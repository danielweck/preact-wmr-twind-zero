import type { FunctionalComponent, RenderableProps } from 'preact';
import { useState } from 'preact/hooks';
import { ErrorBoundary } from 'preact-iso/lazy';

import { SuspendedLazy } from '../suspended/lazy/lazy-island.js';
import { twindShortcut, twindTw } from '../twindish.js';

const SuspendedLazyLoader: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const [isLazyLoaded, setLazyLoaded] = useState(false);

	return (
		<>
			{isLazyLoaded ? (
				<ErrorBoundary
					onError={(err) => {
						console.log('ErrorBoundary onError (SuspendedLazy): ', err);
					}}
				>
					<SuspendedLazy />
				</ErrorBoundary>
			) : (
				<>
					<button
						class={`
							p-2
							m-2
							border-2
							rounded
							border-dotted
							border-purple-500
						`}
						onClick={() => {
							setLazyLoaded(true);
						}}
					>
						CLICK HERE TO LAZY-LOAD
					</button>
					<span>(1s simulated network delay on first load, then "cache" hit)</span>
				</>
			)}
		</>
	);
};

export const RoutedRoute: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	// This could be directly inlined in the class JSX property without the twindTw (void) helper,
	// but we're just demonstrating the use of the twindTw tagged template literal function
	// for autocompletion / VSCode intellisense.
	const other = process.env.NOPE ? twindTw`text-pink-600` : twindTw`text-black`;
	// This one below doesn't use twindTw, so no autocompletion / VSCode intellisense:
	const paraClass = `
		bg-yellow-700
		${other}
	`;

	// note the dual class and className props on the HTML / JSX paragraph below (no difference, either can be used):
	return (
		<section>
			<h2>Routed &rarr; Route</h2>
			<p class={paraClass} className="text-6xl">
				This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<p
				class={twindShortcut`
					!text-center
					hover:underline
					cursor-pointer
					text-red-800
					bg(
						green-50
						!hover:red-100
					)
					w-1/2
					ml-11
				`}
			>
				This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles:
				<strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>.
			</p>
			<SuspendedLazyLoader />
		</section>
	);
};
