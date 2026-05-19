/**
 * HTML-related filters for Eleventy.
 *
 * - `cleanForRSS` requires `posthtml` as a peer dependency.
 * - `renderMarkdown` requires `markdown-it` as a peer dependency or a
 *   user-provided renderer instance.
 *
 * @module @allons-y/dashly/filters/html
 */

/**
 * Strip every HTML tag from a string, leaving only text content. Zero-dep
 * regex pass — for opinionated tag-aware stripping (RSS feeds, custom
 * elements, permalinks), use {@link cleanForRSS} instead.
 *
 * Internal whitespace is collapsed and the result is trimmed.
 *
 * @param {string} value
 * @returns {string}
 *
 * @example
 * // 'Hello world'
 * stripTags('<p>Hello <strong>world</strong></p>');
 *
 * @example
 * {{ post.content | stripTags | excerpt(40) }}
 */
export const stripTags = (value) => {
	if (value == null) return '';
	return String(value)
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};

/**
 * Replace newline characters with `<br>` tags. Handles `\r\n`, `\r`, and `\n`.
 * Useful for rendering plain-text strings (form responses, YAML data) as HTML
 * while preserving line breaks. Preserves the trailing newline so the HTML
 * source stays readable.
 *
 * @param {string} value
 * @returns {string}
 *
 * @example
 * // 'one<br>\ntwo<br>\nthree'
 * nl2br('one\ntwo\nthree');
 *
 * @example
 * {{ user.bio | nl2br | safe }}
 */
export const nl2br = (value) => {
	if (value == null) return '';
	return String(value).replace(/\r\n|\r|\n/g, '<br>\n');
};

const DEFAULT_UNSAFE_TAGS = Object.freeze([
	'comment',
	'embed',
	'link',
	'listing',
	'meta',
	'noscript',
	'object',
	'plaintext',
	'script',
	'xmp',
]);

/**
 * Strip tags and elements that are unsafe or undesirable in RSS/Atom feeds.
 *
 * By default this removes script/style/embed/etc. tags and `header-anchor`
 * permalink `<a>` elements inserted by markdown-it-anchor. Pass `customTags`
 * to strip additional tags (e.g. web components like `lite-youtube`).
 *
 * @param {string} html
 * @param {object} [options]
 * @param {string[]} [options.unsafeTags] Override the default unsafe-tag list.
 * @param {string[]} [options.customTags=[]] Additional tag names to strip (e.g. custom elements).
 * @param {boolean} [options.stripPermalinks=true] Remove `<a class="header-anchor">` nodes.
 * @returns {Promise<string>}
 */
export const cleanForRSS = async (html, options = {}) => {
	if (!html || typeof html !== 'string') return html;

	const { default: posthtml } = await import('posthtml');
	const unsafe = options.unsafeTags ?? DEFAULT_UNSAFE_TAGS;
	const custom = options.customTags ?? [];
	const stripPermalinks = options.stripPermalinks !== false;

	const modifier = posthtml().use((tree) => {
		if (!Array.isArray(tree) || !tree.length) return tree;
		tree.walk((node) => {
			if (!node || typeof node !== 'object') return node;
			const classes =
				node.attrs?.class?.split(' ').map((c) => c.trim().toLowerCase()) ?? [];
			const isPermalink =
				stripPermalinks && node.tag === 'a' && classes.includes('header-anchor');
			const isUnsafe = unsafe.includes(node.tag);
			const isCustom = custom.includes(node.tag);
			if (isPermalink || isUnsafe || isCustom) {
				node.tag = false;
				node.content = [];
			}
			return node;
		});
		return tree;
	});

	const result = await modifier.process(html);
	return result.html;
};

/**
 * Render a markdown string to HTML. Accepts either a pre-configured
 * `markdown-it` instance or, by default, lazily imports `markdown-it` and
 * creates one with sensible defaults.
 *
 * If `splitParagraphs` is true (default), the input is also pre-split on
 * literal `\n\n` (paragraph) and `\n` (line break) escape sequences — useful
 * for rendering markdown stored as a single-line string in YAML data files.
 *
 * @param {string} value
 * @param {object} [options]
 * @param {import('markdown-it').default} [options.renderer] A pre-configured `markdown-it` instance.
 * @param {boolean} [options.splitParagraphs=true]
 * @returns {Promise<string>}
 */
export const renderMarkdown = async (value, options = {}) => {
	if (!value || typeof value !== 'string') return value;

	let renderer = options.renderer;
	if (!renderer) {
		const { default: MarkdownIt } = await import('markdown-it');
		renderer = new MarkdownIt({ html: true, linkify: true });
	}

	if (options.splitParagraphs === false) return renderer.render(value);

	const paragraphs = value
		.split('\\n\\n')
		.map((p) => `<p>${p.replace(/\\n/g, '<br>').trim()}</p>`);
	if (paragraphs.length === 0) return renderer.render(value);
	return renderer.render(paragraphs.join(''));
};
