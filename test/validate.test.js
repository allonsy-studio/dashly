/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { helperOptions } from './helpers.js';
import { DashlyArgumentError, arg, describeValue, intl, isHelperOptions, need, omitted } from '../src/validate.js';

describe('isHelperOptions & omitted', () => {
	it('recognizes the Handlebars options object', () => {
		expect(isHelperOptions(helperOptions())).toBe(true);
	});

	it('does not mistake ordinary objects for it', () => {
		expect(isHelperOptions({ hash: {} })).toBe(false);
		expect(isHelperOptions({ style: 'long' })).toBe(false);
		expect(isHelperOptions(null)).toBe(false);
		expect(isHelperOptions('hash')).toBe(false);
	});

	it('treats undefined, null, & Handlebars options as omitted', () => {
		expect(omitted(undefined)).toBe(true);
		expect(omitted(null)).toBe(true);
		expect(omitted(helperOptions())).toBe(true);
		expect(omitted(0)).toBe(false);
		expect(omitted('')).toBe(false);
		expect(omitted(false)).toBe(false);
	});
});

describe('describing a received value', () => {
	it.each([
		[null, 'null'],
		[undefined, 'undefined'],
		[[1, 2], 'an array of 2'],
		[Promise.resolve(), 'a Promise'],
		[new Date(0), 'a Date'],
		['abc', 'the string "abc"'],
		[NaN, 'the number NaN'],
		[true, 'the boolean true'],
		[() => {}, 'a function'],
		[{}, 'an object'],
		[10n, 'a bigint'],
	])('describes %s', (value, expected) => {
		expect(describeValue(value)).toBe(expected);
	});

	it('shortens long strings', () => {
		expect(describeValue('x'.repeat(100))).toContain('…');
	});

	it('names the Handlebars options object', () => {
		expect(describeValue(helperOptions())).toContain('Handlebars options');
	});
});

describe('arg (optional arguments)', () => {
	it('returns a valid value unchanged', () => {
		expect(arg.number('f', 'p', 3)).toBe(3);
		expect(arg.string('f', 'p', 'a')).toBe('a');
		expect(arg.boolean('f', 'p', false)).toBe(false);
		expect(arg.stringArray('f', 'p', ['a'])).toEqual(['a']);
		expect(arg.locale('f', 'p', 'en-GB')).toBe('en-GB');
		expect(arg.locale('f', 'p', ['en-GB', 'en'])).toEqual(['en-GB', 'en']);
		expect(arg.oneOf(['a', 'b'])('f', 'p', 'a')).toBe('a');
	});

	it('returns undefined for an omitted value, so the default applies', () => {
		expect(arg.number('f', 'p', undefined)).toBeUndefined();
		expect(arg.number('f', 'p', null)).toBeUndefined();
		expect(arg.number('f', 'p', helperOptions())).toBeUndefined();
		expect(arg.object('f', 'p', helperOptions())).toBeUndefined();
	});

	it.each([
		['number', arg.number, 'x'],
		['number', arg.number, NaN],
		['string', arg.string, 5],
		['boolean', arg.boolean, 'true'],
		['array', arg.array, {}],
		['stringArray', arg.stringArray, ['a', 1]],
		['object', arg.object, []],
		['locale', arg.locale, 42],
		['keyOrFn', arg.keyOrFn, {}],
		['indent', arg.indent, true],
		['date', arg.date, new Date('nope')],
		['renderer', arg.renderer, {}],
	])('rejects a wrongly typed %s', (_name, check, value) => {
		expect(() => check('fn', 'param', value)).toThrow(DashlyArgumentError);
	});

	it('rejects a value outside oneOf', () => {
		expect(() => arg.oneOf(['asc', 'desc'])('sortBy', 'order', 'up')).toThrow('must be one of "asc", "desc"');
	});
});

describe('need (required arguments)', () => {
	it('returns a valid value', () => {
		expect(need.number('f', 'p', 2)).toBe(2);
		expect(need.keyOrFn('f', 'p', 'a.b')).toBe('a.b');
	});

	it.each([undefined, null])('requires a value, rejecting %s', (value) => {
		expect(() => need.number('chunk', 'size', value)).toThrow('This argument is required.');
	});

	it('treats the Handlebars options object as missing', () => {
		expect(() => need.keyOrFn('sortBy', 'keyOrFn', helperOptions())).toThrow('the argument was not supplied');
	});
});

describe('DashlyArgumentError', () => {
	it('names the filter, the parameter, what was expected, & what arrived', () => {
		const error = (() => {
			try {
				arg.number('readingTime', 'wpm', 'fast');
			} catch (e) {
				return /** @type {DashlyArgumentError} */ (e);
			}
		})();
		expect(error).toBeInstanceOf(TypeError);
		expect(error?.name).toBe('DashlyArgumentError');
		expect(error?.message).toBe('dashly: readingTime(): "wpm" must be a finite number, but received the string "fast".');
		expect(error).toMatchObject({ fn: 'readingTime', param: 'wpm', expected: 'a finite number', received: 'fast' });
	});

	it('suggests the number when a numeric string was passed', () => {
		expect(() => arg.number('readingTime', 'wpm', '300')).toThrow('pass the number 300 instead');
	});

	it('explains that a Promise cannot be awaited', () => {
		expect(() => arg.number('readingTime', 'wpm', Promise.resolve(1))).toThrow('cannot await');
	});
});

describe('intl', () => {
	it('passes through a successful result', () => {
		expect(intl('number', 'locale', () => 'ok')).toBe('ok');
	});

	it('re-throws an Intl RangeError as a DashlyArgumentError naming the filter', () => {
		expect(() => intl('number', 'locale or options', () => new Intl.NumberFormat('xx_INVALID'))).toThrow(
			'dashly: number(): Intl rejected the arguments (Incorrect locale information provided). Check locale or options.'
		);
	});

	it('leaves other errors alone', () => {
		expect(() =>
			intl('number', 'locale', () => {
				throw new Error('boom');
			})
		).toThrow('boom');
	});
});
