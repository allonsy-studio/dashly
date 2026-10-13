---
"@allons-y/dashly": minor
---

**Breaking:** the `year` shortcode is now `currentYear`. Shortcodes & filters share one namespace in Handlebars & 11ty.js, where the shortcode shadowed the `year` filter. Replace `{% year %}` with `{% currentYear %}` & `shortcodes: { exclude: ["year"] }` with `["currentYear"]`; a stale exclude emits a deprecation warning. The `year` filter is unchanged.

Filters now check their optional arguments. A present but wrongly typed argument throws a `DashlyArgumentError` naming the filter, the parameter, & what arrived, instead of failing silently. Omitted arguments, nullish values, & the options object that Handlebars appends to every helper call fall back to defaults, so `readingTime`, `absoluteUrl`, `tags`, & other filters with optional arguments now work in Handlebars.

`cleanForRSS` & `renderMarkdown` stay async. They are documented as unsupported in Handlebars, whose helpers are synchronous.
