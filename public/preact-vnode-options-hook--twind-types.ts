// tw():
// Parameters<(tokens: string) => string>
//
// shortcut():
// Parameters<(strings: TemplateStringsArray | Class, ...interpolations: Class[]) => string>

export type TClassProps = {
	class?: string;
	className?: string;
	'data-tw'?: string;
};

export type TwindProps = TClassProps;

declare module 'preact' {
	/* eslint-disable-next-line @typescript-eslint/no-namespace */
	namespace JSX {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
		interface DOMAttributes<Target extends EventTarget> extends TwindProps {}
	}
}
