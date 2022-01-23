import { type Options, type VNode, options } from 'preact';

import type { TClassProps, TwindProps } from './preact-vnode-options-hook--twind-types';

let _preactOptionsVNodeOriginal: ((vnode: VNode<TwindProps>) => void) | undefined | -1 = -1;

export const initPreactVDOMHook = (tw?: (val: string) => string) => {
	if (_preactOptionsVNodeOriginal === -1) {
		_preactOptionsVNodeOriginal = options.vnode;
	}
	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal as Options['vnode'];

	options.vnode = (vnode: VNode<TwindProps>) => {
		if (!vnode.type) {
			if (preactOptionsVNodeOriginal) {
				preactOptionsVNodeOriginal(vnode);
			}
			return;
		}

		const props = vnode.props;

		// if (props.className && !props.class) {
		// 	if (preactOptionsVNodeOriginal) {
		// 		preactOptionsVNodeOriginal(vnode);
		// 	}
		// 	return;
		// }

		const classes = new Set<string>();

		for (const p of ['class', 'className'] as Array<keyof TClassProps>) {
			if (p in props) {
				const pp = props[p];
				if (!pp) {
					continue;
				}

				const c = tw ? tw(pp) : pp;
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
