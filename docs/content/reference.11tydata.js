// Page data for reference.webc: functions, because WebC would render front matter strings as WebC.

export default {
	permalink: (data) => `/${data.category.key}/`,
	eleventyComputed: {
		title: (data) => data.category.title,
		description: (data) => data.category.description,
		order: (data) => data.category.order,
		icon: (data) => data.category.icon,
	},
};
