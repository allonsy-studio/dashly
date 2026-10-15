---
title: Configuration
description: Every plugin option, its default, & what it affects.
icon: sliders
order: 3
templateEngineOverride: md
---

Pass options as the second argument to `addPlugin`:

```js
config.addPlugin(dashly, {
	dateLocale: "en-GB",
	baseUrl: "https://example.com",
	readingTimeWpm: 220,
	transforms: { exclude: ["htmlmin"] },
});
```

## Defaults

| Option | Type | Default | Affects |
| --- | --- | --- | --- |
| `dateLocale` | `Intl.LocalesArgument` | `'en-US'` | `longDate`, `shortDate`, `relativeDate`, `timeAgo`, `number`, `currency`, `percent` |
| `baseUrl` | `string` | none | `absoluteUrl`. Without it, paths are returned unchanged. |
| `readingTimeWpm` | `number` | `200` | `readingTime` |
| `tagsExclude` | `string[]` | `['all', 'post', 'posts']` | `tags` |

## Choosing what registers

`filters`, `transforms`, & `shortcodes` each accept either `false` or an object.

| Value | Result |
| --- | --- |
| omitted | Everything in the category registers |
| `false` | Nothing in the category registers |
| `{ exclude: ['name'] }` | Everything except the named utilities registers |

```js
config.addPlugin(dashly, {
	filters: { exclude: ["title", "capitalize"] },
	shortcodes: false,
});
```

Use `exclude` to avoid a name clash with another plugin or with a filter that Nunjucks or Liquid already provides.

## Transform options

The `transforms` object also carries per-transform options next to `exclude`.

| Key | Options | Reference |
| --- | --- | --- |
| `prettier` | `extensions`, `prettier` | [prettier](/transforms/#module-prettier) |
| `htmlmin` | `production`, `minifier` | [htmlmin](/transforms/#module-htmlmin) |
| `cleanAttrs` | `attrs` | [clean-attrs](/transforms/#module-clean-attrs) |

```js
config.addPlugin(dashly, {
	transforms: {
		exclude: ["cleanAttrs"],
		prettier: { prettier: { printWidth: 100 } },
		htmlmin: { production: false },
	},
});
```
