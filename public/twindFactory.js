import { twind } from 'twind';

import { twConfig, twindReset } from './twindConfig.js';

/**
 * @template { string[] | CSSStyleSheet } [TSheet=string[]]
 * @param {import('twind').Sheet<TSheet>} sheet
 * @returns {import('twind').Twind<import('twind').BaseTheme, TSheet>}
 * */
export const createTwindInstance = (sheet) => {
	const tw = twind(twConfig, sheet);
	resetTwindInstance(tw);
	return tw;
};

/**
 * @template { string[] | CSSStyleSheet } [TSheet=string[]]
 * @param {import('twind').Twind<import('twind').BaseTheme, TSheet>} tw
 * */
export const resetTwindInstance = (tw) => {
	tw.clear();
	tw(twindReset());
};
