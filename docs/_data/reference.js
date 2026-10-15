/*
 * SPDX-License-Identifier: MPL-2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Builds the reference pages from the JSDoc in `src/`, so the docs can't
 * drift from the code.
 *
 * @module docs/reference
 */

import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import { parse, tokenizers } from "comment-parser";
import markdownIt from "markdown-it";

import { highlightFences, scrollTables } from "../utilities/highlight.js";

const SRC = new URL("../../src/", import.meta.url);

const md = markdownIt({ html: true, linkify: true }).use(highlightFences).use(scrollTables);

const CATEGORIES = ["filters", "transforms", "shortcodes"];

// Sidebar position after Getting started, How it works, & Configuration.
const FIRST_ORDER = 4;

/** Font Awesome classes for each category, shown beside its name. */
const ICONS = {
	filters: "filter",
	transforms: "wand-magic-sparkles",
	shortcodes: "code",
};

const EXPORT = /^export\s+(async\s+)?(const|function)\s+(\w+)(\s*=\s*(?:async\s*)?(?:function|\(|\w+\s*=>|\w+\s*;))?/;

/**
 * Skip a comment-parser tokenizer for tags whose body is not `{type} name`:
 * `@returns` has no name, & `@example` is raw code that may start with `{{`.
 *
 * @param {string[]} tags
 * @param {(spec: object) => object} tokenizer
 */
const skipFor = (tags, tokenizer) => (spec) => (tags.includes(spec.tag) ? spec : tokenizer(spec));

const parserOptions = {
	spacing: "preserve",
	tokenizers: [
		tokenizers.tag(),
		skipFor(["example"], tokenizers.type("preserve")),
		skipFor(["example", "return", "returns"], tokenizers.name()),
		tokenizers.description("preserve"),
	],
};

/** @param {string} text */
const tidy = (text) => text.replace(/^\s*-\s*/, "").replace(/\s*\n\s*/g, " ").trim();

/**
 * @param {import('comment-parser').Tag} tag
 */
const toParam = (tag) => ({
	name: tag.name,
	type: tag.type,
	optional: tag.optional,
	...(tag.default !== undefined && { default: tag.default }),
	description: tidy(tag.description),
	descriptionHtml: md.renderInline(tidy(tag.description)),
});

/**
 * @param {string} code
 * @returns {{ code: string, lang: string }}
 */
const toExample = (code) => {
	const trimmed = code.replace(/^\s*\n/, "").trimEnd();
	return { code: trimmed, lang: /^\s*(\/\/[^\n]*\n)*\s*\{[{%#]/.test(trimmed) ? "njk" : "js" };
};

/**
 * Parse every JSDoc block in a source file.
 *
 * @param {string} text
 * @returns {import('comment-parser').Block[]}
 */
const parseBlocks = (text) => parse(text, parserOptions);

/**
 * The module-level description from the block tagged `@module`.
 *
 * @param {string} text
 * @returns {string}
 */
const readModuleDoc = (text) => parseBlocks(text).find((block) => block.tags.some(({ tag }) => tag === "module"))?.description.trim() ?? "";

/**
 * Find the export a doc block documents: the first `export` within the few
 * lines after it, skipping a helper declaration in between.
 *
 * @param {string[]} lines Source lines.
 * @param {import('comment-parser').Block} block
 */
const findExport = (lines, block) => {
	const start = block.source.at(-1).number;
	for (const line of lines.slice(start, start + 3)) {
		const match = line.match(EXPORT);
		if (match) return { keyword: match[2], name: match[3], callable: match[4] };
	}
};

/**
 * @param {string} text
 * @returns {object[]}
 */
const parseExports = (text) => {
	const lines = text.split("\n");
	const exports = [];

	for (const block of parseBlocks(text)) {
		if (block.tags.some(({ tag }) => tag === "module")) continue;
		const found = findExport(lines, block);
		if (!found) continue;

		const params = block.tags.filter(({ tag }) => tag === "param").map(toParam);
		const returns = block.tags.find(({ tag }) => tag === "returns" || tag === "return");
		const topLevel = params.filter((param) => !param.name.includes("."));
		const isFunction = found.callable || found.keyword === "function";

		exports.push({
			name: found.name,
			description: block.description.trim(),
			params,
			signature: isFunction ? `${found.name}(${topLevel.map((param) => param.name + (param.optional ? "?" : "")).join(", ")})` : found.name,
			returns: returns && { type: returns.type, description: tidy(returns.description), descriptionHtml: md.renderInline(tidy(returns.description)) },
			examples: block.tags.filter(({ tag }) => tag === "example").map(({ description }) => toExample(description)),
		});
	}

	// Aliases (`export const timeAgo = relativeDate`) inherit the target's signature.
	for (const entry of exports) {
		const target = exports.find((other) => entry.description.startsWith(`Alias for {@link ${other.name}}`));
		if (!target) continue;
		Object.assign(entry, {
			params: target.params,
			signature: target.signature.replace(target.name, entry.name),
			returns: target.returns,
			examples: entry.examples.length ? entry.examples : target.examples,
		});
	}

	return exports.map((entry) => {
		const description = entry.description.replace(/\{@link (\w+)\}/g, "`$1`");
		// A break point after the opening parenthesis lets a long signature wrap in a heading.
		const signatureHtml = md.utils.escapeHtml(entry.signature).replace("(", "(<wbr>");
		return { ...entry, description, descriptionHtml: md.render(description), signatureHtml, summary: plain(firstSentence(description)) };
	});
};

/**
 * Build the import line for a module, one name per line when it runs long.
 *
 * @param {{ name: string }[]} exported
 * @param {string} importPath
 * @returns {string}
 */
const importStatement = (exported, importPath) => {
	const names = exported.map((entry) => entry.name);
	const line = `import { ${names.join(", ")} } from '${importPath}';`;
	return line.length <= 72 ? line : `import {\n${names.map((name) => `\t${name},`).join("\n")}\n} from '${importPath}';`;
};

/**
 * First sentence of a doc description.
 *
 * @param {string} text
 * @returns {string}
 */
const firstSentence = (text) => text.replace(/\s*\n\s*/g, " ").split(/(?<=\.)\s/)[0];

/** @param {string} text */
const plain = (text) => text.replace(/`/g, "");

/**
 * Read each category's intro from the JSDoc in its `index.js`.
 *
 * @returns {{ key: string, title: string, order: number, intro: string, description: string }[]}
 */
const loadCategories = () =>
	CATEGORIES.map((key, index) => {
		const text = readFileSync(new URL(`${key}/index.js`, SRC), "utf8");
		const intro = readModuleDoc(text);
		return {
			key,
			icon: ICONS[key],
			title: key[0].toUpperCase() + key.slice(1),
			order: FIRST_ORDER + index,
			intro,
			introHtml: md.render(intro),
			description: plain(firstSentence(intro)),
		};
	});

/**
 * @returns {{ pages: object[], categories: object[] }}
 */
export default function () {
	const pages = [];
	const categories = loadCategories();

	for (const category of categories) {
		const dir = new URL(`${category.key}/`, SRC);
		for (const file of readdirSync(dir).filter((f) => f.endsWith(".js") && f !== "index.js").sort()) {
			const text = readFileSync(join(dir.pathname, file), "utf8");
			const slug = basename(file, ".js");
			const description = readModuleDoc(text);
			const exported = parseExports(text);
			const importPath = `@allons-y/dashly/${category.key}/${slug}`;
			pages.push({
				category: category.key,
				categoryTitle: category.title,
				slug,
				url: `/${category.key}/${slug}/`,
				importPath,
				importStatement: importStatement(exported, importPath),
				description,
				descriptionHtml: md.render(description),
				summary: plain(firstSentence(description)),
				exports: exported,
			});
		}
	}

	// Pager links: the category page, then each module in order.
	for (const category of categories) {
		const siblings = pages.filter((page) => page.category === category.key);
		siblings.forEach((page, index) => {
			const before = siblings[index - 1];
			const after = siblings[index + 1];
			page.prev = before ? { url: before.url, title: before.slug } : { url: `/${category.key}/`, title: category.title };
			page.next = after ? { url: after.url, title: after.slug } : undefined;
		});
	}

	return {
		pages,
		categories: categories.map((category) => ({
			...category,
			pages: pages.filter((page) => page.category === category.key),
			exportCount: pages
				.filter((page) => page.category === category.key)
				.reduce((total, page) => total + page.exports.length, 0),
		})),
	};
}
