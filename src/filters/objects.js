/**
 * Object-related filters for Eleventy.
 * @module @allons-y/dashly/filters/objects
 */

/**
 * Return the enumerable keys of an object. Returns an empty array for nullish
 * or non-object values so templates can `{% for %}` safely.
 * @param {object} value
 * @returns {string[]}
 */
export const keys = (value) => {
	if (value == null || typeof value !== 'object') return [];
	return Object.keys(value);
};
