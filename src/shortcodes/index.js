/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Shortcodes are registered with `addShortcode` & called as `{% name %}` in
 * templates. This entry re-exports every shortcode module.
 *
 * @module @allons-y/dashly/shortcodes
 */

export * from "./year.js";
