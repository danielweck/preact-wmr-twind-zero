import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedRoute: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Route</h2>
			<p
				class={twindTw`
					bg-yellow-700
					text-black
				`}
			>
				This text should have a yellow-700 background
			</p>
		</section>
	);
};
