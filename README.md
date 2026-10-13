# Yichen Ding's Homepage | 丁熠晨的个人主页

Personal academic homepage of **Yichen Ding (丁熠晨)**, built with the [Academic Pages](https://academicpages.github.io/) template and hosted on GitHub Pages.

**丁熠晨** 的个人学术主页，基于 [Academic Pages](https://academicpages.github.io/) 模板构建，托管在 GitHub Pages。

- Site | 网址：<https://dingyc2004.github.io>
- English homepage | 英文首页：`/`
- 中文首页：`/zh/`

## Structure | 目录结构

| Path | Content |
|---|---|
| `_config.yml` | Site-wide settings (name, email, social links…) · 全站配置 |
| `_data/navigation.yml` | English (`main`) and Chinese (`zh`) header menus · 中英文导航菜单 |
| `_pages/*.md` | English pages · 英文页面 |
| `_pages/zh-*.md` | Chinese pages (front matter includes `lang: zh`) · 中文页面 |
| `_portfolio/*.md` | Projects · 项目 |
| `_publications/*.md` | Publications · 论文 |
| `images/profile.png` | Sidebar avatar · 侧边栏头像 |
| `files/` | Downloadable files · 可下载文件 |

## How to update | 如何更新

1. Edit the Markdown/YAML files above.
2. 编辑上述 Markdown / YAML 文件。
3. Commit and push to the `master` branch — GitHub Actions builds and deploys the site automatically.
4. 提交并推送到 `master` 分支，GitHub Actions 会自动构建并部署。

## Local preview | 本地预览

```bash
bundle exec jekyll serve
```

or with Docker | 或使用 Docker：

```bash
docker compose up
```
