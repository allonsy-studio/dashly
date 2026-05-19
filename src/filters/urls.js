/**
 * URL-related filters for Eleventy.
 * @module @allons-y/dashly/filters/urls
 */

/**
 * Ensure a URL is safe to render. Passes through `mailto:`, `tel:`, fragments,
 * relative paths, and URLs already prefixed with `http(s):`. Everything else is
 * prefixed with `https://`. All output is URI-encoded.
 *
 * Note: pass the full URL string. This filter is not context-aware.
 * @param {string} url
 * @returns {string}
 */
export const validateURL = (url) => {
	if (!url || typeof url !== 'string') return url;
	if (/^(https?:|mailto:|tel:|\/|#)/.test(url)) return encodeURI(url);
	return `https://${encodeURI(url)}`;
};

/**
 * Resolve a path or URL against a base, producing an absolute URL. Useful for
 * canonical tags, OpenGraph metadata, JSON-LD, and RSS/Atom feeds — anywhere a
 * fully-qualified URL is required.
 *
 * Already-absolute URLs are returned unchanged. `mailto:`, `tel:`, and
 * fragment-only (`#section`) inputs pass through as-is. Empty/nullish input
 * returns an empty string.
 *
 * @param {string} path A relative path, absolute path, or full URL.
 * @param {string} [baseUrl] The site's origin (e.g. `https://example.com`).
 *   Trailing slashes are tolerated. If omitted, the input is returned
 *   unchanged — useful during local development.
 * @returns {string}
 *
 * @example
 * // 'https://example.com/posts/hello'
 * absoluteUrl('/posts/hello', 'https://example.com');
 *
 * @example
 * // 'https://example.com/posts/hello'
 * absoluteUrl('posts/hello', 'https://example.com/');
 *
 * @example
 * // 'https://other.com/x' — already absolute, returned as-is
 * absoluteUrl('https://other.com/x', 'https://example.com');
 *
 * @example
 * {# canonical tag #}
 * <link rel="canonical" href="{{ page.url | absoluteUrl }}">
 */
export const absoluteUrl = (path, baseUrl) => {
	if (path == null || path === '') return '';
	if (typeof path !== 'string') return path;
	if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
	if (!baseUrl) return path;

	try {
		return new URL(path, baseUrl).toString();
	} catch {
		const base = String(baseUrl).replace(/\/+$/, '');
		const rest = path.replace(/^\/+/, '');
		return `${base}/${rest}`;
	}
};
