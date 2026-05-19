/**
 * String-manipulation filters for Eleventy.
 * @module @allons-y/dashly/filters/strings
 */

/**
 * Return the first whitespace-delimited word of a string.
 * @param {string} value
 * @returns {string | undefined}
 */
export const firstWord = (value) => {
	if (value == null) return undefined;
	return String(value).trim().split(/\s+/)[0];
};

/**
 * Return the last whitespace-delimited word of a string.
 * @param {string} value
 * @returns {string | undefined}
 */
export const lastWord = (value) => {
	if (value == null) return undefined;
	const words = String(value).trim().split(/\s+/);
	return words[words.length - 1];
};

/**
 * Trim leading and trailing whitespace.
 * @param {string} value
 * @returns {string | undefined}
 */
export const trim = (value) => (value == null ? undefined : String(value).trim());

/**
 * Remove all whitespace characters from a string.
 * @param {string} value
 * @returns {string | undefined}
 */
export const stripWhitespace = (value) =>
	value == null ? undefined : String(value).replace(/\s/g, '');

/**
 * Strip every non-digit character from a string. Useful for phone-number
 * normalization before formatting.
 * @param {string} value
 * @returns {string | undefined}
 */
export const digitsOnly = (value) =>
	value == null ? undefined : String(value).replace(/\D/g, '').trim();

/**
 * Uppercase the first character of a string and lowercase the rest. Matches
 * the semantics of Nunjucks/Liquid `capitalize`.
 *
 * @param {string} value
 * @returns {string | undefined}
 *
 * @example
 * // 'Hello world'
 * capitalize('hello WORLD');
 *
 * @example
 * {{ heading | capitalize }}
 */
export const capitalize = (value) => {
	if (value == null) return undefined;
	const s = String(value);
	if (!s) return s;
	return s[0].toUpperCase() + s.slice(1).toLowerCase();
};

/**
 * Title-case a string by uppercasing the first letter of each whitespace-
 * delimited word and lowercasing the rest. Useful for converting slugs or
 * raw labels into display headings.
 *
 * @param {string} value
 * @returns {string | undefined}
 *
 * @example
 * // 'The Quick Brown Fox'
 * title('the QUICK brown fox');
 *
 * @example
 * {{ tag | title }}
 */
export const title = (value) => {
	if (value == null) return undefined;
	return String(value).replace(
		/\S+/g,
		(word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
	);
};
