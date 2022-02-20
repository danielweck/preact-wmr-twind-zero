import { ContextSlotsProvider, Slot } from '@preact-wmr-twind-zero/preact-things/slots.js';
import { func } from '@preact-wmr-twind-zero/shared';
import { func as func2 } from '@preact-wmr-twind-zero/shared/func.js';
import { other } from '@preact-wmr-twind-zero/shared/sub';
import { foo } from '@preact-wmr-twind-zero/shared/sub/foo.js';
import { other as other2 } from '@preact-wmr-twind-zero/shared/sub/other.js';
import { useState } from 'preact/hooks';
import hydrate from 'preact-iso/hydrate';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';
import type { PrerenderResult } from 'preact-iso/prerender';
import { LocationProvider, Route, Router } from 'preact-iso/router';

import { initPreactVDOMHook } from './preact-vnode-options-hook.js';
import { Routed404 } from './routed/_404.js';
import { RoutedHome } from './routed/home.js';
import { RoutedNonLazy } from './routed/non-lazy.js';
import { RoutedRoute } from './routed/route.js';
import { StaticNoHydrate } from './static-no-hydrate.js';
import { RoutedSuspendedSubRouter } from './suspended/index.js';
import { twindTw } from './twindish.js';
import { IS_CLIENT_SIDE, IS_PRE_RENDER, KEYBOARD_INTERACT, LAZY_TIMEOUT, PUBLIC_PATH_ROOT } from './utils.js';

console.log(func());
console.log(func2());
console.log(other());
console.log(other2());
console.log(foo());

const _window = (IS_CLIENT_SIDE ? window : {}) as typeof window & {
	PREACTWMR_HYDRATED: boolean | undefined;
};

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	(async () => {
		// @ts-expect-error TS7016
		await import('preact/debug');
	})();
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

// Code splitting
// const RoutedLazy = lazy(() => import('./routed/lazy.js'));
const RoutedLazy = lazy(
	() =>
		new Promise<typeof import('./routed/lazy.js')>((resolve) => {
			setTimeout(() => {
				resolve(import('./routed/lazy.js'));
			}, LAZY_TIMEOUT);
		}),
);

// "prerenderIndex": 0,
// "ssr": true,
// "url": "/route-path/",
// "route": {
// 	"url": "/route-path/",
// 	"_discoveredBy": {
// 		"url": "/"
// 	}
// }
export const App = ({ prerenderIndex }: { prerenderIndex?: number }) => {
	const [onRouteChangeWasCalled, setOnRouteChangeWasCalled] = useState(false);

	// the following demonstrates the use of options.VNode processor
	// to ensure the production of all possible Twind's classes! (conditional ternary)
	// see the non-class JSX prop below ('data-tw' instead of say 'tw' prop, to avoid TypeScript compiler error)
	const cls1 = twindTw`text-red-600`;
	const cls2 = twindTw`text-green-600`;
	const clazz = onRouteChangeWasCalled ? cls1 : cls2;

	return (
		<LocationProvider>
			<ContextSlotsProvider>
				<StaticNoHydrate label="1">
					<p>
						.STATIC NO HYDRATE (in dev mode, this should be -1, in a prerendered build, this should be a fixed number
						corresponding to the SSG sequence index, NOT 999 which would otherwise indicate that the fragment has incorrectly
						been hydrated)
					</p>
					<p>prerenderIndex: {prerenderIndex}</p>
				</StaticNoHydrate>

				<h1>Router status:</h1>
				<p
					class={`
						bg-pink-600
						p-1.5
						text(white text-3xl)
					`}
				>
					{onRouteChangeWasCalled ? 'SPA route (post-hydration)' : 'Initial route (static SSR / SSG)'}
				</p>

				<StaticNoHydrate label="2">
					<p>STATIC NO HYDRATE</p>
					<span class={clazz} data-tw={cls1}>
						{onRouteChangeWasCalled
							? '[onRouteChangeWasCalled] (this should NEVER display in prerender builds (does show in dev mode))'
							: '[!onRouteChangeWasCalled] (this should ALWAYS display in prerender builds (does show in dev mode))'}
					</span>
				</StaticNoHydrate>

				<h1>Router links:</h1>
				<ul>
					<li>
						<span
							class={`
								inline-block
								text-yellow-400
								mr-1.5
							`}
						>
							&#x2588;&#x2588;&#x2588;
						</span>
						<a href={`${PUBLIC_PATH_ROOT}?param=home#hash-home`}>Routed Home</a>
					</li>
					<li>
						<span
							class={`
								inline-block
								text-yellow-500
								mr-1.5
							`}
						>
							&#x2588;&#x2588;&#x2588;
						</span>
						<a href={`${PUBLIC_PATH_ROOT}routed-lazy${IS_PRE_RENDER ? '/' : ''}?param=lazy#hash-lazy`}>Routed Lazy</a> (1s
						simulated network delay on first load, then "cache" hit)
					</li>
					<li>
						<span
							class={`
								inline-block
								text-yellow-600
								mr-1.5
							`}
						>
							&#x2588;&#x2588;&#x2588;
						</span>
						<a href={`${PUBLIC_PATH_ROOT}routed-non-lazy${IS_PRE_RENDER ? '/' : ''}?param=non-lazy#hash-non-lazy`}>
							Routed Non Lazy
						</a>
					</li>
					<li>
						<span
							class={`
								inline-block
								text-yellow-700
								mr-1.5
							`}
						>
							&#x2588;&#x2588;&#x2588;
						</span>
						<a href={`${PUBLIC_PATH_ROOT}routed-route${IS_PRE_RENDER ? '/' : ''}?param=route#hash-route`}>Routed Route</a>{' '}
						(contains lazy component and triggers slots / named portals)
					</li>
				</ul>

				<h1>First Slot:</h1>
				<hr />
				<Slot name="first slot" />
				<hr />
				<h1>Second Slot:</h1>
				<hr />
				<Slot name="second slot" />
				<hr />

				<h1>Router content:</h1>
				<div class="border(solid 4 pink-600) rounded">
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
							<RoutedLazy path={`${PUBLIC_PATH_ROOT}routed-lazy${IS_PRE_RENDER ? '/' : ''}`} />
							<RoutedNonLazy path={`${PUBLIC_PATH_ROOT}routed-non-lazy${IS_PRE_RENDER ? '/' : ''}`} />
							<Route component={RoutedRoute} path={`${PUBLIC_PATH_ROOT}routed-route${IS_PRE_RENDER ? '/' : ''}`} />
							<Routed404 default />
							<RoutedSuspendedSubRouter path={`${PUBLIC_PATH_ROOT}suspended/*`} />
						</Router>
					</ErrorBoundary>
				</div>

				<h1>Twind critical/secondary stylesheet tests:</h1>
				<p class={'text-3xl'}>
					This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it
					isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles.
				</p>
				<p
					class={`
					bg-yellow-200
					text-black
				`}
				>
					This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route
					or component)
				</p>

				<h1>404 Not Found links:</h1>
				<ul>
					<li>
						<span
							class={`
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
							class={`
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
			</ContextSlotsProvider>
		</LocationProvider>
	);
};

