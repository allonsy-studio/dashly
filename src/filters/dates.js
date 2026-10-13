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

import { arg, intl } from '../validate.js';

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
 *
 * Defaults to `timeZone: 'UTC'` so a date-only string like `'2026-01-15'`
 * (which `Date` parses as midnight UTC) renders as "15 January" everywhere,
 * not "14 January" on machines west of Greenwich. Pass `timeZone` in
 * `options` to override.
 *
 * @param {string | number | Date} value
 * @param {Intl.DateTimeFormatOptions} [options]
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string | number | Date} The formatted string, or `value` unchanged when it is falsy or unparseable.
 */
export const dateFormat = (value, options, locale) => {
	const formatOptions = arg.object('dateFormat', 'options', options) ?? {};
	const tag = arg.locale('dateFormat', 'locale', locale) ?? 'en-US';
	if (!value) return value;
	const d = new Date(value);
	if (isNaN(d.getTime())) return value;
	return intl('dateFormat', 'locale or options', () => d.toLocaleDateString(tag, { timeZone: 'UTC', ...formatOptions }));
};

/**
 * Format a date as a long-form date (e.g. "15 January 2026").
 * @param {string | number | Date} value
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string | number | Date} The formatted date, or `value` unchanged when it is falsy or unparseable.
 */
export const longDate = (value, locale) =>
	dateFormat(value, { day: 'numeric', month: 'long', year: 'numeric' }, arg.locale('longDate', 'locale', locale));

/**
 * Format a date as an abbreviated month-and-year (e.g. "Jan 2026").
 * @param {string | number | Date} value
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string | number | Date} The formatted date, or `value` unchanged when it is falsy or unparseable.
 */
export const shortDate = (value, locale) =>
	dateFormat(value, { month: 'short', year: 'numeric' }, arg.locale('shortDate', 'locale', locale));

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
export const relativeDate = (value, locale, options) => {
	const tag = arg.locale('relativeDate', 'locale', locale) ?? 'en-US';
	const opts = arg.object('relativeDate', 'options', options) ?? {};
	const now = arg.date('relativeDate', 'options.now', opts.now) ?? new Date();
	const style = arg.oneOf(['long', 'short', 'narrow'])('relativeDate', 'options.style', opts.style) ?? 'long';
	const numeric = arg.oneOf(['always', 'auto'])('relativeDate', 'options.numeric', opts.numeric) ?? 'auto';
	if (!value) return '';
	const d = new Date(value);
	if (isNaN(d.getTime())) return '';
	const diffSeconds = (d.getTime() - now.getTime()) / 1000;
	const formatter = intl('relativeDate', 'locale', () => new Intl.RelativeTimeFormat(tag, { style, numeric }));
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
