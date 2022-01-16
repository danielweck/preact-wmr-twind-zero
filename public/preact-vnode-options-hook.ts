import { options } from 'preact';

import { IS_CLIENT_SIDE } from './utils.js';

// eslint-disable-next-line no-duplicate-imports
import type { Options, VNode } from 'preact';

import type { Class, TwindProps, TTwindPair, TPropShortcut, TPropTw } from './preact-vnode-options-hook--twind-types';

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

	const getTwindPairVal = (obj: TTwindPair) => {
		if (tw) {
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
			const c = twShortcut ? twShortcut(cls) : cls;
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
				const c = tw ? tw(val) : val;
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
			const c = tw ? tw(val) : val;
			if (typeof c === 'string') {
				classes.add(c);
			}
			props.class = undefined;
		}

		if (props.className) {
			const val = isTwindPair(props.className) ? getTwindPairVal(props.className) : props.className;
			const c = tw ? tw(val) : val;
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
