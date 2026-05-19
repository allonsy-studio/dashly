import { describe, it, expect } from 'vitest';
import {
	firstWord,
	lastWord,
	trim,
	stripWhitespace,
	digitsOnly,
	capitalize,
	title,
} from '../../src/filters/strings.js';

describe('firstWord', () => {
	it('returns the first whitespace-delimited word', () => {
		expect(firstWord('Hello world')).toBe('Hello');
		expect(firstWord('  leading spaces   foo')).toBe('leading');
	});

	it('handles single-word and empty input', () => {
		expect(firstWord('Solo')).toBe('Solo');
		expect(firstWord('')).toBe('');
	});

	it('returns undefined for nullish input', () => {
		expect(firstWord(null)).toBeUndefined();
		expect(firstWord(undefined)).toBeUndefined();
	});
});

describe('lastWord', () => {
	it('returns the last whitespace-delimited word', () => {
		expect(lastWord('Hello world')).toBe('world');
		expect(lastWord('one   two    three')).toBe('three');
	});

	it('returns undefined for nullish input', () => {
		expect(lastWord(null)).toBeUndefined();
	});
});

describe('trim', () => {
	it('trims leading and trailing whitespace', () => {
		expect(trim('  hello  ')).toBe('hello');
	});

	it('returns undefined for nullish input', () => {
		expect(trim(null)).toBeUndefined();
	});
});

describe('stripWhitespace', () => {
	it('removes all whitespace characters', () => {
		expect(stripWhitespace('  hello \t\n world  ')).toBe('helloworld');
	});
});

describe('digitsOnly', () => {
	it('keeps only digits', () => {
		expect(digitsOnly('+1 (555) 123-4567')).toBe('15551234567');
	});

	it('returns empty string when no digits are present', () => {
		expect(digitsOnly('abc')).toBe('');
	});
});

describe('capitalize', () => {
	it('uppercases the first letter and lowercases the rest', () => {
		expect(capitalize('hello WORLD')).toBe('Hello world');
	});

	it('handles single-character and empty strings', () => {
		expect(capitalize('a')).toBe('A');
		expect(capitalize('')).toBe('');
	});

	it('returns undefined for nullish input', () => {
		expect(capitalize(null)).toBeUndefined();
		expect(capitalize(undefined)).toBeUndefined();
	});
});

describe('title', () => {
	it('title-cases each word', () => {
		expect(title('the QUICK brown fox')).toBe('The Quick Brown Fox');
	});

	it('preserves internal whitespace', () => {
		expect(title('  multiple   spaces  ')).toBe('  Multiple   Spaces  ');
	});

	it('returns undefined for nullish input', () => {
		expect(title(null)).toBeUndefined();
	});
});
