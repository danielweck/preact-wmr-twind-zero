import { twindTw } from '../../twindish.js';

import type { FunctionalComponent, RenderableProps } from 'preact';

export const SuspendedLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<div
			class={twindTw`
				border-solid
				border-4
				border-pink-600
				rounded
			`}
		>
			<h3>Suspended &rarr; Lazy</h3>
			<p
				class={twindTw`
					bg-green-200
					text-black
					text-3xl
				`}
			>
				This text has a <strong>green-200</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
		</div>
	);
};
// For the dynamic await import (code splitting)
export default SuspendedLazy;
