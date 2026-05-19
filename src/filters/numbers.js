/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Locale-aware number-formatting filters built on `Intl.NumberFormat`.
 *
 * @module @allons-y/dashly/filters/numbers
 */

const toNumber = (value) => {
	if (value == null || value === '') return NaN;
	if (typeof value === 'number') return value;
	const n = Number(value);
	return Number.isFinite(n) ? n : NaN;
};

/**
 * Format a number using `Intl.NumberFormat`. Returns an empty string for
 * non-numeric input so templates render gracefully.
 *
 * @param {number | string} value
 * @param {Intl.NumberFormatOptions} [options]
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @returns {string}
 *
 * @example
 * // '1,234,567'
 * number(1234567);
 *
 * @example
 * // '1 234 567,89'
 * number(1234567.89, { maximumFractionDigits: 2 }, 'fr-FR');
 *
 * @example
 * {{ stats.views | number }}
 */
export const number = (value, options = {}, locale = 'en-US') => {
	const n = toNumber(value);
	if (isNaN(n)) return '';
	return new Intl.NumberFormat(locale, options).format(n);
};

/**
 * Format a number as a localized currency string.
 *
 * @param {number | string} value
 * @param {string} [currencyCode='USD'] ISO 4217 currency code.
 * @param {Intl.LocalesArgument} [locale='en-US']
 * @param {Intl.NumberFormatOptions} [options] Extra `Intl.NumberFormat` options.
 * @returns {string}
 *
 * @example
 * // '$1,299.00'
 * currency(1299);
 *
 * @example
 * // '1 299,00 €'
 * currency(1299, 'EUR', 'fr-FR');
 *
 * @example
 * {{ product.price | currency('USD') }}
 */
export const currency = (value, currencyCode = 'USD', locale = 'en-US', options = {}) => {
	const n = toNumber(value);
	if (isNaN(n)) return '';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
		...options,
	}).format(n);
};

/**
 * Format a number as a localized percentage. Input is treated as a fraction by
 * default (`0.25` → `25%`); pass `{ asFraction: false }` to format whole-number
 * percentages (`25` → `25%`).
 *
 * @param {number | string} value
 * @param {object} [options]
 * @param {boolean} [options.asFraction=true] Treat input as a 0–1 fraction. Set false for whole-number percentages.
 * @param {number} [options.maximumFractionDigits=0]
 * @param {Intl.LocalesArgument} [options.locale='en-US']
 * @returns {string}
 *
 * @example
 * // '25%'
 * percent(0.25);
 *
 * @example
 * // '25%'
 * percent(25, { asFraction: false });
 *
 * @example
 * // '25.5%'
 * percent(0.255, { maximumFractionDigits: 1 });
 *
 * @example
 * {{ survey.completionRate | percent }}
 */
export const percent = (value, options = {}) => {
	const n = toNumber(value);
	if (isNaN(n)) return '';
	const { asFraction = true, maximumFractionDigits = 0, locale = 'en-US', ...rest } = options;
	const fraction = asFraction ? n : n / 100;
	return new Intl.NumberFormat(locale, {
		style: 'percent',
		maximumFractionDigits,
		...rest,
	}).format(fraction);
};
