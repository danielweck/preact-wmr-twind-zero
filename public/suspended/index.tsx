import { ErrorBoundary } from 'preact-iso/lazy';
import { Router } from 'preact-iso/router';

import { PUBLIC_PATH_ORIGIN, PUBLIC_PATH_ROOT } from '../utils.js';
import { SuspendedLazy } from './lazy/lazy-island.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

// This subrouter exists only to facilitate the generation of "critical" vs. "secondary" CSS stylesheets,
// via the post-build script that parses all the Twind stylesheets
// in order to extract and merge the "remainder" for each static route (i.e. dry render vs. hydrated / SPA styles).
// By virtue of the presence of this sub-router in the compiled codebase,
// the routes *do* exist in the SPA runtime and as static HTML file / folder structure,
// but the URLs are not meant to be invoked!
// This is only to indicate the existence of self-contained lazy/async components.
export const RoutedSuspendedSubRouter: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (sub router): ', err);
			}}
		>
			<Router>{[<SuspendedLazy path={`${PUBLIC_PATH_ROOT}lazy${PUBLIC_PATH_ORIGIN ? '/' : ''}`} />]}</Router>
		</ErrorBoundary>
	);
};
