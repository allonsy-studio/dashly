/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Debugging filters for rendering template data into output for inspection.
 *
 * @module @allons-y/dashly/filters/debug
 */

const circularSafeReplacer = () => {
	const seen = new WeakSet();
	return (_key, value) => {
		if (typeof value === 'object' && value !== null) {
			if (seen.has(value)) return '[Circular]';
			seen.add(value);
		}
		if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
		if (typeof value === 'bigint') return value.toString() + 'n';
		if (value instanceof Date) return value.toISOString();
		if (value instanceof RegExp) return value.toString();
		return value;
	};
};

/**
 * Serialize a value as pretty-printed JSON. Handles circular references,
 * functions, BigInts, Dates, and RegExps so it never throws inside a template.
 *
 * @param {unknown} value
 * @param {number} [indent=2] Indent width passed to `JSON.stringify`.
 * @returns {string}
 *
 * @example
 * // <pre>{{ page | dump }}</pre>
 *
 * @example
 * {{ collections.posts[0] | dump(0) }}
 *
 * @example
 * // '{"a":1}'
 * dump({ a: 1 }, 0);
 */
export const dump = (value, indent = 2) => JSON.stringify(value, circularSafeReplacer(), indent);

/**
 * Alias for {@link dump}. Some teams prefer the `| jsonify` name.
 *
 * @param {unknown} value
 * @param {number} [indent=2]
 * @returns {string}
 */
export const jsonify = dump;
