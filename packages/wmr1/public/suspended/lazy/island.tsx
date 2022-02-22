import { SlotContent } from '@preact-wmr-twind-zero/preact-things/slots.js';
import type { FunctionalComponent, RenderableProps } from 'preact';

import { twindTw } from '../../twindish.js';

export const SuspendedLazyComp: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const other0 = twindTw`block`;
	const other1 = twindTw`nope`;
	return (
		<div
			class={`${other0}
				rounded
				${`
					${other1}
					border-solid
					${'border(4 pink-600)'}
				`}`}
		>
			<h3>Suspended &rarr; Lazy</h3>
			<p
				class={`
					bg-green-200
					text-3xl
				`}
			>
				This text has a <strong>green-200</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<input
				type="text"
				class={`
					form-input
					block
					w-full
				`}
				placeholder="Tailwind Forms preset class (unique to this component)"
			/>

			<SlotContent name="second slot">
				<p>(lifecycle: AFTER lazy dynamic import)</p>
				<p>Slot Content (A)</p>
				<p class="text-blue-500">Slot Content (B)</p>
			</SlotContent>
		</div>
	);
};
// For the dynamic await import (code splitting)
export default SuspendedLazyComp;
