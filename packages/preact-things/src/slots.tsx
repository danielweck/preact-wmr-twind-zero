import { type ComponentChildren, type FunctionalComponent, type RenderableProps, createContext, h } from 'preact';
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';

import { IS_CLIENT_SIDE } from './utils.js';

// SOURCE:
// https://github.com/preactjs/wmr/commits/c5216427035c7bd814e0526e109445b149dbf76c/docs/public/lib/slots.js

type TFunc = (v: ComponentChildren) => void;
type TTuple = [name: string, fn: TFunc];

function createSlotContext() {
	const slots: Record<string, ComponentChildren> = {};
	const owners: Record<string, number> = {};
	const subs: Array<TTuple> = [];

	const sub = (name: string, fn: TFunc) => {
		const e: TTuple = [name, fn];
		subs.push(e);

		return () => {
			const i = subs.indexOf(e);
			if (i >= 0) {
				subs.splice(i, 1);
			}
		};
	};

	const pub = (name: string, value: ComponentChildren, owner: number) => {
		slots[name] = value;
		owners[name] = owner;

		subs.forEach((s) => {
			if (s[0] === name) {
				s[1](value);
			}
		});
	};

	return { slots, owners, sub, pub };
}

const ContextSlots = createContext({} as ReturnType<typeof createSlotContext>);
ContextSlots.displayName = 'Slot Context';

// type TProps = { value: ReturnType<typeof createSlotContext> };
export const ContextSlotsProvider: FunctionalComponent<unknown> = (props: RenderableProps<unknown>) => {
	const value = useMemo(createSlotContext, []);
	const { children, ...rest } = props;

	return <ContextSlots.Provider value={value} children={children} {...rest} />;
	// return h(ContextSlots.Provider as FunctionalComponent<TProps>, { value, ...rest }, children);
};

type TSlot = {
	name: string;
};
export const Slot: FunctionalComponent<TSlot> = (props: RenderableProps<TSlot>) => {
	const name = props.name;

	const { slots, sub } = useContext(ContextSlots);
	const [slotted, update] = useState(slots[name]);

	(IS_CLIENT_SIDE ? useLayoutEffect : useEffect)(() => {
		const unsub = sub(name, update);

		return () => {
			unsub();
		};
	}, [name, sub]);

	return slotted as ReturnType<FunctionalComponent<TSlot>>;
};

let c = 0;
export const SlotContent: FunctionalComponent<TSlot> = (props: RenderableProps<TSlot>) => {
	const { owners, pub } = useContext(ContextSlots);
	const content = useRef<ComponentChildren>(null);
	const owner = useRef<number>(0);
	const initial = useRef(true);

	const name = props.name;
	const children = props.children;

	if (!owner.current) {
		owner.current = ++c;
		pub(name, children, owner.current);
	}
	content.current = children;

	(IS_CLIENT_SIDE ? useLayoutEffect : useEffect)(() => {
		if (!initial.current) {
			pub(name, content.current, owner.current);
		}
		initial.current = false;

		return () => {
			if (owners[name] === owner.current) {
				pub(name, null, 0);
			}
		};
	}, [owners, pub, name]);

	return null;
};
