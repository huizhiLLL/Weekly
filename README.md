# Weekly-Memos

huizhiLLL 的个人周记站点，用来记录每周想法、阅读笔记、技术实践和生活备忘。

## 最新周记

* [第 1 期 - 开始](https://weekly.huizhi.ink/posts/1-开始)

## 新增周记

文章只维护中文版本，放在 `src/pages/posts/`。

文件名建议使用“期号-标题.md”：

```text
2-本周记录.md
3-读书和折腾.md
```

文章模板：

```md
---
date: 2026/05/08
image: /assets/2.svg
description: 这一期的简短摘要。
---

<img src="/assets/2.svg" alt="本周记录" />

<small>这一期的简短摘要。</small>

## 这一周

正文内容。
```

写完后运行：

```bash
node build.js
npm run build
```

`node build.js` 会更新 `README.md`、`RECENT.md`、`posts.json` 和 `public/posts.json`。

## 使用

```bash
npm install
npm run dev
```

## 部署

计划部署域名：`https://weekly.huizhi.ink`
