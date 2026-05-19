/**
 * Eleventy transform that minifies HTML output via `html-minifier-terser`.
 * Requires `html-minifier-terser` as a peer dependency.
 *
 * @module @allons-y/dashly/transforms/htmlmin
 */

const DEFAULT_OPTIONS = {
	collapseInlineTagWhitespace: false,
	collapseWhitespace: true,
	removeComments: true,
	sortClassName: true,
	useShortDoctype: true,
};

/**
 * Create the HTML minification transform. By default it runs only when
 * `process.env.ELEVENTY_ENV === 'production'`; pass `production: false` to
 * always run or `production: true` to enforce the gate explicitly.
 *
 * @param {object} [options]
 * @param {boolean} [options.production] When true, only run in production. Defaults to true.
 * @param {import('html-minifier-terser').Options} [options.minifier] Options forwarded to html-minifier-terser.
 * @returns {(content: string, outputPath?: string) => Promise<string>}
 */
export const createHtmlMinTransform = (options = {}) => {
	const productionOnly = options.production !== false;
	const minifierOptions = { ...DEFAULT_OPTIONS, ...(options.minifier ?? {}) };

	return async function htmlminTransform(content, outputPath) {
		if (productionOnly && process.env.ELEVENTY_ENV !== 'production') return content;
		const path = outputPath ?? this?.page?.outputPath ?? '';
		if (!path.endsWith('.html')) return content;
		const { minify } = await import('html-minifier-terser');
		return minify(content, minifierOptions);
	};
};
