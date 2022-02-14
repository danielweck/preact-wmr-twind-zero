import type { FunctionalComponent, RenderableProps } from 'preact';
import { ErrorBoundary } from 'preact-iso/lazy';

import { lazy, Suspense } from '../../.patched/suspense.js';
import { twindTw } from '../../twindish.js';
import { LAZY_TIMEOUT } from '../../utils.js';

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
		text-blue-500
		bg-pink-400
	`;
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (SuspendedLazy): ', err);
			}}
		>
			<Suspense data-tw={clz} fallback={<p class={clz}>LOADING...</p>}>
				<SuspendedLazy />
			</Suspense>
		</ErrorBoundary>
	);
};
