// rehype-customize-image-src.js
import { visit } from "unist-util-visit";
import fs from "fs";
import path from "path";

// Cache for the metadata to avoid reading from disk too often
let imageMetadataCache = null;

function normalizeAssetPath(src) {
  if (!src) return src;
  if (src.startsWith("./assets/")) return src.replace(/^\./, "");
  if (src.startsWith("assets/")) return `/${src}`;
  return src;
}

function getImageMetadata() {
  if (process.env.NODE_ENV === "production" && imageMetadataCache) {
    return imageMetadataCache;
  }
  const METADATA_PATH = path.resolve("./src/data/image-metadata.json");
  if (!fs.existsSync(METADATA_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));
    if (process.env.NODE_ENV === "production") {
      imageMetadataCache = data;
    }
    return data;
  } catch (e) {
    console.error("Failed to parse image-metadata.json", e);
    return {};
  }
}

const getHeroImage = (tree) => {
  let heroUrl = null;
  visit(tree, "raw", (node) => {
    if (heroUrl) return;
    const match = /<img\s+[^>]*src="([^"]+)"/.exec(node.value);
    if (match) {
      const url = normalizeAssetPath(match[1]);
      const domainRegex =
        /https:\/\/(?:cdn\.(?:fliggy\.com|alipayobjects\.com)|gw\.(?:alipayobjects\.com|alicdn\.com)|img\.alicdn\.com|raw\.githubusercontent\.com|camo\.githubusercontent\.com)/;
      const skipRegex = /\.(?:gif|svg|GIF|SVG)(?:\?.*)?$/;
      if (url.match(domainRegex) && !url.match(skipRegex)) {
        const separator = url.includes("?") ? "&" : "?";
        heroUrl = `${url}${separator}x-oss-process=image/auto-orient,1/resize,w_2000/format,webp`;
      }
    }
  });
  return heroUrl;
};

export default function rehypeCustomizeImageSrc() {
  return (tree, file) => {
    // In dev mode, we want to pick up changes to the JSON file
    // In production/build, it's fine to read once
    const imageMetadata = getImageMetadata();
    let imageIndex = 0;

    // Attach hero image to file metadata so layouts can access it for preloading
    const heroImage = getHeroImage(tree);
    if (heroImage) {
      if (!file.data.astro) file.data.astro = {};
      if (!file.data.astro.frontmatter) file.data.astro.frontmatter = {};
      file.data.astro.frontmatter.heroImage = heroImage;
    }

    visit(tree, "raw", (node) => {
      // 1. Process <img> tags
      const fullImgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
      node.value = node.value.replace(fullImgRegex, (fullMatch, p1) => {
        const imageSrc = normalizeAssetPath(p1);
        const normalizedFullMatch =
          imageSrc === p1
            ? fullMatch
            : fullMatch.replace(/\s*src="[^"]*"/, ` src="${imageSrc}"`);
        const urlLower = imageSrc.toLowerCase();
        const isSvgOrGif =
          urlLower.includes(".svg") ||
          urlLower.includes(".gif") ||
          imageSrc.includes("2e737667") || // .svg
          imageSrc.includes("2e676966"); // .gif

        if (isSvgOrGif) {
          return normalizedFullMatch;
        }

        const domainRegex =
          /https:\/\/(?:cdn\.(?:fliggy\.com|alipayobjects\.com)|gw\.(?:alipayobjects\.com|alicdn\.com)|img\.alicdn\.com|raw\.githubusercontent\.com|camo\.githubusercontent\.com)/;
        if (!imageSrc.match(domainRegex)) {
          return normalizedFullMatch;
        }

        imageIndex++;
        const isFirstImage = imageIndex === 1;
        const separator = imageSrc.includes("?") ? "&" : "?";
        const meta = imageMetadata[imageSrc];

        // Extract original width/height if they exist
        const originalWidthMatch = fullMatch.match(/width="([^"]*)"/);
        const originalHeightMatch = fullMatch.match(/height="([^"]*)"/);
        const origWidth = originalWidthMatch
          ? originalWidthMatch[1].replace("px", "")
          : null;
        const origHeight = originalHeightMatch
          ? originalHeightMatch[1].replace("px", "")
          : null;

        let newAttrs = `src="${imageSrc}${separator}x-oss-process=image/auto-orient,1/resize,w_2000/format,webp" data-lightense-src="${imageSrc}" data-pswp-src="${imageSrc}"`;

        // Use metadata for aspect-ratio and lightbox, user-specified for display size
        const metaWidth = meta?.width;
        const metaHeight = meta?.height;

        const loadingAttr = isFirstImage
          ? 'loading="eager" fetchpriority="high"'
          : 'loading="lazy"';
        newAttrs += ` ${loadingAttr}`;

        // Add lightbox dimensions from metadata
        if (metaWidth && metaHeight) {
          const ratio = (Number(metaWidth) / Number(metaHeight)).toFixed(4);
          newAttrs += ` data-pswp-width="${metaWidth}" data-pswp-height="${metaHeight}" style="aspect-ratio: ${ratio};"`;
        }

        // User-specified dimensions for display (if provided)
        if (origWidth) {
          newAttrs += ` width="${origWidth}"`;
        }
        if (origHeight) {
          newAttrs += ` height="${origHeight}"`;
        }

        const otherAttrs = fullMatch
          .replace(/<img\s+/, "")
          .replace(/\s*\/?>$/, "")
          .replace(/\s*src="[^"]*"/, "")
          .replace(/\s*width="[^"]*"/g, "")
          .replace(/\s*height="[^"]*"/g, "")
          .replace(/\s*loading="[^"]*"/g, "")
          .replace(/\s*fetchpriority="[^"]*"/g, "")
          .replace(/\s*style="[^"]*"/g, "");

        return `<img ${newAttrs} ${otherAttrs} />`;
      });

      // 2. Video tags processing removed to prevent automatic poster injection from first image as it was causing confusion.
      // If a poster is needed, it should be manually specified in the markdown.
    });
  };
}
