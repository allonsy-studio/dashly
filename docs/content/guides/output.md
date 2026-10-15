---
title: Format & minify output
description: Run Prettier & HTML minification, & control when each runs.
icon: file-code
order: 8
templateEngineOverride: md
---

Three transforms act on built pages. Install the peer each one needs; see [How it works](/concepts/).

## Format with Prettier

The `prettier` transform formats `.html`, `.xml`, & `.svg` output. Defaults favor readable source over line wrapping: `printWidth: 512`, `tabWidth: 2`, & `bracketSameLine: true`.

```js
config.addPlugin(dashly, {
	transforms: {
		prettier: {
			extensions: [".html"],
			prettier: { printWidth: 100 },
		},
	},
});
```

`extensions` limits which outputs are formatted. `prettier` merges on top of the defaults.

## Minify in production

The `htmlmin` transform minifies `.html` output, but only when `ELEVENTY_ENV` is `production`.

```sh
ELEVENTY_ENV=production npx @11ty/eleventy
```

Pass `production: false` to minify in every build. Forward any `html-minifier-terser` option through `minifier`.

```js
config.addPlugin(dashly, {
	transforms: {
		htmlmin: { minifier: { removeAttributeQuotes: true } },
	},
});
```

## Clean leftover attributes

The `cleanAttrs` transform removes `eleventy:ignore=""` markers that Eleventy's image transform leaves on `<img>` elements inside `<picture>`. Add more attribute names with `attrs`. The list replaces the default, so include `eleventy:ignore` to keep it.

## Order

The plugin registers `cleanAttrs`, then `prettier`, then `htmlmin`, so minification runs last.
