import preact from '@preact/preset-vite';
import { cyan, green } from 'kolorist';
import * as path from 'path';
import { type Plugin, defineConfig } from 'vite';

const plugg = () => {
	return {
		name: 'vite-plugin-typescript-type-modifier-on-imported-names',
		enforce: 'pre',
		apply: (config, env) => {
			const DEBUG_PREFIX = '\nWMR IMPORT_TYPE PLUGIN:\n';
			// config.mode === 'development' || config.mode === 'production'
			const pluginDoApply = env.command === 'build' || env.command === 'serve';
			console.log(
				`${DEBUG_PREFIX}[${pluginDoApply} => ${config.mode} -- ${config.build.ssr} -- ${green(
					JSON.stringify(env, null, 4),
				)}]\n`,
			);
			return pluginDoApply;
		},
		// resolveId(source, importer, options) {
		// 	const DEBUG_PREFIX = '\nWMR IMPORT_TYPE PLUGIN:\n';
		// 	const res = source.startsWith('.') ? this.resolve(source) : undefined;
		// 	console.log(
		// 		`${DEBUG_PREFIX}resolveId => [${green(source)}] [${cyan(importer)}] [${green(
		// 			JSON.stringify(options, null, 4),
		// 		)}] ==> ${typeof res}\n`,
		// 	);
		// 	return res;
		// },
		// load(id, options) {
		// 	const DEBUG_PREFIX = '\nWMR IMPORT_TYPE PLUGIN:\n';
		// 	console.log(`${DEBUG_PREFIX}load => [${cyan(id)}][${green(JSON.stringify(options, null, 4))}]\n`);
		// 	return undefined;
		// },
		transform(code, id) {
			if (!/\.tsx?$/.test(id)) return;
			const DEBUG_PREFIX = `\nWMR IMPORT_TYPE PLUGIN [${cyan(id.replace(process.cwd(), ''))}]:\n`;
			console.log(`${DEBUG_PREFIX}transform => [${cyan(id)}]\n`);
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
		},
	} as Plugin;
};

export default defineConfig({
	root: path.join(process.cwd(), 'public'),
	// base: '/public/',
	// publicDir: 'public',

	clearScreen: false,

	build: {
		outDir: path.join(process.cwd(), 'dist-vite'),
		minify: false,
		emptyOutDir: true,
	},

	server: {
		host: '127.0.0.1',
		port: 8080,
		fs: {
			strict: true,
		},
	},

	preview: {
		host: '127.0.0.1',
		port: 8080,
	},

	resolve: {
		alias: {
			'~/': './public',
		},
	},

	plugins: [plugg(), preact()],
});
