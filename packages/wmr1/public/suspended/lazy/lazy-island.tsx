import { lazy, Suspense } from '@preact-wmr-twind-zero/preact-things/xpatched/suspense.js';
import type { FunctionalComponent, RenderableProps } from 'preact';
import { ErrorBoundary } from 'preact-iso/lazy';

import { twindTw } from '../../twindish.js';
import { LAZY_TIMEOUT } from '../../utils.js';

// import { lazy, Suspense } from '../../../../preact-things/src/xpatched/suspense.js';

// Code splitting
// export const SuspendedLazy = lazy(() => import('./island.js'));
export const SuspendedLazy = lazy(
	() =>
		new Promise<typeof import('./island.js')>((resolve) => {
			setTimeout(() => {
				resolve(import('./island.js'));
			}, LAZY_TIMEOUT);
		}),
);

export const SuspendedLazy_: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const clz = twindTw`
		text(blue-500 3xl)
		bg-pink-400
	`;
	const clzz = clz; // testing the Babel visitor
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (SuspendedLazy): ', err);
			}}
		>
			<Suspense data-tw={clz} fallback={<p class={clzz}>LOADING...</p>}>
				<SuspendedLazy />
			</Suspense>
		</ErrorBoundary>
	);
};
