/**
 * Text-analysis filters: word counting, excerpting, and reading-time
 * estimation. Strip HTML so callers can feed rendered post content directly.
 *
 * @module @allons-y/dashly/filters/text
 */

const stripHtml = (value) => String(value).replace(/<[^>]*>/g, ' ');

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
export const readingTime = (value, wpm = 200) => {
	const count = typeof value === 'number' ? value : wordCount(value);
	if (!count || !wpm) return 1;
	return Math.max(1, Math.round(count / wpm));
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
export const excerpt = (value, n = 30, unit = 'words') => {
	if (value == null) return '';
	const text = stripHtml(value).replace(/\s+/g, ' ').trim();
	if (!text || !n) return text;

	const fromEnd = n < 0;
	const count = Math.abs(n);

	if (unit === 'chars') {
		if (text.length <= count) return text;
		return fromEnd ? '…' + text.slice(-count) : text.slice(0, count) + '…';
	}

	const tokens = text.split(/\s+/);
	if (tokens.length <= count) return text;
	return fromEnd
		? '… ' + tokens.slice(-count).join(' ')
		: tokens.slice(0, count).join(' ') + '…';
};
