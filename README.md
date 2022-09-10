# `update-vscode-extension-cli`

`update-vscode-extension-cli` 简称 `uvec`

## `uvec package`

#### Usage

```
Usage:
  $ uvec package [cwd]

Options:
  --pkg-name      要发布的npm包的package.json中的name, 默认为vscode插件的package.json的name 
  --pkg-version   默认为package.json中的version, 可用值: [new-version] | major | minor | patch | premajor | preminor | prepatch | prerelease 
  --only-build     (default: false)
  --registry-url   (default: https://registry.npmjs.org/)
  --cache-dir     构建npm包的暂存区 (default: ~/.uvec)
  --vsce          vsce package的参数 
  --publish       npm publish/yarn publish的参数 
  -h, --help      Display this message 

Examples:
  onlyBuild模式(只构建npm包, 剩余部分自己实现): uvec package . --only-build --pkg-name='@hupu/vscode-extension' -vsce.out='hupu.vsix' --vsce.no-yarn --vsce.allow-star-activation
  default模式(打包并发布npm包): uvec package . --registry-url='http://hnpm.hupu.io/' --pkg-name='@hupu/vscode-extension' -vsce.out='hupu.vsix' --vsce.no-yarn --vsce.allow-star-activation


更多详情请看:
  https://juejin.cn/post/7141662937420136479/
```

#### `--vsce` 参数

> vsce不是本包的强制依赖, 本包已经将vsce@2作为peerDependencies
> 
> 如果最新的vsce有什么问题, 可能是兼容没做好, 可以降级到 vsce@2.11.0
> 
> 从 `vsce package` 的参数中改造, 可能vsce支持了最新参数, 但是下面

```
--out <path>                npm包中 (defaults to ./extension.vsix)
--target <target>           Target architecture
--message <commit message>  Commit message used when calling `npm version`.
--no-git-tag-version            Do not create a version commit and tag when calling `npm version`. Valid only when
                                [version] is provided.
--no-update-package-json        Do not update `package.json`. Valid only when [version] is provided.
--githubBranch <branch>         The GitHub branch used to infer relative links in README.md. Can be overriden by
                                --baseContentUrl and --baseImagesUrl.
--gitlabBranch <branch>         The GitLab branch used to infer relative links in README.md. Can be overriden by
                                --baseContentUrl and --baseImagesUrl.
--no-rewrite-relative-links     Skip rewriting relative links.
--baseContentUrl <url>          Prepend all relative links in README.md with this url.
--baseImagesUrl <url>           Prepend all relative image links in README.md with this url.
--yarn                          Use yarn
--no-yarn                       Use npm
--ignoreFile <path>             Indicate alternative .vscodeignore
--no-gitHubIssueLinking         Disable automatic expansion of GitHub-style issue syntax into links
--no-gitLabIssueLinking         Disable automatic expansion of GitLab-style issue syntax into links
--dependencies                  Enable dependency detection via npm or yarn
--no-dependencies               Disable dependency detection via npm or yarn
--pre-release                   Mark this package as a pre-release
--allow-star-activation         Allow using * in activation events
--allow-missing-repository      Allow missing a repository URL in package.json
```


