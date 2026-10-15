import { defineConfig } from "eslint/config";
import globals from "globals";

import vitest from "@vitest/eslint-plugin";
import licenseHeader from "eslint-plugin-license-header";
import js from "@allons-y/opx-lint-js/eslint.config.js";
import json from "@allons-y/opx-lint-json/eslint.config.js";
import md from "@allons-y/opx-lint-md/eslint.config.js";

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
	...js,
	...json,
	...md,
	{
		ignores: [".cache/**", "coverage/**", "docs/_site/**", "docs/_a11y/**"],
	},
	{
		files: ["docs/content/assets/scripts/**/*.js"],
		languageOptions: { globals: globals.browser },
	},
	{
		files: ["docs/cypress/**/*.js"],
		languageOptions: { globals: { ...globals.mocha, Cypress: "readonly", cy: "readonly" } },
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
		// Eleventy's callbacks take arbitrary arguments.
		files: ["types/**/*.d.ts"],
		rules: { "@typescript-eslint/no-explicit-any": "off" },
	},
]);
