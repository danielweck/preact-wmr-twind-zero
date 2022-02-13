import type { FunctionalComponent, RenderableProps } from 'preact';

export const RoutedHome: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<section>
			<h2>Routed &rarr; Home</h2>
			<p
				class={`
					bg-yellow-400
					text-black
					non-twind-class-token
					text-3xl
				`}
			>
				This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or
				component)
			</p>
			<div class="test-scope">
				<p>
					this is a paragraph{' '}
					<span class="child-span">
						with a <span>child</span> span
					</span>{' '}
					element.
				</p>
				<h4>heading</h4>
			</div>
		</section>
	);
};
