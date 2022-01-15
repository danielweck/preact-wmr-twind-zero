import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const Routed404: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>404 Not Found</h2>
			<p
				class={twindTw`
					bg-yellow-300
					text-black
				`}
			>
				This text should have a yellow-300 background
			</p>
		</section>
	);
};
