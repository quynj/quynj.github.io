# quynj.github.io

基于 `Vue 3 + Vite` 的个人主页仓库，页面内容包括：

- 首页介绍与个人标签
- 最近 GitHub 活动展示
- Photo Loop 图片轮播
- GitHub Discussion 公开讨论区

这个仓库采用“源码分支 + 部署分支”的方式维护，避免把 Vue 源码和打包产物混在一起。

## Branch Strategy

- `codex-vue-source`
  - 默认用于开发和维护源码
  - 包含 `src/`、Vite 配置、GitHub Actions workflow、README
- `main`
  - 仅用于承接打包后的静态文件
  - 作为 GitHub Pages 展示分支
  - 不建议直接手动修改

## Local Development

```bash
npm install
npm run dev
```

本地构建：

```bash
npm run build
```

## Deploy Flow

仓库包含 GitHub Actions 工作流：

- 文件位置：`.github/workflows/deploy-to-main.yml`
- 触发分支：`codex-vue-source`
- 发布逻辑：
  - 安装依赖
  - 执行 `npm run build`
  - 将 `dist/` 内容同步到 `main`
  - 自动提交并推送到 `main`

也就是说：

- 平时只需要在 `codex-vue-source` 开发
- 推送后 Actions 会自动把页面发布到 `main`

## Photo Loop 目录约定

```text
public/photos/
```

- 你把相册图片放到 `public/photos/`
- Vite 构建时会把它们原样复制到 `dist/photos/`
- Actions 发布后，`main/photos/` 会保留这些图片
- 页面通过 GitHub API 读取 `main` 分支下的 `photos/` 目录内容

支持格式：

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.gif`
- `.avif`

## Notes

- `main` 分支建议视为自动生成分支
- 如果后续需要保留 `CNAME`、自定义静态文件或其他根目录文件，可以在 workflow 里额外加保留规则
- 如果想让仓库首页优先展示这份说明，建议把 GitHub 默认分支切到 `codex-vue-source`
