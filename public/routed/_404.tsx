import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const Routed404: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; 404 Not Found</h2>
			<p
				class={twindTw`
					bg-yellow-300
					text-black
					text-3xl
				`}
			>
				This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
		</section>
	);
};
