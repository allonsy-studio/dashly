---
"@allons-y/dashly": major
---

Initial public release of `@allons-y/dashly` — a standard-library of filters, transforms, and shortcodes for [Eleventy](https://www.11ty.dev).

**Filters:** `toISOString`, `year`, `dateFormat`, `longDate`, `shortDate`, `relativeDate`/`timeAgo`, `firstWord`, `lastWord`, `trim`, `stripWhitespace`, `digitsOnly`, `capitalize`, `title`, `keys`, `validateURL`, `absoluteUrl`, `cleanForRSS`, `renderMarkdown`, `wordCount`, `readingTime`, `excerpt`, `dump`/`jsonify`, `first`, `last`, `reverse`, `stripTags`, `nl2br`, `number`, `currency`, `percent`, `groupBy`, `sortBy`, `chunk`, `where`, `pluck`, `tags`.

**Transforms:** `cleanAttrs`, `prettier`, `htmlmin` (production-gated by default), plus a standalone `processCSS` helper.

**Shortcodes:** `year`.

**Packaging:** Subpath exports for `/filters`, `/transforms`, `/shortcodes` and their submodules so consumers can import only what they need. Heavy renderers (`prettier`, `html-minifier-terser`, `posthtml`, `markdown-it`, `postcss`) are declared as optional peer dependencies.
