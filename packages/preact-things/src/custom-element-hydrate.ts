import { type FunctionalComponent, h, hydrate, type RenderableProps, type VNode } from 'preact';

import { createRootFragment } from './render-hydrate-replace-node.js';
import { IS_CLIENT_SIDE } from './utils.js';

// https://gist.github.com/developit/6f2666740a1b4925f1d15ea2894f28ec

const CUSTOM_ELEMENT_NAME = 'preact-hydrator';

export type T = {
	href: string;
	data: Record<string, unknown>;
};

let _count = 0;
export const CustomElementHydrator: FunctionalComponent<T> = (props: RenderableProps<T>) => {
	const json = props.data ? JSON.stringify(props.data) : undefined;
	const id = `_hydrator:${_count++}`;
	return [
		h(`!--${id}--`, null),
		props.children,
		h(CUSTOM_ELEMENT_NAME, { href: props.href, id }, json ? h('script', { type: 'text/props' }, json) : undefined),
	] as unknown as VNode;
};

if (IS_CLIENT_SIDE && typeof customElements !== 'undefined') {
	customElements.define(
		CUSTOM_ELEMENT_NAME,
		class extends HTMLElement {
			connectedCallback() {
				if (!this.parentNode) {
					return;
				}
				const href = this.getAttribute('href');
				if (!href) {
					return;
				}
				const [url, exportName] = href.split('#');

				const id = this.getAttribute('id');

				let data: unknown | undefined;
				try {
					data = this.firstElementChild?.textContent ? JSON.parse(this.firstElementChild.textContent) : undefined;
				} catch (_err: unknown) {
					// ignore
				}

				const childNodes: Node[] = [];
				let child = this as ChildNode | null | undefined;

				while ((child = child?.previousSibling)) {
					if (child.nodeType !== 8) {
						childNodes.unshift(child);
					} else if ((child as Comment).data === id) {
						break;
					}
				}
				const fragment = createRootFragment(this.parentNode as Element, childNodes);

				const $import = new Function('s', 'return import(s)');
				$import(url)
					.then((m: { [exportName: string]: FunctionalComponent<unknown> }) => {
						const component = exportName ? m[exportName] : m.default;
						hydrate(h(component, data as RenderableProps<Record<string, unknown>>, []), fragment);
						return null;
					})
					// @ts-expect-error TS7006
					.catch((_err) => {
						// noop
					});
			}
		},
	);
}
