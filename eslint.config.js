import { defineConfig } from "eslint/config";
import globals from "globals";

import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import json from "@eslint/json";
import jsonc from "eslint-plugin-jsonc";
import markdown from "@eslint/markdown";
import licenseHeader from "eslint-plugin-license-header";
import eslintConfigPrettier from "eslint-config-prettier/flat";

// MPL-2.0 file header — SPDX identifier + Mozilla Public License Exhibit A
// boilerplate. Authored as a single block comment so eslint-plugin-license-
// header sees one AST node (matching against multiple line comments leaves the
// plugin stuck in "Invalid" because only the first line is compared). The
// `SPDX-License-Identifier` line is what the plugin keys on to detect an
// existing header. Auto-applied to src/ and test/ via `yarn lint --fix`.
const MPL_HEADER = [
	"/*",
	" * SPDX-License-Identifier: MPL-2.0",
	" *",
	" * This Source Code Form is subject to the terms of the Mozilla Public",
	" * License, v. 2.0. If a copy of the MPL was not distributed with this",
	" * file, You can obtain one at https://mozilla.org/MPL/2.0/.",
	" */",
];

export default defineConfig([
	{
		ignores: ["**/node_modules/**", ".yarn/**", ".cache/**", "bin/**", "dist/**", "coverage/**"],
	},
	{
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		plugins: { js },
		extends: ["js/recommended"],
		languageOptions: {
			sourceType: "module",
			globals: globals.node,
		},
	},
	{
		files: ["**/*.test.js"],
		plugins: { vitest },
		extends: ["vitest/recommended"],
		languageOptions: {
			globals: vitest.environments.env.globals,
		},
	},
	{
		files: ["src/**/*.js", "test/**/*.js"],
		plugins: { "license-header": licenseHeader },
		rules: {
			"license-header/header": ["error", MPL_HEADER],
		},
	},
	{
		files: ["**/(!package).json"],
		plugins: { json },
		language: "json/json",
		extends: ["json/recommended"],
		rules: {
			"json/sort-keys": [
				"warn",
				"asc",
				{ natural: true },
			],
		},
	},
	{
		files: ["package.json"],
		plugins: { jsonc },
		language: "jsonc/jsonc",
		extends: ["jsonc/recommended-with-json"],
		rules: {
			"jsonc/sort-keys": [
				"warn",
				{
					pathPattern: "^$",
					order: ["$schema", "private", "publishConfig", "name", "version", "description", "license", "author", "maintainers", "contributors", "homepage", "funding", "repository", "bugs", "type", "exports", "main", "module", "browser", "man", "preferGlobal", "bin", "files", "directories", "scripts", "config", "sideEffects", "types", "typings", "workspaces", "resolutions", "dependencies", "bundleDependencies", "bundledDependencies", "peerDependencies", "peerDependenciesMeta", "optionalDependencies", "devDependencies", "keywords", "engines", "engineStrict", "os", "cpu", "*", "packageManager"],
				},
				{ pathPattern: "^repository$", order: ["type", "url", "directory"] },
				{ pathPattern: "^exports$", order: ["."] },
				{ pathPattern: ".*", order: { type: "asc" } },
			],
		},
	},
	{
		files: ["**/*.md"],
		plugins: { markdown },
		language: "markdown/gfm",
		extends: ["markdown/recommended"],
	},
	eslintConfigPrettier,
]);
