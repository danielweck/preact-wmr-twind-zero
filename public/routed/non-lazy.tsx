import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedNonLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>&rarr; Non Lazy</h2>
			<p
				class={twindTw`
					bg-yellow-600
					text-black
					text-3xl
				`}
			>
				This text should have a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other
				route or omponent)
			</p>
		</section>
	);
};
