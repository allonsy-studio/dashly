/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Eleventy from '@11ty/eleventy';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import dashly from '../src/index.js';

/**
 * Runs dashly through real Eleventy template engines, so the claim that
 * filters & shortcodes behave the same in every engine can't regress unnoticed.
 * Unit specs elsewhere call the functions directly; these render templates.
 */

/** Template key per engine: `njk`, `liquid`, or `js` (a function using `this`). */
const ENGINES = [
	{ name: 'Nunjucks', ext: 'njk', key: 'njk' },
	{ name: 'Liquid', ext: 'liquid', key: 'liquid' },
	{ name: '11ty.js', ext: '11ty.js', key: 'js' },
];

const DATA = {
	post: { date: '2026-01-15', content: `<p>${'word '.repeat(450)}</p>` },
	list: ['a', 'b', 'c', 'd'],
	tagList: ['draft', 'all', 'design'],
	html: '<p>Hello <script>x()</script><a class="header-anchor" href="#h">#</a></p>',
	md: 'Hello **world**',
	mdOptions: { splitParagraphs: false },
	phone: '(555) 123-4567',
	rate: 0.25,
};

/** @type {{ name: string, options?: object, expected: string, njk: string, liquid: string, js: (t: any, d: typeof DATA) => unknown }[]} */
const CASES = [
	{
		name: 'renders a template at all',
		njk: 'ok',
		liquid: 'ok',
		js: () => 'ok',
		expected: 'ok',
	},
	{
		name: 'passes arguments to a filter',
		njk: "{{ list | first(2) | join(',') }}",
		liquid: "{{ list | first: 2 | join: ',' }}",
		js: (t, d) => t.first(d.list, 2).join(','),
		expected: 'a,b',
	},
	{
		name: 'overrides an engine built-in with the dashly version',
		njk: '{{ "abc" | reverse }}',
		liquid: '{{ "abc" | reverse }}',
		js: (t) => t.reverse('abc'),
		expected: 'cba',
	},
	{
		name: 'applies dateLocale to date filters',
		options: { dateLocale: 'en-GB' },
		njk: '{{ post.date | longDate }}',
		liquid: '{{ post.date | longDate }}',
		js: (t, d) => t.longDate(d.post.date),
		expected: '15 January 2026',
	},
	{
		name: 'applies dateLocale to number filters',
		options: { dateLocale: 'de-DE' },
		njk: '{{ 1234 | number }}',
		liquid: '{{ 1234 | number }}',
		js: (t) => t.number(1234),
		expected: '1.234',
	},
	{
		name: 'applies readingTimeWpm',
		options: { readingTimeWpm: 300 },
		njk: '{{ post.content | readingTime }}',
		liquid: '{{ post.content | readingTime }}',
		js: (t, d) => t.readingTime(d.post.content),
		expected: '2',
	},
	{
		name: 'lets a per-call argument beat the plugin option',
		options: { readingTimeWpm: 300 },
		njk: '{{ post.content | readingTime(100) }}',
		liquid: '{{ post.content | readingTime: 100 }}',
		js: (t, d) => t.readingTime(d.post.content, 100),
		expected: '5',
	},
	{
		name: 'applies baseUrl to absoluteUrl',
		options: { baseUrl: 'https://example.com' },
		njk: '{{ "/posts/hi" | absoluteUrl }}',
		liquid: '{{ "/posts/hi" | absoluteUrl }}',
		js: (t) => t.absoluteUrl('/posts/hi'),
		expected: 'https://example.com/posts/hi',
	},
	{
		name: 'applies tagsExclude',
		options: { tagsExclude: ['draft'] },
		njk: "{{ tagList | tags | join(',') }}",
		liquid: "{{ tagList | tags | join: ',' }}",
		js: (t, d) => t.tags(d.tagList).join(','),
		expected: 'all,design',
	},
	{
		name: 'formats a fraction as a percent',
		njk: '{{ rate | percent }}',
		liquid: '{{ rate | percent }}',
		js: (t, d) => t.percent(d.rate),
		expected: '25%',
	},
	{
		name: 'runs an async filter (cleanForRSS)',
		njk: '{{ html | cleanForRSS | safe }}',
		liquid: '{{ html | cleanForRSS }}',
		js: (t, d) => t.cleanForRSS(d.html),
		expected: '<p>Hello </p>',
	},
	{
		name: 'runs an async filter with an options object (renderMarkdown)',
		njk: '{{ md | renderMarkdown(mdOptions) | safe }}',
		liquid: '{{ md | renderMarkdown: mdOptions }}',
		js: (t, d) => t.renderMarkdown(d.md, d.mdOptions),
		expected: '<p>Hello <strong>world</strong></p>',
	},
	{
		name: 'registers the year shortcode',
		njk: '{% year %}',
		liquid: '{% year %}',
		js: (t) => t.year(),
		expected: String(new Date().getFullYear()),
	},
];

