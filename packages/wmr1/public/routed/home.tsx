import { type ResolvedOrRejected, useSuspendCache } from '@preact-wmr-twind-zero/preact-things/suspend-cache.js';
import { Suspense } from '@preact-wmr-twind-zero/preact-things/xpatched/suspense.js';
import type { FunctionalComponent, RenderableProps } from 'preact';

import { IS_CLIENT_SIDE, IS_PRE_RENDER } from '../utils.js';

const asyncFunc = async (num: number): Promise<string> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`Fulfilled: ${num} [${new Date().toUTCString()}] ${IS_CLIENT_SIDE ? 'CLIENT' : 'SERVER'}`);
		}, 2000);
	});
};
// preloadCache(asyncFunc, [111]);
// const removed = removeFromCache([111], 'my cache key');
// const val = peekCache([111], 'my cache key');

const SuspendedCache: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	let hydrationValue: ResolvedOrRejected<typeof asyncFunc> | undefined;

	// TODO:
	// PREACTWMR_HYDRATE_SUSPEND_CACHE
	// should be unique property name based on useSuspendCache key
	if (IS_PRE_RENDER && IS_CLIENT_SIDE) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const ssr = (window as any).PREACTWMR_HYDRATE_SUSPEND_CACHE;
		if (typeof ssr !== 'undefined') {
			hydrationValue = [`_${ssr.data}_`, undefined];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).PREACTWMR_HYDRATE_SUSPEND_CACHE = undefined;
		}
	}
	const [success, failure] = useSuspendCache(asyncFunc, [111], 'my cache key', {
		hydrationValue,
	});
	if (IS_PRE_RENDER && !IS_CLIENT_SIDE) {
		if (typeof success !== 'undefined') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(globalThis as any).PREACTWMR_HYDRATE_SUSPEND_CACHE = success;
		}
	}
	const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
	return (
		<p
			onClick={() => {
				alert(str);
			}}
		>
			{str}
		</p>
	);
};

export const RoutedHome: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Home</h2>
			<p
				class={`
					bg-yellow-400
					text(black 3xl)
					non-twind-class-token
				`}
			>
				This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<Suspense fallback={<p>SUSPENSE CACHE...</p>}>
				<SuspendedCache />
			</Suspense>
			<div class="test-scope">
				<p>
					this is a paragraph{' '}
					<span class="child-span">
						with a <span>child</span> span
					</span>{' '}
					element.
				</p>
				<h4>heading</h4>
			</div>
		</section>
	);
};
