// eslint-disable-next-line @typescript-eslint/triple-slash-reference
// <reference path="./node_modules/kolorist/dist/types/index.d.ts"/>
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
// <reference path="./node_modules/resolve.exports/index.d.ts"/>

// https://github.com/import-js/eslint-plugin-import/blob/main/resolvers/README.md
// https://github.com/import-js/eslint-plugin-import#resolvers

const fs = require('fs');

// @ts-expect-error TS7016
const { cyan, green, red } = require('kolorist');

// @ts-expect-error TS7016
const { resolve: resolveExports } = require('resolve.exports');

const { CachedInputFileSystem, ResolverFactory } = require('enhanced-resolve');

const { builtinModules } = require('module'); // createRequire
const path = require('path');

// create.sync
const enhancedResolver = ResolverFactory.createResolver({
	fileSystem: new CachedInputFileSystem(fs, 4000),
	extensions: ['.mjs', '.cjs', '.json', '.node', '.ts', '.tsx', '.js', '.jsx'],
	useSyncFileSystemCalls: true,
	// preferRelative: true,
	// conditionNames: ['node'],
});

// https://github.com/browserify/resolve
// const { isCore } = require('resolve');
//, sync, SyncOpts

// https://github.com/import-js/eslint-plugin-import/blob/main/resolvers/node/index.js
// https://github.com/alexgorbatchev/eslint-import-resolver-typescript/blob/master/src/index.ts
// https://github.com/laysent/eslint-import-resolver-custom-alias/blob/master/index.js

// // https://gist.github.com/developit/4ba748d7d0196b780076b29e6f7a65c8
// /**
//  * @param {any} exp `package.exports`
//  * @param {string} entry `./foo` or `.`
//  * @param {string[]} envKeys package environment keys
//  * @returns {string | boolean} a resolved path, or a boolean indicating if the given entry is exposed
//  */
// const resolveExportMap = (exp, entry, envKeys) => {
// 	console.log('resolveExportMap >>>> ', entry, exp);
// 	if (typeof exp === 'string') {
// 		// {"exports":"./foo.js"}
// 		// {"exports":{"./foo":"./foo.js"}}
// 		console.log('resolveExportMap >>>> string ', entry, exp);
// 		return exp;
// 	}
// 	let isFileListing;
// 	let isDirectoryExposed = false;
// 	for (let i in exp) {
// 		if (isFileListing === undefined) isFileListing = i[0] === '.';
// 		if (isFileListing) {
// 			// {"exports":{".":"./index.js"}}
// 			if (i === entry) {
// 				console.log('resolveExportMap >>>> isFileListing ', entry, exp);
// 				return resolveExportMap(/** @type {Object} */ exp[i], entry, envKeys);
// 			}
// 			if (!isDirectoryExposed && i.endsWith('/') && entry.startsWith(i)) {
// 				isDirectoryExposed = true;
// 			}
// 		} else if (envKeys.includes(i)) {
// 			// {"exports":{"import":"./foo.js"}}
// 			console.log('resolveExportMap >>>> envKeys ', entry, exp, i);
// 			return resolveExportMap(exp[i], entry, envKeys);
// 		}
// 	}
// 	console.log('resolveExportMap >>>> isDirectoryExposed ', entry, exp, isDirectoryExposed);
// 	return isDirectoryExposed;
// };

const builtins = new Set(builtinModules);

/**
 * @param {string} source source
 * @param {string} file file
 * @param {Object} _config config
 */
