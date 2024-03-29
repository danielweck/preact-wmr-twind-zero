import { get, obs, set, type TObs } from '@preact-wmr-twind-zero/preact-things/observant/core/index.js';
import { preactObservant } from '@preact-wmr-twind-zero/preact-things/observant/preact/index.js';
import { ContextSlotsProvider, Slot } from '@preact-wmr-twind-zero/preact-things/slots.js';
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import hydrate from 'preact-iso/hydrate';
import lazy, { ErrorBoundary } from 'preact-iso/lazy';
import type { PrerenderResult } from 'preact-iso/prerender';
import { LocationProvider, Route, Router } from 'preact-iso/router';

import { initPreactVDOMHook } from '~/preact-vnode-options-hook.js';
import { twindTw } from '~/twindish.js';

import { Routed404 } from './routed/_404.js';
import { RoutedHome } from './routed/home.js';
import { RoutedNonLazy } from './routed/non-lazy.js';
import { RoutedRoute } from './routed/route.js';
import { StaticNoHydrate } from './static-no-hydrate.js';
import {
	suspendCacheHydrationObtainPrerenderingServerJavascript,
	suspendCacheHydrationResetPrerenderingServerContext,
} from './suspend-cache/suspend-cache-hydration.js';
import { RoutedSuspendedSubRouter } from './suspended/index.js';
import { IS_CLIENT_SIDE, IS_PRE_RENDER, KEYBOARD_INTERACT, LAZY_TIMEOUT, PUBLIC_PATH_ROOT } from './utils.js';

interface PreactWmrHydrated {
	PREACTWMR_HYDRATED: boolean | undefined;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Window extends PreactWmrHydrated {}
}
// const _window = (IS_CLIENT_SIDE ? window : {}) as typeof window & PreactWmrHydrated;

if (IS_CLIENT_SIDE && process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	(async () => {
		await import('preact/debug');
	})();
}

// import { CustomElementHydrator } from '@preact-wmr-twind-zero/preact-things/custom-element-hydrate.js';
// <h1>CustomElementHydrator:</h1>
// <CustomElementHydrator
// 	href=""
// 	data={{
// 		test: true,
// 		daniel: 'weck',
// 		deep: {
// 			yes: 1,
// 			no: 0,
// 			nil: null,
// 			undef: undefined,
// 		},
// 	}}
// />

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

const obsPerf = () => {
	const start = {
		prop1: obs(1),
		// prop2: Obs(2),
		// prop3: new Obs(3),
		prop2: obs(2),
		prop3: obs(3),
		prop4: obs(4),
	};

	let layer = start;
	for (let i = 5000; i > 0; i--) {
		layer = (function (m) {
			const s = {
				prop1: obs(function () {
					return get(m.prop2);
				}),
				prop2: obs(function () {
					return get(m.prop1) - get(m.prop3);
				}),
				prop3: obs(function () {
					return get(m.prop2) + get(m.prop4);
				}),
				prop4: obs(function () {
					return get(m.prop3);
				}),
			};

			// onChange(s.prop1, () => {
			// 	// noop
			// });
			// onChange(s.prop2, () => {
			// 	// noop
			// });
			// onChange(s.prop3, () => {
			// 	// noop
			// });
			// onChange(s.prop4, () => {
			// 	// noop
			// });

			// get(s.prop1);
			// get(s.prop2);
			// get(s.prop3);
			// get(s.prop4);

			return s;
		})(layer);
	}

	const end = layer;

	if (get(end.prop1) !== 2) {
		console.log(`PERF get(end.prop1, ) !== 2: ${get(end.prop1)}`);
	}
	if (get(end.prop2) !== 4) {
		console.log(`PERF get(end.prop2, ) !== 4: ${get(end.prop2)}`);
	}
	if (get(end.prop3) !== -1) {
		console.log(`PERF get(end.prop3, ) !== -1: ${get(end.prop3)}`);
	}
	if (get(end.prop4) !== -6) {
		console.log(`PERF get(end.prop4, ) !== -6: ${get(end.prop4)}`);
	}

	const timeStart = performance.now();

	set(start.prop1, 4);
	set(start.prop2, 3);
	set(start.prop3, 2);
	set(start.prop4, 1);

	if (get(end.prop1) !== -2) {
		console.log(`PERF get(end.prop1, ) !== -2: ${get(end.prop1)}`);
	}
	if (get(end.prop2) !== 1) {
		console.log(`PERF get(end.prop2, ) !== 1: ${get(end.prop2)}`);
	}
	if (get(end.prop3) !== -4) {
		console.log(`PERF get(end.prop3, ) !== -4: ${get(end.prop3)}`);
	}
	if (get(end.prop4) !== -4) {
		console.log(`PERF get(end.prop4, ) !== -4: ${get(end.prop4)}`);
	}

	const duration = performance.now() - timeStart;

	// expect(duration).toBeGreaterThanOrEqual(10);
	// expect(duration).toBeLessThanOrEqual(40);

	console.log(`PERF duration (DOM): ${duration}`);

	return duration;
};

