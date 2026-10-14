/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from "vitest";
import { first, last, groupBy, sortBy, chunk, where, pluck } from "../../src/filters/arrays.js";
import { dateFormat, longDate, shortDate, relativeDate } from "../../src/filters/dates.js";
import { dump } from "../../src/filters/debug.js";
import { cleanForRSS, renderMarkdown } from "../../src/filters/html.js";
import { number, currency, percent } from "../../src/filters/numbers.js";
import { tags } from "../../src/filters/tags.js";
import { readingTime, excerpt } from "../../src/filters/text.js";
import { absoluteUrl } from "../../src/filters/urls.js";
import { DashlyArgumentError } from "../../src/validate.js";
import { helperOptions } from "../helpers.js";

const posts = [{ n: 2 }, { n: 1 }];
const html = "<p>Hello</p>";

/**
 * Every guarded argument: a call with a wrongly typed value must throw an error
 * naming the function & the parameter.
 */
const WRONG_TYPES = [
	["first", "n", () => first([1, 2], "x")],
	["last", "n", () => last([1, 2], "x")],
	["groupBy", "keyOrFn", () => groupBy(posts, 5)],
	["sortBy", "keyOrFn", () => sortBy(posts, {})],
	["sortBy", "order", () => sortBy(posts, "n", "up")],
	["chunk", "size", () => chunk([1, 2, 3], "2")],
	["where", "keyOrFn", () => where(posts, 5)],
	["pluck", "keyOrFn", () => pluck(posts, 5)],
	["dateFormat", "options", () => dateFormat("2026-01-15", "long")],
	["dateFormat", "locale", () => dateFormat("2026-01-15", {}, 42)],
	["longDate", "locale", () => longDate("2026-01-15", 42)],
	["shortDate", "locale", () => shortDate("2026-01-15", 42)],
	["relativeDate", "locale", () => relativeDate("2026-01-15", 42)],
	["relativeDate", "options", () => relativeDate("2026-01-15", "en", "short")],
	["relativeDate", "options.style", () => relativeDate("2026-01-15", "en", { style: "tiny" })],
	["relativeDate", "options.numeric", () => relativeDate("2026-01-15", "en", { numeric: "sometimes" })],
	["relativeDate", "options.now", () => relativeDate("2026-01-15", "en", { now: "2026-02-01" })],
	["number", "options", () => number(1, "compact")],
	["number", "locale", () => number(1, {}, 42)],
	["currency", "currencyCode", () => currency(1, 840)],
	["currency", "locale", () => currency(1, "USD", 42)],
	["currency", "options", () => currency(1, "USD", "en", "x")],
	["percent", "options", () => percent(0.5, "x")],
	["percent", "options.asFraction", () => percent(0.5, { asFraction: "no" })],
	["percent", "options.maximumFractionDigits", () => percent(0.5, { maximumFractionDigits: "2" })],
	["readingTime", "wpm", () => readingTime("a b c", "fast")],
	["excerpt", "n", () => excerpt("a b c", "2")],
	["excerpt", "unit", () => excerpt("a b c", 2, "sentences")],
	["absoluteUrl", "baseUrl", () => absoluteUrl("/x", 42)],
	["tags", "extraExclude", () => tags(["a"], "draft")],
	["tags", "defaultExclude", () => tags(["a"], [], "draft")],
	["dump", "indent", () => dump({}, true)],
];

/** The async filters reject instead of throwing. */
const WRONG_TYPES_ASYNC = [
	["cleanForRSS", "options", () => cleanForRSS(html, "x")],
	["cleanForRSS", "options.unsafeTags", () => cleanForRSS(html, { unsafeTags: "script" })],
	["cleanForRSS", "options.customTags", () => cleanForRSS(html, { customTags: "lite-youtube" })],
	["cleanForRSS", "options.stripPermalinks", () => cleanForRSS(html, { stripPermalinks: "yes" })],
	["renderMarkdown", "options", () => renderMarkdown("# x", "x")],
	["renderMarkdown", "options.renderer", () => renderMarkdown("# x", { renderer: {} })],
	["renderMarkdown", "options.splitParagraphs", () => renderMarkdown("# x", { splitParagraphs: "no" })],
];

