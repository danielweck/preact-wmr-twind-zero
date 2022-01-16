import { options } from 'preact';

import { asArray, cssom, defineConfig, shortcut, twind } from '@twind/core';
import autoprefix from '@twind/preset-autoprefix';
import ext from '@twind/preset-ext';

import { twindConfig } from './twind.config.js';
import { IS_CLIENT_SIDE } from './utils.js';

// eslint-disable-next-line no-duplicate-imports
import type { TwindUserConfig, Class, Twind, Sheet, BaseTheme } from '@twind/core';
// eslint-disable-next-line no-duplicate-imports
import type { Options, VNode } from 'preact';

let _preactOptionsVNodeOriginal: ((vnode: VNode<TwindProps>) => void) | undefined | -1 = -1;

let _tw: Twind<BaseTheme, CSSStyleSheet | string[]> | undefined;

export type TTwindPair = {
	_: string; // the original parameter of the tagged template literal function (or empty string if same as '.tw', to save bytes)
	tw: string; // the result of Twind processing over '._', i.e. tw(._) or tw(shortcut(._))
};

export type TParamsTw = Class;
// Parameters<(strings: TemplateStringsArray | Class, ...interpolations: Class[]) => string>
export type TPropTw = {
	tw?: TParamsTw;
	'data-tw'?: TParamsTw;
};

export type TParamsShortcut = {
	shortcut: Class | undefined;
	preshortcut: Class | undefined;
};
// Parameters<(...tokens: Class[]) => Directive<CSSRules>>;
// Parameters<(strings: TemplateStringsArray, ...interpolations: Class[]) => Directive<CSSRules>>
export type TPropShortcut = {
	'tw-shortcut'?: TParamsShortcut;
	'data-tw-shortcut'?: TParamsShortcut;
};

export type TClassProps = {
	class?: string;
	className?: string;
};
export type TwindProps = TClassProps & TPropShortcut & TPropTw;

declare module 'preact' {
	/* eslint-disable-next-line @typescript-eslint/no-namespace */
	namespace JSX {
		// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
		interface DOMAttributes<Target extends EventTarget> extends TwindProps {}
	}
}

const DEBUG_PREFIX = 'WMR TWIND PREACT VNODE:\n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTwindPair = (obj: any): obj is TTwindPair => {
	return !!(
		typeof obj === 'object' &&
		typeof (obj as TTwindPair)._ !== 'undefined' && // can be empty string
		typeof (obj as TTwindPair).tw !== 'undefined'
	);
};

export const initPreactVDOMHookForTwind_ = (runTwind: boolean) => {
	// if context === prerendered page
	if (!runTwind) {
		// This should not be called during SSG / static SSR / WMR prerender (see Twind plugin transform)
		// ... however it should be called at runtime in prerendered pages.
		if (!IS_CLIENT_SIDE) {
			throw new Error(
				`${DEBUG_PREFIX}initPreactVDOMHookForTwind_ > isTwindPair/getTwindPairVal with not IS_CLIENT_SIDE?!`,
			);
		}
	}

	if (_preactOptionsVNodeOriginal === -1) {
		_preactOptionsVNodeOriginal = options.vnode;
	}
	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal as Options['vnode'];

	const getTwindPairVal = (obj: TTwindPair) => {
		if (runTwind) {
			// isTwindPair should only be true for SSG / static SSR / WMR prerender (see Twind plugin transform)
			// Conversely, in dev mode Twind is invoked on the raw unprocessed values (no generated "Twind pairs")
			if (IS_CLIENT_SIDE) {
				throw new Error(`${DEBUG_PREFIX}initPreactVDOMHookForTwind_ > isTwindPair/getTwindPairVal with IS_CLIENT_SIDE?!`);
			}
			return (obj._ || obj.tw) as string;
		}

		return obj.tw;
	};

	const processShortcut = (x: Class) => {
		if (!Array.isArray(x)) {
			x = [x];
		}
		return x.reduce<string>((acc, pp) => {
			const cls = isTwindPair(pp) ? getTwindPairVal(pp) : pp;
			const c = runTwind && _tw ? _tw(shortcut(cls)) : cls;
			return `${acc}${acc ? ' ' : ''}${typeof c === 'string' ? c : ''}`;
		}, '');
	};

	options.vnode = (vnode: VNode<TwindProps>) => {
		if (!vnode.type) {
			if (preactOptionsVNodeOriginal) {
				preactOptionsVNodeOriginal(vnode);
			}
			return;
		}

		const props = vnode.props;

		if (
			props.className &&
			!props.class &&
			!props['data-tw'] &&
			!props['tw'] &&
			!props['data-tw-shortcut'] &&
			!props['tw-shortcut']
		) {
			if (preactOptionsVNodeOriginal) {
				preactOptionsVNodeOriginal(vnode);
			}
			return;
		}

		const classes = new Set<string>();

		for (const p of ['data-tw', 'tw'] as Array<keyof TPropTw>) {
			if (p in props) {
				const pp = props[p];
				const val = isTwindPair(pp) ? getTwindPairVal(pp) : pp;
				const c = runTwind && _tw ? _tw(val) : val;
				if (typeof c === 'string') {
					classes.add(c);
				}
				props[p] = undefined;
			}
		}

		for (const p of ['data-tw-shortcut', 'tw-shortcut'] as Array<keyof TPropShortcut>) {
			if (p in props) {
				const pr = props[p];

				if (pr?.shortcut) {
					const val = processShortcut(pr.shortcut);
					classes.add(val);
				}

				if (pr?.preshortcut) {
					processShortcut(pr.preshortcut);
				}

				props[p] = undefined;
			}
		}

		if (props.class) {
			const val = isTwindPair(props.class) ? getTwindPairVal(props.class) : props.class;
			const c = runTwind && _tw ? _tw(val) : val;
			if (typeof c === 'string') {
				classes.add(c);
			}
			props.class = undefined;
		}

		if (props.className) {
			const val = isTwindPair(props.className) ? getTwindPairVal(props.className) : props.className;
			const c = runTwind && _tw ? _tw(val) : val;
			if (typeof c === 'string') {
				classes.add(c);
			}
		}

		if (classes.size) {
			// Removes line breaks and collapses whitespaces
			props.className = Array.from(classes).join(' ').replace(/\s\s*/gm, ' ').trim();
		}

		if (preactOptionsVNodeOriginal) {
			preactOptionsVNodeOriginal(vnode);
		}
	};
};

export const initPreactVDOMHookForTwind = (prerendered: boolean, sheet?: Sheet<string[]>) => {
	// client-side live dev server !== page prerendered via WMR 'build' mode
	if (prerendered) {
		// No Twind runtime, stylesheets already statically generated
		initPreactVDOMHookForTwind_(false);
	} else {
		const twConfig = defineConfig({
			...twindConfig,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			presets: [autoprefix(), ...asArray((twindConfig as TwindUserConfig<any>).presets), ext()],
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
		initPreactVDOMHookForTwind_(true);
	}
};
