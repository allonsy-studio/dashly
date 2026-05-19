/**
 * Tag-list helpers for Eleventy. Use to clean Eleventy's system-tag noise
 * (`all`, `post`, `posts`, etc.) out of a tag list before rendering it.
 *
 * @module @allons-y/dashly/filters/tags
 */

export const DEFAULT_EXCLUDED_TAGS = Object.freeze(['all', 'post', 'posts']);

/**
 * Filter an array of tag strings to exclude system tags and any additional
 * names supplied either as plugin defaults or as a per-call extra list.
 *
 * The plugin wires its `tagsExclude` option into the default exclusion list
 * so callers configure once in `eleventy.config.js`. Per-call extras are
 * added on top, not replacing the defaults.
 *
 * @param {readonly string[]} tagList
 * @param {readonly string[]} [extraExclude] Names to exclude in addition to the configured defaults.
 * @param {readonly string[]} [defaultExclude=DEFAULT_EXCLUDED_TAGS]
 * @returns {string[]}
 *
 * @example
 * // ['design', 'engineering']
 * tags(['all', 'post', 'design', 'engineering']);
 *
 * @example
 * tags(['all', 'post', 'design', 'draft'], ['draft']);
 *
 * @example
 * {% for tag in collections.all | getAllTags | tags %} … {% endfor %}
 */
export const tags = (tagList, extraExclude = [], defaultExclude = DEFAULT_EXCLUDED_TAGS) => {
	if (!Array.isArray(tagList)) return [];
	const excluded = new Set([...defaultExclude, ...extraExclude]);
	return tagList.filter((t) => typeof t === 'string' && !excluded.has(t));
};
