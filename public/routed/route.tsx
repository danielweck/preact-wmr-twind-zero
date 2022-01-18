import { ErrorBoundary } from 'preact-iso/lazy';
import { useState } from 'preact/hooks';

import { SuspendedLazy } from '../suspended/lazy/lazy-island.js';
import { twindShortcut, twindTw } from '../twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

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
						onClick={() => {
							setLazyLoaded(true);
						}}
					>
						Lazy
					</button>
					<span>(1s simulated network delay on first load, then "cache" hit)</span>
				</>
			)}
		</>
	);
};

export const RoutedRoute: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Route</h2>
			<p
				class={twindTw`
					bg-yellow-700
					text-black
					text-3xl
				`}
			>
				This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<p
				tw-shortcut={twindShortcut`
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
