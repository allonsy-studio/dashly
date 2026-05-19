import { describe, it, expect } from 'vitest';
import { tags, DEFAULT_EXCLUDED_TAGS } from '../../src/filters/tags.js';

describe('tags', () => {
	it('strips the default system tags', () => {
		expect(tags(['all', 'post', 'posts', 'design', 'eng'])).toEqual(['design', 'eng']);
	});

	it('honors a per-call extra exclude list on top of defaults', () => {
		expect(tags(['all', 'design', 'draft'], ['draft'])).toEqual(['design']);
	});

	it('honors a fully overridden default list', () => {
		expect(tags(['all', 'design', 'draft'], [], ['draft'])).toEqual(['all', 'design']);
	});

	it('filters out non-string entries', () => {
		expect(tags(['design', null, 42, 'eng'])).toEqual(['design', 'eng']);
	});

	it('returns [] for non-array input', () => {
		expect(tags(null)).toEqual([]);
	});

	it('exports the default list as a readonly array', () => {
		expect(DEFAULT_EXCLUDED_TAGS).toEqual(['all', 'post', 'posts']);
		expect(Object.isFrozen(DEFAULT_EXCLUDED_TAGS)).toBe(true);
	});
});
