import { describe, it, expect } from 'vitest';
import { dump, jsonify } from '../../src/filters/debug.js';

describe('dump', () => {
	it('pretty-prints with 2-space indent by default', () => {
		expect(dump({ a: 1 })).toBe('{\n  "a": 1\n}');
	});

	it('honors a custom indent', () => {
		expect(dump({ a: 1 }, 0)).toBe('{"a":1}');
	});

	it('handles circular references without throwing', () => {
		const obj = { name: 'root' };
		obj.self = obj;
		const out = dump(obj);
		expect(out).toContain('"name": "root"');
		expect(out).toContain('[Circular]');
	});

	it('serializes functions, dates, regexps, and bigints', () => {
		const out = dump({
			fn: function namedFn() {},
			date: new Date('2026-01-15T00:00:00.000Z'),
			re: /abc/i,
			big: 10n,
		});
		expect(out).toContain('[Function: namedFn]');
		expect(out).toContain('2026-01-15T00:00:00.000Z');
		expect(out).toContain('/abc/i');
		expect(out).toContain('"10n"');
	});

	it('jsonify is an alias of dump', () => {
		expect(jsonify).toBe(dump);
	});
});
