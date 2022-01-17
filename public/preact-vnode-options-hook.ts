import { options } from 'preact';

import { IS_CLIENT_SIDE } from './utils.js';

// eslint-disable-next-line no-duplicate-imports
import type { Options, VNode } from 'preact';

import type {
	Class,
	TwindProps,
	TTwindPair,
	TPropShortcut,
	TPropTw,
	TClassProps,
} from './preact-vnode-options-hook--twind-types';

let _preactOptionsVNodeOriginal: ((vnode: VNode<TwindProps>) => void) | undefined | -1 = -1;

const DEBUG_PREFIX = 'WMR TWIND PREACT VNODE:\n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTwindPair = (obj: any): obj is TTwindPair => {
	return !!(
		typeof obj === 'object' &&
		typeof (obj as TTwindPair)._ !== 'undefined' && // can be empty string
		typeof (obj as TTwindPair).tw !== 'undefined'
	);
};

export const initPreactVDOMHook = (tw?: (val: Class) => string, twShortcut?: (val: Class) => string) => {
	if (_preactOptionsVNodeOriginal === -1) {
		_preactOptionsVNodeOriginal = options.vnode;
	}
	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal as Options['vnode'];

	// isTwindPair is only be true (and therefore getTwindPairVal() is only called)
	// by components that have been prerendered by Preact WMR and therefore source-transformed by the Twind plugin
	// (i.e. execution of Twind's tw() and shortcut() functions ahead of time,
	//  in order to generate the TTwindPair objects and place them directly in the source code).
	//
	// Conversely, in dev mode the tagged template literal Twind functions are simply erased
	// (i.e. no TTwindPairs replacements) and the template literal are consumed as-is by the Twind tw() and shortcut() function here,
	// that is to say in the Preact render runtime (live usage of Twind, as normally intented).
	const getTwindPairVal = (obj: TTwindPair) => {
		if (tw) {
			if (IS_CLIENT_SIDE) {
				throw new Error(`${DEBUG_PREFIX}initPreactVDOMHook > isTwindPair/getTwindPairVal with IS_CLIENT_SIDE?!`);
			}
			// The fallback from ._ to .tw is performance optimisation
			// (when the generated .tw string value is equal to the original ._ one,
			// we only preserve a single one in .tw in order to avoid doubling the size footprint.
			// and ._ is empty string)
			return (obj._ || obj.tw) as string;
		}

		if (!IS_CLIENT_SIDE) {
			throw new Error(`${DEBUG_PREFIX}initPreactVDOMHook > isTwindPair/getTwindPairVal with IS_CLIENT_SIDE?!`);
		}
		return obj.tw;
	};

	// const processShortcut = (x: Class) => {
	// 	if (!Array.isArray(x)) {
	// 		x = [x];
	// 	}
	// 	return x.reduce<string>((acc, pp) => {
	// 		const isTP = isTwindPair(pp);
	// 		if (isTP && !pp.$) {
	// 			throw new Error(
	// 				`${DEBUG_PREFIX}processShortcut > isTwindPair/getTwindPairVal but not generated with twindShortcut?!`,
	// 			);
	// 		}
	// 		const cls = isTP ? getTwindPairVal(pp) : pp;
	// 		const c = twShortcut ? twShortcut(cls) : cls;
	// 		return `${acc}${acc ? ' ' : ''}${typeof c === 'string' ? c : ''}`;
	// 	}, '');
	// };

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

		for (const p of ['data-tw', 'tw', 'class', 'className', 'data-tw-shortcut', 'tw-shortcut'] as Array<
			keyof TPropTw | keyof TClassProps | keyof TPropShortcut
		>) {
			if (p in props) {
				const pp = props[p];
				if (!pp) {
					continue;
				}
				const isShortcut = p === 'data-tw-shortcut' || p === 'tw-shortcut';

				const isTP = isTwindPair(pp);
				if (isTP) {
					if (isShortcut && !pp.$) {
						throw new Error(`${DEBUG_PREFIX}isTwindPair/getTwindPairVal but expecting generated with twindShortcut!`);
					} else if (!isShortcut && pp.$) {
						throw new Error(`${DEBUG_PREFIX}isTwindPair/getTwindPairVal but not expecting generated with twindShortcut!`);
					}
				}
				const val = isTP ? getTwindPairVal(pp) : pp;

				const c = isShortcut ? (twShortcut ? twShortcut(val) : val) : tw ? tw(val) : val;
				if (typeof c === 'string') {
					classes.add(c);
				}

				props[p] = undefined;
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
