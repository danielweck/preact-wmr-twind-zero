import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedNonLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Non Lazy</h2>
			<p
				class={twindTw`
					bg-yellow-600
					text-black
				`}
			>
				This text should have a yellow-600 background
			</p>
		</section>
	);
};
