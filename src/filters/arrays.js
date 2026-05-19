/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Array-manipulation filters for Eleventy. Universal across template engines —
 * Nunjucks and Liquid have native `first` / `last` / `reverse` filters, but
 * Eleventy's JS templates and other engines do not. Registering these via
 * dashly makes them available everywhere.
 *
 * @module @allons-y/dashly/filters/arrays
 */

/**
 * Return the first item of an array, or the first `n` items if a count is
 * supplied. With no count, matches Nunjucks `first` (single item). With a
 * count, returns the first N items — covers the "limit / head" use case.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {number} [n]
 * @returns {T | T[] | undefined}
 *
 * @example
 * // 'a'
 * first(['a', 'b', 'c']);
 *
 * @example
 * // ['a', 'b']
 * first(['a', 'b', 'c'], 2);
 *
 * @example
 * {{ collections.posts | first }}
 *
 * @example
 * {% for post in collections.posts | first(3) %} … {% endfor %}
 */
export const first = (value, n) => {
	if (!Array.isArray(value)) return value;
	if (n === undefined) return value[0];
	if (n <= 0) return [];
	return value.slice(0, n);
};

/**
 * Return the last item of an array, or the last `n` items if a count is
 * supplied. Mirror of {@link first}.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {number} [n]
 * @returns {T | T[] | undefined}
 *
 * @example
 * // 'c'
 * last(['a', 'b', 'c']);
 *
 * @example
 * // ['b', 'c']
 * last(['a', 'b', 'c'], 2);
 *
 * @example
 * {{ collections.posts | last }}
 */
export const last = (value, n) => {
	if (!Array.isArray(value)) return value;
	if (n === undefined) return value[value.length - 1];
	if (n <= 0) return [];
	return value.slice(-n);
};

/**
 * Reverse an array or a string without mutating the input.
 *
 * @template T
 * @param {readonly T[] | string} value
 * @returns {T[] | string}
 *
 * @example
 * // [3, 2, 1]
 * reverse([1, 2, 3]);
 *
 * @example
 * // 'cba'
 * reverse('abc');
 *
 * @example
 * {{ collections.posts | reverse }}
 */
export const reverse = (value) => {
	if (Array.isArray(value)) return value.slice().reverse();
	if (typeof value === 'string') return Array.from(value).reverse().join('');
	return value;
};

const getPath = (obj, path) => {
	if (obj == null) return undefined;
	if (typeof path === 'function') return path(obj);
	const keys = String(path).split('.');
	let cur = obj;
	for (const k of keys) {
		if (cur == null) return undefined;
		cur = cur[k];
	}
	return cur;
};

/**
 * Group array items by a key, a dot-path, or a function. Returns a plain
 * object keyed by the grouping value, with each value an array of items.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {string | ((item: T) => unknown)} keyOrFn Property name (dot-paths supported, e.g. `'data.year'`) or selector function.
 * @returns {Record<string, T[]>}
 *
 * @example
 * // { 2025: [...], 2026: [...] }
 * groupBy(posts, 'data.year');
 *
 * @example
 * groupBy(posts, (p) => p.data.tags[0]);
 *
 * @example
 * {% for year, items in collections.posts | groupBy('data.year') %} … {% endfor %}
 */
export const groupBy = (value, keyOrFn) => {
	if (!Array.isArray(value)) return {};
	const out = {};
	for (const item of value) {
		const k = String(getPath(item, keyOrFn));
		(out[k] ??= []).push(item);
	}
	return out;
};

/**
 * Sort an array by a key, dot-path, or selector function, without mutating
 * the input. String values are compared with `localeCompare`; everything else
 * with standard `<` / `>`.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {string | ((item: T) => unknown)} keyOrFn
 * @param {'asc' | 'desc'} [order='asc']
 * @returns {T[]}
 *
 * @example
 * sortBy(posts, 'data.date', 'desc');
 *
 * @example
 * sortBy(items, (item) => item.priority);
 */
export const sortBy = (value, keyOrFn, order = 'asc') => {
	if (!Array.isArray(value)) return value;
	const dir = order === 'desc' ? -1 : 1;
	return value.slice().sort((a, b) => {
		const av = getPath(a, keyOrFn);
		const bv = getPath(b, keyOrFn);
		if (av === bv) return 0;
		if (av == null) return 1;
		if (bv == null) return -1;
		if (typeof av === 'string' && typeof bv === 'string') {
			return av.localeCompare(bv) * dir;
		}
		return (av < bv ? -1 : 1) * dir;
	});
};

/**
 * Split an array into N-sized chunks. The final chunk may be smaller than
 * `size`. Returns an empty array for non-array or invalid-size input.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {number} size
 * @returns {T[][]}
 *
 * @example
 * // [[1, 2], [3, 4], [5]]
 * chunk([1, 2, 3, 4, 5], 2);
 *
 * @example
 * {# render a gallery grid #}
 * {% for row in images | chunk(3) %} … {% endfor %}
 */
export const chunk = (value, size) => {
	if (!Array.isArray(value) || !Number.isInteger(size) || size <= 0) return [];
	const out = [];
	for (let i = 0; i < value.length; i += size) {
		out.push(value.slice(i, i + size));
	}
	return out;
};

/**
 * Filter an array by a key/dot-path equality check. When `expected` is
 * omitted, items where the keyed value is truthy are kept (useful for
 * `where(posts, 'data.featured')`).
 *
 * @template T
 * @param {readonly T[]} value
 * @param {string | ((item: T) => unknown)} keyOrFn
 * @param {unknown} [expected]
 * @returns {T[]}
 *
 * @example
 * where(posts, 'data.draft', false);
 *
 * @example
 * where(posts, 'data.featured'); // truthy-only
 */
const WHERE_TRUTHY = Symbol('where:truthy');
export const where = (value, keyOrFn, expected = WHERE_TRUTHY) => {
	if (!Array.isArray(value)) return [];
	if (expected === WHERE_TRUTHY) {
		return value.filter((item) => Boolean(getPath(item, keyOrFn)));
	}
	return value.filter((item) => getPath(item, keyOrFn) === expected);
};

/**
 * Project an array of objects onto a single key or dot-path.
 *
 * @template T
 * @param {readonly T[]} value
 * @param {string | ((item: T) => unknown)} keyOrFn
 * @returns {unknown[]}
 *
 * @example
 * // ['Hello', 'World']
 * pluck([{ title: 'Hello' }, { title: 'World' }], 'title');
 *
 * @example
 * {{ collections.posts | pluck('data.title') | join(', ') }}
 */
export const pluck = (value, keyOrFn) => {
	if (!Array.isArray(value)) return [];
	return value.map((item) => getPath(item, keyOrFn));
};
