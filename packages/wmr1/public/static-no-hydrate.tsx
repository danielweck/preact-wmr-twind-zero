import { NO_HYDRATE } from '@preact-wmr-twind-zero/preact-things/no-hydrate.js';
import type { FunctionalComponent, RenderableProps } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import { IS_CLIENT_SIDE, IS_PRE_RENDER } from './utils.js';

const _window = (IS_CLIENT_SIDE ? window : {}) as typeof window & {
	PREACTWMR_HYDRATED: boolean | undefined;
};

export type T = { label: string };
export const StaticNoHydrate: FunctionalComponent<T> = (props: RenderableProps<T>) => {
	const hasRenderedAtLeastOnce = useRef(false);
	useEffect(() => {
		hasRenderedAtLeastOnce.current = true;
	}, []);

	const hydrated = _window.PREACTWMR_HYDRATED;
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
			`NO_HYDRATE: ${props.label} (hydrated: ${String(hydrated)}, hasRenderedAtLeastOnce: ${String(
				hasRenderedAtLeastOnce.current,
			)})`,
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
				border(solid 2 pink-800)
				rounded
			`}
			data-static-no-hydrate
		>
			<div>{`hasRenderedAtLeastOnce: ${String(hasRenderedAtLeastOnce.current)} (${props.label})`}</div>
			{props.children}
		</div>
	);
};
