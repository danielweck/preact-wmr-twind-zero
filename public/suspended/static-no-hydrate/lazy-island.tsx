import { type FunctionalComponent, type RenderableProps } from 'preact';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';

import { LAZY_TIMEOUT } from '../../utils.js';

// Code splitting
// export const SuspendedStaticNoHydrate = lazy(() => import('./island.js'));
export const SuspendedStaticNoHydrate = lazy(
	() =>
		new Promise<typeof import('./island.js')>((resolve) => {
			setTimeout(() => {
				resolve(import('./island.js'));
			}, LAZY_TIMEOUT);
		}),
);
export const SuspendedStaticNoHydrate_: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (SuspendedStaticNoHydrate): ', err);
			}}
		>
			<SuspendedStaticNoHydrate />
		</ErrorBoundary>
	);
};
