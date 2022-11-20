import { transformSync } from '@babel/core';
import { isBooleanLiteral, isNumericLiteral, isStringLiteral, stringLiteral, templateLiteral } from '@babel/types';
import { shortcut, virtual } from '@twind/core';
import { cyan, green, red } from 'kolorist';

import { createTwindInstance, resetTwindInstance } from './public/twindFactory.js';

const DEBUG_BABEL = false;

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

// does not match nested template strings (the Babel plugin takes care of this)
const REGEXP_MULTILINE_JSX_CLASS_PROPS = /(class|className|data-tw)[\s]*=[\s]*{[\s]*`([^`]+)`[\s]*}/gm;

/**
 * @returns {import('wmr').Plugin}
 * @param {import('wmr').Options} config
 * */
export function wmrTwindPlugin(config) {
	// in WMR build/prerender mode, we execute Twind via a transient stylesheet.
	// See lazy instantiation further down below...
	/** @type {import('@twind/core').Twind<import('@twind/core').BaseTheme & import('@twind/preset-tailwind').TailwindTheme, string[]> | undefined} */
	let _tw;
	// The Twind stylesheet is not actually used anywhere, this is just to generate the classnames (not the actual styles / rules)
	/** @type {import('@twind/core').Sheet<string[]> | undefined} */
	let _twindSheet;

	/**
	 * @param {string} DEBUG_PREFIX
	 * @param {boolean} isPlainTwind
	 * @param {string} classList
	 * @return {string}
	 * */
	const twindTw = (DEBUG_PREFIX, isPlainTwind, classList) => {
		// we preserve any potential interpolated string template
		// (Twind silently ignores unknown classes, leaves them in place)
		// classList = classList.replace(/\${.+?}/g, '');

		// shortcut or not, the resulting class must still pass through Preact's 'options.VNode' processor!
		const s = isPlainTwind ? classList : shortcut(classList);

		// _tw is always defined here,
		// this is just to satisfy the TypeScript compiler
		const twindResult = _tw ? _tw(s) : 'no-twind?!';

		if (s === classList) {
			console.log(`${DEBUG_PREFIX}${green('--------> twind (plain): ')}[${classList}] => [${red(twindResult)}]\n`);
		} else {
			console.log(
				`${DEBUG_PREFIX}${green('--------> twind (shortcut): ')}[${classList}] => [${cyan(s)}] => [${red(twindResult)}]\n`,
			);
		}

		// _twindSheet is always defined here,
		// this is just to satisfy the TypeScript compiler
		if (_twindSheet && !_twindSheet.target.length) {
			throw new Error(`${DEBUG_PREFIX}${red('empty stylesheet?!')} -- ${red(twindResult)}\n`);
		}

		return twindResult;
	};

	/**
	 * @param {import('@babel/traverse').NodePath<import('@babel/types').Node>} path
	 * @param {import('@babel/core').PluginPass} state
	 * */
	const babelSubVisit = (path, state) => {
		let arr = state.get('pathTrace');
		const ctx = arr ? arr.join(' > ') : '?!';

		if (path.node.type === 'JSXAttribute') {
			/**
			 * @type {import('@babel/types').JSXAttribute}
			 * */
			const node = path.node;

			// StringLiteral | JSXExpressionContainer | null | JSXElement | JSXFragment
			if (node.value.type === 'StringLiteral') {
				/**
				 * @type {import('@babel/types').StringLiteral}
				 * */
				const val = node.value;
				if (DEBUG_BABEL) {
					console.log(`#BABEL#_1 ${cyan(`${ctx} > StringLiteral`)}: ${green(val.value)} (${red(state.filename)})`);
				}

				if (val.value) {
					val.value = twindTw(`WMR TWIND PLUGIN Babel 1 [${cyan(state.filename)}]:\n`, true, val.value);
				}
			} else if (node.value.type === 'JSXExpressionContainer') {
				/**
				 * @type {import('@babel/types').JSXExpressionContainer}
				 * */
				// const val = node.value;
				// val.expression;
				if (DEBUG_BABEL) {
					console.log(`#BABEL#_1 ${cyan(`${ctx} > JSXExpressionContainer`)}: (${red(state.filename)})`);
				}
				if (arr) {
					arr.push('JSXExpressionContainer');
				} else {
					arr = ['??!!'];
				}
				state.set('pathTrace', arr);
				path.traverse(
					{
						// enter: (p, s) => {
						// 	babelSubVisit(p, s);
						// },
						StringLiteral(p, s) {
							/**
							 * @type {import('@babel/types').StringLiteral}
							 * */
							const n = p.node;
							const v = n.value;
							if (DEBUG_BABEL) {
								console.log(
									`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > StringLiteral')}: ${green(v)} (${red(s.filename)})`,
								);
							}
							if (v) {
								n.value = twindTw(`WMR TWIND PLUGIN Babel 2 [${cyan(s.filename)}]:\n`, true, v);
							}
						},
						TaggedTemplateExpression(p, s) {
							/**
							 * @type {import('@babel/types').TaggedTemplateExpression}
							 * */
							const n = p.node;
							console.log(
								`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > TaggedTemplateExpression')}: ${green(n.tag)} ${green(
									JSON.stringify(n.typeParameters),
								)} ${green(JSON.stringify(path.node, null, 4))} (${red(s.filename)})`,
							);
							throw new Error('XXXX');
						},
						TemplateLiteral: {
							enter(p, s) {
								/**
								 * @type {import('@babel/types').TemplateLiteral}
								 * */
								const n = p.node;
								if (DEBUG_BABEL) {
									console.log(
										`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > TemplateLiteral ENTRY')}: ${green(
											JSON.stringify(n, null, 4),
										)} (${red(s.filename)})`,
									);
								}
								if (
									n.expressions.length === 0 &&
									n.quasis.length === 1 &&
									n.quasis[0].type === 'TemplateElement' &&
									n.quasis[0].tail
								) {
									p.replaceWith(stringLiteral(n.quasis[0].value.raw));
									// p.skip();
									if (DEBUG_BABEL) {
										console.log(
											`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > TemplateLiteral ENTRY (flattened)')}: ${green(
												JSON.stringify(p.node, null, 4),
											)} (${red(s.filename)})`,
										);
									}
								}
							},
							exit(p, s) {
								/**
								 * @type {import('@babel/types').TemplateLiteral}
								 * */
								const n = p.node;
								if (DEBUG_BABEL) {
									console.log(
										`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > TemplateLiteral EXIT')}: ${green(
											JSON.stringify(n, null, 4),
										)} (${red(s.filename)})`,
									);
								}

								let changed = false;
								for (let i = 0; i < n.expressions.length; i++) {
									const expr = n.expressions[i];

									if (isStringLiteral(expr) || isNumericLiteral(expr) || isBooleanLiteral(expr)) {
										changed = true;

										const str = expr.value;
										const before = n.quasis[i].value;
										const after = n.quasis[i + 1].value;
										before.raw += str + after.raw;
										before.cooked += str + after.cooked;
										n.expressions.splice(i, 1);
										n.quasis.splice(i + 1, 1);
									}
								}
								if (DEBUG_BABEL && changed) {
									console.log(
										`#BABEL#_2 ${cyan('JSXAttribute > JSXExpressionContainer > TemplateLiteral EXIT (flattened)')}: ${green(
											JSON.stringify(p.node, null, 4),
										)} (${red(s.filename)})`,
									);
								}

								const root = templateLiteral(
									n.quasis.map((q) => {
										delete q.start;
										delete q.end;
										delete q.loc;
										if (q.value?.raw || q.value?.cooked) {
											const str = (q.value.raw || q.value.cooked).replace(/\s\s*/gm, ' ').trim();
											q.value.raw = q.value.cooked = str
												? ` ${twindTw(`WMR TWIND PLUGIN Babel 3 [${cyan(s.filename)}]:\n`, true, str)} `
												: '';
										}
										return q;
									}),
									n.expressions.map((e) => {
										delete e.start;
										delete e.end;
										delete e.loc;
										return e;
									}),
								);
								// console.log(JSON.stringify(root, null, 4));
								p.replaceWith(root); // causes re-visit, but we skip in exit() (not enter()) so no infinite loop
								p.skip();
								// p.get('...').traverse(visitor);
							},
						},
					},
					state,
				);
			} else {
				console.log(
					`#BABEL#_1 ${cyan(`${ctx} > !StringLiteral && !JSXExpressionContainer!!? (JSXElement | JSXFragment ?)`)}: ${green(
						node.value.type,
					)} (${red(state.filename)})`,
				);
				throw new Error('XXXX');
			}
		} else if (
			path.node.type === 'StringLiteral' ||
			path.node.type === 'JSXIdentifier' ||
			path.node.type === 'TemplateLiteral' ||
			path.node.type === 'TemplateElement' ||
			// path.node.type === 'TaggedTemplateExpression' ||
			path.node.type === 'JSXExpressionContainer'
		) {
			if (DEBUG_BABEL) {
				console.log(`#BABEL#_2 ${cyan(`${ctx} > Identifier`)}: ${green(path.node.type)} (${red(state.filename)})`);
			}
		} else if (path.node.type === 'Identifier') {
			if (DEBUG_BABEL) {
				console.log(`#BABEL#_2 ${cyan(`${ctx} > Identifier`)}: ${green(path.node.name)} (${red(state.filename)})`);
			}
		} else {
			console.log(
				`#BABEL#_2 ${cyan(
					`${ctx} > !JSXAttribute !StringLiteral !JSXIdentifier !JSXExpressionContainer !Identifier !TemplateLiteral !TaggedTemplateExpression ?`,
				)}: ${green(path.node.type)} ${green(JSON.stringify(path.node, null, 4))} (${red(state.filename)})`,
			);
			throw new Error('XXXX');
		}
	};

	//({types}, options = {}) => { return { ... } };
	/**
	 * @type {import('@babel/core').Visitor<import('@babel/core').PluginPass>}
	 * */
	const babelTopVisitor = {
		/**
		 * @param {import('@babel/traverse').NodePath<import('@babel/types').Node>} path
		 * @param {import('@babel/core').PluginPass} state
		 * */
		JSXAttribute(path, state) {
			/**
			 * @type {import('@babel/types').JSXAttribute}
			 * */
			const node = path.node;
			if (
				node.value && // JSXElement | JSXFragment | StringLiteral | JSXExpressionContainer | null
				node.name?.name &&
				/(class|className|data-tw)/.test(node.name.name)
			) {
				if (DEBUG_BABEL) {
					console.log(
						`#BABEL# ${cyan('JSXAttribute')}: ${green(node.name.name)}=${green(node.value.type)} (${red(state.filename)})`,
					);
				}

				state.set('pathTrace', ['JSXAttribute']);
				babelSubVisit(path, state);
			}
		},
	};

	/**
	 * @type {import('@babel/core').PluginObj<import('@babel/core').PluginPass>}
	 * */
	const babelPlugin = {
		name: 'Twind WMR Babel plugin',
		visitor: babelTopVisitor,
	};

	/** @type {import('wmr').Plugin} */
	const plug = {
		name: 'Twind WMR plugin',
		enforce: 'pre',

		transform(code, id) {
			if (!REGEXP_TRANSFORM_FILE_FILTER.test(id)) return;

			if (id[0] === '\0' || id[0] === '\b' || id.startsWith('npm/')) return;

			const DEBUG_PREFIX = `\nWMR TWIND PLUGIN (${config.mode}) [${cyan(id.replace(process.cwd(), ''))}]:\n`;

			if (config.mode === 'build') {
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
			}

			code = code.replace(
				REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS,
				(_match, /** @type {string} */ $1, /** @type {string} */ $2) => {
					// Removes line breaks and collapses whitespaces
					const classList = $2.replace(/\s\s*/gm, ' ').trim();
					// console.log(' ****** ', `[${$2}]`, `[${classList}]`);

					if (config.mode !== 'build') {
						return `\`${classList}\``;
					}

					const isPlainTwind = $1 === 'twindTw';

					// we MUST process in all cases! (e.g. expand potentially grouped Twind syntax)
					// if (isPlainTwind) {
					// 	// Replaces tagged template literals (i.e. prefixed with the Twind function)
					// 	// with plain template literals (i.e. potentially-interporlated strings).
					// 	return `\`${classList}\``;
					// }

					const twindResult = twindTw(DEBUG_PREFIX, isPlainTwind, classList);

					return `\`${twindResult}\``;
				},
			);

			// Sanity check in both 'build' and 'start' (dev) config.mode:
			// there should not be any remaining Twind *tagged* template literals.
			// See explanations at the top of this file.
			if (REGEXP_TWIND_TAGGED_TEMPLATE_LITERALS_CHECK.test(code)) {
				throw new Error(`${DEBUG_PREFIX}${red('not all Twind tagged template literals were transformed!')}\n`);
			}

			code = code.replace(
				REGEXP_MULTILINE_JSX_CLASS_PROPS,
				(_match, /** @type {string} */ $1, /** @type {string} */ $2) => {
					// Removes line breaks and collapses whitespaces
					// Babel StringLiteral vs. TemplateLiteral
					if ($2.includes('${')) {
						const t = `${$1}={\`${$2.replace(/\s\s*/gm, ' ').trim()}\`}`;
						// console.log(' +++++++++ ', `[${$2}]`, `[${t}]`);
						return t;
					}
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

			// config.mode === 'start' => dev server (Twind live runtime)
			if (config.mode === 'build' && /\.(?:jsx?|tsx)$/.test(id) && /<[a-zA-Z$_][\w.:-]*[^>]*>/.test(code)) {
				const isTSX = /.tsx$/.test(id);

				const f = id.replace(process.cwd(), '');
				code = transformSync(code, {
					filename: f,
					filenameRelative: f,
					plugins: [isTSX && ['@babel/plugin-syntax-typescript', { isTSX }], '@babel/plugin-syntax-jsx', babelPlugin].filter(
						Boolean,
					),
				}).code;
				// console.log(code);
			}

			return { code, map: null };
		},
	};
	return plug;
}
