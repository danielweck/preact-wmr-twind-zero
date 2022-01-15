import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedHome: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Home</h2>
			<p
				class={twindTw`
					bg-yellow-400
					text-black
				`}
			>
				This text should have a yellow-400 background
			</p>
		</section>
	);
};
