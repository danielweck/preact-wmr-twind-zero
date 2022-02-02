import type { TailwindTheme } from '@twind/preset-tailwind';
import { type BaseTheme, type Sheet, type Twind, cssom } from 'twind';

import { initPreactVDOMHook } from './preact-vnode-options-hook';
import { createTwindInstance } from './twindFactory.js';

let _tw: Twind<BaseTheme & TailwindTheme, CSSStyleSheet | string[]>;

// client-side live dev server (cssom Twind stylesheet),
// or static SSR / SSG / WMR prerender (virtual Twind stylesheet)
export const initPreactVDOMHook_Twind = (
	sheet?: Sheet<string[]>,
): Twind<BaseTheme & TailwindTheme, CSSStyleSheet | string[]> => {
	// Twind runtime, stylesheets will be generated on the fly
	if (sheet) {
		// static SSR / SSG / WMR prerender => virtual stylesheet
		// _tw = twind(twConfig, sheet);
		_tw = createTwindInstance(sheet);
	} else {
		// client side DOM stylesheet (CSSOM)
		// _tw = twind(twConfig, cssom());
		_tw = createTwindInstance(cssom());
	}

	initPreactVDOMHook(_tw);

	return _tw;
};
