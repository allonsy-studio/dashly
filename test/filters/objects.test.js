import { describe, it, expect } from 'vitest';
import { keys } from '../../src/filters/objects.js';

describe('keys', () => {
	it('returns Object.keys for an object', () => {
		expect(keys({ a: 1, b: 2 })).toEqual(['a', 'b']);
	});

	it('returns empty array for nullish or primitive input', () => {
		expect(keys(null)).toEqual([]);
		expect(keys(undefined)).toEqual([]);
		expect(keys('string')).toEqual([]);
		expect(keys(42)).toEqual([]);
	});
});
