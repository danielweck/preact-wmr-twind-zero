import hydrate from 'preact-iso/hydrate';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';
import { LocationProvider, Route, Router } from 'preact-iso/router';

import { Routed404 } from './routed/_404.js';
import { RoutedHome } from './routed/home.js';
import { RoutedNonLazy } from './routed/non-lazy.js';
import { RoutedRoute } from './routed/route.js';
import { initPreactVDOMHookForTwind } from './twind-preact-vnode-options-hook.js';
import { twindTw } from './twindish.js';
import { IS_CLIENT_SIDE } from './utils.js';

import type { PrerenderResult } from 'preact-iso/prerender';

if (process.env.NODE_ENV === 'development') {
	(async () => {
		// @ts-expect-error TS7016
		await import('preact/debug');
	})();
}

// Code splitting
const RoutedLazy = lazy(() => import('./routed/lazy.js'));

const publicPath = process.env.WMR_PUBLIC_PATH_ROOT || '/';

export const App = () => {
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError: ', err);
			}}
		>
			<LocationProvider>
				<h1>Twind test:</h1>
				<p
					class={twindTw`
						bg-yellow-200
						text-black
					`}
				>
					This text should have a yellow-200 background
				</p>
				<h1>404 Not Found links:</h1>
				<ul>
					<li>
						<a href={`${publicPath}not/found/blank`} rel="noreferrer noopener" target="_BLANK">
							404 (target BLANK)
						</a>
					</li>
					<li>
						<a href={`${publicPath}not/found/inpage`} target="_top">
							404 (in page)
						</a>
					</li>
				</ul>

				<h1>Router links:</h1>
				<ul>
					<li>
						<a href={`${publicPath}`}>Routed Home</a>
					</li>
					<li>
						<a href={`${publicPath}routed-lazy`}>Routed Lazy</a>
					</li>
					<li>
						<a href={`${publicPath}routed-non-lazy`}>Routed Non Lazy</a>
					</li>
					<li>
						<a href={`${publicPath}routed-route`}>Routed Route</a>
					</li>
				</ul>

				<h1>Router content:</h1>
				<Router>
					<RoutedHome path={`${publicPath}`} />
					<RoutedLazy path={`${publicPath}routed-lazy`} />
					<RoutedNonLazy path={`${publicPath}routed-non-lazy`} />
					<Route component={RoutedRoute} path={`${publicPath}routed-route`} />
					<Routed404 default />
				</Router>
			</LocationProvider>
		</ErrorBoundary>
	);
};

if (IS_CLIENT_SIDE) {
	const load = () => {
		// client-side live dev server !== page prerendered via WMR 'build' mode
		const isPrerendered = !!document.querySelector('script[type=isodata]'); // TODO: is that reliable?
		initPreactVDOMHookForTwind(isPrerendered);
		hydrate(<App />, document.body);
	};

	if (document.readyState === 'loading') {
		document.addEventListener(
			'DOMContentLoaded',
			(_ev) => {
				load();
			},
			{
				once: false,
				passive: false,
				capture: false,
			},
		);
	} else {
		load();
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prerender(data: Record<string, any>): Promise<
	PrerenderResult & {
		// This WMR typing is missing in PrerenderResult?!
		head: {
			elements: Set<{
				type: string;
				props: Record<string, string>;
			}>;
		};
		data: Record<string, string>;
	}
> {
	// Must be dynamic import for code splitting and avoid include in client bundle
	const { preactWmrPrerenderForTwind } = await import('./prerender/prerender.js');

	const res = await preactWmrPrerenderForTwind(data.url, <App {...data} />);
	const elements = new Set([
		{ type: 'meta', props: { property: 'og:title', content: 'SEO title' } as Record<string, string> },
		{ type: 'style', props: { id: res.cssId, children: res.cssTextContent } },
	]);
	return {
		html: res.html,
		links: res.links,
		// <script type="isodata" />
		data: {
			foo: 'bar',
		},
		head: {
			elements,
		},
	};
}
