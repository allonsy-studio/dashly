/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Eleventy transform that strips `eleventy:ignore=""` markers left on `<img>`
 * tags inside `<picture>` elements. The official
 * `eleventyImageTransformPlugin` only clears the attribute on bare `<img>`
 * elements; this transform finishes the job.
 *
 * @module @allons-y/dashly/transforms/clean-attrs
 */

const EXTRA_ATTRS = ['eleventy:ignore'];

/**
 * Create the attribute-cleanup transform.
 *
 * @param {object} [options]
 * @param {string[]} [options.attrs] Additional attribute names to strip. Defaults to ['eleventy:ignore'].
 * @returns {(content: string) => string}
 */
export const createCleanAttrsTransform = (options = {}) => {
	const attrs = options.attrs ?? EXTRA_ATTRS;
	const patterns = attrs.map((attr) => new RegExp(`\\s+${escapeRegExp(attr)}=""`, 'g'));

	return function cleanAttrsTransform(content) {
		const outputPath = this?.page?.outputPath || '';
		if (!outputPath.endsWith('.html')) return content;
		return patterns.reduce((html, re) => html.replace(re, ''), content);
	};
};

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
