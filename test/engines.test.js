/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Eleventy from "@11ty/eleventy";
import handlebarsPlugin from "@11ty/eleventy-plugin-handlebars";
import Handlebars from "handlebars";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import dashly from "../src/index.js";
import { dashlyPlugin } from "../src/plugin.js";

/**
 * Runs dashly through real Eleventy template engines, so the claim that
 * filters & shortcodes behave the same in every engine can't regress unnoticed.
 * Unit specs elsewhere call the functions directly; these render templates.
 *
 * A case lists known gaps per engine in `gaps`. Those run as `it.fails`, so CI
 * stays green while the gap exists & the test fails (prompting its removal)
 * the moment the gap is fixed.
 */

/**
 * Template key per engine: `njk`, `liquid`, `hbs`, or `js` (a function using
 * `this`). Handlebars is an official plugin in Eleventy 3, added after dashly
 * so it picks up the registered filters & shortcodes as helpers. Each build
 * gets its own Handlebars instance, since the default one is process-wide &
 * would carry helpers from one build into the next.
 */
const ENGINES = [
	{ name: "Nunjucks", ext: "njk", key: "njk" },
	{ name: "Liquid", ext: "liquid", key: "liquid" },
	{ name: "11ty.js", ext: "11ty.js", key: "js" },
	{
		name: "Handlebars",
		ext: "hbs",
		key: "hbs",
		setup: (config) => config.addPlugin(handlebarsPlugin, { eleventyLibraryOverride: Handlebars.create() }),
	},
];

const HANDLEBARS_ASYNC = "Handlebars helpers are synchronous";

const DATA = {
	post: { date: "2026-01-15", content: `<p>${"word ".repeat(450)}</p>` },
	list: ["a", "b", "c", "d"],
	tagList: ["draft", "all", "design"],
	html: '<p>Hello <script>x()</script><a class="header-anchor" href="#h">#</a></p>',
	md: "Hello **world**",
	mdOptions: { splitParagraphs: false },
	phone: "(555) 123-4567",
	rate: 0.25,
};

/**
 * @typedef {(t: any, d: typeof DATA) => unknown} JsTemplate
 * @type {{ name: string, options?: object, expected: string, njk: string, liquid: string, hbs: string, js: JsTemplate, gaps?: Record<string, string> }[]}
 */
const CASES = [
	{
		name: "renders a template at all",
		njk: "ok",
		liquid: "ok",
		hbs: "ok",
		js: () => "ok",
		expected: "ok",
	},
	{
		name: "passes arguments to a filter",
		njk: "{{ list | first(2) | join(',') }}",
		liquid: "{{ list | first: 2 | join: ',' }}",
		hbs: "{{first list 2}}",
		js: (t, d) => t.first(d.list, 2).join(","),
		expected: "a,b",
	},
	{
		name: "overrides an engine built-in with the dashly version",
		njk: '{{ "abc" | reverse }}',
		liquid: '{{ "abc" | reverse }}',
		hbs: '{{reverse "abc"}}',
		js: (t) => t.reverse("abc"),
		expected: "cba",
	},
	{
		name: "applies dateLocale to date filters",
		options: { dateLocale: "en-GB" },
		njk: "{{ post.date | longDate }}",
		liquid: "{{ post.date | longDate }}",
		hbs: "{{longDate post.date}}",
		js: (t, d) => t.longDate(d.post.date),
		expected: "15 January 2026",
	},
	{
		name: "applies dateLocale to number filters",
		options: { dateLocale: "de-DE" },
		njk: "{{ 1234 | number }}",
		liquid: "{{ 1234 | number }}",
		hbs: "{{number 1234}}",
		js: (t) => t.number(1234),
		expected: "1.234",
	},
	{
		name: "applies readingTimeWpm",
		options: { readingTimeWpm: 300 },
		njk: "{{ post.content | readingTime }}",
		liquid: "{{ post.content | readingTime }}",
		hbs: "{{readingTime post.content}}",
		js: (t, d) => t.readingTime(d.post.content),
		expected: "2",
	},
	{
		name: "lets a per-call argument beat the plugin option",
		options: { readingTimeWpm: 300 },
		njk: "{{ post.content | readingTime(100) }}",
		liquid: "{{ post.content | readingTime: 100 }}",
		hbs: "{{readingTime post.content 100}}",
		js: (t, d) => t.readingTime(d.post.content, 100),
		expected: "5",
	},
	{
		name: "applies baseUrl to absoluteUrl",
		options: { baseUrl: "https://example.com" },
		njk: '{{ "/posts/hi" | absoluteUrl }}',
		liquid: '{{ "/posts/hi" | absoluteUrl }}',
		hbs: '{{absoluteUrl "/posts/hi"}}',
		js: (t) => t.absoluteUrl("/posts/hi"),
		expected: "https://example.com/posts/hi",
	},
	{
		name: "applies tagsExclude",
		options: { tagsExclude: ["draft"] },
		njk: "{{ tagList | tags | join(',') }}",
		liquid: "{{ tagList | tags | join: ',' }}",
		hbs: "{{tags tagList}}",
		js: (t, d) => t.tags(d.tagList).join(","),
		expected: "all,design",
	},
	{
		name: "formats a fraction as a percent",
		njk: "{{ rate | percent }}",
		liquid: "{{ rate | percent }}",
		hbs: "{{percent rate}}",
		js: (t, d) => t.percent(d.rate),
		expected: "25%",
	},
	{
		name: "runs an async filter (cleanForRSS)",
		njk: "{{ html | cleanForRSS | safe }}",
		liquid: "{{ html | cleanForRSS }}",
		hbs: "{{{cleanForRSS html}}}",
		js: (t, d) => t.cleanForRSS(d.html),
		expected: "<p>Hello </p>",
		gaps: { hbs: HANDLEBARS_ASYNC },
	},
	{
		name: "runs an async filter with an options object (renderMarkdown)",
		njk: "{{ md | renderMarkdown(mdOptions) | safe }}",
		liquid: "{{ md | renderMarkdown: mdOptions }}",
		hbs: "{{{renderMarkdown md mdOptions}}}",
		js: (t, d) => t.renderMarkdown(d.md, d.mdOptions),
		expected: "<p>Hello <strong>world</strong></p>",
		gaps: { hbs: HANDLEBARS_ASYNC },
	},
	{
		name: "registers the currentYear shortcode",
		njk: "{% currentYear %}",
		liquid: "{% currentYear %}",
		hbs: "{{currentYear}}",
		js: (t) => t.currentYear(),
		expected: String(new Date().getFullYear()),
	},
	{
		name: "keeps the year filter distinct from the year shortcode",
		njk: '{{ "2020-05-05" | year }}',
		liquid: '{{ "2020-05-05" | year }}',
		hbs: '{{year "2020-05-05"}}',
		js: (t) => t.year("2020-05-05"),
		expected: "2020",
	},
];

