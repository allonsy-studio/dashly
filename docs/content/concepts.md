---
title: How it works
description: What the plugin registers, how options reach each utility, & how optional peers load.
icon: diagram-project
order: 2
templateEngineOverride: md
---

## Three kinds of utility

| Kind | Registered with | Used in |
| --- | --- | --- |
| [Filters](/filters/) | `addFilter` | Templates: `{{ value \| filter }}` |
| [Transforms](/transforms/) | `addTransform` | Built output, after templates render |
| [Shortcodes](/shortcodes/) | `addShortcode` | Templates: `{% name %}` |

Every utility is a small, pure function with its own JSDoc. The reference pages in this site are generated from that JSDoc, so they match the code.

## What the plugin does

`config.addPlugin(dashly, options)` walks a fixed list of names for each kind & registers the ones that are not excluded. Options flow into the utilities that use them:

- `dateLocale` is the default locale for `longDate`, `shortDate`, `relativeDate`, `timeAgo`, `number`, `currency`, & `percent`.
- `baseUrl` is the origin `absoluteUrl` resolves against.
- `readingTimeWpm` is the default words-per-minute for `readingTime`.
- `tagsExclude` is the list of system tags the `tags` filter removes.

A per-call argument always wins over the plugin default. For example, `{{ post.content | readingTime(250) }}` ignores `readingTimeWpm`.

## Plugin or a la carte

The plugin is a convenience. Every utility is also exported by name, so registering a single filter by hand is a one-liner. See [Use only what you need](/guides/a-la-carte/).

## Optional peers load on first use

dashly imports `prettier`, `html-minifier-terser`, `posthtml`, `markdown-it`, & `postcss` lazily, at the moment a utility needs them. A missing package surfaces as an import error from that utility, not at startup.

| Utility | Loads | When |
| --- | --- | --- |
| `prettier` transform | `prettier` | For every `.html`, `.xml`, & `.svg` output |
| `htmlmin` transform | `html-minifier-terser` | For `.html` output, only when `ELEVENTY_ENV` is `production` |
| `cleanForRSS` filter | `posthtml` | On each call |
| `renderMarkdown` filter | `markdown-it` | On each call, unless a `renderer` option is passed |

## Async utilities

`cleanForRSS` & `renderMarkdown` return promises because they load their peer on demand with a dynamic `import()`. Nunjucks, Liquid, & 11ty.js await them. The reference lists the return type of every utility.

### Not supported in Handlebars

**Do not use `cleanForRSS` or `renderMarkdown` in Handlebars templates.** Every other filter works there. Handlebars helpers are synchronous: Handlebars calls the helper, takes whatever it returns, & writes it into the page without waiting. An async filter returns a promise, so `{{cleanForRSS html}}` renders `[object Promise]`. There is no template-side fix: Handlebars has no way to wait on a helper, & both filters need an async `import()` of an optional peer.

To get their output onto a Handlebars page, resolve it before the template renders & hand the template a finished string. Use [`eleventyComputed`](https://www.11ty.dev/docs/data-computed/) in a directory or template data file:

```js
// post.11tydata.js
import { renderMarkdown } from '@allons-y/dashly/filters/html';

export default {
	eleventyComputed: {
		summaryHtml: async (data) => renderMarkdown(data.summary, { splitParagraphs: false }),
	},
};
```

Then write `{{{summaryHtml}}}` in the template. Or write that page in Nunjucks, Liquid, or 11ty.js, which await filters.
