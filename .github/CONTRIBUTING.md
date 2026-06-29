# Contributing to @allons-y/dashly

This project follows the [Allons-y Studio Contributing Guide](https://github.com/allonsy-studio/.github/blob/main/CONTRIBUTING.md) for the general workflow (forking, branching, conventional commits, PR etiquette). The notes below cover **dashly-specific** topics: how to add a new utility, the local test/lint commands, and how releases are cut.

Allons-y — let's go! Contributions of all kinds are welcome: new filters/transforms/shortcodes, bug fixes, documentation improvements, and test coverage. If you're unsure whether your idea fits the project, open an issue first and we'll figure it out together.

## Before you start

1. **Search existing issues** before opening a new one — your bug or idea may already be in progress.
2. **Open an issue** to discuss non-trivial changes (new utilities, breaking API changes, new peer dependencies) before writing code. This saves everyone time and avoids PRs that can't be merged.
3. **Fork the repository** and clone your fork locally:
    ```sh
    git clone https://github.com/<your-username>/dashly.git
    cd dashly
    yarn install
    ```

## Development workflow

### Branching

Create a branch from `main` that describes your change:

```sh
git checkout -b fix/excerpt-negative-bounds
git checkout -b feat/add-relative-date-filter
```

### Adding a new utility

Pick the right home:

| Kind | Where it lives | Registration |
| --- | --- | --- |
| Filter | `src/filters/<category>.js` | Re-exported from `src/filters/index.js`; added to `FILTER_NAMES` and the filter map in `src/plugin.js` |
| Transform | `src/transforms/<name>.js` | Re-exported from `src/transforms/index.js`; added to `TRANSFORM_NAMES` and the transform map in `src/plugin.js` |
| Shortcode | `src/shortcodes/<name>.js` | Re-exported from `src/shortcodes/index.js`; registered inside the shortcode block in `src/plugin.js` |

Each new utility must:

1. **Be a small, pure function** with a single responsibility. No I/O at import time. Lazy-load heavy peer dependencies via dynamic `import()`.
2. **Carry full JSDoc** with `@param`, `@returns`, and at least one `@example` per export.
3. **Handle nullish input gracefully** — return an empty string, `undefined`, or `[]` as the category convention dictates rather than throwing.
4. **Be tree-shakeable** — exported individually and reachable via its subpath (`@allons-y/dashly/filters/<category>`).
5. **Have a Vitest spec** under `test/filters/<category>.test.js` covering nullish input, the happy path, and at least one edge case.
6. **Be documented in `README.md`** — added to the appropriate feature table.

### Peer dependencies

Heavy dependencies (HTML formatters, markdown renderers, image pipelines) belong in `peerDependencies` with an entry in `peerDependenciesMeta` marking them `optional: true`. Consumers should only have to install the peers they actually use.

### Running commands

```sh
yarn test                       # Run the Vitest suite once
yarn test:watch                 # Watch mode
yarn lint                       # ESLint over .js / .json / .md
yarn format                     # yarn lint --fix
```

### Testing

We use [Vitest](https://vitest.dev). Tests live under `test/` mirroring `src/`. Every new export needs at least one spec. For utilities that lazy-load peer deps, write tests that exercise both the happy path and the "peer not installed" branch where reasonable.

### Linting and formatting

ESLint (flat config in `eslint.config.js`) covers `.js`, `.json`/`package.json`, and `.md`. Prettier handles formatting via `prettier.config.js`. Husky runs `lint-staged` on pre-commit so formatting is automatic.

### Commit messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). The format is:

```md
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

Common types:

| Type       | When to use                                 |
| ---------- | ------------------------------------------- |
| `feat`     | A new feature (triggers a minor release)    |
| `fix`      | A bug fix (triggers a patch release)        |
| `perf`     | A performance improvement (patch release)   |
| `docs`     | Documentation changes only                  |
| `test`     | Adding or updating tests                    |
| `refactor` | Code restructuring without behaviour change |
| `chore`    | Tooling, config, dependency updates         |

`commitlint` runs on every commit. Use a scope like `filters/dates` or `transforms/htmlmin` when the change is localized to one module — it makes the changelog easier to scan.

### Pull requests

- Keep PRs focused — one logical change per PR.
- Every new utility or changed behavior **must** include tests and a README update.
- PR titles should follow Conventional Commits — the title becomes the squash-merge commit subject.
- Fill out the PR description — explain the "why", not just the "what". If you're adding a filter, include a template-side usage example.
- New peer dependencies require a brief justification in the PR description.

## Project structure

```sh
dashly/
├── package.json                # npm package manifest
├── src/                        # Source — pure ESM, no build step
│   ├── index.js                # Default plugin export + aggregate re-exports
│   ├── plugin.js               # Eleventy plugin registering everything
│   ├── filters/                # Filters grouped by category
│   ├── transforms/             # HTML/CSS/format transforms
│   └── shortcodes/             # Shortcodes
├── test/                       # Vitest specs mirroring src/
├── eslint.config.js
├── prettier.config.js
├── commitlint.config.js
├── lint-staged.config.js
├── .releaserc.js               # semantic-release config
└── .github/
    └── workflows/              # CI automation
```

## Release process

Releases run via `semantic-release` on every merge to `main`. The commit-message types determine the version bump:

- `feat:` → minor
- `fix:` / `perf:` → patch
- `BREAKING CHANGE:` footer or `!` suffix → major

semantic-release updates `CHANGELOG.md`, publishes to npm, and commits the version bump back to `main`. **Do not** edit `version` in `package.json` or `CHANGELOG.md` by hand.

## Code of Conduct

This project is governed by the [Allons-y Studio Code of Conduct](https://github.com/allonsy-studio/.github/blob/main/CODE_OF_CONDUCT.md). By participating you agree to uphold a welcoming and respectful environment for everyone. Report unacceptable behavior to **report@allons-y.studio**.

## Security

To report a security vulnerability, **do not open a public issue**. See the [Allons-y Studio Security Policy](https://github.com/allonsy-studio/.github/blob/main/SECURITY.md) for the disclosure process.