// Safari 5-6
// Chrome 5-6
// Firefox 9-10
const ObservantPerf = () => {
	const [perf, setPerf] = useState(0);
	return (
		<>
			<hr />
			<button
				onClick={async () => {
					const COUNT = 10;
					let count = COUNT;
					let total = 0;
					while (count--) {
						await new Promise((resolve) => setTimeout(resolve, 200));
						const p = obsPerf();
						total += p;
					}
					setPerf(total / COUNT);
				}}
			>
				{`OBS PERF (${perf})`}
			</button>
			<hr />
		</>
	);
};

const _rootObservant = obs(
	0,
	// {
	// 	name: ,
	// }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// (_rootObservant as any)._name = 'ROOT'; // Object.seal()!
const _subObservant = obs(
	0,
	// {
	// 	name: 'SUB',
	// }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// (_subObservant as any)._name = 'SUB'; // Object.seal()!
// onChange(_rootObservant, (_evt) => {
// 	console.log('TRACE OBS CHANGE');
// });
const _renders1: Record<string, number> = {};
const _renders2: Record<string, number> = {};
const _renders3: Record<string, number> = {};
const ObservantComp = preactObservant(
	({ signal, signalName, children }: { signal: TObs<number>; signalName: string; children?: ComponentChildren }) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		_renders1[signalName] = (_renders1[signalName] || 0) + 1;
		useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			_renders2[signalName] = (_renders2[signalName] || 0) + 1;
			return () => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				_renders3[signalName] = (_renders3[signalName] || 0) + 1;
			};
		});
		return (
			<>
				<hr />
				<button
					onClick={() => {
						// set(signal, (peek(signal) ?? 0) + 1);
						set(signal, (v) => (v ?? 0) + 1);
					}}
				>
					{
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						`${signalName}++`
					}
				</button>
				<pre>{JSON.stringify(get(signal), null, 4)}</pre>
				<p>render 1:</p>
				<pre>{JSON.stringify(_renders1, null, 4)}</pre>
				<p>render 2:</p>
				<pre>{JSON.stringify(_renders2, null, 4)}</pre>
				<p>render 3:</p>
				<pre>{JSON.stringify(_renders3, null, 4)}</pre>
				<hr />
				{children ? children : null}
			</>
		);
	},
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
				<ObservantPerf />
				<h1 data-headlessui-state="open" class="ui-open:bg-pink-600">
					Router status:
				</h1>
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
				<ul data-headlessui-state="open">
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
						<a class="ui-open:bg-pink-600" href={`${PUBLIC_PATH_ROOT}?param=home#hash-home`}>
							Routed Home
						</a>
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
				<ObservantComp signal={_rootObservant} signalName="ROOT">
					<ObservantComp signal={_subObservant} signalName="SUB" />
				</ObservantComp>
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

	// import { createRootFragment } from '@preact-wmr-twind-zero/preact-things/render-hydrate-replace-node.js';
	// import { render as preactRender, hydrate as preactHydrate } from 'preact';
	// setTimeout(() => {
	// 	const root1 = createRootFragment(document.head, [
	// 		document.getElementById('replaceMe1'),
	// 		document.getElementById('replaceMe2'),
	// 	] as Element[]);

	// 	// Note that with hydrate() instead of render(),
	// 	// <noscript id="replaceMe1"> remains ID === 'replaceMe1'
	// 	// and data-id does not become 'did-replace1'
	// 	// ... but id="replacedID1" replaces id="originalID1" (children)
	// 	preactHydrate(
	// 		<>
	// 			<noscript data-id="did-replace1">
	// 				<h1 data-id="replacedID1">REPLACED 1!</h1>
	// 				<p title="replacedTitle1">non-pre-rendered HTML 1!</p>
	// 			</noscript>
	// 			<noscript data-id="did-replace2">
	// 				<h1 data-id="replacedID2">REPLACED 2!</h1>
	// 				<p title="replacedTitle2">non-pre-rendered HTML 2!</p>
	// 			</noscript>
	// 		</>,
	// 		root1,
	// 	);

	// 	const root2 = createRootFragment(document.head, [
	// 		document.getElementById('replaceMeA'),
	// 		document.getElementById('replaceMeB'),
	// 	] as Element[]);

	// 	// Note that with render() instead of hydrate(),
	// 	// <noscript id="replaceMeA"> becomes ID === '' if unspecified
	// 	// ... and id="replacedIDA" replaces id="originalIDA"
	// 	preactRender(
	// 		<>
	// 			<noscript id="replaceMeA" data-id="did-replaceA">
	// 				<h1 data-id="replacedIDA">REPLACED A!</h1>
	// 				<p title="replacedTitleA">non-pre-rendered HTML A!</p>
	// 			</noscript>
	// 			<noscript id="replaceMeB" data-id="did-replaceB">
	// 				<h1 data-id="replacedIDB">REPLACED B!</h1>
	// 				<p title="replacedTitleB">non-pre-rendered HTML B!</p>
	// 			</noscript>
	// 		</>,
	// 		root2,
	// 	);

	// 	setTimeout(() => {
	// 		const root3 = createRootFragment(document.head, [
	// 			document.getElementById('replaceMeA'),
	// 			document.getElementById('replaceMeB'),
	// 		] as Element[]);

	// 		// Note that with hydrate() instead of render(),
	// 		// <noscript id="did-replaceA"> remains ID === 'did-replaceA'
	// 		// ... but the data-id and title attributes remain stuck in the previous render
	// 		preactHydrate(
	// 			<>
	// 				<noscript data-id="did-replaceA_">
	// 					<h1 data-id="replacedIDA_">REPLACED A_!</h1>
	// 					<p title="replacedTitleA_">non-pre-rendered HTML A_!</p>
	// 				</noscript>
	// 				<noscript data-id="did-replaceB_">
	// 					<h1 data-id="replacedIDB_">REPLACED B_!</h1>
	// 					<p title="replacedTitleB_">non-pre-rendered HTML B_!</p>
	// 				</noscript>
	// 			</>,
	// 			root3,
	// 		);
	// 	}, 2000);
	// }, 2000);

	// note: IS_PRE_RENDER includes IS_SERVER_SIDE,
	// but here we are inside a IS_CLIENT_SIDE conditional code branch
	if (IS_PRE_RENDER) {
		initPreactVDOMHook();
		hydrate(<App prerenderIndex={999} />, document.body);

		// window is safe, as in conditional IS_CLIENT_SIDE
		window.PREACTWMR_HYDRATED = true;
	} else {
		// here in this code branch (no isodata): process.env.NODE_ENV === 'development'
		// we use await import to force code splitting => this code bundle will not be loaded in production

		// TODO: because of Preact WMR workaround for config.PUBLIC_PATH_ROOT, this import fails :(
		// ... so we strip the code fragment at build time by detecting the following HTML comment in the raw/static source:
		//
		/* PREACT_WMR_BUILD_STRIP_CODE_BEGIN */
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		(async () => {
			const { initPreactVDOMHook_Twind } = await import('./preact-vnode-options-hook--twind.js');
			const _tw = initPreactVDOMHook_Twind();

			hydrate(<App prerenderIndex={-1} />, document.body);

			// window is safe, as in conditional IS_CLIENT_SIDE
			window.PREACTWMR_HYDRATED = true;
		})();
		/* PREACT_WMR_BUILD_STRIP_CODE_END */
		//
		// THIS instead? (I don't think so, this is just to avoid Rollup bundling detection)
		// const $import = new Function('s', 'return import(s)');
		// const m = await $import('file:///preact-vnode-options-hook--twind.js');
		// m.initPreactVDOMHook_Twind
		//
	}
}

