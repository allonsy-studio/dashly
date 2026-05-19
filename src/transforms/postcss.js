/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * PostCSS processing helper for Eleventy bundles or `addExtension('css', ...)`
 * setups. Requires `postcss` as a peer dependency.
 *
 * @module @allons-y/dashly/transforms/postcss
 */

import path from 'node:path';
import { writeFile } from 'node:fs/promises';

/**
 * Run a CSS string through PostCSS using the plugins and options supplied in
 * `config` (the shape returned by `postcss-load-config`). If a source map is
 * produced it is written next to the CSS output as `<name>.css.map`.
 *
 * @param {string} content
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {{ plugins?: import('postcss').AcceptedPlugin[], options?: import('postcss').ProcessOptions }} [config]
 * @returns {Promise<string>}
 */
export const processCSS = async (content, inputPath, outputPath, config = {}) => {
	const { default: postcss } = await import('postcss');
	const parsed = path.parse(inputPath);

	const result = await postcss(config.plugins ?? []).process(content, {
		...(config.options ?? {}),
		from: inputPath,
		to: outputPath,
	});

	if (result.map && outputPath) {
		const outputFolder = path.join(path.dirname(outputPath), 'css');
		await writeFile(path.join(outputFolder, `${parsed.name}.css.map`), result.map.toString());
	}

	return result.css;
};
