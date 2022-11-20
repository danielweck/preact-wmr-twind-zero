import { twind } from '@twind/core';

import { twindReset } from './twind.config.js';
import { twConfig } from './twindConfig.js';

/**
 * @template { string[] | CSSStyleSheet } [TSheet=string[]]
 * @param {import('@twind/core').Sheet<TSheet>} sheet
 * @returns {import('@twind/core').Twind<import('@twind/core').BaseTheme & import('@twind/preset-tailwind').TailwindTheme, TSheet>}
 * */
export const createTwindInstance = (sheet) => {
	const tw = twind(twConfig, sheet);
	resetTwindInstance(tw);
	return tw;
};

/**
 * @template { string[] | CSSStyleSheet } [TSheet=string[]]
 * @param {import('@twind/core').Twind<import('@twind/core').BaseTheme & import('@twind/preset-tailwind').TailwindTheme, TSheet>} tw
 * */
export const resetTwindInstance = (tw) => {
	tw.clear();
	tw(twindReset());
};
