import type { FunctionalComponent, RenderableProps } from 'preact';

import { StaticNoHydrate } from '../static-no-hydrate.js';
import { SuspendedStaticNoHydrate_ } from '../suspended/static-no-hydrate/lazy-island.js';

export const RoutedLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Lazy</h2>
			<p
				class={`
					bg-yellow-500
					text-black
					text-3xl
				`}
			>
				This text has a <strong>yellow-500</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<p class="text-2xl">
				This text has a <strong>text-2xl</strong> size (unique to this paragraph, not shared with any other route or
				component)
			</p>

			<StaticNoHydrate label="3">
				<p>
					STATIC NO HYDRATE (HTML/JSX component below is not shipped to client via the Javascript bundle on initial
					hydration, as it is considered static during pre-rendering. However the JS async component is lazy-loaded at
					subsequent route changes (SPA)
				</p>
				<SuspendedStaticNoHydrate_ />
			</StaticNoHydrate>
		</section>
	);
};
// For the dynamic await import (code splitting)
export default RoutedLazy;
