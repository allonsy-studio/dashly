/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Transforms process built output. The `prettier`, `htmlmin`, & `clean-attrs`
 * modules export factories that return a function to pass to `addTransform`;
 * `postcss` exports a helper for CSS bundles. Peer dependencies load on first
 * use, so a transform only needs its package when it runs.
 *
 * @module @allons-y/dashly/transforms
 */

export * from "./prettier.js";
export * from "./htmlmin.js";
export * from "./clean-attrs.js";
export * from "./postcss.js";
