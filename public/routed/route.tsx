import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedRoute: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>&rarr; Route</h2>
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
		</section>
	);
};
