import { describe, it, expect } from 'vitest';
import {
	toISOString,
	year,
	dateFormat,
	longDate,
	shortDate,
	relativeDate,
	timeAgo,
} from '../../src/filters/dates.js';

describe('toISOString', () => {
	it('returns ISO 8601 for a valid date string', () => {
		expect(toISOString('2026-01-15')).toBe('2026-01-15T00:00:00.000Z');
	});

	it('returns empty string for nullish input', () => {
		expect(toISOString(null)).toBe('');
		expect(toISOString(undefined)).toBe('');
		expect(toISOString('')).toBe('');
	});

	it('returns empty string for an invalid date', () => {
		expect(toISOString('not-a-date')).toBe('');
	});

	it('accepts Date objects and numbers', () => {
		expect(toISOString(new Date('2026-01-15'))).toBe('2026-01-15T00:00:00.000Z');
		expect(toISOString(0)).toBe('');
	});
});

describe('year', () => {
	it('returns the four-digit year', () => {
		expect(year('2026-05-18')).toBe(2026);
	});

	it('returns empty string for falsy or invalid input', () => {
		expect(year(null)).toBe('');
		expect(year('garbage')).toBe('');
	});
});

describe('dateFormat', () => {
	it('formats using the supplied Intl options and locale', () => {
		const out = dateFormat('2026-01-15', { day: 'numeric', month: 'long', year: 'numeric' }, 'en-GB');
		expect(out).toMatch(/15 January 2026/);
	});

	it('passes through unparseable values unchanged', () => {
		expect(dateFormat('not-a-date')).toBe('not-a-date');
	});

	it('passes through nullish values unchanged', () => {
		expect(dateFormat(null)).toBe(null);
		expect(dateFormat('')).toBe('');
	});
});

describe('longDate', () => {
	it('formats with day, month, year', () => {
		expect(longDate('2026-01-15', 'en-GB')).toMatch(/15 January 2026/);
	});
});

describe('shortDate', () => {
	it('formats with abbreviated month and year only', () => {
		expect(shortDate('2026-01-15', 'en-GB')).toMatch(/Jan 2026/);
	});
});

describe('relativeDate', () => {
	const now = new Date('2026-05-19T12:00:00Z');

	it('formats past dates as "X ago"', () => {
		const twoDaysAgo = new Date('2026-05-17T12:00:00Z');
		expect(relativeDate(twoDaysAgo, 'en-US', { now })).toBe('2 days ago');
	});

	it('formats future dates as "in X"', () => {
		const inTwoMonths = new Date('2026-07-19T12:00:00Z');
		expect(relativeDate(inTwoMonths, 'en-US', { now })).toBe('in 2 months');
	});

	it('uses auto numeric style for adjacent days', () => {
		const yesterday = new Date('2026-05-18T12:00:00Z');
		expect(relativeDate(yesterday, 'en-US', { now })).toBe('yesterday');
	});

	it('honors numeric: always', () => {
		const yesterday = new Date('2026-05-18T12:00:00Z');
		expect(relativeDate(yesterday, 'en-US', { now, numeric: 'always' })).toBe('1 day ago');
	});

	it('returns an empty string for nullish or invalid input', () => {
		expect(relativeDate(null)).toBe('');
		expect(relativeDate('garbage')).toBe('');
	});

	it('timeAgo is an alias of relativeDate', () => {
		expect(timeAgo).toBe(relativeDate);
	});
});
