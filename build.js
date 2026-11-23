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

function normalizeAssetPath(src) {
  if (!src) return src;
  if (src.startsWith("./assets/")) return src.replace(/^\./, "");
  if (src.startsWith("assets/")) return `/${src}`;
  return src;
}

function parseFrontmatterTags(content) {
  const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
  if (!frontmatterMatch) return [];

  const frontmatter = frontmatterMatch[1];
  const lines = frontmatter.split(/\r?\n/);
  const tagsLineIndex = lines.findIndex((line) => /^tags:\s*$/.test(line));
  if (tagsLineIndex >= 0) {
    const tags = [];
    for (const line of lines.slice(tagsLineIndex + 1)) {
      if (!/^\s+-\s+/.test(line)) break;
      tags.push(line.replace(/^\s+-\s+/, "").trim().replace(/^['"]|['"]$/g, ""));
    }
    return tags.filter(Boolean);
  }

  return [];
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
    const tags = parseFrontmatterTags(mdContent);
    const stat = await fs.stat(fullPath);
    const modified = stat.mtime.toISOString().split("T")[0];
    const url = `${SITE_URL}/posts/${num}`;
    const displayTitle = `第 ${num} 期 - ${title}`;

    posts.push({
      num,
      title,
      url,
      pic: normalizeAssetPath(imgMatch ? imgMatch[1] : ""),
      tags,
    });

    readmeList += `* [${displayTitle}](${url})\n`;

    if (index < 5) {
      recentContent += `* [${displayTitle}](${url}) - ${modified}\n`;
    }
  }

  const readmeContent = `# Weekly

huizhiLLL 的个人周记站点，用来记录每周想法、阅读笔记、技术实践和生活备忘

> 站点框架来源：[Weekly](https://github.com/tw93/Weekly)

## List

${readmeList || "暂无周记。"}

## Writing

文章 frontmatter 使用 \`tags\` 标记主题，格式如下：

\`\`\`yaml
tags:
  - Astrbot
  - MCP
  - AI
  - 魔方
\`\`\`

### 文章配乐

把音频放在 Obsidian 的当期素材目录里，和封面放在一起。例如，封面是 \`/assets/26-21/bg.jpg\`，音频就放在 \`Essay/Weekly/assets/26-21/\`。同步 Action 会把整个素材目录复制到站点的 \`public/assets/\`。

目录里只有一首音频时，站点会自动选中它，文件名可以自定。自动识别 MP3、M4A、AAC、OGG、Opus、WAV 和 FLAC。目录里有多首时，可以在 Obsidian 添加文本属性 \`music\` 来选曲。手动指定的路径优先。

\`\`\`yaml
music: /assets/26-21/track.mp3
\`\`\`

播放器显示在封面下方，读者点击播放后才请求音频。音频文件会随站点公开发布。
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
