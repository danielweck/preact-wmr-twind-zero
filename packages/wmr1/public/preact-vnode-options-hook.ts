import { type Options, type VNode, options } from 'preact';

import type { TClassProps, TwindProps } from './preact-vnode-options-hook--twind-types.js';

let _preactOptionsVNodeOriginal: ((vnode: VNode<TwindProps>) => void) | undefined | -1 = -1;

export const initPreactVDOMHook = (tw?: (val: string) => string) => {
	if (_preactOptionsVNodeOriginal === -1) {
		// console.log(
		// 	'initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook',
		// );
		// eslint-disable-next-line @typescript-eslint/unbound-method
		_preactOptionsVNodeOriginal = options.vnode;
	}
	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal as Options['vnode'];

	const optionsVnodeCore = (vnode: VNode<TwindProps>, _fromRenderFunc = false) => {
		const props = vnode.props || {};

		// if (props.className && !props.class) {
		// 	if (preactOptionsVNodeOriginal) {
		// 		preactOptionsVNodeOriginal(vnode);
		// 	}
		// 	return;
		// }

		// type T = typeof vnode.props;
		// const { children, class: clazz, className, ...rest } = props;
		// const props_: T = rest as T;
		// console.log(
		// 	fromRenderFunc,
		// 	`\x1b[31m${vnode.type}\x1b[0m`,
		// 	' ---> \n',
		// 	`CLASS: \x1b[36m${clazz ? clazz : ' '}\x1b[0m \n`,
		// 	`CLASSNAME: \x1b[36m${className ? className : ' '}\x1b[0m \n`,
		// 	`CHILD TEXT: \x1b[32m${typeof children === 'string' ? children : ' '}\x1b[0m \n`,
		// 	'PROPS: ',
		// 	JSON.stringify(props_, null, 4),
		// );

		const classes = new Set<string>();

		for (const p of ['class', 'className', 'data-tw'] as Array<keyof TClassProps>) {
			if (p in props) {
				const pp = props[p];
				if (!pp) {
					continue;
				}

				if (typeof pp !== 'string') {
					throw new Error(pp);
				}
				const c = tw ? tw(pp) : pp;

				// if (tw) {
				// 	console.log(`##### [[\x1b[36m${pp}\x1b[0m]] =======> [[\x1b[33m${c}\x1b[0m]]`);
				// }

				if (typeof c === 'string' && (p === 'class' || p === 'className')) {
					classes.add(c);
				}

				props[p] = undefined;

				// https://github.com/preactjs/preact-render-to-string/compare/v5.2.2...5.2.3#diff-bfe9874d239014961b1ae4e89875a6155667db834a410aaaa2ebe3cf89820556R258
				delete props[p];
			}
		}

		if (classes.size) {
			// Removes line breaks and collapses whitespaces
			props.className = Array.from(classes).join(' ').replace(/\s\s*/gm, ' ').trim();
		}
	};
	const optionsVnodeFunc = (vnode: VNode<TwindProps>) => {
		if (typeof vnode.type === 'string') {
			optionsVnodeCore(vnode, true);
		}
		if (vnode.props?.children && Array.isArray(vnode.props.children)) {
			const children = vnode.props.children as VNode<TwindProps>[];
			for (const v of children) {
				if (v) {
					optionsVnodeFunc(v);
				}
			}
		}
	};
	options.vnode = (vnode: VNode<TwindProps>) => {
		if (!vnode.type || typeof vnode.type !== 'string') {
			if (typeof vnode.type === 'function') {
				optionsVnodeFunc(vnode);
			}
			// console.log(
			// 	`vnode.typevnode.typevnode.typevnode.typevnode.typevnode.typevnode.typevnode.type ${typeof vnode.type} => ${JSON.stringify(
			// 		vnode.props,
			// 		null,
			// 		4,
			// 	)}`,
			// );
			if (preactOptionsVNodeOriginal) {
				preactOptionsVNodeOriginal(vnode);
			}
			return;
		}

		optionsVnodeCore(vnode);

		if (preactOptionsVNodeOriginal) {
			preactOptionsVNodeOriginal(vnode);
		}
	};
};
