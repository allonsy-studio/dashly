/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Filters are plain functions registered with `addFilter`, so they work in
 * Nunjucks, Liquid, & 11ty.js (JavaScript) templates.
 * This entry re-exports every filter module; for narrower bundles, import
 * directly from a subpath (e.g. `@allons-y/dashly/filters/dates`).
 *
 * @module @allons-y/dashly/filters
 */

export * from "./dates.js";
export * from "./strings.js";
export * from "./urls.js";
export * from "./objects.js";
export * from "./html.js";
export * from "./text.js";
export * from "./debug.js";
export * from "./arrays.js";
export * from "./numbers.js";
export * from "./tags.js";
