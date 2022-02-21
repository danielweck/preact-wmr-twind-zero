import { SlotContent } from '@preact-wmr-twind-zero/preact-things/slots.js';
import { lazy, Suspense } from '@preact-wmr-twind-zero/preact-things/xpatched/suspense.js';
import type { FunctionalComponent, RenderableProps } from 'preact';
import { ErrorBoundary } from 'preact-iso/lazy';

import { twindTw } from '../../twindish.js';
import { LAZY_TIMEOUT } from '../../utils.js';

// Code splitting
// export const SuspendedLazy = lazy(() => import('./island.js'));
export const SuspendedLazy = lazy(
	() =>
		new Promise<typeof import('./island.js')>((resolve) => {
			setTimeout(() => {
				resolve(import('./island.js'));
			}, LAZY_TIMEOUT);
		}),
);

export const SuspendedLazy_: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	const clz = twindTw`
		text(blue-500 3xl)
		bg-pink-400
	`;
	const clzz = clz; // testing the Babel visitor
	return (
		<ErrorBoundary
			onError={(err) => {
				console.log('ErrorBoundary onError (SuspendedLazy): ', err);
			}}
		>
			<Suspense
				data-tw={clz}
				fallback={
					<>
						<SlotContent name="second slot">
							<p>(lifecycle: DURING-only lazy dynamic import, suspense fallback)</p>
							<p>
								<strong>Slot Content (1)</strong>
							</p>
							<p class="text-blue-500">
								<strong>Slot Content (2)</strong>
							</p>
						</SlotContent>
						<p class={clzz}>LOADING...</p>
					</>
				}
			>
				<SuspendedLazy />
			</Suspense>
		</ErrorBoundary>
	);
};
