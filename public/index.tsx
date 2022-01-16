import hydrate from 'preact-iso/hydrate';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';
import { LocationProvider, Route, Router } from 'preact-iso/router';
import { useState } from 'preact/hooks';

import { initPreactVDOMHook } from './preact-vnode-options-hook.js';
import { Routed404 } from './routed/_404.js';
import { RoutedHome } from './routed/home.js';
import { RoutedNonLazy } from './routed/non-lazy.js';
import { RoutedRoute } from './routed/route.js';
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

const publicPathOrigin = process.env.WMR_PUBLIC_PATH_ORIGIN || '';
const publicPath = process.env.WMR_PUBLIC_PATH_ROOT || '/';

export const App = () => {
	const [onRouteChangeWasCalled, setOnRouteChangeWasCalled] = useState(false);
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError: ', err);
			}}
		>
			<LocationProvider>
				<h1>Router status</h1>
				<p
					class={twindTw`
					bg-red-400
					text-white
					text-3xl
				`}
				>
					{onRouteChangeWasCalled ? 'SPA route (post-hydration)' : 'Initial route (static SSR / SSG)'}
				</p>

				<h1>Router links:</h1>
				<ul>
					<li>
						<a href={`${publicPath}`}>Routed Home</a>
					</li>
					<li>
						<a href={`${publicPath}routed-lazy${publicPathOrigin ? '/' : ''}`}>Routed Lazy</a>
					</li>
					<li>
						<a href={`${publicPath}routed-non-lazy${publicPathOrigin ? '/' : ''}`}>Routed Non Lazy</a>
					</li>
					<li>
						<a href={`${publicPath}routed-route${publicPathOrigin ? '/' : ''}`}>Routed Route</a>
					</li>
				</ul>

				<h1>Router content:</h1>
				<Router
					onRouteChange={() => {
						setOnRouteChangeWasCalled(true);
					}}
				>
					<RoutedHome path={`${publicPath}`} />
					<RoutedLazy path={`${publicPath}routed-lazy${publicPathOrigin ? '/' : ''}`} />
					<RoutedNonLazy path={`${publicPath}routed-non-lazy${publicPathOrigin ? '/' : ''}`} />
					<Route component={RoutedRoute} path={`${publicPath}routed-route${publicPathOrigin ? '/' : ''}`} />
					<Routed404 default />
				</Router>

				<h1>Twind critical/secondary stylesheet tests:</h1>
				<p class={twindTw`text-3xl`}>
					This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it
					isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles.
				</p>
				<p
					class={twindTw`
						bg-yellow-200
						text-black
					`}
				>
					This text should have a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other
					route or component)
				</p>

				<h1>404 Not Found links:</h1>
				<ul>
					<li>
						<a href={`${publicPath}not-found-blank`} rel="noreferrer noopener" target="_BLANK">
							404 (target BLANK)
						</a>
					</li>
					<li>
						<a href={`${publicPath}not-found-inpage`} target="_top">
							404 (in page)
						</a>
					</li>
				</ul>
			</LocationProvider>
		</ErrorBoundary>
	);
};

if (IS_CLIENT_SIDE) {
	const load = async () => {
		// client-side live dev server !== page prerendered via WMR 'build' mode
		const isPrerendered = !!document.querySelector('script[type=isodata]');
		if (isPrerendered) {
			initPreactVDOMHook();
		} else {
			// here in this code branch (no isodata): process.env.NODE_ENV === 'development'
			// we use await import to force code splitting => this code bundle will not be loaded in production

			// TODO: because of Preact WMR workaround for config.publicPath, this import fails :(
			// ... so we strip the code at build time by detecting the following HTML comment:

			/* PREACT_WMR_BUILD_STRIP_CODE_BEGIN */
			const { initPreactVDOMHook_Twind } = await import('./preact-vnode-options-hook--twind.js');
			initPreactVDOMHook_Twind();
			/* PREACT_WMR_BUILD_STRIP_CODE_END */
		}

		// body to match prerender!
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

	// TODO: data props?
	const res = await preactWmrPrerenderForTwind(data.url, <App {...data} />, { props: data });

	const elements = new Set([
		{ type: 'meta', props: { property: 'og:title', content: 'SEO title' } as Record<string, string> },
		{ type: 'style', props: { id: res.cssId, children: res.cssTextContent } },
	]);
	return {
		html: res.html,
		links: res.links,
		data: {
			isprerendered: 'yes', // leave this one! (ensures <script type="isodata" /> is present)
			...data,
		},
		head: {
			elements,
		},
	};
}
