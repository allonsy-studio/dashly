/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from 'vitest';
import { validateURL, absoluteUrl } from '../../src/filters/urls.js';

describe('validateURL', () => {
	it('leaves http/https URLs alone (URI-encoded)', () => {
		expect(validateURL('https://example.com')).toBe('https://example.com');
		expect(validateURL('http://example.com')).toBe('http://example.com');
	});

	it('passes through mailto: and tel: URIs', () => {
		expect(validateURL('mailto:foo@example.com')).toBe('mailto:foo@example.com');
		expect(validateURL('tel:+15551234567')).toBe('tel:+15551234567');
	});

	it('passes through fragments and relative paths', () => {
		expect(validateURL('/about')).toBe('/about');
		expect(validateURL('#section')).toBe('#section');
	});

	it('prefixes bare hostnames with https://', () => {
		expect(validateURL('example.com')).toBe('https://example.com');
	});

	it('returns the input unchanged when not a string', () => {
		expect(validateURL(null)).toBe(null);
		expect(validateURL(undefined)).toBe(undefined);
		expect(validateURL(123)).toBe(123);
	});
});

describe('absoluteUrl', () => {
	it('joins a path to a base URL', () => {
		expect(absoluteUrl('/posts/hello', 'https://example.com')).toBe(
			'https://example.com/posts/hello',
		);
	});

	it('tolerates trailing slashes on the base and leading slashes on the path', () => {
		expect(absoluteUrl('posts/hello', 'https://example.com/')).toBe(
			'https://example.com/posts/hello',
		);
	});

	it('returns absolute URLs unchanged', () => {
		expect(absoluteUrl('https://other.com/x', 'https://example.com')).toBe(
			'https://other.com/x',
		);
	});

	it('passes mailto:, tel:, and fragments through', () => {
		expect(absoluteUrl('mailto:foo@bar.com', 'https://example.com')).toBe('mailto:foo@bar.com');
		expect(absoluteUrl('tel:+1', 'https://example.com')).toBe('tel:+1');
		expect(absoluteUrl('#top', 'https://example.com')).toBe('#top');
	});

	it('returns the path unchanged when no base is supplied', () => {
		expect(absoluteUrl('/posts/hello')).toBe('/posts/hello');
	});

	it('returns an empty string for nullish or empty input', () => {
		expect(absoluteUrl(null, 'https://example.com')).toBe('');
		expect(absoluteUrl('', 'https://example.com')).toBe('');
	});
});
