import { cyan, green, red } from 'kolorist';
import { shortcut, virtual } from 'twind';

import { createTwindInstance, resetTwindInstance } from './public/twindFactory.js';

// Regular expression that checks file extensions:
// we only transform Twind tagged template literals in TS, TSX, JS, JSX source code
const REGEXP_TRANSFORM_FILE_FILTER = /\.[tj]sx?$/;

// 'twindShortcut' is a function (tagged template literal) available in userland
// to "proxy" Twind's own shortcut() function which is invoked here in the build process.
// 'twindTw' is a "passthrough" tagged template literal function which can be used to signal
// that the parameters are Twind utility classes (this enables Visual Studio Code intellisense / autocompletion).
// (see tsconfig.json, 'compilerOptions' > 'plugins' > '@twind/typescript-plugin' > 'tags' and 'attributes')
const twindTagFunctions = ['twindTw', 'twindShortcut'];

// Regular expression that captures Twind tagged template literals,
// based on the above list of custom Twind functions.
const REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS = new RegExp(`(${twindTagFunctions.join('|')})\`([^\`]+)\``, 'gm');

// Post-transformation sanity check: no tagged template literals should remain,
// as they should all have been transformed to plain (untagged) template literals,
// to be later processed by the custom Preact VNode 'options' hook.
const REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS_CHECK = new RegExp(`(${twindTagFunctions.join('|')})\``, 'g');

const REGEXP_MULTILINE_JSX_CLASS_PROPS = /(class|className)[\s]*=[\s]*{[\s]*`([^`]+)`[\s]*}/gm;

/**
 * @returns {import('wmr').Plugin}
 * @param {import('wmr').Options} config
 * */
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

			const DEBUG_PREFIX = `\nWMR TWIND PLUGIN (${config.mode}) [${cyan(id.replace(process.cwd(), ''))}]:\n`;

			// Lazy instantiation
			if (!_tw) {
				console.log(`${DEBUG_PREFIX}${green('lazy create stylesheet and init Twind')}\n`);

				_twindSheet = virtual(false);

				_tw = createTwindInstance(_twindSheet);
			} else {
				// Resets the stylesheet (previous file transform).
				// Note that generally-speaking, 'preflight' (if any) is included.
				// (reset !== zero-ing the stylesheet)
				// note: condition ALWAYS true, TODO: is a full reset necessary?
				// if (_tw) {
				// 	_tw.clear();
				// } else if (_twindSheet) {
				// 	_twindSheet.clear();
				// }
				resetTwindInstance(_tw);
			}

			console.log(`${DEBUG_PREFIX}${green('stylesheet reset and process Twind tagged template literals...')}\n`);

			code = code.replace(
				REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS,
				(_match, /** @type {string} */ $1, /** @type {string} */ $2) => {
					// Removes line breaks and collapses whitespaces
					const classList = $2.replace(/\s\s*/gm, ' ').trim();

					if ($1 === 'twindTw') {
						// Replaces tagged template literals (i.e. prefixed with the Twind function)
						// with plain template literals (i.e. potentially-interporlated strings).
						return `\`${classList}\``;
					}

					// _tw is always defined here,
					// this is just to satisfy the TypeScript compiler
					const s = shortcut(classList);
					const twindResult = _tw ? _tw(s) : 'no-twind?!';

					console.log(`${DEBUG_PREFIX}${green('--------> shortcut: ')}${classList} => ${cyan(s)} => ${red(twindResult)}\n`);

					if (_twindSheet && !_twindSheet.target.length) {
						throw new Error(`${DEBUG_PREFIX}${red('empty stylesheet?!')} -- ${red(twindResult)}\n`);
					}

					return `\`${twindResult}\``;
				},
			);

			// Sanity check in both build and dev modes:
			// there should not be any remaining Twind *tagged* template literals.
			// See explanations at the top of this file.
			if (REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS_CHECK.test(code)) {
				throw new Error(`${DEBUG_PREFIX}${red('not all Twind tagged template literals were transformed!')}\n`);
			}

			code = code.replace(
				REGEXP_MULTILINE_JSX_CLASS_PROPS,
				(_match, /** @type {string} */ $1, /** @type {string} */ $2) => {
					// Removes line breaks and collapses whitespaces
					return `${$1}="${$2.replace(/\s\s*/gm, ' ').trim()}"`;
				},
			);

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
