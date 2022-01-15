import path from 'path';

import { wmrTwindPlugin } from './wmr-plugin-twind.mjs';

import { defineConfig } from 'wmr';

export default defineConfig(async (config) => {
	// verbose!
	// we also use CLI DEBUG=*
	config.debug = true;

	config.publicPath = process.env.BUILD_FOR_GITHUB
		? '//raw.githack.com/danielweck/preact-wmr-twind-zero/main/dist/'
		: '/';

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
	config.customRoutes = ['/_404'];

	config.plugins.push(wmrTwindPlugin(config));
});
