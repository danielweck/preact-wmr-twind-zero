import type { BaseTheme, Class, Sheet, Twind } from 'twind';
import { cssom, shortcut, twind } from 'twind'; // eslint-disable-line no-duplicate-imports

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

	initPreactVDOMHook(_tw, (val: Class) => _tw(shortcut(val)));

	return _tw;
};
