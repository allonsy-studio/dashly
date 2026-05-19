/**
 * Current-year shortcode for footer copyrights and similar.
 *
 * @module @allons-y/dashly/shortcodes/year
 */

/**
 * Return the current four-digit year. Distinct from the `year` filter, which
 * extracts the year from a passed-in date.
 *
 * @returns {number}
 *
 * @example
 * // <p>&copy; {% year %} Acme Corp.</p>
 *
 * @example
 * // 2026
 * currentYear();
 */
export const currentYear = () => new Date().getFullYear();
