import type { FunctionalComponent, RenderableProps } from 'preact';

export const SuspendedStaticNoHydrateComp: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	return (
		<>
			<p
				dir="rtl"
				class={`
					is-rtl:font-bold
					is-rtl:text-6xl
				`}
			>
				RTL (bold)
			</p>
			<p>
				<button
					class={'text-red-400'}
					onClick={() => {
						alert('BUTTON CLICK: should only show in dev mode, no in pre-rendered build');
					}}
				>
					CLICK HERE TO TEST "StaticNoHydrate" (window.alert() should only work in dev mode, no in pre-rendered build)
				</button>
			</p>
		</>
	);
};
// For the dynamic await import (code splitting)
export default SuspendedStaticNoHydrateComp;
