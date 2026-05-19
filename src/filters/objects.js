/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Object-related filters for Eleventy.
 * @module @allons-y/dashly/filters/objects
 */

/**
 * Return the enumerable keys of an object. Returns an empty array for nullish
 * or non-object values so templates can `{% for %}` safely.
 * @param {object} value
 * @returns {string[]}
 */
export const keys = (value) => {
	if (value == null || typeof value !== 'object') return [];
	return Object.keys(value);
};
