import { type FunctionalComponent, type RenderableProps, Component, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { IS_CLIENT_SIDE, IS_PRE_RENDER } from './utils.js';

type T = { label: string };
export const StaticNoHydrate: FunctionalComponent<T> = (props: RenderableProps<T>) => {
	const hasRenderedAtLeastOnce = useRef(false);
	useEffect(() => {
		hasRenderedAtLeastOnce.current = true;
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const hydrated = IS_CLIENT_SIDE && (window as any).PREACTWMR_HYDRATED;
	// note: IS_PRE_RENDER includes IS_SERVER_SIDE,
	// so here we must ensure IS_CLIENT_SIDE
	if (IS_CLIENT_SIDE && IS_PRE_RENDER && (!hydrated || hasRenderedAtLeastOnce.current)) {
		// return (
		// 	<div>
		// 		{(Array.isArray(props.children) ? props.children : [props.children])
		// 			.filter((c) => typeof c !== 'undefined' && c !== null)
		// 			.map((_c) => NO_HYDRATE)}
		// 	</div>
		// );
		console.log(
			`NO_HYDRATE: ${props.label} (hydrated: ${hydrated}, hasRenderedAtLeastOnce: ${hasRenderedAtLeastOnce.current})`,
		);
		return NO_HYDRATE;
	}
	// IS_SERVER_SIDE always renders the children components,
	// or IS_CLIENT_SIDE in dev mode,
	// or IS_CLIENT_SIDE in prerender build but only after initial hydration,
	// and only if the component wasn't already rendered
	return (
		<div
			class={`
				bg-pink-200
				border-solid
				border-2
				border-pink-800
				rounded
			`}
			data-static-no-hydrate
		>
			<div>{`hasRenderedAtLeastOnce: ${String(hasRenderedAtLeastOnce.current)} (${props.label})`}</div>
			{props.children}
		</div>
	);
};

// https://gist.github.com/developit/e94cd0da8479aacd1bbdedd612c1975f
// also see: https://github.com/preactjs/preact-www/blob/master/src/lib/hydrator.js

const S = {};

export class NoHydrate extends Component {
	shouldComponentUpdate() {
		return false;
	}
	componentDidCatch(e: unknown) {
		// mark the component as dirty to trigger suspend, but do not re-render:

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (e === S) (this as unknown as any).__d = true;
	}
	render() {
		return h(Suspender, null, null);
	}
}

export const NO_HYDRATE = h(NoHydrate, null, []);

const Suspender: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	throw S;
	// return null;
};
