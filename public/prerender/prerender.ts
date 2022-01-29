import type { VNode } from 'preact';
import prerender, { type PrerenderOptions, type PrerenderResult } from 'preact-iso/prerender';
import { virtual } from 'twind';

import { initPreactVDOMHook_Twind } from '../preact-vnode-options-hook--twind';
import { twindConfig } from '../twind.config';
import { resetTwindInstance } from '../twindFactory';

// Global module-level stylesheet,
// reset for each WMR-prerendered file
const _twindSheet = virtual();

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
	const DEBUG_PREFIX = `\nWMR TWIND PRERENDER [${url}]:\n`;

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

	if (!_twindSheet.target.length) {
		const msg = `${DEBUG_PREFIX}stylesheet is empty after prerender?!\n${result.html}\n`;
		console.log(msg);
		// throw new Error(msg);
	}

	return {
		...result,
		cssTextContent: _twindSheet.target.join('\n'), // the line break is super important! (used as delimiter by our external postbuild script)
		cssId: '__twind', // this MUST be! (this is how we find the style element in our external postbuild script)
	};
};
