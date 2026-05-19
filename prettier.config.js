/** @type {import('prettier').Config} */
export default {
	printWidth: 800,
	tabWidth: 4,
	useTabs: true,
	trailingComma: "es5",
	overrides: [
		{
			files: "*.json",
			options: {
				tabWidth: 2,
				useTabs: false,
			},
		},
		{
			files: ".github/**/*.yml",
			options: {
				useTabs: false,
			},
		},
	],
};
