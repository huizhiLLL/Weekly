import { promises as fs } from "fs";

const SITE_URL = "https://weekly.huizhi.ink";
const POSTS_DIR = "./src/pages/posts";

function parsePostFileName(name) {
  const slug = name.replace(/\.md$/, "");
  const [issueNumberPart, ...titleParts] = slug.split("-");
  const num = Number.parseInt(issueNumberPart, 10);
  const title = titleParts.join("-") || issueNumberPart;

  return { num, title };
}

async function main() {
  const files = await fs.readdir(POSTS_DIR);
  const mdFiles = files
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => parsePostFileName(b).num - parsePostFileName(a).num);

  const posts = [];
  let recentContent = "";
  let readmeList = "";

  for (const [index, name] of mdFiles.entries()) {
    const { num, title } = parsePostFileName(name);
    const fullPath = `${POSTS_DIR}/${name}`;
    const mdContent = await fs.readFile(fullPath, "utf8");
    const imgMatch = mdContent.match(/<img\s+src="([^"]+)"/);
    const descMatch = mdContent.match(/<small>(.*?)<\/small>/s);
    const stat = await fs.stat(fullPath);
    const modified = stat.mtime.toISOString().split("T")[0];
    const slug = name.replace(/\.md$/, "");
    const url = `${SITE_URL}/posts/${slug}`;
    const displayTitle = `第 ${num} 期 - ${title}`;

    posts.push({
      num,
      title,
      url,
      pic: imgMatch ? imgMatch[1] : "",
      description: descMatch ? descMatch[1].trim() : "",
    });

    readmeList += `* [${displayTitle}](${url})\n`;

    if (index < 5) {
      recentContent += `* [${displayTitle}](${url}) - ${modified}\n`;
    }
  }

  const readmeContent = `# Weekly-Memos

huizhiLLL 的个人周记站点，用来记录每周想法、阅读笔记、技术实践和生活备忘。

## 最新周记

${readmeList || "暂无周记。"}
## 新增周记

文章只维护中文版本，放在 \`src/pages/posts/\`。

文件名建议使用“期号-标题.md”：

\`\`\`text
2-本周记录.md
3-读书和折腾.md
\`\`\`

文章模板：

\`\`\`md
---
date: 2026/05/08
image: /assets/2.svg
description: 这一期的简短摘要。
---

<img src="/assets/2.svg" alt="本周记录" />

<small>这一期的简短摘要。</small>

## 这一周

正文内容。
\`\`\`

写完后运行：

\`\`\`bash
node build.js
npm run build
\`\`\`

\`node build.js\` 会更新 \`README.md\`、\`RECENT.md\`、\`posts.json\` 和 \`public/posts.json\`。

## 使用

\`\`\`bash
npm install
npm run dev
\`\`\`

## 部署

计划部署域名：\`${SITE_URL}\`
`;

  await Promise.all([
    fs.writeFile("README.md", readmeContent),
    fs.writeFile("RECENT.md", recentContent),
    fs.writeFile("posts.json", JSON.stringify(posts, null, 2)),
    fs.writeFile("public/posts.json", JSON.stringify(posts, null, 2)),
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
