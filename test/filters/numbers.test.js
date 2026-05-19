import { describe, it, expect } from 'vitest';
import { number, currency, percent } from '../../src/filters/numbers.js';

describe('number', () => {
	it('formats with locale-aware grouping', () => {
		expect(number(1234567)).toBe('1,234,567');
	});

	it('honors fraction-digit options', () => {
		expect(number(1234.5, { maximumFractionDigits: 1 })).toBe('1,234.5');
	});

	it('accepts numeric strings', () => {
		expect(number('1234')).toBe('1,234');
	});

	it('returns empty string for non-numeric input', () => {
		expect(number('abc')).toBe('');
		expect(number(null)).toBe('');
		expect(number('')).toBe('');
		expect(number(NaN)).toBe('');
	});
});

describe('currency', () => {
	it('formats USD by default', () => {
		expect(currency(1299)).toBe('$1,299.00');
	});

	it('honors a different currency and locale', () => {
		const out = currency(1299, 'EUR', 'de-DE');
		expect(out).toMatch(/1\.299,00/);
		expect(out).toMatch(/€/);
	});

	it('returns empty string for non-numeric input', () => {
		expect(currency('abc')).toBe('');
	});
});

describe('percent', () => {
	it('treats input as a fraction by default', () => {
		expect(percent(0.25)).toBe('25%');
	});

	it('honors asFraction: false for whole-number inputs', () => {
		expect(percent(25, { asFraction: false })).toBe('25%');
	});

	it('honors maximumFractionDigits', () => {
		expect(percent(0.255, { maximumFractionDigits: 1 })).toBe('25.5%');
	});

	it('returns empty string for non-numeric input', () => {
		expect(percent('abc')).toBe('');
	});
});
