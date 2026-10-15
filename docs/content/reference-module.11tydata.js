// Page data for reference-module.webc: functions, because WebC would render front matter strings as WebC.

export default {
	permalink: (data) => data.module.url,
	eleventyComputed: {
		title: (data) => data.module.slug,
		description: (data) => data.module.summary,
	},
};
