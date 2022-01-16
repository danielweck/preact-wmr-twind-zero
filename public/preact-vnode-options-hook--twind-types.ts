import type { Class as TClass } from '@twind/core';

export type Class = TClass;

export type TTwindPair = {
	_: string; // the original parameter of the tagged template literal function (or empty string if same as '.tw', to save bytes)
	tw: string; // the result of Twind processing over '._', i.e. tw(._) or tw(shortcut(._))
};

export type TParamsTw = Class;
// Parameters<(strings: TemplateStringsArray | Class, ...interpolations: Class[]) => string>
export type TPropTw = {
	tw?: TParamsTw;
	'data-tw'?: TParamsTw;
};

export type TParamsShortcut = {
	shortcut: Class | undefined;
	preshortcut: Class | undefined;
};
// Parameters<(...tokens: Class[]) => Directive<CSSRules>>;
// Parameters<(strings: TemplateStringsArray, ...interpolations: Class[]) => Directive<CSSRules>>
export type TPropShortcut = {
	'tw-shortcut'?: TParamsShortcut;
	'data-tw-shortcut'?: TParamsShortcut;
};

export type TClassProps = {
	class?: string;
	className?: string;
};
export type TwindProps = TClassProps & TPropShortcut & TPropTw;

declare module 'preact' {
	/* eslint-disable-next-line @typescript-eslint/no-namespace */
	namespace JSX {
		// eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
		interface DOMAttributes<Target extends EventTarget> extends TwindProps {}
	}
}
