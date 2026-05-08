import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useLocalizedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    let normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return normalizedPath.replace(/\/$/, "") || "/";
  };
}