const resolve = (source, file, _config) => {
	// if (source.startsWith('@preact-wmr-twind-zero/')) {
	// 	// const resolvedPath = await import.meta.resolve(source, `file://${file}`);
	// 	// https://github.com/import-js/eslint-plugin-import/issues/1868
	// 	// https://github.com/import-js/eslint-plugin-import/issues/1810
	// 	// https://github.com/browserify/resolve/pull/224
	// 	// https://github.com/wooorm/import-meta-resolve/issues/2
	// 	// https://github.com/weiran-zsd/eslint-plugin-node/pull/4
	// 	// https://github.com/mysticatea/eslint-plugin-node/issues/255
	// 	// https://github.com/mysticatea/eslint-plugin-node/issues/244
	// 	// https://github.com/mysticatea/eslint-plugin-node/issues/258
	// 	// https://github.com/webpack/enhanced-resolve
	// 	console.log(`${red('ESLINT PLUGIN IMPORT RESOLVER')} >> [${green(source)}] in [${cyan(file)}] (...)`);
	// 	return { found: true, path: null };
	// 	// return { found: false };
	// }

	// if (isCore(source)) {
	// 	console.log(`${red('ESLINT PLUGIN IMPORT RESOLVER')} >> [${green(source)}] in [${cyan(file)}] (builtins)`);
	// 	return { found: true, path: null };
	// }
	if (builtins.has(source)) {
		console.log(
			`${red('OK - ESLINT PLUGIN IMPORT RESOLVER (builtins)')} >> [${green(source)}] in [${cyan(file)}] (builtins 1)`,
		);
		// return { found: false };
		return { found: true, path: null };
	}

	try {
		const moduleId = require.resolve(source, { paths: [path.dirname(file)] });
		// if (process.versions.pnp && moduleId.includes('__virtual__')) {
		// 	moduleId = require('pnpapi').resolveVirtual(moduleId);
		// }

		// if (builtinModules.includes(moduleId)) {
		// 	console.log(
		// 		`${red('ESLINT PLUGIN IMPORT RESOLVER 2')} >> [${green(source)}] in [${cyan(file)}] ([${yellow(
		// 			moduleId,
		// 		)}]) (builtins 2)`,
		// 	);
		// 	// return { found: false };
		// 	return { found: true, path: null };
		// }

		console.log(
			`${red('OK - ESLINT PLUGIN IMPORT RESOLVER (require.resolve)')} >> [${green(source)}] in [${cyan(file)}] => [${green(
				moduleId,
			)}]`,
		);
		return { found: true, path: moduleId };
	} catch (/** @type {any} */ errRequireResolve) {
		try {
			const result = enhancedResolver.resolveSync({}, path.dirname(file), source);

			console.log(
				`${red('OK - ESLINT PLUGIN IMPORT RESOLVER (enhanced-resolve)')} >> [${green(source)}] in [${cyan(file)}]]`,
			);
			return { found: true, path: result };
		} catch (/** @type {any} */ _errEnhancedResolver) {
			// console.log(
			// 	`FAIL? - ESLINT PLUGIN IMPORT RESOLVER (enhanced-resolve) [${green(source)}] in [${cyan(file)}]`,
			// 	errEnhancedResolver.code,
			// 	errEnhancedResolver.path,
			// 	errEnhancedResolver.message,
			// );

			// try {
			// 	const req = createRequire(file); // import.meta.url
			// 	const moduleId = req.resolve(source, { paths: [path.dirname(file)] });
			// 	console.log(`${red('ESLINT PLUGIN IMPORT RESOLVER')} >> [${green(source)}] in [${cyan(file)}] => [${green(moduleId)}] (ESM)`);
			// 	return { found: true, path: moduleId };
			// } catch (err2) {
			// 	console.log(`ESLINT PLUGIN IMPORT RESOLVER?!! [${green(source)}] in [${cyan(file)}]`, err1, err2);
			// 	return { found: false };
			// }
			// err1.code => 'MODULE_NOT_FOUND'
			// err1.path => '/path/to/node_modules/@preact-wmr-twind-zero/xxx/package.json'
			// err1.message => Cannot find module '/path/to/node_modules/@preact-wmr-twind-zero/preact-things/dist/cjs/xx.js'
			if (errRequireResolve.code === 'MODULE_NOT_FOUND' && errRequireResolve.path?.endsWith('/package.json')) {
				// const str = 'node_modules/';
				// const i = err1.path.lastIndexOf(str) + str.length;
				// const prefix = err1.path.replace(/\/package\.json$/, '').substr(i);
				// const relativeSource = source.replace(prefix, '.');
				// const { exports } = require(err1.path);
				// const resolved = resolveExportMap(exports, relativeSource, ['import']);
				const { name, module, main, exports } = require(errRequireResolve.path);
				const resolved = resolveExports({ name, module, main, exports }, source);
				const ok = resolved?.startsWith('.');
				const moduleId = ok
					? path.join(path.dirname(errRequireResolve.path), resolved)
					: errRequireResolve.message?.replace(
							/Cannot find module '(.*)'/,
							(/** @type {string} */ _match, /** @type {string} */ $1) => {
								// assumes: err1.message.includes('/dist/cjs/')
								return $1.replace(/\/dist\/cjs\//, '/dist/esm/');
							},
					  );
				console.log(
					`${red('OK - ESLINT PLUGIN IMPORT RESOLVER (resolve.exports)')} >> [${green(source)}] in [${cyan(
						file,
					)}] => [${green(moduleId)}] (ESM${ok ? '' : ' (fallback)'})`,
				);
				// [${red(resolved)}] [${prefix}] [${relativeSource}]
				return { found: true, path: moduleId };
			}
			console.log(
				`FAIL! - ESLINT PLUGIN IMPORT RESOLVER [${green(source)}] in [${cyan(file)}]`,
				errRequireResolve.code,
				errRequireResolve.path,
				errRequireResolve.message,
			);
			return { found: false };
		}
	}
};

module.exports = {
	interfaceVersion: 2,
	resolve,
};
