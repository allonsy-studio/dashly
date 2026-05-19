/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { dashlyPlugin } from '../src/plugin.js';

const createFakeEleventyConfig = () => {
	const filters = {};
	const transforms = {};
	const shortcodes = {};
	return {
		filters,
		transforms,
		shortcodes,
		addFilter(name, fn) {
			filters[name] = fn;
		},
		addTransform(name, fn) {
			transforms[name] = fn;
		},
		addShortcode(name, fn) {
			shortcodes[name] = fn;
		},
	};
};

describe('dashlyPlugin', () => {
	it('registers the default filter set', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(Object.keys(cfg.filters)).toEqual(
			expect.arrayContaining(['toISOString', 'year', 'longDate', 'shortDate', 'trim', 'validateURL'])
		);
	});

	it('registers all three transforms by default', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(Object.keys(cfg.transforms).sort()).toEqual(['cleanAttrs', 'htmlmin', 'prettier']);
	});

	it('honors filters: false to skip all filters', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { filters: false });
		expect(cfg.filters).toEqual({});
	});

	it('honors per-category exclude lists', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, {
			filters: { exclude: ['toISOString', 'cleanForRSS'] },
			transforms: { exclude: ['htmlmin'] },
		});
		expect(cfg.filters.toISOString).toBeUndefined();
		expect(cfg.filters.cleanForRSS).toBeUndefined();
		expect(cfg.filters.year).toBeDefined();
		expect(cfg.transforms.htmlmin).toBeUndefined();
		expect(cfg.transforms.prettier).toBeDefined();
	});

it('applies dateLocale to longDate and shortDate', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { dateLocale: 'en-GB' });
		expect(cfg.filters.longDate('2026-01-15')).toMatch(/15 January 2026/);
	});

	it('registers text and debug filters', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(cfg.filters.wordCount('one two three')).toBe(3);
		expect(cfg.filters.excerpt('a b c d e', 2)).toBe('a b…');
		expect(cfg.filters.dump({ a: 1 }, 0)).toBe('{"a":1}');
		expect(cfg.filters.jsonify).toBe(cfg.filters.dump);
	});

	it('applies readingTimeWpm to readingTime', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { readingTimeWpm: 100 });
		expect(cfg.filters.readingTime(300)).toBe(3);
	});

	it('registers the year shortcode by default', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(cfg.shortcodes.year()).toBe(new Date().getFullYear());
	});

	it('honors shortcodes.exclude for the year shortcode', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { shortcodes: { exclude: ['year'] } });
		expect(cfg.shortcodes.year).toBeUndefined();
	});

	it('applies baseUrl to absoluteUrl', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { baseUrl: 'https://example.com' });
		expect(cfg.filters.absoluteUrl('/posts/hi')).toBe('https://example.com/posts/hi');
	});

	it('lets a per-call override beat the configured baseUrl', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { baseUrl: 'https://example.com' });
		expect(cfg.filters.absoluteUrl('/x', 'https://other.com')).toBe('https://other.com/x');
	});

	it('formats numbers and currency using dateLocale by default', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { dateLocale: 'de-DE' });
		expect(cfg.filters.number(1234)).toBe('1.234');
		const eur = cfg.filters.currency(1299, 'EUR');
		expect(eur).toMatch(/1\.299,00/);
	});

	it('wires tagsExclude into the tags filter', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg, { tagsExclude: ['draft', 'private'] });
		expect(cfg.filters.tags(['draft', 'all', 'design', 'private'])).toEqual([
			'all',
			'design',
		]);
	});

	it('uses the default exclusion list when tagsExclude is not provided', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(cfg.filters.tags(['all', 'post', 'design'])).toEqual(['design']);
	});

	it('registers Nunjucks-parity universal filters', () => {
		const cfg = createFakeEleventyConfig();
		dashlyPlugin(cfg);
		expect(cfg.filters.first(['a', 'b', 'c'])).toBe('a');
		expect(cfg.filters.first(['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
		expect(cfg.filters.last(['a', 'b', 'c'])).toBe('c');
		expect(cfg.filters.reverse([1, 2, 3])).toEqual([3, 2, 1]);
		expect(cfg.filters.capitalize('hello')).toBe('Hello');
		expect(cfg.filters.title('the brown fox')).toBe('The Brown Fox');
		expect(cfg.filters.stripTags('<p>hi <em>there</em></p>')).toBe('hi there');
		expect(cfg.filters.nl2br('a\nb')).toBe('a<br>\nb');
	});
});
