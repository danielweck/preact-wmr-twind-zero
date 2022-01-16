import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>&rarr; Lazy</h2>
			<p
				class={twindTw`
					bg-yellow-500
					text-black
					text-3xl
				`}
			>
				This text should have a <strong>yellow-500</strong> background (unique to this paragraph, not shared with any other
				route or omponent)
			</p>
		</section>
	);
};
// For the dynamic await import (code splitting)
export default RoutedLazy;
