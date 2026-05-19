/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { wordCount, readingTime, excerpt } from '../../src/filters/text.js';

describe('wordCount', () => {
	it('counts whitespace-delimited words', () => {
		expect(wordCount('The quick brown fox jumps')).toBe(5);
		expect(wordCount('  spaced   out   ')).toBe(2);
	});

	it('strips HTML before counting', () => {
		expect(wordCount('<p>Hello <strong>world</strong></p>')).toBe(2);
	});

	it('returns 0 for nullish or empty input', () => {
		expect(wordCount(null)).toBe(0);
		expect(wordCount(undefined)).toBe(0);
		expect(wordCount('')).toBe(0);
		expect(wordCount('   ')).toBe(0);
	});
});

describe('readingTime', () => {
	it('estimates minutes at default 200 wpm', () => {
		const text = 'word '.repeat(600).trim();
		expect(readingTime(text)).toBe(3);
	});

	it('respects a custom wpm', () => {
		expect(readingTime(1200, 300)).toBe(4);
	});

	it('accepts a precomputed word count', () => {
		expect(readingTime(200)).toBe(1);
		expect(readingTime(400)).toBe(2);
	});

	it('floors at 1 minute for non-empty input', () => {
		expect(readingTime('a few words')).toBe(1);
	});

	it('returns 1 for empty/nullish input', () => {
		expect(readingTime('')).toBe(1);
		expect(readingTime(null)).toBe(1);
		expect(readingTime(0)).toBe(1);
	});
});

describe('excerpt', () => {
	const sentence = 'The quick brown fox jumps over the lazy dog';

	it('returns the first N words with ellipsis', () => {
		expect(excerpt(sentence, 5)).toBe('The quick brown fox jumps…');
	});

	it('returns the last |N| words with leading ellipsis when N is negative', () => {
		expect(excerpt(sentence, -4)).toBe('… over the lazy dog');
	});

	it('does not append an ellipsis when nothing is trimmed', () => {
		expect(excerpt('one two three', 5)).toBe('one two three');
		expect(excerpt('one two three', -5)).toBe('one two three');
	});

	it('supports a chars unit', () => {
		expect(excerpt(sentence, 9, 'chars')).toBe('The quick…');
		expect(excerpt(sentence, -8, 'chars')).toBe('…lazy dog');
	});

	it('strips HTML before slicing', () => {
		expect(excerpt('<p>The <em>quick</em> brown fox</p>', 2)).toBe('The quick…');
	});

	it('collapses internal whitespace', () => {
		expect(excerpt('one\n\ntwo   three\tfour', 3)).toBe('one two three…');
	});

	it('returns an empty string for nullish input', () => {
		expect(excerpt(null)).toBe('');
		expect(excerpt(undefined)).toBe('');
	});
});
