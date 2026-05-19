/**
 * Eleventy transform that runs Prettier over HTML, XML, and SVG output.
 * Requires `prettier` as a peer dependency.
 *
 * @module @allons-y/dashly/transforms/prettier
 */

import path from 'node:path';

const DEFAULT_EXTENSIONS = ['.html', '.xml', '.svg'];

const DEFAULT_OPTIONS = {
	bracketSameLine: true,
	printWidth: 512,
	parser: 'html',
	tabWidth: 2,
};

/**
 * Create the Prettier transform. Bind to an Eleventy transform with
 * `config.addTransform('prettier', createPrettierTransform())`.
 *
 * @param {object} [options]
 * @param {string[]} [options.extensions] File extensions to format (default: html/xml/svg).
 * @param {import('prettier').Options} [options.prettier] Prettier options (merged on top of dashly defaults).
 * @returns {(content: string) => Promise<string>}
 */
export const createPrettierTransform = (options = {}) => {
	const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
	const prettierOptions = { ...DEFAULT_OPTIONS, ...(options.prettier ?? {}) };

	return async function prettierTransform(content) {
		const outputPath = this?.page?.outputPath || this?.outputPath || '';
		if (!extensions.includes(path.extname(outputPath))) return content;
		const { default: prettier } = await import('prettier');
		return prettier.format(content, prettierOptions);
	};
};
