import type { FunctionalComponent, RenderableProps } from 'preact';

import { twindTw } from '../twindish.js';

export const RoutedNonLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Non Lazy</h2>
			<p
				class={twindTw`
					bg-yellow-600
					text-black
					text-3xl
				`}
			>
				This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<p
				class={twindTw`
					text-4xl
				`}
			>
				This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or
				component)
			</p>
		</section>
	);
};
