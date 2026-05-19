/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Current-year shortcode for footer copyrights and similar.
 *
 * @module @allons-y/dashly/shortcodes/year
 */

/**
 * Return the current four-digit year. Distinct from the `year` filter, which
 * extracts the year from a passed-in date.
 *
 * @returns {number}
 *
 * @example
 * // <p>&copy; {% year %} Acme Corp.</p>
 *
 * @example
 * // 2026
 * currentYear();
 */
export const currentYear = () => new Date().getFullYear();