/** Opt-out cases: the unavailable utility must not produce the dashly result. */
const OPT_OUTS = [
	{
		name: 'filters.exclude drops only the named filter',
		options: { filters: { exclude: ['digitsOnly'] } },
		njk: '{{ phone | digitsOnly }}',
		liquid: '{{ phone | digitsOnly }}',
		js: (t, d) => t.digitsOnly(d.phone),
		absent: '5551234567',
	},
	{
		name: 'filters: false registers no filters',
		options: { filters: false },
		njk: '{{ phone | digitsOnly }}',
		liquid: '{{ phone | digitsOnly }}',
		js: (t, d) => t.digitsOnly(d.phone),
		absent: '5551234567',
	},
	{
		name: 'shortcodes: false registers no shortcodes',
		options: { shortcodes: false },
		njk: '{% year %}',
		liquid: '{% year %}',
		js: (t) => t.year(),
		absent: String(new Date().getFullYear()),
	},
];

let inputDir;

beforeAll(async () => {
	inputDir = await mkdtemp(join(tmpdir(), 'dashly-engines-'));
});

afterAll(async () => {
	await rm(inputDir, { recursive: true, force: true });
});

/**
 * Render one template through a real Eleventy build, in memory.
 *
 * @param {{ ext: string, key: string }} engine
 * @param {string | ((t: any, d: typeof DATA) => unknown)} template
 * @param {object} [options] dashly plugin options.
 * @returns {Promise<string>}
 */
const render = async (engine, template, options = {}) => {
	const eleventy = new Eleventy(inputDir, join(inputDir, '_site'), {
		quietMode: true,
		config(config) {
			config.addPlugin(dashly, { transforms: false, ...options });
			for (const [key, value] of Object.entries(DATA)) config.addGlobalData(key, value);

			const file = `page.${engine.ext}`;
			if (engine.key === 'js') {
				config.addTemplate(
					file,
					class {
						data() {
							return { permalink: 'out.txt' };
						}
						async render(data) {
							return String(await template(this, data));
						}
					},
					{}
				);
			} else {
				config.addTemplate(file, template, { permalink: 'out.txt' });
			}
		},
	});

	const [result] = await eleventy.toJSON();
	return String(result?.content ?? '').trim();
};

/** Like {@link render}, but a template error becomes the string `ERROR`. */
const attempt = (...args) => render(...args).catch(() => 'ERROR');

describe.each(ENGINES)('$name templates', (engine) => {
	it.each(CASES)('$name', async ({ njk, liquid, js, options, expected }) => {
		const template = { njk, liquid, js }[engine.key];
		expect(await render(engine, template, options)).toBe(expected);
	});

	it.each(OPT_OUTS)('$name', async ({ njk, liquid, js, options, absent }) => {
		const template = { njk, liquid, js }[engine.key];
		expect(await attempt(engine, template, options)).not.toBe(absent);
	});

	it('keeps other filters available when one is excluded', async () => {
		const template = {
			njk: '{{ post.date | year }}',
			liquid: '{{ post.date | year }}',
			js: (t, d) => t.year(d.post.date),
		}[engine.key];
		expect(await render(engine, template, { filters: { exclude: ['digitsOnly'] } })).toBe('2026');
	});
});
