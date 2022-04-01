import { suspendCache } from '@preact-wmr-twind-zero/preact-things/suspend-cache.js';
import { Suspense } from '@preact-wmr-twind-zero/preact-things/xpatched/suspense.js';
import type { FunctionalComponent, RenderableProps } from 'preact';

import { IS_CLIENT_SIDE } from '../utils.js';

const asyncFunc = async (num: number): Promise<string> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`Fulfilled: ${num} ${IS_CLIENT_SIDE ? 'CLIENT' : 'SERVER'}`);
		}, 1000);
	});
};
// preloadCache(asyncFunc, [111]);
// const removed = removeFromCache([111], 'my cache key');
// const val = peekCache([111], 'my cache key');

const SuspendedCache: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const [success, failure] = suspendCache(asyncFunc, [111], 'my cache key');
	const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
	return <p>{str}</p>;
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
