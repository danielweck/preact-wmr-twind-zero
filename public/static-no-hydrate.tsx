import { type FunctionalComponent, type RenderableProps, Component, h } from 'preact';

import { IS_CLIENT_SIDE, IS_PRE_RENDERED } from './utils.js';

export const StaticNoHydrate: FunctionalComponent<unknown> = (props: RenderableProps<unknown>) => {
	// note: IS_PRE_RENDERED includes IS_SERVER_SIDE,
	// so here we must ensure IS_CLIENT_SIDE
	if (IS_CLIENT_SIDE && IS_PRE_RENDERED) {
		// return (
		// 	<div>
		// 		{(Array.isArray(props.children) ? props.children : [props.children])
		// 			.filter((c) => typeof c !== 'undefined' && c !== null)
		// 			.map((_c) => NO_HYDRATE)}
		// 	</div>
		// );
		return NO_HYDRATE;
	}
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
