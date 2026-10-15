---
title: Metadata, feeds, & absolute URLs
description: Canonical tags, JSON-LD dates, & RSS-safe content.
icon: rss
order: 9
templateEngineOverride: md
---

## Set a base URL once

```js
config.addPlugin(dashly, { baseUrl: "https://example.com" });
```

[`absoluteUrl`](/filters/#absoluteUrl) resolves paths against it. Full URLs, `mailto:`, `tel:`, & fragment links pass through unchanged. Without `baseUrl`, paths come back as given, which keeps local development simple.

## Canonical & social tags

```njk
<link rel="canonical" href="{{ page.url | absoluteUrl }}">
<meta property="og:url" content="{{ page.url | absoluteUrl }}">
<meta property="og:image" content="{{ image | absoluteUrl }}">
```

## Dates for machines & people

[`toISOString`](/filters/#toISOString) feeds `<time>` elements & JSON-LD. [`longDate`](/filters/#longDate) & [`timeAgo`](/filters/#timeAgo) read well on the page.

```njk
<time datetime="{{ post.date | toISOString }}">{{ post.date | longDate }}</time>
```

Date-only strings such as `2026-01-15` render as the same day everywhere: formatting defaults to UTC.

## Feeds

[`cleanForRSS`](/filters/#cleanForRSS) strips scripts, embeds, & heading permalinks from rendered HTML. Pass `customTags` for web components that feed readers cannot render. It needs the `posthtml` peer.
