/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
