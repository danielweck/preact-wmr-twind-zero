import { SlotContent } from '@preact-wmr-twind-zero/preact-things/slots.js';
import type { FunctionalComponent, RenderableProps } from 'preact';
import { useState } from 'preact/hooks';

import { SuspendedLazy_ } from '../suspended/lazy/lazy-island.js';
import { twindShortcut, twindTw } from '../twindish.js';

const SuspendedLazyLoader: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const [isLazyLoading, setLazyLoading] = useState(false);

	// eslint-disable-next-line quotes
	const cls = twindTw`before:content-['zob']`;
	return (
		<>
			{isLazyLoading ? (
				<>
					<SlotContent name="first slot">
						<p>(lifecycle: DURING and AFTER lazy dynamic import)</p>
						<p>Slot Content (1)</p>
						<p class="text-blue-400">Slot Content (2)</p>
					</SlotContent>
					<SuspendedLazy_ />
				</>
			) : (
				<>
					<button
						data-tw="text-blue-400"
						class={`
							p-2
							m-2
							border(2 dotted purple-500)
							rounded
						`}
						onClick={() => {
							setLazyLoading(true);
						}}
					>
						CLICK HERE TO LAZY-LOAD
					</button>
					<span class={cls}>(1s simulated network delay on first load, then "cache" hit)</span>
				</>
			)}
		</>
	);
};

export const RoutedRoute: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	// The following classes could be directly inlined in the 'class' / 'className' JSX properties
	// with or without the twindTw helper,
	// but here we demonstrate the twindTw tagged template literal function
	// for the benefits of autocompletion / VSCode intellisense,
	// and also noting that this will perform whitespace collapse + string trim,
	// resulting in cleaner smaller JSX hydration code
	// (this is automatically done for class/className props too, not just the twindTw / twindShortcut functions)
	const other3 = process.env.NOPE
		? twindTw`text-pink-600`
		: `
        
        text-black
        
        `;
	const other4 = twindTw`bg-yellow-700`;
	const paraClass = twindTw`
		
		${other3}
		bg-yellow-700
		${other4}
		
		
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
