import { removeFromCache } from '@preact-wmr-twind-zero/preact-things/suspend-cache.js';
import { Suspense } from '@preact-wmr-twind-zero/preact-things/xpatched/suspense.js';
import { deepEqual } from 'fast-equals';
import type { FunctionalComponent, RenderableProps } from 'preact';
import { useRef, useState } from 'preact/hooks';

import { useSuspendCache } from '~/suspend-cache/use-suspend-cache-with-hydration.js';

import { IS_CLIENT_SIDE } from '../utils.js';

const asyncFunc1 = async (
	num: number,
	str: string,
): Promise<{
	str: string;
	arr: number[];
}> => {
	return new Promise((resolve) => {
		setTimeout(
			() => {
				resolve({
					str: `<Ful&filled> 1: ${num} ${str} [${new Date().toUTCString()}] ${IS_CLIENT_SIDE ? 'CLIENT' : 'SERVER'}`,
					arr: [888, 777],
				});
			},
			IS_CLIENT_SIDE ? 2000 : 0,
		);
	});
};
// eslint-disable-next-line quotes
const suspendCacheKey1 = "my 'cache' key 1";
const suspendCacheArgs1 = [111, '1<1>1'] as Parameters<typeof asyncFunc1>;
// preloadCache(asyncFunc1, suspendCacheArgs1, suspendCacheKey1, {
// 	// hydration: undefined, // Omit<>
// });
// const removed = removeFromCache(suspendCacheArgs1, suspendCacheKey1);
// const val = peekCache(suspendCacheArgs1, suspendCacheKey1);

const SuspendedCache1: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const renderCount = useRef(0);
	renderCount.current++;

	const [success, failure] = useSuspendCache(asyncFunc1, suspendCacheArgs1, suspendCacheKey1, {
		// NO NEED HERE, THE DEFAULT SHALLOW EQUAL IS SUFFICENT:
		// isEqual: (a, b) => {
		// 	return deepEqual(a, b);
		// },
	});

	const [, forceReRender_] = useState(NaN);
	const forceReRender = () => {
		// TODO check isMounted?
		forceReRender_(NaN);
	};

	const str =
		typeof success !== 'undefined'
			? JSON.stringify(success, null, 4)
			: typeof failure !== 'undefined'
			? `${failure}`
			: '?!';
	return (
		<>
			<button
				class={`
					p-2
					m-2
					border(2 dashed purple-500)
					rounded
				`}
				onClick={() => {
					removeFromCache(suspendCacheArgs1, suspendCacheKey1);
					forceReRender();
				}}
			>
				FORCE REFRESH [NO CACHE] ({renderCount.current})
			</button>
			<p
				onClick={() => {
					alert(str);
				}}
			>
				$1
				<pre>{str}</pre>
			</p>
		</>
	);
};

const asyncFunc2 = async (
	num: number,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	arr: any[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	obj: any,
): Promise<
	Array<{
		str: string;
		n?: number;
	}>
> => {
	return new Promise((resolve) => {
		setTimeout(
			() => {
				resolve([
					{
						str: `<Ful&filled> 2: ${num} ${arr.length} ${Object.keys(obj)} [${new Date().toUTCString()}] ${
							IS_CLIENT_SIDE ? 'CLIENT' : 'SERVER'
						}`,
						n: 999,
					},
					{
						str: 'other',
					},
				]);
			},
			IS_CLIENT_SIDE ? 4000 : 1000,
		);
	});
};

const SuspendedCache2: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const renderCount = useRef(0);
	renderCount.current++;

	// eslint-disable-next-line quotes
	const s = "1'2'3";
	const [success, failure] = useSuspendCache(
		asyncFunc2,
		// eslint-disable-next-line quotes
		[222, ['2<<2>>2', 222], { a: 123, b: [s, { c: 1234 }] }],
		'my cache key 2',
		{
			isEqual: (a, b) => {
				return deepEqual(a, b);
			},
		},
	);

	const [, forceReRender_] = useState(NaN);
	const forceReRender = () => {
		// TODO check isMounted?
		forceReRender_(NaN);
	};

	const str =
		typeof success !== 'undefined'
			? JSON.stringify(success, null, 4)
			: typeof failure !== 'undefined'
			? `${failure}`
			: '?!';
	return (
		<>
			<button
				class={`
					p-2
					m-2
					border(2 dashed purple-500)
					rounded
				`}
				onClick={() => {
					forceReRender();
				}}
			>
				FORCE REFRESH [FROM CACHE] ({renderCount.current})
			</button>
			<p
				onClick={() => {
					alert(str);
				}}
			>
				<pre>{str}</pre>
			</p>
		</>
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
			<Suspense fallback={<p>SUSPENSE CACHE 1...</p>}>
				<SuspendedCache1 />
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
			<Suspense fallback={<p>SUSPENSE CACHE 2...</p>}>
				<SuspendedCache2 />
			</Suspense>
		</section>
	);
};
