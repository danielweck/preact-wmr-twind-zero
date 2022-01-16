import prerender from 'preact-iso/prerender';
import { virtual } from '@twind/core';

import { initPreactVDOMHookForTwind } from '../twind-preact-vnode-options-hook.js';
import { twindConfig } from '../twind.config.js';

import type { VNode } from 'preact';
// eslint-disable-next-line no-duplicate-imports
import type { PrerenderOptions, PrerenderResult } from 'preact-iso/prerender';

// Global module-level stylesheet,
// reset for each WMR-prerendered file
const _twindSheet = virtual();

// Custom Preact VNode 'options' hook
// that interprets Twind component props (class, classname, etc.)
const _tw = initPreactVDOMHookForTwind(false, _twindSheet);

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
	const DEBUG_PREFIX = `WMR TWIND PRERENDER [${url}]:\n`;

	console.log(`${DEBUG_PREFIX}stylesheet reset and Preact WMR SSG / static SSR...`);

	// Resets the stylesheet (previous file transform).
	// Note that 'preflight', if any, is included (reset !== zero-ing the stylesheet)
	// note: condition ALWAYS true, TODO: is a full reset necessary?
	if (_tw) {
		_tw.clear();
	} else {
		_twindSheet.clear();
	}

	if (twindConfig.preflight === false && _twindSheet.target.length) {
		const msg = `${DEBUG_PREFIX}no preflight but stylesheet is not empty after reset?!`;
		console.log(msg);
		throw new Error(msg);
	}

	const result = await prerender(app, options);

	if (!_twindSheet.target.length) {
		const msg = `${DEBUG_PREFIX}stylesheet is empty after prerender?!\n${result.html}`;
		console.log(msg);
		// throw new Error(msg);
	}

	return {
		...result,
		cssTextContent: _twindSheet.target.join('\n'),
		cssId: '__twind', // this MUST be! (other values will break an external postbuild script)
	};
};
