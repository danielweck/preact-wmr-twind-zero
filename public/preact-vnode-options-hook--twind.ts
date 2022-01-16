import { asArray, cssom, defineConfig, shortcut, twind } from '@twind/core';
import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';

import { initPreactVDOMHook } from './preact-vnode-options-hook';
import { twindConfig } from './twind.config.js';

// eslint-disable-next-line no-duplicate-imports
import type { TwindUserConfig, Class, Twind, Sheet, BaseTheme } from '@twind/core';

let _tw: Twind<BaseTheme, CSSStyleSheet | string[]>;

// client-side live dev server (cssom Twind stylesheet),
// or static SSR / SSG / WMR prerender (virtual Twind stylesheet)
export const initPreactVDOMHook_Twind = (sheet?: Sheet<string[]>): Twind<BaseTheme, CSSStyleSheet | string[]> => {
	const twConfig = defineConfig({
		...twindConfig,
		presets: [
			twindPresetAutoprefix(),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			...asArray((twindConfig as TwindUserConfig<any>).presets),
			twindPresetExt(),
			twindPresetTailwind(),
		],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as TwindUserConfig<any>);
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