if (IS_CLIENT_SIDE) {
	document.documentElement.addEventListener(
		'mousedown',
		(_ev: MouseEvent) => {
			document.documentElement.classList.remove(KEYBOARD_INTERACT);
		},
		true,
	);

	document.addEventListener(
		'keydown',
		(_ev: KeyboardEvent) => {
			document.documentElement.classList.add(KEYBOARD_INTERACT);
		},
		{
			once: false,
			passive: false,
			capture: true,
		},
	);
	document.addEventListener(
		'keyup',
		(_ev: KeyboardEvent) => {
			document.documentElement.classList.add(KEYBOARD_INTERACT);
		},
		{
			once: false,
			passive: false,
			capture: true,
		},
	);

	// note: IS_PRE_RENDER includes IS_SERVER_SIDE,
	// but here we are inside a IS_CLIENT_SIDE conditional code branch
	if (IS_PRE_RENDER) {
		initPreactVDOMHook();
		hydrate(<App prerenderIndex={999} />, document.body);

		// window is safe, as in conditional IS_CLIENT_SIDE
		_window.PREACTWMR_HYDRATED = true;
	} else {
		// here in this code branch (no isodata): process.env.NODE_ENV === 'development'
		// we use await import to force code splitting => this code bundle will not be loaded in production

		// TODO: because of Preact WMR workaround for config.PUBLIC_PATH_ROOT, this import fails :(
		// ... so we strip the code at build time by detecting the following HTML comment:
		//
		// THIS?
		// const $import = new Function('s', 'return import(s)');
		// const m = await $import('file:///preact-vnode-options-hook--twind.js');
		// m.initPreactVDOMHook_Twind
		//
		/* PREACT_WMR_BUILD_STRIP_CODE_BEGIN */
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		(async () => {
			const { initPreactVDOMHook_Twind } = await import('./preact-vnode-options-hook--twind.js');
			const _tw = initPreactVDOMHook_Twind();
			hydrate(<App prerenderIndex={-1} />, document.body);

			// window is safe, as in conditional IS_CLIENT_SIDE
			_window.PREACTWMR_HYDRATED = true;
		})();
		/* PREACT_WMR_BUILD_STRIP_CODE_END */
	}
}

let _prerenderIndex = 0;

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

	// console.log(`))) PRERENDER DATA: ${JSON.stringify(data, null, 4)}`);

	// TODO: data props?
	// <App {...data} />
	const res = await preactWmrPrerenderForTwind(data.url as string, <App prerenderIndex={_prerenderIndex++} />, {
		props: data,
	});
	// const res = await preactWmrPrerenderForTwind(data.url, cloneElement(<App />, { prerenderIndex: _prerenderIndex++ }), {
	// 	props: data,
	// });
	// // const $App = new Function('$', 'return (p) => $.apply($, [p])');
	// const $App = new Function('$', 'return $');
	// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// // @ts-expect-error
	// const res = await preactWmrPrerenderForTwind(data.url, $App(App), {
	// 	maxDepth: 10,
	// 	props: { prerenderIndex: _prerenderIndex++, ...data },
	// });

	const elements = new Set([
		{ type: 'meta', props: { property: 'og:title', content: 'SEO title' } as Record<string, string> },
		{ type: 'style', props: { id: res.cssId, children: res.cssTextContent } },
		{
			type: 'script',
			props: {
				type: 'text/javascript',
				children:
					'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }',
			},
		},
	]);
	return {
		html: res.html,
		links: res.links,
		data: {
			// xxx: true, // ensures <script type="isodata" /> is generated so we can later check the DOM for its existence, but not needed here as 'data' includes ssr:true already
			...data,
		},
		head: {
			elements,
		},
	};
}
