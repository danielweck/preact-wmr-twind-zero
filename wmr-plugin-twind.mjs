import { cyan, green, red } from 'kolorist';
import { shortcut, twind, virtual } from 'twind';

import { twConfig } from './public/twindConfig.js';

// Regular expression that checks file extensions:
// we only transform Twind tagged template literals in TS, TSX, JS, JSX source code
const REGEXP_TRANSFORM_FILE_FILTER = /\.[tj]sx?$/;

// 'twindTw' is a function we define to wrap Twind's own tagged template literal.
// 'twindShortcut' is a function we define to wrap Twind's own shortcut() tagged template literal.
// 'twindSkip' is a function we define to signal that Twind will not be invoked,
// instead we preserve the function parameters as-is (i.e. raw template literal string),
// which enables token intellisense / autocompletion DX, without actually invoking Twind at buildtime or runtime.
// (see tsconfig.json, 'compilerOptions' > 'plugins' > '@twind/typescript-plugin' > 'tags' and 'attributes')
const twindTagFunctions = ['twindTw', 'twindShortcut', 'twindSkip'];

// Regular expression that captures Twind tagged template literals,
// based on the above list of custom Twind functions.
// In 'dev' mode, the transformation simply removes the function call (i.e. the term immediately before the opening backtick),
// and leaves the raw / untagged template literal (which may or may not be interpolated with the `${}` syntax, recursively).
// Just like with 'twindSkip', this string is then consumed by the Twind runtime via the custom Preact VNode 'options' hook.
// In 'build' mode (i.e. WMR prerender, which is designed to eliminate the need for the Twind runtime in deployed / rendered pages),
// the transformation executes Twind as appropriate into a transient stylesheet during the build steps,
// and we replace the entire expression with a JSON object that contains the result of Twind's processing
// (see implementation details in the 'transform()' function below).
// This JSON object is then consumed at runtime by the custom Preact 'options' VNode hook.
const REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS = new RegExp(`(${twindTagFunctions.join('|')})\`([^\`]+)\``, 'gm');

// Post-transformation sanity check: no tagged template literals should remain,
// as they should all have been transformed to either plain (untagged) template literals,
// of JSON objects resulting from Twind execution (to be later processed by the custom Preact VNode 'options' hook).
const REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS_CHECK = new RegExp(`(${twindTagFunctions.join('|')})\``, 'g');

/** @returns {import('wmr').Plugin} */
/** @param {import('wmr').Options} config */
export function wmrTwindPlugin(config) {
	// in WMR build/prerender mode, we execute Twind via a transient stylesheet.
	// See lazy instantiation further down below...
	/** @type {import('twind').Twind<import('twind').BaseTheme, string[]> | undefined} */
	let _tw;
	/** @type {import('twind').Sheet<string[]> | undefined} */
	let _twindSheet;

	/** @type {import('wmr').Plugin} */
	const plug = {
		name: 'Twind WMR plugin',
		enforce: 'pre',

		transform(code, id) {
			if (!REGEXP_TRANSFORM_FILE_FILTER.test(id)) return;

			// TODO: is this really necessary in WMR's latest version?
			if (id[0] === '\0' || id[0] === '\b') return;

			const DEBUG_PREFIX = `WMR TWIND PLUGIN (${config.mode}) [${cyan(id.replace(process.cwd(), ''))}]:\n`;

			// TODO: strictly-speaking, this is an unnecessary, resource-consuming check?
			// (we have it here to avoid lazy-creating the Twind stylesheet unless it will be needed)
			if (REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS.test(code)) {
				if (config.mode === 'build') {
					// Lazy instantiation
					if (!_tw) {
						console.log(`${DEBUG_PREFIX}${green('lazy create stylesheet and init Twind')}`);

						_twindSheet = virtual();

						_tw = twind(twConfig, _twindSheet);
					}

					console.log(`${DEBUG_PREFIX}${green('stylesheet reset and process Twind tagged template literals...')}`);

					// Resets the stylesheet (previous file transform).
					// Note that generally-speaking, 'preflight' (if any) is included.
					// (reset !== zero-ing the stylesheet)
					// note: condition ALWAYS true, TODO: is a full reset necessary?
					if (_tw) {
						_tw.clear();
					} else if (_twindSheet) {
						_twindSheet.clear();
					}

					code = code.replace(REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS, (_match, $1, $2) => {
						// Removes line breaks and collapses whitespaces
						const classList = $2.replace(/\s\s*/gm, ' ').trim();

						if ($1 === 'twindSkip') {
							// Replaces tagged template literals (i.e. prefixed with the Twind function)
							// with plain template literals (i.e. potentially-interporlated strings).
							return `\`${classList}\``;
						}

						// The other option is $1 === 'twindTw'
						const isTwindShortcut = $1 === 'twindShortcut';

						const twindResult = _tw ? (isTwindShortcut ? _tw(shortcut(classList)) : _tw(classList)) : '';

						if (_twindSheet && !_twindSheet.target.length) {
							throw new Error(`${DEBUG_PREFIX}${red('empty stylesheet?!')} -- ${red(twindResult)}`);
						}

						// Replaces tagged template literals (i.e. prefixed with the Twind function)
						// with a JSON object that contains the result of Twind processing.
						return `{${isTwindShortcut ? '$:1,' : ''}_:\`${
							classList === twindResult ? '' : classList
						}\`,tw:\`${twindResult}\`}`;
					});
				} else {
					// config.mode !== 'build' ('dev' mode)

					console.log(`${DEBUG_PREFIX}${green('process Twind tagged template literals...')}`);

					code = code.replace(REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS, (_match, _$1, $2) => {
						// Removes line breaks and collapses whitespaces
						const classList = $2.replace(/\s\s*/gm, ' ').trim();

						// Replaces tagged template literals (i.e. prefixed with the Twind function)
						// with plain template literals (i.e. potentially-interporlated strings).
						return `\`${classList}\``;
					});
				}
			}

			// Sanity check in both build and dev modes:
			// there should not be any remaining Twind *tagged* template literals.
			// See explanations at the top of this file.
			if (REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS_CHECK.test(code)) {
				throw new Error(`${DEBUG_PREFIX}${red('not all Twind tagged template literals were transformed!')}`);
			}

			if (config.publicPath !== '/') {
				// TODO: because of Preact WMR workaround for config.publicPath, the async module imports fail :(
				// ... so we strip the code at build time by detecting the following HTML comment:
				code = code.replace(
					/\/\* PREACT_WMR_BUILD_STRIP_CODE_BEGIN \*\/([\s\S]+)\/\* PREACT_WMR_BUILD_STRIP_CODE_END \*\//gm,
					'',
				);
				if (code.includes('PREACT_WMR_BUILD_STRIP_CODE_BEGIN')) {
					console.log(code);
					throw new Error('?!');
				}
			}

			return { code, map: null };
		},
	};
	return plug;
}
