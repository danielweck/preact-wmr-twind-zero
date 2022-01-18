import hydrate from 'preact-iso/hydrate';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';
import { LocationProvider, Route, Router } from 'preact-iso/router';
import { useState } from 'preact/hooks';

import { initPreactVDOMHook } from './preact-vnode-options-hook.js';
import { Routed404 } from './routed/_404.js';
import { RoutedHome } from './routed/home.js';
import { RoutedNonLazy } from './routed/non-lazy.js';
import { RoutedRoute } from './routed/route.js';
import { RoutedSuspendedSubRouter } from './suspended/index.js';
import { twindTw } from './twindish.js';
import { IS_CLIENT_SIDE, PUBLIC_PATH_ORIGIN, PUBLIC_PATH_ROOT } from './utils.js';

import type { PrerenderResult } from 'preact-iso/prerender';

if (process.env.NODE_ENV === 'development') {
	(async () => {
		// @ts-expect-error TS7016
		await import('preact/debug');
	})();
}

// Code splitting
// const RoutedLazy = lazy(() => import('./routed/lazy.js'));
const RoutedLazy = lazy(
	() =>
		new Promise<typeof import('./routed/lazy.js')>((resolve) => {
			setTimeout(
				() => {
					resolve(import('./routed/lazy.js'));
				},
				IS_CLIENT_SIDE ? 1000 : 0,
			);
		}),
);

export const App = () => {
	const [onRouteChangeWasCalled, setOnRouteChangeWasCalled] = useState(false);
	return (
		<LocationProvider>
			<h1>Router status:</h1>
			<p
				class={twindTw`
						bg-pink-600
						p-1.5
						text-white
						text-3xl
					`}
			>
				{onRouteChangeWasCalled ? 'SPA route (post-hydration)' : 'Initial route (static SSR / SSG)'}
			</p>

			<h1>Router links:</h1>
			<ul>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-400
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}`}>Routed Home</a>
				</li>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-500
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}routed-lazy${PUBLIC_PATH_ORIGIN ? '/' : ''}`}>Routed Lazy</a> (1s simulated network
					delay on first load, then "cache" hit)
				</li>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-600
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}routed-non-lazy${PUBLIC_PATH_ORIGIN ? '/' : ''}`}>Routed Non Lazy</a>
				</li>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-700
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}routed-route${PUBLIC_PATH_ORIGIN ? '/' : ''}`}>Routed Route</a> (contains lazy
					component)
				</li>
			</ul>

			<h1>Router content:</h1>
			<div
				class={twindTw`
						border-solid
						border-4
						border-pink-600
						rounded
					`}
			>
				<ErrorBoundary
					onError={(err) => {
						console.log('ErrorBoundary onError (top router): ', err);
					}}
				>
					<Router
						onRouteChange={() => {
							setOnRouteChangeWasCalled(true);
						}}
					>
						<RoutedHome path={`${PUBLIC_PATH_ROOT}`} />
						<RoutedLazy path={`${PUBLIC_PATH_ROOT}routed-lazy${PUBLIC_PATH_ORIGIN ? '/' : ''}`} />
						<RoutedNonLazy path={`${PUBLIC_PATH_ROOT}routed-non-lazy${PUBLIC_PATH_ORIGIN ? '/' : ''}`} />
						<Route component={RoutedRoute} path={`${PUBLIC_PATH_ROOT}routed-route${PUBLIC_PATH_ORIGIN ? '/' : ''}`} />
						<Routed404 default />
						<RoutedSuspendedSubRouter path={`${PUBLIC_PATH_ROOT}suspended/*`} />
					</Router>
				</ErrorBoundary>
			</div>

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
				This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>

			<h1>404 Not Found links:</h1>
			<ul>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-300
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}not-found-blank`} rel="noreferrer noopener" target="_BLANK">
						404 (target BLANK)
					</a>
				</li>
				<li>
					<span
						class={twindTw`
								inline-block
								text-yellow-300
								mr-1.5
							`}
					>
						&#x2588;&#x2588;&#x2588;
					</span>
					<a href={`${PUBLIC_PATH_ROOT}not-found-inpage`} target="_top">
						404 (in page)
					</a>
				</li>
			</ul>
		</LocationProvider>
	);
};

if (IS_CLIENT_SIDE) {
	// client-side live dev server !== page prerendered via WMR 'build' mode
	const isPrerendered = !!document.querySelector('script[type=isodata]');
	if (isPrerendered) {
		initPreactVDOMHook();
		hydrate(<App />, document.body);
	} else {
		// here in this code branch (no isodata): process.env.NODE_ENV === 'development'
		// we use await import to force code splitting => this code bundle will not be loaded in production

		// TODO: because of Preact WMR workaround for config.PUBLIC_PATH_ROOT, this import fails :(
		// ... so we strip the code at build time by detecting the following HTML comment:

		/* PREACT_WMR_BUILD_STRIP_CODE_BEGIN */
		(async () => {
			const { initPreactVDOMHook_Twind } = await import('./preact-vnode-options-hook--twind.js');
			initPreactVDOMHook_Twind();
			hydrate(<App />, document.body);
		})();
		/* PREACT_WMR_BUILD_STRIP_CODE_END */
	}

	// Here, no need to wait for
	// document.DOMContentLoaded
	// or window.load
	// or document.readyState=='interactive'||'complete',
	// this script loads in the body and we want hydration ASAP.

	// const load = async () => { ... };
	// document.readyState:
	// -1 loading
	// -2 interactive (document.DOMContentLoaded)
	// -3 complete (window.load)
	// if (document.readyState === 'interactive' || document.readyState === 'complete') {
	// 	load();
	// } else {
	// 	// document.readyState === 'loading'
	// 	document.addEventListener(
	// 		'DOMContentLoaded',
	// 		(_ev) => {
	// 			load();
	// 		},
	// 		{
	// 			once: false,
	// 			passive: false,
	// 			capture: false,
	// 		},
	// 	);
	// }
}

// See ==> https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/prerender.js
//
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
	// // TODO? trick Rollup into *not* transforming the `import()`
	// const $import = new Function('s', 'return import(s)');
	// const { preactWmrPrerenderForTwind } = await $import('file:///' + path.resolve(cwd, './prerender/prerender.js'));

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
			// isprerendered: true, // ensures <script type="isodata" /> is generated so we can later check the DOM for its existence, but not needed here as 'data' includes ssr:true already
			...data,
		},
		head: {
			elements,
		},
	};
}
