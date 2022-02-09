import { type FunctionalComponent, type RenderableProps } from 'preact';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';

import { IS_CLIENT_SIDE } from '../../utils.js';

// Code splitting
// export const SuspendedLazy = lazy(() => import('./island.js'));
export const SuspendedLazy = lazy(
	() =>
		new Promise<typeof import('./island.js')>((resolve) => {
			setTimeout(
				() => {
					resolve(import('./island.js'));
				},
				IS_CLIENT_SIDE ? 1000 : 0,
			);
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
