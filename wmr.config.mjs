import { cyan, green } from 'kolorist';
import path from 'path';
import { defineConfig } from 'wmr';

import { wmrTwindPlugin } from './wmr-plugin-twind.mjs';

export default defineConfig(async (config) => {
	// verbose!
	// we also use CLI DEBUG=*
	config.debug = true;

	// WMR hacks to deploy on GitHub :(
	// const PUBLIC_PATH_ORIGIN = '//raw.githack.com';
	// const PUBLIC_PATH_ROOT = '/danielweck/preact-wmr-twind-zero/gh-pages/dist/';
	const PUBLIC_PATH_ORIGIN = '//danielweck.github.io';
	const PUBLIC_PATH_ROOT = '/preact-wmr-twind-zero/';
	if (process.env.BUILD_FOR_GITHUB) {
		config.publicPath = `${PUBLIC_PATH_ORIGIN}${PUBLIC_PATH_ROOT}`;
		config.env = { WMR_PUBLIC_PATH_ORIGIN: PUBLIC_PATH_ORIGIN, WMR_PUBLIC_PATH_ROOT: PUBLIC_PATH_ROOT };
	}

	// we use CLI --visualize
	// config.visualize = true;

	// so that "visualize" reports meaningful sizes
	config.minify = true;

	config.port = 8080;
	config.host = '127.0.0.1';

	// prerender output folder (dev mode uses .cache folder)
	config.out = path.join(process.cwd(), 'dist');

	// source code (that's actually WMR's default)
	config.root = path.join(process.cwd(), 'public');

	// same as / which is a built-in WMR feature)
	config.alias = { '~/*': './public' };

	// ask WMR to prerender route not explicitly linked to in source code
	config.customRoutes = [
		'/_404-not-found', // This is only to ensure that the 404 page stylesheet is processed at post-build stage to segregate "critical" vs. "secondary" styles.
		config.publicPath.startsWith('//') ? `${PUBLIC_PATH_ROOT}suspended/lazy` : '/suspended/lazy', // Same reason as 404 above, but this is for self-contained lazy/async components (see /public/suspended/index.tsx).
	];

	config.plugins.push(wmrTwindPlugin(config));

	config.plugins.push({
		name: 'TypeScript 4.5 type modifier on imported names removal plugin',
		enforce: 'pre',

		transform(code, id) {
			if (!/\.tsx?$/.test(id)) return;

			// TODO: is this really necessary in WMR's latest version?
			if (id[0] === '\0' || id[0] === '\b') return;

			if (config.mode === 'build' || config.mode === 'start') {
				const DEBUG_PREFIX = `\nWMR IMPORT_TYPE PLUGIN (${config.mode}) [${cyan(id.replace(process.cwd(), ''))}]:\n`;
				const re = /^import(.*)({.+})\s*from\s*['|"](.+)['|"]/gm;
				return {
					code: code.replace(re, (match, /** @type {string} */ $1, /** @type {string} */ $2, /** @type {string} */ $3) => {
						if (!$2.includes('type ')) {
							return match; // preserve as-is
						}
						const s = `import${$1}${$2.replace(/type /g, '')} from '${$3}'`;
						console.log(`${DEBUG_PREFIX}[${green(match)}] => [${green(s)}]\n`);
						return s;
					}),
					map: null,
				};
			}
		},
	});
});