/** Opt-out cases: the unavailable utility must not produce the dashly result. */
const OPT_OUTS = [
	{
		name: "filters.exclude drops only the named filter",
		options: { filters: { exclude: ["digitsOnly"] } },
		njk: "{{ phone | digitsOnly }}",
		liquid: "{{ phone | digitsOnly }}",
		hbs: "{{digitsOnly phone}}",
		js: (t, d) => t.digitsOnly(d.phone),
		absent: "5551234567",
	},
	{
		name: "filters: false registers no filters",
		options: { filters: false },
		njk: "{{ phone | digitsOnly }}",
		liquid: "{{ phone | digitsOnly }}",
		hbs: "{{digitsOnly phone}}",
		js: (t, d) => t.digitsOnly(d.phone),
		absent: "5551234567",
	},
	{
		name: "shortcodes: false registers no shortcodes",
		options: { shortcodes: false },
		njk: "{% currentYear %}",
		liquid: "{% currentYear %}",
		hbs: "{{currentYear}}",
		js: (t) => t.currentYear(),
		absent: String(new Date().getFullYear()),
	},
];

const KEEP_OTHERS = {
	njk: '{{ "hello world" | firstWord }}',
	liquid: '{{ "hello world" | firstWord }}',
	hbs: '{{firstWord "hello world"}}',
	js: (t) => t.firstWord("hello world"),
};

/**
 * Utilities with unit specs but no engine case yet. Do not add new utilities
 * here: write an engine case instead. This list should only shrink.
 */
const UNIT_ONLY = new Set([
	"toISOString", "dateFormat", "shortDate", "relativeDate", "timeAgo",
	"lastWord", "trim", "stripWhitespace", "capitalize", "title",
	"keys", "validateURL", "dump", "jsonify", "currency",
	"wordCount", "excerpt", "stripTags", "nl2br",
	"last", "groupBy", "sortBy", "chunk", "where", "pluck",
]);

let inputDir;

beforeAll(async () => {
	inputDir = await mkdtemp(join(tmpdir(), "dashly-engines-"));
});

afterAll(async () => {
	await rm(inputDir, { recursive: true, force: true });
});

/**
 * Render one template through a real Eleventy build, in memory.
 *
 * @param {{ ext: string, key: string, setup?: (config: any) => void }} engine
 * @param {string | JsTemplate} template
 * @param {object} [options] dashly plugin options.
 * @returns {Promise<string>}
 */
