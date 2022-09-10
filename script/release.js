const { execSync } = require('child_process');
const path = require("path");
const spawn = require('cross-spawn');
const { name, shortname } = require('../package.json');

const spawnPromise = (fullCmd) => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = fullCmd.split(' ');
    spawn(cmd, args, { stdio: 'inherit' })
      .on('close', resolve)
      .on('error', reject);
  });
};

const release = async () => {
  const version = process.argv[2] ?? 'patch';
  console.log('update to version: ', version);

  process.chdir(path.resolve(__dirname, '..'));

  await spawnPromise(`dot-json package.json name ${name}`);
  execSync(`npm version ${version}`); // 只能用exec，不然不会报错终止代码
  await spawnPromise('npm publish');

  await spawnPromise(`dot-json package.json name ${shortname}`);
  await spawnPromise('npm publish');

  await spawnPromise(`dot-json package.json name ${name}`);

  await spawnPromise('git add package.json');
  await spawnPromise(`git commit -m "${version}"`);
  await spawnPromise('git push origin master');
};

release();
