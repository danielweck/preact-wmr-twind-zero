import { options } from 'preact';
import { apply, setup, Sheet, tw } from 'twind';

import { twindConfig } from './twind.config.js';

// eslint-disable-next-line no-duplicate-imports
import type { Token } from 'twind';
// eslint-disable-next-line no-duplicate-imports
import type { Options, VNode } from 'preact';

import { IS_CLIENT_SIDE } from './utils.js';

let _preactOptionsVNodeOriginal: ((vnode: VNode<TwindProps>) => void) | undefined | -1 = -1;

export type TTwindPair = {
	_: string; // the original parameter of the tagged template literal function (or empty string if same as '.tw', to save bytes)
	tw: string; // the result of Twind processing over '._', i.e. tw(._) or tw(apply(._))
};

export type TParamsTw = Token;
// Parameters<(...tokens: Token[]) => string>;
// Parameters<(strings: TemplateStringsArray, ...interpolations: Token[]) => string>
export type TPropTw = {
	tw?: TParamsTw;
	'data-tw'?: TParamsTw;
};

export type TParamsApply = {
	apply: Token | undefined;
	preapply: Token | undefined;
};
// Parameters<(...tokens: Token[]) => Directive<CSSRules>>;
// Parameters<(strings: TemplateStringsArray, ...interpolations: Token[]) => Directive<CSSRules>>
export type TPropApply = {
	'tw-apply'?: TParamsApply;
	'data-tw-apply'?: TParamsApply;
};

export type TClassProps = {
	class?: string;
	className?: string;
};
export type TwindProps = TClassProps & TPropApply & TPropTw;

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

	const processApply = (x: Token) => {
		if (!Array.isArray(x)) {
			x = [x];
		}
		return x.reduce<string>((acc, pp) => {
			const cls = isTwindPair(pp) ? getTwindPairVal(pp) : pp;
			const c = runTwind ? tw(apply(cls)) : cls;
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
			!props['data-tw-apply'] &&
			!props['tw-apply']
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
				const c = runTwind ? tw(val) : val;
				if (typeof c === 'string') {
					classes.add(c);
				}
				props[p] = undefined;
			}
		}

		for (const p of ['data-tw-apply', 'tw-apply'] as Array<keyof TPropApply>) {
			if (p in props) {
				const pr = props[p];

				if (pr?.apply) {
					const val = processApply(pr.apply);
					classes.add(val);
				}

				if (pr?.preapply) {
					processApply(pr.preapply);
				}

				props[p] = undefined;
			}
		}

		if (props.class) {
			const val = isTwindPair(props.class) ? getTwindPairVal(props.class) : props.class;
			const c = runTwind ? tw(val) : val;
			if (typeof c === 'string') {
				classes.add(c);
			}
			props.class = undefined;
		}

		if (props.className) {
			const val = isTwindPair(props.className) ? getTwindPairVal(props.className) : props.className;
			const c = runTwind ? tw(val) : val;
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

// export const initPreactVDOMHookForTwindZeroRuntime = () => {
// 	// This should not be called during SSG / static SSR / WMR prerender (see Twind plugin transform)
// 	// ... however it should be called at runtime in prerendered pages.
// 	if (!IS_CLIENT_SIDE) {
// 		throw new Error(
// 			`${DEBUG_PREFIX}initPreactVDOMHookForTwindZeroRuntime > isTwindPair/getTwindPairVal with not IS_CLIENT_SIDE?!`,
// 		);
// 	}
// 	if (_preactOptionsVNodeOriginal === -1) {
// 		_preactOptionsVNodeOriginal = options.vnode;
// 	}
// 	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal as Options['vnode'];

// 	const getTwindPairVal = (obj: TTwindPair): string => {
// 		return obj.tw;
// 	};

// 	options.vnode = (vnode: VNode<TwindProps>) => {
// 		if (!vnode.type) {
// 			if (preactOptionsVNodeOriginal) {
// 				preactOptionsVNodeOriginal(vnode);
// 			}
// 			return;
// 		}

// 		const props = vnode.props;

// 		if (
// 			props.className &&
// 			!props.class &&
// 			!props['data-tw'] &&
// 			!props['tw'] &&
// 			!props['data-tw-apply'] &&
// 			!props['tw-apply']
// 		) {
// 			if (preactOptionsVNodeOriginal) {
// 				preactOptionsVNodeOriginal(vnode);
// 			}
// 			return;
// 		}

// 		const classes = new Set<string>();

// 		for (const p of ['data-tw', 'tw'] as Array<keyof TPropTw>) {
// 			if (p in props) {
// 				const pp = props[p];
// 				const val = isTwindPair(pp) ? getTwindPairVal(pp) : pp;
// 				if (typeof val === 'string') {
// 					classes.add(val);
// 				}
// 				props[p] = undefined;
// 			}
// 		}
// 		for (const p of ['data-tw-apply', 'tw-apply'] as Array<keyof TPropApply>) {
// 			if (p in props) {
// 				const pr = props[p];
// 				if (pr?.apply) {
// 					let x = pr.apply;
// 					if (!Array.isArray(x)) {
// 						x = [x];
// 					}
// 					const val = x.reduce<string>((acc, pp) => {
// 						const cls = isTwindPair(pp) ? getTwindPairVal(pp) : pp;
// 						return `${acc}${acc ? ' ' : ''}${typeof cls === 'string' ? cls : ''}`;
// 					}, '');

// 					classes.add(val);
// 				}
// 				props[p] = undefined;
// 			}
// 		}

// 		if (props.class) {
// 			const val = isTwindPair(props.class) ? getTwindPairVal(props.class) : props.class;
// 			if (typeof val === 'string') {
// 				classes.add(val);
// 			}
// 			props.class = undefined;
// 		}

// 		if (props.className) {
// 			const val = isTwindPair(props.className) ? getTwindPairVal(props.className) : props.className;
// 			if (typeof val === 'string') {
// 				classes.add(val);
// 			}
// 		}

// 		if (classes.size) {
// 			// Removes line breaks and collapses whitespaces
// 			props.className = Array.from(classes).join(' ').replace(/\s\s*/gm, ' ').trim();
// 		}

// 		if (preactOptionsVNodeOriginal) {
// 			preactOptionsVNodeOriginal(vnode);
// 		}
// 	};
// };

export const initPreactVDOMHookForTwind = (prerendered: boolean, sheet?: Sheet<unknown>) => {
	// client-side live dev server !== page prerendered via WMR 'build' mode
	if (prerendered) {
		// No Twind runtime, stylesheets already statically generated
		initPreactVDOMHookForTwind_(false);
	} else {
		// Twind runtime, stylesheets will be generated on the fly
		if (sheet) {
			// static SSR / SSG / WMR prerender => virtual stylesheet
			setup({ ...twindConfig, sheet });
		} else {
			// client side DOM stylesheet (CSSOM)
			setup(twindConfig);
		}
		initPreactVDOMHookForTwind_(true);
	}
};
