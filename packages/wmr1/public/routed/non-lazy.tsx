import type { FunctionalComponent, RenderableProps } from 'preact';

import { StaticNoHydrate } from '../static-no-hydrate.js';
import { SuspendedStaticNoHydrate_ } from '../suspended/static-no-hydrate/lazy-island.js';

export const RoutedNonLazy: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Non Lazy</h2>
			<p
				class={`
					bg-yellow-600
					text-3xl
				`}
			>
				This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<p class="text-4xl">
				This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or
				component)
			</p>

			<StaticNoHydrate label="4">
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
