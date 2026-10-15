---
title: Getting started
description: Install dashly, register the plugin, & use your first filter.
icon: rocket
order: 1
templateEngineOverride: md
---

## Requirements

- Node.js 24 or newer
- Eleventy 3 or newer

## Install

```sh
npm install --save-dev @allons-y/dashly
# or
yarn add --dev @allons-y/dashly
```

dashly is currently in beta. The `latest` & `beta` tags point at the same release.

Heavy dependencies are optional peers. Install the ones that match what is in use:

| Package | Needed by |
| --- | --- |
| `prettier` | The `prettier` transform |
| `html-minifier-terser` | The `htmlmin` transform |
| `posthtml` | The `cleanForRSS` filter |
| `markdown-it` | The `renderMarkdown` filter |
| `postcss` | The `processCSS` helper |

## Register the plugin

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

The plugin registers every filter, transform, & shortcode. Plugin options set project-wide defaults: see [Configuration](/config/).

The default registration includes the `prettier` transform, which runs on every HTML, XML, & SVG file. Either install `prettier` or exclude the transform:

```js
config.addPlugin(dashly, { transforms: { exclude: ["prettier"] } });
```

## Use it in templates

```njk
{{ post.date | longDate }}        {# 15 January 2026 #}
{{ post.content | readingTime }}  {# 4 #}
{{ post.content | excerpt(40) }}  {# first 40 words, ellipsised #}
{{ page.url | absoluteUrl }}      {# https://example.com/posts/hello/ #}
{{ post.date | timeAgo }}         {# 2 days ago #}
&copy; {% currentYear %} Acme Corp.
```

## Next steps

- [How it works](/concepts/)
- [Configuration](/config/)
- [Filters](/filters/)
- [Use only what you need](/guides/a-la-carte/)