let _prerenderIndex = 0;

// See ==> https://github.com/preactjs/wmr/blob/main/packages/wmr/src/lib/prerender.js
export async function prerender(data: Record<string, unknown>): Promise<
	PrerenderResult & {
		// This WMR typing is missing in PrerenderResult?!
		head: {
			elements: Set<{
				type: string;
				props: Record<string, string>;
			}>;
		};
		data: Record<string, unknown>;
	}
> {
	// Must be dynamic import for code splitting and avoid include in client bundle
	const { preactWmrPrerenderForTwind } = await import('./prerender/prerender.js');
	// // TODO? trick Rollup into *not* transforming the `import()`
	// const $import = new Function('s', 'return import(s)');
	// const { preactWmrPrerenderForTwind } = await $import('file:///' + path.resolve(cwd, './prerender/prerender.js'));

	// console.log(`))) PRERENDER DATA: ${JSON.stringify(data, null, 4)}`);

	suspendCacheHydrationResetPrerenderingServerContext();

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
	// const res = await preactWmrPrerenderForTwind(data.url, $App(App), {
	// 	maxDepth: 10,
	// 	props: { prerenderIndex: _prerenderIndex++, ...data },
	// });
	const arr = [
		{ type: 'meta', props: { property: 'og:title', content: 'SEO title' } as Record<string, string> },
		{ type: 'style', props: { id: res.cssId, textContent: res.cssTextContent } },
		{
			type: 'script',
			props: {
				type: 'text/javascript',
				textContent:
					'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }',
			},
		},
	];

	const hydrationJavascript = suspendCacheHydrationObtainPrerenderingServerJavascript();
	if (hydrationJavascript) {
		arr.push({
			type: 'script',
			props: {
				type: 'text/javascript',
				textContent: hydrationJavascript.replace(/\$1/g, '&#36;'),
			},
		});
	}

	const elements = new Set(arr);
	return {
		html: res.html.replace(/\$1/g, '&#36;'), // res.html ? res.html.replace(/\$1/g, '&#36;') : '',
		links: res.links,
		// JSON.stringify(data) in WMR's packages/wmr/src/lib/prerender.js
		data: {
			// xxx: true, // ensures <script type="isodata" /> is generated so we can later check the DOM for its existence, but not needed here as 'data' includes ssr:true already
			...data,
		},
		head: {
			elements,
		},
	};
}
