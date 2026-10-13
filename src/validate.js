/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Argument checks that explain why a call failed. Internal to dashly.
 *
 * An argument that is omitted (`undefined`, `null`, or the options object that
 * Handlebars appends to every helper call) yields `undefined`, so the caller
 * can fall back to its default. An argument that is present but the wrong type
 * throws a {@link DashlyArgumentError} naming the filter, the parameter, what
 * was expected, & what arrived.
 *
 * @module @allons-y/dashly/validate
 */

/**
 * Handlebars appends `{ name, hash, data, loc, lookupProperty }` as the last
 * argument of every helper call.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isHelperOptions = (value) =>
	typeof value === 'object' &&
	value !== null &&
	typeof (/** @type {any} */ (value).lookupProperty) === 'function' &&
	typeof (/** @type {any} */ (value).hash) === 'object';

/**
 * True when an argument was not supplied, so a default should apply.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const omitted = (value) => value === undefined || value === null || isHelperOptions(value);

/**
 * Describe a received value for an error message.
 *
 * @param {unknown} value
 * @returns {string}
 */
export const describe = (value) => {
	if (isHelperOptions(value)) return 'the Handlebars options object (the argument was not supplied)';
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (Array.isArray(value)) return `an array of ${value.length}`;
	if (value instanceof Promise) return 'a Promise';
	if (value instanceof Date) return 'a Date';
	switch (typeof value) {
		case 'string':
			return `the string ${JSON.stringify(value.length > 40 ? `${value.slice(0, 40)}…` : value)}`;
		case 'number':
			return `the number ${value}`;
		case 'boolean':
			return `the boolean ${value}`;
		case 'function':
			return 'a function';
		case 'object':
			return 'an object';
		default:
			return `a ${typeof value}`;
	}
};

/**
 * Thrown when a filter receives an argument of the wrong type.
 *
 * @example
 * // dashly: readingTime(): "wpm" must be a number, but received the string "fast".
 * readingTime(post.content, 'fast');
 */
export class DashlyArgumentError extends TypeError {
	/**
	 * @param {{ fn: string, param: string, expected: string, received: unknown, hint?: string, message?: string }} details
	 *   `message` replaces the generated text, for failures that are not a plain type mismatch.
	 */
	constructor({ fn, param, expected, received, hint, message }) {
		super(message ?? `dashly: ${fn}(): "${param}" must be ${expected}, but received ${describe(received)}.${hint ? ` ${hint}` : ''}`);
		this.name = 'DashlyArgumentError';
		this.fn = fn;
		this.param = param;
		this.expected = expected;
		this.received = received;
	}
}

/**
 * Suggest a fix for the most common mistakes.
 *
 * @param {string} expected
 * @param {unknown} received
 * @returns {string | undefined}
 */
const hintFor = (expected, received) => {
	if (received instanceof Promise) return 'Filters cannot await a value; resolve it before passing it in.';
	if (typeof received === 'string' && /number|integer/.test(expected) && received.trim() !== '' && !Number.isNaN(Number(received))) {
		return `Numeric strings are not converted; pass the number ${Number(received)} instead.`;
	}
	return undefined;
};

/**
 * Build a check for an optional argument.
 *
 * @template T
 * @param {string} expected Phrase completing "must be …".
 * @param {(value: unknown) => value is T} test
 * @returns {(fn: string, param: string, value: unknown) => T | undefined}
 */
const optional = (expected, test) => (fn, param, value) => {
	if (omitted(value)) return undefined;
	if (test(value)) return value;
	throw new DashlyArgumentError({ fn, param, expected, received: value, hint: hintFor(expected, value) });
};

/** @param {unknown} v @returns {v is number} */
const isNumber = (v) => typeof v === 'number' && Number.isFinite(v);
/** @param {unknown} v @returns {v is string} */
const isString = (v) => typeof v === 'string';
/** @param {unknown} v @returns {v is boolean} */
const isBoolean = (v) => typeof v === 'boolean';
/** @param {unknown} v @returns {v is readonly unknown[]} */
const isArray = (v) => Array.isArray(v);
/** @param {unknown} v @returns {v is readonly string[]} */
const isStringArray = (v) => Array.isArray(v) && v.every(isString);
/** @param {unknown} v @returns {v is Record<string, any>} */
const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
/** @param {unknown} v @returns {v is Date} */
const isValidDate = (v) => v instanceof Date && !Number.isNaN(v.getTime());
/** @param {unknown} v @returns {v is string | number} */
const isIndent = (v) => isNumber(v) || isString(v);
/** @param {unknown} v @returns {v is { render: Function }} */
const isRenderer = (v) => isObject(v) && typeof v.render === 'function';
/** @param {unknown} v @returns {v is Intl.LocalesArgument} */
const isLocale = (v) => isString(v) || (typeof Intl !== 'undefined' && v instanceof Intl.Locale) || (Array.isArray(v) && v.every((l) => isString(l) || l instanceof Intl.Locale));

/**
 * Build a check for a required argument: omitted is an error too.
 *
 * @template T
 * @param {string} expected
 * @param {(value: unknown) => value is T} test
 * @returns {(fn: string, param: string, value: unknown) => T}
 */
const required = (expected, test) => (fn, param, value) => {
	if (!omitted(value) && test(value)) return value;
	throw new DashlyArgumentError({
		fn,
		param,
		expected,
		received: value,
		hint: omitted(value) ? 'This argument is required.' : hintFor(expected, value)
	});
};

/** @param {unknown} v @returns {v is string | Function} */
const isKeyOrFn = (v) => isString(v) || typeof v === 'function';

/**
 * Required-argument checks. Same shape as {@link arg}, but a missing value throws.
 */
export const need = {
	number: required('a finite number', isNumber),
	keyOrFn: required('a property name (dot-paths allowed) or a function', isKeyOrFn)
};

/**
 * Optional-argument checks. Each takes `(fn, param, value)` & returns the value
 * or `undefined` when it was omitted.
 */
export const arg = {
	number: optional('a finite number', isNumber),
	string: optional('a string', isString),
	boolean: optional('true or false', isBoolean),
	array: optional('an array', isArray),
	stringArray: optional('an array of strings', isStringArray),
	object: optional('an object', isObject),
	renderer: optional('a markdown-it instance (an object with a render() method)', isRenderer),
	date: optional('a valid Date', isValidDate),
	locale: optional('a locale tag such as "en-GB", or an array of them', isLocale),
	keyOrFn: optional('a property name (dot-paths allowed) or a function', isKeyOrFn),
	indent: optional('a number or a string', isIndent),
	/**
	 * @template {string} T
	 * @param {readonly T[]} allowed
	 */
	oneOf: (allowed) =>
		optional(`one of ${allowed.map((v) => JSON.stringify(v)).join(', ')}`, /** @type {(value: unknown) => value is T} */ ((v) => allowed.includes(/** @type {T} */ (v))))
};

/**
 * Re-throw an `Intl` failure (a bad locale, currency code, or option) as a
 * {@link DashlyArgumentError}, so the message names the filter.
 *
 * @template T
 * @param {string} fn
 * @param {string} params Parameters that could be at fault, for the message.
 * @param {() => T} run
 * @returns {T}
 */
export const intl = (fn, params, run) => {
	try {
		return run();
	} catch (error) {
		if (!(error instanceof RangeError)) throw error;
		throw new DashlyArgumentError({
			fn,
			param: params,
			expected: 'values Intl accepts',
			received: error.message,
			message: `dashly: ${fn}(): Intl rejected the arguments (${error.message}). Check ${params}.`
		});
	}
};
