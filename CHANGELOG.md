# Changelog

## 0.1.0-beta.0

### Minor Changes

- [#7](https://github.com/allonsy-studio/dashly/pull/7) [`0b97b97`](https://github.com/allonsy-studio/dashly/commit/0b97b97b58b8932d530c21b697c9f644699ec45c) Thanks [@castastrophe](https://github.com/castastrophe)! - First beta release of **@allons-y/dashly** — a standard library of filters, transforms, and shortcodes for [Eleventy](https://www.11ty.dev) v3, so you can stop copy-pasting the same utility filters between projects.

    Add the whole toolkit to your Eleventy config with one line:

    ```js
    import dashly from "@allons-y/dashly";

    export default function (config) {
    	config.addPlugin(dashly, {
    		dateLocale: "en-GB",
    		baseUrl: "https://example.com",
    	});
    }
    ```

    **What's included**

    - **38 filters** across dates (`longDate`, `relativeDate`, `timeAgo`, …), strings (`title`, `capitalize`, `trim`, …), arrays (`groupBy`, `sortBy`, `where`, `chunk`, …), HTML (`stripTags`, `nl2br`, `renderMarkdown`, `cleanForRSS`, …), text (`readingTime`, `wordCount`, `excerpt`), numbers (`number`, `currency`, `percent`), URLs (`absoluteUrl`, `validateURL`), tag collections, and debugging (`dump`, `jsonify`).
    - **3 output transforms**: `cleanAttrs` (strip framework leftovers from markup), `prettier` (format built HTML), and `htmlmin` (minify, gated to production builds).
    - **1 shortcode**: `{% year %}` for always-current footer copyrights.

    **Configure it your way**

    - Plugin options set sensible project-wide defaults: `dateLocale` for locale-aware date and number formatting, `baseUrl` for absolute URLs, `readingTimeWpm` for reading-time estimates, and `tagsExclude` for tag-list cleanup.
    - Everything is opt-out: skip whole categories (`filters: false`) or individual registrations (`transforms: { exclude: ["htmlmin"] }`).
    - Prefer picking utilities yourself? Every function is importable directly from tree-shakeable subpaths like `@allons-y/dashly/filters/dates` — no plugin required.

    Heavier dependencies (`markdown-it`, `prettier`, `html-minifier-terser`, `posthtml`, `postcss`) are **optional peer dependencies** — install only the ones backing the utilities you actually use.

    Requires Node.js ≥ 24 and Eleventy ≥ 3. This is a beta: the API may still shift before a stable 1.0, and feedback is very welcome on the [issue tracker](https://github.com/allonsy-studio/dashly/issues).

All notable changes to `@allons-y/dashly` are documented here. This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are managed with [Changesets](https://github.com/changesets/changesets). New entries are prepended above this line by the **Release** workflow when a "Version packages" PR is merged.
