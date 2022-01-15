import { twindTw } from '/twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Lazy</h2>
			<p
				class={twindTw`
					bg-yellow-500
					text-black
				`}
			>
				This text should have a yellow-500 background
			</p>
		</section>
	);
};
// For the dynamic await import (code splitting)
export default RoutedLazy;
