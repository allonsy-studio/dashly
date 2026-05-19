/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { cleanForRSS, renderMarkdown, stripTags, nl2br } from '../../src/filters/html.js';

describe('stripTags', () => {
	it('removes HTML tags and collapses whitespace', () => {
		expect(stripTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
	});

	it('handles self-closing and void elements', () => {
		expect(stripTags('a<br>b<img src="x"/>c')).toBe('a b c');
	});

	it('returns empty string for nullish input', () => {
		expect(stripTags(null)).toBe('');
		expect(stripTags(undefined)).toBe('');
	});

	it('returns the input unchanged if no tags are present', () => {
		expect(stripTags('plain text')).toBe('plain text');
	});
});

describe('nl2br', () => {
	it('replaces unix newlines', () => {
		expect(nl2br('one\ntwo')).toBe('one<br>\ntwo');
	});

	it('replaces windows and old-mac line endings', () => {
		expect(nl2br('a\r\nb\rc')).toBe('a<br>\nb<br>\nc');
	});

	it('returns empty string for nullish input', () => {
		expect(nl2br(null)).toBe('');
	});

	it('leaves non-newline content untouched', () => {
		expect(nl2br('no breaks here')).toBe('no breaks here');
	});
});

describe('cleanForRSS', () => {
	it('strips script and style-adjacent unsafe tags', async () => {
		const html = '<p>ok</p><script>alert(1)</script><meta name="x">';
		const out = await cleanForRSS(html);
		expect(out).not.toMatch(/<script/);
		expect(out).not.toMatch(/<meta/);
		expect(out).toMatch(/<p>ok<\/p>/);
	});

	it('removes markdown-it-anchor header permalinks by default', async () => {
		const html =
			'<h2>Title <a class="header-anchor" href="#title">#</a></h2><p>body</p>';
		const out = await cleanForRSS(html);
		expect(out).not.toMatch(/header-anchor/);
		expect(out).toMatch(/<p>body<\/p>/);
	});

	it('strips additional custom tags when requested', async () => {
		const html = '<p>x</p><lite-youtube videoid="abc"></lite-youtube>';
		const out = await cleanForRSS(html, { customTags: ['lite-youtube'] });
		expect(out).not.toMatch(/lite-youtube/);
	});

	it('passes through nullish or non-string input', async () => {
		expect(await cleanForRSS(null)).toBe(null);
		expect(await cleanForRSS('')).toBe('');
	});
});

describe('renderMarkdown', () => {
	it('renders a markdown string to HTML', async () => {
		const out = await renderMarkdown('**bold**', { splitParagraphs: false });
		expect(out).toMatch(/<strong>bold<\/strong>/);
	});

	it('splits literal \\n\\n into paragraphs by default', async () => {
		const out = await renderMarkdown('first\\n\\nsecond');
		const paragraphs = out.match(/<p>/g) ?? [];
		expect(paragraphs.length).toBeGreaterThanOrEqual(2);
	});

	it('passes through nullish or non-string input', async () => {
		expect(await renderMarkdown(null)).toBe(null);
		expect(await renderMarkdown(42)).toBe(42);
	});
});
