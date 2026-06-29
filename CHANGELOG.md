# Changelog

All notable changes to `@allons-y/dashly` are documented here. This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial extraction from `castastrophe/portfolio`.
- Filters: `toISOString`, `year`, `dateFormat`, `longDate`, `shortDate`, `firstWord`, `lastWord`, `trim`, `stripWhitespace`, `digitsOnly`, `keys`, `validateURL`, `cleanForRSS`, `renderMarkdown`.
- Transforms: `cleanAttrs`, `prettier`, `htmlmin` (production-gated by default), `processCSS` helper.
- Plugin entry that auto-registers everything with opt-out support.
- Subpath exports for `/filters`, `/transforms`, `/shortcodes` and their submodules.

[Unreleased]: https://github.com/allonsy-studio/dashly/compare/HEAD...HEAD
