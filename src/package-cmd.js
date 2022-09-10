const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const shell = require('shelljs');
const semver = require('semver');
const debug = require('./debug');

const parsePackageCmdArgs = (args = {}) => {
  const defaultArgs = {
    cwd: '.',
    onlyBuild: false,
    registryUrl: 'https://registry.npmjs.org/',
    cacheDir: '~/.uvec',
    vsceOpts: {},
    publishOpts: {},
  };
  args = Object.assign(defaultArgs, args);

  const pkgJSONPath = path.resolve(args.cwd, 'package.json');
  if (!fs.existsSync(pkgJSONPath)) {
    throw new Error(`${pkgJSONPath}不存在, 请检查cwd参数是否正确`);
  }
  const packageJSON = fs.readJSONSync(pkgJSONPath);

  if (!args.pkgName) {
    args.pkgName = packageJSON.name;
  }

  if (
    args.pkgVersion &&
    [
      'major', 'minor', 'patch',
      'premajor', 'preminor', 'prepatch', 'prerelease',
    ].includes(args.pkgVersion)
  ) {
    args.pkgVersion = semver.inc(packageJSON.version, args.pkgVersion);
  } else if (!args.pkgVersion) {
    args.pkgVersion = packageJSON.version;
  }

  args.cwd = args.cwd.replace(/^~\//, os.homedir() + '/');
  args.cwd = path.resolve(args.cwd);

  args.cacheDir = args.cacheDir.replace(/^~\//, os.homedir() + '/');
  args.cacheDir = path.resolve(args.cacheDir);

  const { vsceOpts } = args;

  if (!vsceOpts.o && !vsceOpts.out) {
    vsceOpts.out = './extension.vsix';
  }
  vsceOpts.out = path.resolve(args.cacheDir, vsceOpts.out);

  if (args.onlyBuild) {
    if (typeof vsceOpts['no-update-package-json'] === 'boolean' && !vsceOpts['no-update-package-json']) {
      throw new Error('onlyBuild模式下, 不能设置vsceOpts.no-update-package-json为true');
    }
    vsceOpts['no-update-package-json'] = true;
  }

  args.publishOpts.registry = args.registryUrl;

  return args;
};

const packageCmd = (args = {}) => {
  const {
    cwd,
    pkgName,
    pkgVersion,
    onlyBuild,
    cacheDir,
    vsceOpts,
    publishOpts,
  } = parsePackageCmdArgs(args);

  fs.ensureDirSync(cacheDir);
  fs.emptyDirSync(cacheDir);

  // 1. vsce package
  shell.cd(cwd);
  const restArgsStr = Object.entries(vsceOpts)
    .reduce((str, [key, value]) => {
      if (typeof value === 'boolean' && !!value) {
        return str + `--${key} `;
      }
      return str + `--${key}="${value}" `;
    }, '');
  const vscePackageCmd = `vsce package ${pkgVersion} ${restArgsStr}`;
  debug('vscePackageCmd: ', vscePackageCmd);
  const { stderr } = shell.exec(vscePackageCmd);
  if (stderr) {
    throw new Error(stderr);
  }

  // 2. generate package.json
  fs.writeJSONSync(
    path.resolve(cacheDir, 'package.json'),
    {
      name: pkgName,
      version: pkgVersion
    },
    { spaces: 2 },
  );

  if (!onlyBuild) {
    // 3. publish npm
    const npmManager = (!vsceOpts.yarn || !!vsceOpts['no-yarn']) ? 'npm' : 'yarn';
    shell.cd(cacheDir);
    const restArgsStr = Object.entries(publishOpts)
      .reduce((str, [key, value]) => {
        if (typeof value === 'boolean' && !!value) {
          return str + `--${key} `;
        }
        return str + `--${key}="${value}" `;
      }, '');
    const publishCmd = `${npmManager} publish ${restArgsStr}`;
    debug('publishCmd: ', publishCmd);
    shell.exec(publishCmd);

    // 4. rm cacheDir
    shell.rm(cacheDir);
  }
};

module.exports = packageCmd;
