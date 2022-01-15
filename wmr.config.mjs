import path from 'path';

import { wmrTwindPlugin } from './wmr-plugin-twind.mjs';

import { defineConfig } from 'wmr';

export default defineConfig(async (config) => {
	// verbose!
	// we also use CLI DEBUG=*
	config.debug = true;

	// WMR hacks to deploy on GitHub :(
	const PUBLIC_PATH_ORIGIN = '//raw.githack.com';
	const PUBLIC_PATH_ROOT = '/danielweck/preact-wmr-twind-zero/main/dist/';
	// config.publicPath = process.env.BUILD_FOR_GITHUB ? `${PUBLIC_PATH_ORIGIN}${PUBLIC_PATH_ROOT}` : '/';
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
	config.customRoutes = ['/_404-not-found'];
	// config.publicPath.startsWith('//') ? PUBLIC_PATH_ROOT : config.publicPath,
	// if (config.publicPath.startsWith('//')) {
	// 	config.customRoutes.push('/');
	// }

	config.plugins.push(wmrTwindPlugin(config));
});
