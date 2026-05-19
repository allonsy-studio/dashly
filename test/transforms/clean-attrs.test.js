/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { createCleanAttrsTransform } from '../../src/transforms/clean-attrs.js';

describe('createCleanAttrsTransform', () => {
	it('strips eleventy:ignore="" from .html output', () => {
		const transform = createCleanAttrsTransform();
		const ctx = { page: { outputPath: '/site/index.html' } };
		const input =
			'<picture><img eleventy:ignore="" src="a.png" alt="a"></picture>';
		const out = transform.call(ctx, input);
		expect(out).not.toMatch(/eleventy:ignore/);
		expect(out).toMatch(/<img src="a.png" alt="a">/);
	});

	it('passes through non-HTML output untouched', () => {
		const transform = createCleanAttrsTransform();
		const ctx = { page: { outputPath: '/site/feed.xml' } };
		const input = '<x eleventy:ignore="" />';
		expect(transform.call(ctx, input)).toBe(input);
	});

	it('accepts additional attribute names', () => {
		const transform = createCleanAttrsTransform({ attrs: ['data-foo'] });
		const ctx = { page: { outputPath: 'index.html' } };
		expect(transform.call(ctx, '<p data-foo="">x</p>')).toBe('<p>x</p>');
	});
});