const render = async (engine, template, options = {}) => {
	const eleventy = new Eleventy(inputDir, join(inputDir, "_site"), {
		quietMode: true,
		config(config) {
			config.addPlugin(dashly, { transforms: false, ...options });
			// Engine plugins read the registered filters & shortcodes, so they go second.
			engine.setup?.(config);
			for (const [key, value] of Object.entries(DATA)) config.addGlobalData(key, value);

			const file = `page.${engine.ext}`;
			if (engine.key === "js") {
				config.addTemplate(
					file,
					class {
						data() {
							return { permalink: "out.txt" };
						}
						async render(data) {
							return String(await template(this, data));
						}
					},
					{},
				);
			} else {
				config.addTemplate(file, template, { permalink: "out.txt" });
			}
		},
	});

	const [result] = await eleventy.toJSON();
	return String(result?.content ?? "").trim();
};

/** Like {@link render}, but a template error becomes the string `ERROR`. */
const attempt = (...args) => render(...args).catch(() => "ERROR");

/**
 * Render a template that is expected to fail & return every message in the
 * error chain, since each engine wraps the original error differently.
 *
 * @returns {Promise<string>}
 */
const errorText = async (...args) => {
	try {
		await render(...args);
		return "";
	} catch (error) {
		const messages = [];
		for (let e = error; e; e = e.originalError ?? e.cause) messages.push(e.message);
		return messages.join("\n");
	}
};

describe.each(ENGINES)("$name templates", (engine) => {
	const rows = CASES.map((c) => ({ ...c, gap: c.gaps?.[engine.key] }));
	const check = async ({ njk, liquid, hbs, js, options, expected }) => {
		const template = { njk, liquid, hbs, js }[engine.key];
		return [await render(engine, template, options), expected];
	};

	it.each(rows.filter((row) => !row.gap))("$name", async (row) => {
		const [actual, expected] = await check(row);
		expect(actual).toBe(expected);
	});

	it.fails.each(rows.filter((row) => row.gap))("$name (known gap: $gap)", async (row) => {
		const [actual, expected] = await check(row);
		expect(actual).toBe(expected);
	});

	it.each(OPT_OUTS)("$name", async ({ njk, liquid, hbs, js, options, absent }) => {
		const template = { njk, liquid, hbs, js }[engine.key];
		expect(await attempt(engine, template, options)).not.toBe(absent);
	});

	it("surfaces the argument error, naming the filter & parameter", async () => {
		const template = {
			njk: '{{ post.content | readingTime("fast") }}',
			liquid: '{{ post.content | readingTime: "fast" }}',
			hbs: '{{readingTime post.content "fast"}}',
			js: (t, d) => t.readingTime(d.post.content, "fast"),
		}[engine.key];
		const text = await errorText(engine, template);
		expect(text).toContain('dashly: readingTime(): "wpm" must be a finite number');
	});

	it("keeps other filters available when one is excluded", async () => {
		const template = KEEP_OTHERS[engine.key];
		expect(await render(engine, template, { filters: { exclude: ["digitsOnly"] } })).toBe("hello");
	});
});

/**
 * Keeps this file aligned with the plugin. Every filter & shortcode dashly
 * registers must either appear in an engine case above or be listed in
 * `UNIT_ONLY`. Adding a utility without one of those fails here.
 */
describe("engine coverage", () => {
	const registered = (() => {
		const filters = [];
		const shortcodes = [];
		dashlyPlugin({
			addFilter: (name) => filters.push(name),
			addShortcode: (name) => shortcodes.push(name),
			addTransform() {},
		});
		return [...filters, ...shortcodes];
	})();

	// Names appear in the Nunjucks template of each case (`| name`, `{% name %}`).
	const covered = new Set(
		registered.filter((name) => [...CASES, ...OPT_OUTS, { njk: KEEP_OTHERS.njk }].some(({ njk }) => new RegExp(`\\b${name}\\b`).test(njk))),
	);

	it("runs every registered utility through an engine, or lists it as unit-only", () => {
		const missing = registered.filter((name) => !covered.has(name) && !UNIT_ONLY.has(name));
		expect(missing, "add a case to CASES in test/engines.test.js, or add the name to UNIT_ONLY with a reason").toEqual([]);
	});

	it("keeps UNIT_ONLY free of utilities that now have an engine case", () => {
		expect([...UNIT_ONLY].filter((name) => covered.has(name))).toEqual([]);
	});

	it("keeps UNIT_ONLY free of utilities that are no longer registered", () => {
		expect([...UNIT_ONLY].filter((name) => !registered.includes(name))).toEqual([]);
	});
});