/** Required arguments: leaving them out is an error too. */
const MISSING = [
	["groupBy", "keyOrFn", () => groupBy(posts)],
	["sortBy", "keyOrFn", () => sortBy(posts)],
	["where", "keyOrFn", () => where(posts)],
	["pluck", "keyOrFn", () => pluck(posts)],
	["chunk", "size", () => chunk([1, 2, 3])],
];

describe("argument checks", () => {
	it.each(WRONG_TYPES)('%s() rejects a wrongly typed "%s"', (fn, param, call) => {
		expect(call).toThrow(DashlyArgumentError);
		expect(call).toThrow(`dashly: ${fn}(): "${param}" must be`);
	});

	it.each(WRONG_TYPES_ASYNC)('%s() rejects a wrongly typed "%s"', async (fn, param, call) => {
		await expect(call()).rejects.toThrow(`dashly: ${fn}(): "${param}" must be`);
	});

	it.each(MISSING)('%s() requires "%s"', (fn, param, call) => {
		expect(call).toThrow(`dashly: ${fn}(): "${param}" must be`);
		expect(call).toThrow("This argument is required.");
	});

	it("keeps the existing lenient handling of out-of-range numbers", () => {
		expect(chunk([1, 2, 3], 0)).toEqual([]);
		expect(chunk([1, 2, 3], 1.5)).toEqual([]);
		expect(first([1, 2], -1)).toEqual([]);
	});

	it("keeps the existing lenient handling of nullish values", () => {
		expect(first(null)).toBeNull();
		expect(excerpt(null)).toBe("");
		expect(number(null)).toBe("");
		expect(dateFormat("", {}, "en")).toBe("");
	});

	it("explains an Intl failure with the filter name", () => {
		expect(() => number(1, {}, "xx_INVALID")).toThrow("dashly: number(): Intl rejected the arguments");
		expect(() => currency(1, "NOPE")).toThrow("dashly: currency(): Intl rejected the arguments");
		expect(() => relativeDate("2026-01-15", "xx_INVALID")).toThrow("dashly: relativeDate(): Intl rejected the arguments");
	});
});

describe("the Handlebars options object counts as an omitted argument", () => {
	const hb = helperOptions;

	it.each([
		["first", () => first([1, 2, 3], hb()), () => first([1, 2, 3])],
		["last", () => last([1, 2, 3], hb()), () => last([1, 2, 3])],
		["sortBy", () => sortBy(posts, "n", hb()), () => sortBy(posts, "n")],
		["where", () => where([{ n: 0 }, { n: 1 }], "n", hb()), () => where([{ n: 0 }, { n: 1 }], "n")],
		["dateFormat", () => dateFormat("2026-01-15", hb(), hb()), () => dateFormat("2026-01-15")],
		["longDate", () => longDate("2026-01-15", hb()), () => longDate("2026-01-15")],
		["relativeDate", () => relativeDate("2026-01-15", hb(), hb()), () => relativeDate("2026-01-15")],
		["number", () => number(1234.5, hb(), hb()), () => number(1234.5)],
		["currency", () => currency(1299, hb(), hb(), hb()), () => currency(1299)],
		["percent", () => percent(0.25, hb()), () => percent(0.25)],
		["readingTime", () => readingTime("a b c", hb()), () => readingTime("a b c")],
		["excerpt", () => excerpt("a b c d", hb(), hb()), () => excerpt("a b c d")],
		["absoluteUrl", () => absoluteUrl("/x", hb()), () => absoluteUrl("/x")],
		["tags", () => tags(["all", "x"], hb(), hb()), () => tags(["all", "x"])],
		["dump", () => dump({ a: 1 }, hb()), () => dump({ a: 1 })],
	])("%s() behaves as if the argument were not passed", (_fn, withOptions, without) => {
		expect(withOptions()).toEqual(without());
	});

	it.each([
		["cleanForRSS", () => cleanForRSS(html, hb()), () => cleanForRSS(html)],
		["renderMarkdown", () => renderMarkdown("**x**", hb()), () => renderMarkdown("**x**")],
	])("%s() behaves as if the argument were not passed", async (_fn, withOptions, without) => {
		expect(await withOptions()).toEqual(await without());
	});
});
