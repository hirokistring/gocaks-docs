(function () {
  "use strict";

  const SUPPORTED_LANGS = ["en", "ja", "de", "fr", "hi", "zh", "es", "pl", "it", "ko", "ru", "ar", "he"];
  const DEFAULT_LANG = "en";

  function getLanguage() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    if (lang && SUPPORTED_LANGS.includes(lang)) return lang;
    const nav = navigator.language.slice(0, 2);
    if (SUPPORTED_LANGS.includes(nav)) return nav;
    return DEFAULT_LANG;
  }

  function markdownBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }

  function applyTranslations(strings) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const value = strings[key];
      if (value == null) return;
      const html = markdownBold(value).replace(/\n/g, "<br>");
      el.innerHTML = html;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      const value = strings[key];
      if (value != null) el.placeholder = value;
    });
  }

  function propagateLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll("a[href]").forEach(function (a) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      try {
        const url = new URL(href, window.location.href);
        url.searchParams.set("lang", lang);
        a.setAttribute("href", url.pathname + url.search);
      } catch (_) {}
    });
  }

  async function init() {
    const lang = getLanguage();
    propagateLang(lang);
    try {
      const basePath = document.querySelector('meta[name="base-path"]');
      const base = basePath ? basePath.content : ".";
      const res = await fetch(base + "/locales/" + lang + ".json");
      if (!res.ok) throw new Error("Failed to load locale: " + res.status);
      const strings = await res.json();
      applyTranslations(strings);
    } catch (e) {
      console.error("i18n load error:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
