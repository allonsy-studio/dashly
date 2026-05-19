import { defineConfig } from "eslint/config";
import globals from "globals";

import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import json from "@eslint/json";
import jsonc from "eslint-plugin-jsonc";
import markdown from "@eslint/markdown";
import eslintConfigPrettier from "eslint-config-prettier/flat";

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
