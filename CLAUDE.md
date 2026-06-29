# @allons-y/dashly

A single-package npm library of utility filters, transforms, and shortcodes for [Eleventy](https://www.11ty.dev) v3. Pure ESM JavaScript, tree-shakeable subpath exports, and a tiny plugin entry that auto-registers everything with opt-out support.

## Repository layout

```sh
package.json                    # npm package manifest
src/
  index.js                      # Aggregate exports + default plugin export
  plugin.js                     # Eleventy plugin: registers filters, transforms, shortcodes
  filters/
    index.js                    # Re-exports every filter
    dates.js                    # toISOString, year, dateFormat, longDate, shortDate, relativeDate, timeAgo
    strings.js                  # firstWord, lastWord, trim, stripWhitespace, digitsOnly, capitalize, title
    urls.js                     # validateURL, absoluteUrl
    objects.js                  # keys
    html.js                     # cleanForRSS, renderMarkdown, stripTags, nl2br
    text.js                     # wordCount, readingTime, excerpt
    debug.js                    # dump, jsonify
    arrays.js                   # first, last, reverse, groupBy, sortBy, chunk, where, pluck
    numbers.js                  # number, currency, percent
    tags.js                     # tags filter + DEFAULT_EXCLUDED_TAGS
  transforms/
    index.js
    prettier.js                 # createPrettierTransform factory
    htmlmin.js                  # createHtmlMinTransform factory (production-gated)
    clean-attrs.js              # createCleanAttrsTransform factory
    postcss.js                  # processCSS helper (for addBundle / addExtension)
  shortcodes/
    index.js
    year.js                     # currentYear (footer copyright)
test/                           # Vitest specs mirroring src/ layout
.changeset/                     # Pending changesets + Changesets config (versioning)
.github/workflows/              # CI: test, lint, release, code review, PR auto-update
```

## Common commands

```bash
yarn test                       # Run the Vitest suite once
yarn test:watch                 # Watch mode
yarn lint                       # ESLint over .js / .json / .md
yarn format                     # yarn lint --fix
yarn ci:test                    # Test run used in CI
yarn changeset                  # Record a version bump for your PR
yarn release                    # changeset publish (CI-only entry)
```

## Adding a new utility

1. Pick (or create) the right module under `src/filters/`, `src/transforms/`, or `src/shortcodes/`.
2. Export a small, pure function with full JSDoc — include `@param`, `@returns`, and at least one `@example` per function. Match the existing style (tabs, named exports, no default exports for utilities).
3. Re-export it from the category's `index.js`.
4. Wire it into `src/plugin.js`:
    - Add the name to `FILTER_NAMES` (or `TRANSFORM_NAMES`).
    - Add the factory/function to the filters/transforms object inside `dashlyPlugin`.
    - If it consumes a plugin option (e.g. `baseUrl`, `dateLocale`), read it from `options` and curry the call.
5. Write Vitest tests under `test/filters/<module>.test.js` mirroring the existing spec style. Cover nullish input, the happy path, and at least one edge case.
6. Add the utility to the relevant table in `README.md`.
7. Run `yarn changeset` and pick a bump type (`patch` for fixes, `minor` for new utilities, `major` for breaking changes). Commit the generated `.changeset/*.md` alongside your code — PRs without a changeset won't produce a release.

## Languages and tooling

- **Node.js ≥ 24** (pinned in `.nvmrc`; package targets `engines.node >= 24`)
- **Yarn 4** (pinned via the `packageManager` field)
- **Vitest** for the test suite
- **ESLint + Prettier** for linting and formatting
- **Husky + lint-staged** wire formatters into pre-commit
- **Changesets** drives versioning + npm publish from `main`
- Conventional Commits are encouraged for scannable git history but are no longer enforced — version bumps come from changesets, not commit messages

## Commits

Commit messages live in git history forever — write them with future-you (or a contributor reading blame) in mind. They're for code archaeology, not release notes; the user-facing changelog comes from changesets. If a pull request has multiple commits, squash before merging into `main` for a tidy history.

### Do

```sh
feat(filters/text): add readingTime estimator with configurable wpm

Estimates per-post reading time from a string or precomputed word count.
Locale-aware, zero-dep, and gated on a `readingTimeWpm` plugin option
(default 200) so consumers can override at config time.

Templates can now render `{{ post.content | readingTime }} min read`
without rolling their own.
```

### Don't

- `wip`
- `fix stuff`
- `feat: updates`

## Release process

Releases are managed by [Changesets](https://github.com/changesets/changesets):

1. Contributors include a `.changeset/*.md` file in their PR via `yarn changeset` when the change is user-facing.
2. On every push to `main`, the **Release** workflow runs `changesets/action`. If any unconsumed changesets exist, it opens (or updates) a **"Version packages"** PR that bumps `package.json`, prepends a new entry to `CHANGELOG.md`, and removes the consumed changeset files.
3. Merging the "Version packages" PR triggers the same workflow, which publishes to npm with provenance and tags the release on GitHub.

Do not manually update `package.json#version` or the released sections of `CHANGELOG.md`.

## What NOT to do

- Do not commit secrets, real API keys, or `.env` files.
- Do not bump `version` in `package.json` by hand — Changesets owns that.
- Do not edit the released sections of `CHANGELOG.md` by hand — the Release workflow owns those.
- Do not add new peer dependencies without making them **optional** in `peerDependenciesMeta` if they're only used by a subset of utilities.
