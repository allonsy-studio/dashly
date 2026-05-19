# dashly

> A standard-library of filters, transforms, and shortcodes for [Eleventy](https://www.11ty.dev). One install, one plugin line, done.

[![npm](https://img.shields.io/npm/v/@allons-y/dashly.svg)](https://www.npmjs.com/package/@allons-y/dashly)
[![license](https://img.shields.io/npm/l/@allons-y/dashly.svg)](./LICENSE)

dashly is the standard-library helpers every 11ty site eventually rewrites from scratch — date formatting, RSS sanitization, responsive images, HTML minification, URL validation, and more — bundled into a single tree-shakeable package.

## Install

```sh
npm install --save-dev @allons-y/dashly
```

Heavy dependencies (`prettier`, `html-minifier-terser`, `posthtml`, `markdown-it`, `postcss`) are declared as **optional peers**. Install only the ones you use.

## Quick start

```js
// eleventy.config.js
import dashly from "@allons-y/dashly";

export default function (config) {
	config.addPlugin(dashly, {
		dateLocale: "en-GB",
		baseUrl: "https://example.com",
	});
}
```

Templates can immediately use:

```njk
{{ post.date | longDate }}        {# 15 January 2026 #}
{{ post.date | shortDate }}       {# Jan 2026 #}
{{ post.date | year }}            {# 2026 #}
{{ name | firstWord }}            {# "Allons-y" → "Allons-y" #}
{{ phone | digitsOnly }}          {# "(555) 123-4567" → "5551234567" #}
{{ "example.com" | validateURL }} {# https://example.com #}
{{ post.content | cleanForRSS }}  {# safe HTML for feeds #}
{{ post.content | wordCount }}    {# 842 #}
{{ post.content | readingTime }}  {# 4 #}
{{ post.content | excerpt(40) }}  {# first 40 words, ellipsised #}
<pre>{{ page | dump }}</pre>      {# pretty-printed JSON, circular-safe #}
{{ page.url | absoluteUrl }}      {# https://example.com/posts/hello/ #}
{{ post.date | timeAgo }}         {# "2 days ago" #}
{{ product.price | currency }}    {# "$1,299.00" #}
{{ survey.rate | percent }}       {# "25%" — input 0.25 #}
&copy; {% year %} Acme Corp.
```

## A la carte

```js
import { filters, transforms } from "@allons-y/dashly";

config.addFilter("long", filters.longDate);
config.addFilter("rss", filters.cleanForRSS);
config.addTransform("prettier", transforms.createPrettierTransform());
```

Or import from the narrowest subpath so unused dependencies never enter your bundle:

```js
import { longDate } from "@allons-y/dashly/filters/dates";
import { validateURL } from "@allons-y/dashly/filters/urls";
```

## What's in the box

### Filters

| Name                                    | Purpose                                                                         | Peer dep             |
| --------------------------------------- | ------------------------------------------------------------------------------- | -------------------- |
| `toISOString`                           | ISO-8601 string for `<time>` and JSON-LD                                        | –                    |
| `year`                                  | Four-digit year                                                                 | –                    |
| `dateFormat`                            | Pass-through `Intl.DateTimeFormat`                                              | –                    |
| `longDate`                              | `15 January 2026`                                                               | –                    |
| `shortDate`                             | `Jan 2026`                                                                      | –                    |
| `firstWord`, `lastWord`                 | Pull first/last word from a string                                              | –                    |
| `trim`, `stripWhitespace`, `digitsOnly` | Common string sanitizers                                                        | –                    |
| `keys`                                  | Safe `Object.keys` for templates                                                | –                    |
| `validateURL`                           | Force `https://` on bare hostnames; pass `mailto:`/`tel:`/relative URLs through | –                    |
| `cleanForRSS`                           | Strip scripts, embeds, permalinks, custom elements from HTML                    | `posthtml`           |
| `renderMarkdown`                        | Render a markdown string (with optional `\n\n` paragraph splitting)             | `markdown-it`        |
| `wordCount`                             | Count words in a string (HTML stripped)                                         | –                    |
| `readingTime`                           | Estimate minutes to read (configurable `wpm`, default 200)                      | –                    |
| `excerpt`                               | First/last N words or chars, ellipsised. Negative N → trailing slice            | –                    |
| `dump` / `jsonify`                      | Pretty-printed JSON for in-template debugging, circular-safe                    | –                    |
| `first`                                 | First element of an array, or first N when a count is given                     | –                    |
| `last`                                  | Last element of an array, or last N when a count is given                       | –                    |
| `reverse`                               | Reverse an array or string (non-mutating, code-point safe)                      | –                    |
| `capitalize`                            | Uppercase first letter, lowercase rest                                          | –                    |
| `title`                                 | Title-case each word                                                            | –                    |
| `stripTags`                             | Remove every HTML tag; collapse whitespace                                      | –                    |
| `nl2br`                                 | Replace newlines with `<br>` for plain-text → HTML                              | –                    |
| `absoluteUrl`                           | Resolve a path against `baseUrl` for canonical/OG/JSON-LD tags                  | –                    |
| `relativeDate` / `timeAgo`              | `Intl.RelativeTimeFormat` wrapper ("2 days ago")                                | –                    |
| `number`                                | `Intl.NumberFormat` wrapper with locale-aware grouping                          | –                    |
| `currency`                              | Localized currency formatting (default `USD`)                                   | –                    |
| `percent`                               | Localized percent formatting (fraction-aware)                                   | –                    |
| `groupBy`                               | Group items by key, dot-path, or selector function                              | –                    |
| `sortBy`                                | Sort by key/dot-path/function, `'asc'` or `'desc'`                              | –                    |
| `chunk`                                 | Split into N-sized arrays (gallery rows, paginated grids)                       | –                    |
| `where`                                 | Filter by key equality, or truthiness when no value is given                    | –                    |
| `pluck`                                 | Project an array of objects onto a single key/path                              | –                    |
| `tags`                                  | Strip Eleventy system tags (`all`/`post`/…) from a tag list                     | –                    |

### Transforms

| Name         | Purpose                                                               | Peer dep               |
| ------------ | --------------------------------------------------------------------- | ---------------------- |
| `prettier`   | Format HTML/XML/SVG output                                            | `prettier`             |
| `htmlmin`    | Minify HTML (production-gated by default)                             | `html-minifier-terser` |
| `cleanAttrs` | Strip `eleventy:ignore=""` markers left on `<img>` inside `<picture>` | –                      |

The `postcss` helper (`@allons-y/dashly/transforms/postcss`) is exported separately for use in `addBundle` or `addExtension('css', …)` setups.

### Shortcodes

| Name   | Purpose                                         | Peer dep |
| ------ | ----------------------------------------------- | -------- |
| `year` | Current four-digit year (for footer copyrights) | –        |

## Plugin options

```ts
interface DashlyOptions {
	dateLocale?: string; // default 'en-US'; also used by relativeDate / number / currency / percent
	baseUrl?: string; // origin used by `absoluteUrl`, e.g. 'https://example.com'
	readingTimeWpm?: number; // default 200
	tagsExclude?: string[]; // tag names stripped by the `tags` filter; default ['all', 'post', 'posts']
	filters?: false | { exclude?: string[] };
	transforms?:
		| false
		| {
				exclude?: string[];
				prettier?: { extensions?: string[]; prettier?: PrettierOptions };
				htmlmin?: { production?: boolean; minifier?: HtmlMinifierOptions };
				cleanAttrs?: { attrs?: string[] };
		  };
	shortcodes?: false | { exclude?: string[] };
}
```

Pass `false` for any category to skip it entirely. Pass `exclude` to omit specific names.

## Design notes

**No `truncate` filter.** Mechanical mid-sentence truncation (`{{ content | truncate(100) }}`) is a poor reading experience — it hides content with no signal about what was cut and often clips mid-word or mid-tag. Use [`excerpt`](#filters) instead, which trims on word boundaries and is intended as a summary affordance, not a clipping one. For trailing slices (last N words), pass a negative N: `{{ content | excerpt(-20) }}`.

**Smart quotes.** No dedicated filter; enable [markdown-it's `typographer: true`](https://github.com/markdown-it/markdown-it#init-with-presets-and-options) on the renderer you pass to `renderMarkdown`, which handles `'` → `’`, `--` → `—`, etc. for free.

**Nunjucks-parity universals.** Nunjucks and Liquid templates ship many of these filters natively (`first`, `last`, `reverse`, `capitalize`, etc.) — dashly registers them through `addFilter` so they're available in **every** Eleventy template engine, including JS templates and shortcodes, with consistent semantics across engines. `first` and `last` accept an optional count argument so `{{ posts | first(3) }}` covers the common "limit to N" case without a separate filter name.

## Versioning

dashly follows semver. Breaking API changes bump major; new utilities and non-breaking option additions bump minor; bug fixes bump patch.

---

<sub>Built and maintained by [Allons-y Studio](https://allons-y.studio) — a US-based studio specializing in design systems, front-end architecture, and accessibility.</sub>
