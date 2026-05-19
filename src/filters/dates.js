/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Date-related filters for Eleventy.
 * @module @allons-y/dashly/filters/dates
 */

/**
 * Convert a date-like value to an ISO 8601 string. Returns an empty string for
 * falsy inputs or unparseable dates.
 * @param {string | number | Date} date
 * @returns {string}
 */
export const toISOString = (date) => {
	if (!date) return '';
	const d = new Date(date);
	if (isNaN(d.getTime())) return '';
	return d.toISOString();
};

/**
 * Extract the four-digit year from a date-like value. Returns an empty string
 * for falsy or unparseable inputs.
 * @param {string | number | Date} date
 * @returns {number | ''}
 */
export const year = (date) => {
	if (!date) return '';
	const d = new Date(date);
	if (isNaN(d.getTime())) return '';
	return d.getFullYear();
};

/**
 * Format a date using `Intl.DateTimeFormat`. Returns the input unchanged on
 * falsy or unparseable values so templates can render gracefully.
 * @param {string | number | Date} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string}
 */
export const dateFormat = (value, options = {}, locale = 'en-US') => {
	if (!value) return value;
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return d.toLocaleDateString(locale, options);
};

/**
 * Format a date as a long-form date (e.g. "15 January 2026").
 * @param {string | number | Date} value
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string}
 */
export const longDate = (value, locale = 'en-US') =>
	dateFormat(value, { day: 'numeric', month: 'long', year: 'numeric' }, locale);

/**
 * Format a date as an abbreviated month-and-year (e.g. "Jan 2026").
 * @param {string | number | Date} value
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string}
 */
export const shortDate = (value, locale = 'en-US') =>
	dateFormat(value, { month: 'short', year: 'numeric' }, locale);

const UNITS = /** @type {const} */ ([
	['year', 60 * 60 * 24 * 365],
	['month', 60 * 60 * 24 * 30],
	['week', 60 * 60 * 24 * 7],
	['day', 60 * 60 * 24],
	['hour', 60 * 60],
	['minute', 60],
	['second', 1],
]);

/**
 * Format a date as a locale-aware relative phrase (e.g. "2 days ago",
 * "in 3 months"). Wraps `Intl.RelativeTimeFormat`.
 *
 * The reference point is `now` by default but can be overridden — useful for
 * stable build output and for testing.
 *
 * @param {string | number | Date} value
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @param {object} [options]
 * @param {Date} [options.now] Reference date to compare against. Defaults to `new Date()`.
 * @param {Intl.RelativeTimeFormatStyle} [options.style='long']
 * @param {'auto' | 'always'} [options.numeric='auto'] `'auto'` produces "yesterday" / "tomorrow"; `'always'` forces "1 day ago".
 * @returns {string}
 *
 * @example
 * // 'yesterday'
 * relativeDate(new Date(Date.now() - 86_400_000));
 *
 * @example
 * // '2 mo. ago'
 * relativeDate('2026-01-15', 'en-US', { now: new Date('2026-03-20'), style: 'short' });
 *
 * @example
 * {{ post.date | timeAgo }}
 */
export const relativeDate = (value, locale = 'en-US', options = {}) => {
	if (!value) return '';
	const d = new Date(value);
	if (isNaN(d.getTime())) return '';
	const now = options.now ?? new Date();
	const diffSeconds = (d.getTime() - now.getTime()) / 1000;
	const formatter = new Intl.RelativeTimeFormat(locale, {
		style: options.style ?? 'long',
		numeric: options.numeric ?? 'auto',
	});
	for (const [unit, secondsPerUnit] of UNITS) {
		if (Math.abs(diffSeconds) >= secondsPerUnit || unit === 'second') {
			const value = Math.round(diffSeconds / secondsPerUnit);
			return formatter.format(value, unit);
		}
	}
	return formatter.format(0, 'second');
};

/**
 * Alias for {@link relativeDate}. Some teams prefer the `| timeAgo` name.
 */
export const timeAgo = relativeDate;
