/**
 * Responsive image shortcode powered by `@11ty/eleventy-img`. Requires the
 * image package as a peer dependency.
 *
 * @module @allons-y/dashly/shortcodes/image
 */

const DEFAULT_FORMATS = ['webp', 'png'];

/**
 * Create an Eleventy shortcode that emits a responsive `<picture>` element.
 * Bind it with `config.addShortcode('image', createImageShortcode({ ... }))`.
 *
 * @param {import('@11ty/eleventy-img').BaseImageOptions} imageOptions
 *   Base options passed to `@11ty/eleventy-img`. `widths`, `formats`, and
 *   `htmlOptions.imgAttributes` are merged per-call.
 * @returns {(src: string, alt: string, widths?: number[], sizes?: string) => Promise<string>}
 */
export const createImageShortcode = (imageOptions = {}) => {
	const baseFormats = imageOptions.formats ?? DEFAULT_FORMATS;

	return async function imageShortcode(src, alt, widths = [320], sizes = '') {
		const { default: Image } = await import('@11ty/eleventy-img');
		return Image(src, {
			...imageOptions,
			formats: baseFormats,
			widths,
			returnType: 'html',
			htmlOptions: {
				...(imageOptions.htmlOptions ?? {}),
				imgAttributes: {
					alt,
					sizes,
					'eleventy:ignore': '',
					...(imageOptions.htmlOptions?.imgAttributes ?? {}),
				},
			},
		});
	};
};
