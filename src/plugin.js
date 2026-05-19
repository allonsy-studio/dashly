/**
 * The dashly Eleventy plugin. Registers every filter, transform, and
 * shortcode under a sensible default name, and accepts an options object to
 * opt out of pieces or override defaults.
 *
 * @example
 *   import dashly from '@allons-y/dashly';
 *   export default function (config) {
 *     config.addPlugin(dashly, {
 *       dateLocale: 'en-GB',
 *       shortcodes: { image: { urlPath: '/images/', outputDir: './public/images/' } },
 *       transforms: { htmlmin: false },
 *     });
 *   }
 *
 * @module @allons-y/dashly/plugin
 */

import * as dateFilters from './filters/dates.js';
import * as stringFilters from './filters/strings.js';
import * as urlFilters from './filters/urls.js';
import * as objectFilters from './filters/objects.js';
import * as htmlFilters from './filters/html.js';
import * as textFilters from './filters/text.js';
import * as debugFilters from './filters/debug.js';
import * as arrayFilters from './filters/arrays.js';
import * as numberFilters from './filters/numbers.js';
import * as tagFilters from './filters/tags.js';
import { createImgSrc } from './filters/images.js';

import { createPrettierTransform } from './transforms/prettier.js';
import { createHtmlMinTransform } from './transforms/htmlmin.js';
import { createCleanAttrsTransform } from './transforms/clean-attrs.js';

import { createImageShortcode } from './shortcodes/image.js';
import { currentYear } from './shortcodes/year.js';

/**
 * @typedef {Object} DashlyOptions
 * @property {Intl.LocalesArgument} [dateLocale='en-US'] Default locale for `longDate`/`shortDate`/`relativeDate`.
 * @property {string} [baseUrl] Site origin used by the `absoluteUrl` filter (e.g. `https://example.com`).
 * @property {number} [readingTimeWpm=200] Default words-per-minute for `readingTime`.
 * @property {string[]} [tagsExclude] Tag names stripped by the `tags` filter. Defaults to `['all', 'post', 'posts']`.
 * @property {false | { exclude?: string[] }} [filters] Pass false to skip filter registration.
 * @property {false | { exclude?: string[], prettier?: object, htmlmin?: object, cleanAttrs?: object }} [transforms]
 * @property {false | { exclude?: string[], image?: object }} [shortcodes]
 */

const FILTER_NAMES = [
	'toISOString',
	'year',
	'dateFormat',
	'longDate',
	'shortDate',
	'firstWord',
	'lastWord',
	'trim',
	'stripWhitespace',
	'digitsOnly',
	'keys',
	'validateURL',
	'cleanForRSS',
	'renderMarkdown',
	'wordCount',
	'readingTime',
	'excerpt',
	'dump',
	'jsonify',
	'first',
	'last',
	'reverse',
	'capitalize',
	'title',
	'stripTags',
	'nl2br',
	'absoluteUrl',
	'relativeDate',
	'timeAgo',
	'number',
	'currency',
	'percent',
	'groupBy',
	'sortBy',
	'chunk',
	'where',
	'pluck',
	'tags',
];

const TRANSFORM_NAMES = ['cleanAttrs', 'prettier', 'htmlmin'];

/**
 * @param {import('@11ty/eleventy').UserConfig} config
 * @param {DashlyOptions} [options]
 */
export function dashlyPlugin(config, options = {}) {
	const dateLocale = options.dateLocale ?? 'en-US';
	const readingTimeWpm = options.readingTimeWpm ?? 200;
	const baseUrl = options.baseUrl;
	const tagsExclude = options.tagsExclude ?? tagFilters.DEFAULT_EXCLUDED_TAGS;

	if (options.filters !== false) {
		const exclude = new Set(options.filters?.exclude ?? []);
		const filters = {
			toISOString: dateFilters.toISOString,
			year: dateFilters.year,
			dateFormat: dateFilters.dateFormat,
			longDate: (value) => dateFilters.longDate(value, dateLocale),
			shortDate: (value) => dateFilters.shortDate(value, dateLocale),
			firstWord: stringFilters.firstWord,
			lastWord: stringFilters.lastWord,
			trim: stringFilters.trim,
			stripWhitespace: stringFilters.stripWhitespace,
			digitsOnly: stringFilters.digitsOnly,
			keys: objectFilters.keys,
			validateURL: urlFilters.validateURL,
			cleanForRSS: htmlFilters.cleanForRSS,
			renderMarkdown: htmlFilters.renderMarkdown,
			wordCount: textFilters.wordCount,
			readingTime: (value, wpm) => textFilters.readingTime(value, wpm ?? readingTimeWpm),
			excerpt: textFilters.excerpt,
			dump: debugFilters.dump,
			jsonify: debugFilters.jsonify,
			first: arrayFilters.first,
			last: arrayFilters.last,
			reverse: arrayFilters.reverse,
			capitalize: stringFilters.capitalize,
			title: stringFilters.title,
			stripTags: htmlFilters.stripTags,
			nl2br: htmlFilters.nl2br,
			absoluteUrl: (path, override) => urlFilters.absoluteUrl(path, override ?? baseUrl),
			relativeDate: (value, locale, opts) =>
				dateFilters.relativeDate(value, locale ?? dateLocale, opts),
			timeAgo: (value, locale, opts) =>
				dateFilters.timeAgo(value, locale ?? dateLocale, opts),
			number: (value, opts, locale) => numberFilters.number(value, opts, locale ?? dateLocale),
			currency: (value, code, locale, opts) =>
				numberFilters.currency(value, code, locale ?? dateLocale, opts),
			percent: (value, opts) =>
				numberFilters.percent(value, { locale: dateLocale, ...(opts ?? {}) }),
			groupBy: arrayFilters.groupBy,
			sortBy: arrayFilters.sortBy,
			chunk: arrayFilters.chunk,
			where: arrayFilters.where,
			pluck: arrayFilters.pluck,
			tags: (tagList, extra) => tagFilters.tags(tagList, extra, tagsExclude),
		};

		for (const name of FILTER_NAMES) {
			if (exclude.has(name)) continue;
			config.addFilter(name, filters[name]);
		}
	}

	if (options.transforms !== false) {
		const exclude = new Set(options.transforms?.exclude ?? []);
		const transforms = {
			cleanAttrs: createCleanAttrsTransform(options.transforms?.cleanAttrs ?? {}),
			prettier: createPrettierTransform(options.transforms?.prettier ?? {}),
			htmlmin: createHtmlMinTransform(options.transforms?.htmlmin ?? {}),
		};

		for (const name of TRANSFORM_NAMES) {
			if (exclude.has(name)) continue;
			config.addTransform(name, transforms[name]);
		}
	}

	if (options.shortcodes !== false) {
		const exclude = new Set(options.shortcodes?.exclude ?? []);
		const imageOptions = options.shortcodes?.image;

		if (!exclude.has('image') && imageOptions) {
			config.addShortcode('image', createImageShortcode(imageOptions));
			config.addFilter('imgSrc', createImgSrc(imageOptions));
		}

		if (!exclude.has('year')) {
			config.addShortcode('year', currentYear);
		}
	}
}
