---
title: Use only what you need
description: Register single utilities by hand or import from the narrowest subpath.
icon: feather-pointed
order: 7
templateEngineOverride: md
---

The plugin is optional. Every utility is a named export, so a site can skip `addPlugin` & register exactly what it uses.

## Register by name

```js
import { filters, transforms } from "@allons-y/dashly";

export default function (config) {
	config.addFilter("long", filters.longDate);
	config.addFilter("rss", filters.cleanForRSS);
	config.addTransform("prettier", transforms.createPrettierTransform());
}
```

Registering by hand skips the plugin's option wiring. A filter such as `longDate` then uses its own default locale unless the template passes one.

## Import from the narrowest subpath

The aggregate entries (`@allons-y/dashly/filters`) load every module in the category. A module subpath loads one file, so unused dependencies never enter the bundle.

```js
import { longDate } from "@allons-y/dashly/filters/dates";
import { validateURL } from "@allons-y/dashly/filters/urls";
```

Each module in the reference opens with its exact import.

## Mix the plugin with exclusions

When most utilities are wanted, keep the plugin & exclude the rest:

```js
config.addPlugin(dashly, {
	filters: { exclude: ["title"] },
	transforms: false,
});
```
