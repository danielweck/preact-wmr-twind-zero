import { type FunctionalComponent, type RenderableProps } from 'preact';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';

// Code splitting
export const SuspendedStaticNoHydrate = lazy(() => import('./island.js'));

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
