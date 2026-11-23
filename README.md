# Weekly

huizhiLLL 的个人周记站点，用来记录每周想法、阅读笔记、技术实践和生活备忘

> 站点框架来源：[Weekly](https://github.com/tw93/Weekly)

## List

* [第 20 期 - The truth that you leave](https://weekly.huizhi.ink/posts/20)
* [第 19 期 - My Soul](https://weekly.huizhi.ink/posts/19)
* [第 18 期 - Illusionary Daytime](https://weekly.huizhi.ink/posts/18)
* [第 17 期 - The Garden of Escapism](https://weekly.huizhi.ink/posts/17)
* [第 16 期 - 기억이 머물던 곳](https://weekly.huizhi.ink/posts/16)
* [第 15 期 - Komorebi](https://weekly.huizhi.ink/posts/15)
* [第 14 期 - Rain](https://weekly.huizhi.ink/posts/14)
* [第 13 期 - 내겐 그대뿐이죠](https://weekly.huizhi.ink/posts/13)
* [第 12 期 - Collapsing World](https://weekly.huizhi.ink/posts/12)
* [第 11 期 - Flower Dance](https://weekly.huizhi.ink/posts/11)
* [第 10 期 - Time Stop](https://weekly.huizhi.ink/posts/10)
* [第 9 期 - Luv Letter](https://weekly.huizhi.ink/posts/9)
* [第 8 期 - 바람에 쓰는 편지](https://weekly.huizhi.ink/posts/8)
* [第 7 期 - Sacred Play Secret Place](https://weekly.huizhi.ink/posts/7)
* [第 6 期 - アゲイン](https://weekly.huizhi.ink/posts/6)
* [第 5 期 - 潮鳴り](https://weekly.huizhi.ink/posts/5)
* [第 4 期 - Bloom of Youth](https://weekly.huizhi.ink/posts/4)
* [第 3 期 - ロック风アレンジ](https://weekly.huizhi.ink/posts/3)
* [第 2 期 - Dusk](https://weekly.huizhi.ink/posts/2)
* [第 1 期 - Asphyxia](https://weekly.huizhi.ink/posts/1)


## Writing

文章 frontmatter 使用 `tags` 标记主题，格式如下：

```yaml
tags:
  - Astrbot
  - MCP
  - AI
  - 魔方
```

### 文章配乐

把音频放在 Obsidian 的当期素材目录里，和封面放在一起。例如，封面是 `/assets/26-21/bg.jpg`，音频就放在 `Essay/Weekly/assets/26-21/`。同步 Action 会把整个素材目录复制到站点的 `public/assets/`。

目录里只有一首音频时，站点会自动选中它，文件名可以自定。自动识别 MP3、M4A、AAC、OGG、Opus、WAV 和 FLAC。目录里有多首时，可以在 Obsidian 添加文本属性 `music` 来选曲。手动指定的路径优先。

```yaml
music: /assets/26-21/track.mp3
```

播放器显示在封面下方，读者点击播放后才请求音频。音频文件会随站点公开发布。
