import { virtual } from '@twind/core';
import type { VNode } from 'preact';
import prerender, { type PrerenderOptions, type PrerenderResult } from 'preact-iso/prerender';

import { initPreactVDOMHook_Twind } from '../preact-vnode-options-hook--twind.js';
import { twindConfig } from '../twind.config.js';
import { resetTwindInstance } from '../twindFactory.js';

// Global module-level stylesheet,
// reset for each WMR-prerendered file
const _twindSheet = virtual(false);

// Custom Preact VNode 'options' hook
// that interprets Twind component props (class, classname, etc.)
const _tw = initPreactVDOMHook_Twind(_twindSheet);

export const preactWmrPrerenderForTwind = async (
	url: string,
	app: VNode,
	options?: PrerenderOptions,
): Promise<
	PrerenderResult & {
		cssId: string;
		cssTextContent: string;
	}
> => {
	const DEBUG_PREFIX = `\n===================== WMR TWIND PRERENDER [${url}]:\n`;

	console.log(`${DEBUG_PREFIX}...\n`);

	// Resets the stylesheet (previous file transform).
	// Note that 'preflight', if any, is included (reset !== zero-ing the stylesheet)
	// note: condition ALWAYS true, TODO: is a full reset necessary?
	// if (_tw) {
	// 	_tw.clear();
	// } else {
	// 	_twindSheet.clear();
	// }
	resetTwindInstance(_tw);

	if (twindConfig.preflight === false && _twindSheet.target.length) {
		const msg = `${DEBUG_PREFIX}no preflight but stylesheet is not empty after reset?!\n`;
		console.log(msg);
		throw new Error(msg);
	}

	const result = await prerender(app, options);

	// import { cloneElement } from 'preact';
	// const vnode = options?.props ? cloneElement(app, options.props) : app;
	// console.log(`]]] PREACT ISO PRERENDER 1: ${typeof vnode} ${JSON.stringify(vnode, null, 4)}`);
	// const result = await prerender(vnode); // , options.macDepth
	// const resetVnodeTree = (v: typeof vnode & { __c?: { __v: null; props: { children: [] | null } | null } | null }) => {
	// 	if (v.__c) {
	// 		v.__c.__v = null; // === v
	// 		v.__c.__H.__[0].__c = null; // === v.__c
	// 		// console.log(`resetVnodeTree: ${v.__c.__h.length}`);
	// 		// if (v.__c.props?.children) {
	// 		// 	for (const child of v.__c.props.children) {
	// 		// 		if (child) {
	// 		// 			resetVnodeTree(child);
	// 		// 		}
	// 		// 	}
	// 		// }
	// 	}
	// 	// console.log(` ---- ${JSON.stringify(v.__c, null, 4)}`);
	// };
	// resetVnodeTree(vnode);
	// // const { __c, ...vnode__ } = vnode_;
	// console.log(`]]] PREACT ISO PRERENDER 2: ${typeof vnode} ${JSON.stringify(vnode, null, 4)}`);

	if (!_twindSheet.target.length) {
		const msg = `${DEBUG_PREFIX}stylesheet is empty after prerender?!\n${result.html}\n`;
		console.log(msg);
		// throw new Error(msg);
	}
	// else {
	// 	console.log(_twindSheet.target.join('\n'));
	// }

	return {
		...result,
		cssTextContent: _twindSheet.target.join('\n'), // the line break is super important! (used as delimiter by our external postbuild script)
		cssId: '__twind', // this MUST be! (this is how we find the style element in our external postbuild script)
	};
};
