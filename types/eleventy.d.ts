/**
 * Eleventy ships no type declarations. This covers the parts of the config API
 * that dashly calls.
 */
declare module "@11ty/eleventy" {
	export interface UserConfig {
		addFilter(name: string, callback: (...args: any[]) => unknown): void;
		addTransform(name: string, callback: (this: any, content: string, outputPath?: string) => unknown): void;
		addShortcode(name: string, callback: (...args: any[]) => unknown): void;
	}
}
