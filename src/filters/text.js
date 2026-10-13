/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Text-analysis filters: word counting, excerpting, and reading-time
 * estimation. Strip HTML so callers can feed rendered post content directly.
 *
 * @module @allons-y/dashly/filters/text
 */

import { arg } from '../validate.js';

/** @param {unknown} value */
const stripHtml = (value) => String(value).replace(/<[^>]*>/g, ' ');

/**
 * @param {unknown} value
 * @returns {string[]}
 */
const words = (value) => {
	if (value == null) return [];
	const text = stripHtml(value).trim();
	if (!text) return [];
	return text.split(/\s+/);
};

/**
 * Count whitespace-delimited words in a string. HTML tags are stripped before
 * counting so rendered post content can be passed in directly.
 *
 * @param {string} value
 * @returns {number}
 *
 * @example
 * // Returns 5
 * wordCount('The quick brown fox jumps');
 *
 * @example
 * {{ post.content | wordCount }}
 */
export const wordCount = (value) => words(value).length;

/**
 * Estimate reading time in minutes for a block of text. Strips HTML, counts
 * words, divides by `wpm` (default 200), and rounds to the nearest whole
 * minute with a floor of 1.
 *
 * Accepts either a string (counted internally) or a pre-computed word count
 * number.
 *
 * @param {string | number} value
 * @param {number} [wpm=200] Words per minute.
 * @returns {number} Whole-minute estimate, minimum 1.
 *
 * @example
 * // Returns 3
 * readingTime('…a 600-word post…');
 *
 * @example
 * {{ post.content | readingTime }} min read
 *
 * @example
 * {{ 1200 | readingTime(250) }}
 */
export const readingTime = (value, wpm) => {
	const perMinute = arg.number('readingTime', 'wpm', wpm) ?? 200;
	const count = typeof value === 'number' ? value : wordCount(value);
	if (!count || !perMinute) return 1;
	return Math.max(1, Math.round(count / perMinute));
};

/**
 * Pull an excerpt from a string. Positive `n` returns the first N units;
 * negative `n` returns the last |N| units. HTML tags are stripped first.
 * Appends an ellipsis on the trimmed side when the input is actually cut.
 *
 * @param {string} value
 * @param {number} [n=30] Word/char count. Negative for trailing slice.
 * @param {'words' | 'chars'} [unit='words']
 * @returns {string}
 *
 * @example
 * // "The quick brown fox jumps…"
 * excerpt('The quick brown fox jumps over the lazy dog', 5);
 *
 * @example
 * // "…over the lazy dog"
 * excerpt('The quick brown fox jumps over the lazy dog', -4);
 *
 * @example
 * {{ post.content | excerpt(40) }}
 *
 * @example
 * {{ post.content | excerpt(200, 'chars') }}
 */
export const excerpt = (value, n, unit) => {
	const limit = arg.number('excerpt', 'n', n) ?? 30;
	const unitOfLength = arg.oneOf(['words', 'chars'])('excerpt', 'unit', unit) ?? 'words';
	if (value == null) return '';
	const text = stripHtml(value).replace(/\s+/g, ' ').trim();
	if (!text || !limit) return text;

	const fromEnd = limit < 0;
	const count = Math.abs(limit);

	if (unitOfLength === 'chars') {
		if (text.length <= count) return text;
		return fromEnd ? '…' + text.slice(-count) : text.slice(0, count) + '…';
	}

	const tokens = text.split(/\s+/);
	if (tokens.length <= count) return text;
	return fromEnd
		? '… ' + tokens.slice(-count).join(' ')
		: tokens.slice(0, count).join(' ') + '…';
};
