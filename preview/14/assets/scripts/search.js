// Mounts Pagefind search into [data-search]. Pages work without it, or without the index (docs:start).
const mount = document.querySelector("[data-search]");

if (mount) {
	// This file lives at <site root>/assets/scripts/, so the site root is two levels up.
	const root = new URL("../../", import.meta.url);
	const load = (tag, attrs) =>
		new Promise((resolve, reject) => {
			const node = Object.assign(document.createElement(tag), attrs);
			node.addEventListener("load", resolve, { once: true });
			node.addEventListener("error", reject, { once: true });
			document.head.append(node);
		});

	try {
		await Promise.all([
			load("link", { rel: "stylesheet", href: new URL("pagefind/pagefind-ui.css", root).href }),
			load("script", { src: new URL("pagefind/pagefind-ui.js", root).href }),
		]);
		new window.PagefindUI({
			element: mount,
			showImages: false,
			baseUrl: root.pathname,
			translations: { placeholder: "Search docs" },
		});
	} catch {
		mount.remove();
	}
}
