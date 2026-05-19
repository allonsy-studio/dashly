import { describe, it, expect } from 'vitest';
import { first, last, reverse, groupBy, sortBy, chunk, where, pluck } from '../../src/filters/arrays.js';

describe('first', () => {
	it('returns the first element with no count', () => {
		expect(first(['a', 'b', 'c'])).toBe('a');
	});

	it('returns the first n elements when n is supplied', () => {
		expect(first(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b']);
	});

	it('returns the whole array when n exceeds length', () => {
		expect(first(['a', 'b'], 5)).toEqual(['a', 'b']);
	});

	it('returns an empty array for n <= 0', () => {
		expect(first(['a', 'b'], 0)).toEqual([]);
		expect(first(['a', 'b'], -1)).toEqual([]);
	});

	it('passes through non-arrays unchanged', () => {
		expect(first(null)).toBe(null);
		expect(first('hello')).toBe('hello');
	});

	it('returns undefined for an empty array with no count', () => {
		expect(first([])).toBeUndefined();
	});
});

describe('last', () => {
	it('returns the last element with no count', () => {
		expect(last(['a', 'b', 'c'])).toBe('c');
	});

	it('returns the last n elements when n is supplied', () => {
		expect(last(['a', 'b', 'c', 'd'], 2)).toEqual(['c', 'd']);
	});

	it('returns an empty array for n <= 0', () => {
		expect(last(['a', 'b'], 0)).toEqual([]);
	});

	it('returns undefined for an empty array', () => {
		expect(last([])).toBeUndefined();
	});
});

describe('reverse', () => {
	it('reverses an array without mutating it', () => {
		const input = [1, 2, 3];
		expect(reverse(input)).toEqual([3, 2, 1]);
		expect(input).toEqual([1, 2, 3]);
	});

	it('reverses a string', () => {
		expect(reverse('abc')).toBe('cba');
	});

	it('reverses unicode by code-point, not byte', () => {
		expect(reverse('a😀b')).toBe('b😀a');
	});

	it('passes through nullish and other types', () => {
		expect(reverse(null)).toBe(null);
		expect(reverse(42)).toBe(42);
	});
});

const posts = [
	{ data: { year: 2025, tag: 'design', featured: true, title: 'B' } },
	{ data: { year: 2026, tag: 'eng', featured: false, title: 'A' } },
	{ data: { year: 2025, tag: 'eng', featured: true, title: 'C' } },
];

describe('groupBy', () => {
	it('groups by a dot-path key', () => {
		const out = groupBy(posts, 'data.year');
		expect(Object.keys(out).sort()).toEqual(['2025', '2026']);
		expect(out['2025']).toHaveLength(2);
		expect(out['2026']).toHaveLength(1);
	});

	it('groups by a selector function', () => {
		const out = groupBy(posts, (p) => p.data.tag);
		expect(out.design).toHaveLength(1);
		expect(out.eng).toHaveLength(2);
	});

	it('returns an empty object for non-arrays', () => {
		expect(groupBy(null, 'x')).toEqual({});
	});
});

describe('sortBy', () => {
	it('sorts strings using localeCompare', () => {
		const out = sortBy(posts, 'data.title');
		expect(out.map((p) => p.data.title)).toEqual(['A', 'B', 'C']);
	});

	it('respects descending order', () => {
		const out = sortBy(posts, 'data.year', 'desc');
		expect(out[0].data.year).toBe(2026);
	});

	it('does not mutate the input', () => {
		const arr = [3, 1, 2];
		sortBy(arr, (n) => n);
		expect(arr).toEqual([3, 1, 2]);
	});
});

describe('chunk', () => {
	it('splits into N-sized groups', () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('returns [] for invalid sizes', () => {
		expect(chunk([1, 2, 3], 0)).toEqual([]);
		expect(chunk([1, 2, 3], -1)).toEqual([]);
		expect(chunk([1, 2, 3], 1.5)).toEqual([]);
	});

	it('returns [] for non-array input', () => {
		expect(chunk(null, 2)).toEqual([]);
	});
});

describe('where', () => {
	it('filters by key equality', () => {
		expect(where(posts, 'data.tag', 'eng')).toHaveLength(2);
	});

	it('filters by truthiness when no expected value is supplied', () => {
		expect(where(posts, 'data.featured')).toHaveLength(2);
	});

	it('accepts false as an explicit expected value', () => {
		expect(where(posts, 'data.featured', false)).toHaveLength(1);
	});

	it('returns [] for non-arrays', () => {
		expect(where(null, 'x')).toEqual([]);
	});
});

describe('pluck', () => {
	it('projects to a dot-path', () => {
		expect(pluck(posts, 'data.title')).toEqual(['B', 'A', 'C']);
	});

	it('accepts a function selector', () => {
		expect(pluck(posts, (p) => p.data.year)).toEqual([2025, 2026, 2025]);
	});

	it('returns [] for non-arrays', () => {
		expect(pluck(null, 'x')).toEqual([]);
	});
});
