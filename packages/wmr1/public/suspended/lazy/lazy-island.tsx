import type { FunctionalComponent, RenderableProps } from 'preact';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';

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
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (SuspendedLazy): ', err);
			}}
		>
			<SuspendedLazy />
		</ErrorBoundary>
	);
};
