import { type BaseTheme, type Sheet, type Twind, cssom, twind } from 'twind';

import { initPreactVDOMHook } from './preact-vnode-options-hook';
import { twConfig } from './twindConfig.js';

let _tw: Twind<BaseTheme, CSSStyleSheet | string[]>;

// client-side live dev server (cssom Twind stylesheet),
// or static SSR / SSG / WMR prerender (virtual Twind stylesheet)
export const initPreactVDOMHook_Twind = (sheet?: Sheet<string[]>): Twind<BaseTheme, CSSStyleSheet | string[]> => {
	// Twind runtime, stylesheets will be generated on the fly
	if (sheet) {
		// static SSR / SSG / WMR prerender => virtual stylesheet
		_tw = twind(twConfig, sheet);
	} else {
		// client side DOM stylesheet (CSSOM)
		_tw = twind(twConfig, cssom());
	}

	initPreactVDOMHook(_tw);

	return _tw;
};
