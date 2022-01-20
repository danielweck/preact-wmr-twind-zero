import type { Class as TClass } from 'twind';

export type Class = TClass;

export type TTwindPair = {
	_: string; // the original parameter of the tagged template literal function (or empty string if same as '.tw', to save bytes)
	tw: string; // the result of Twind processing over '._', i.e. tw(._) or tw(shortcut(._))
	$?: 1; // exists if Twind shortcut
};

// Both tw() and shortcut():
// Parameters<(strings: TemplateStringsArray | Class, ...interpolations: Class[]) => string>

export type TPropTw = {
	tw?: Class;
	'data-tw'?: Class;
};

export type TPropShortcut = {
	'tw-shortcut'?: Class;
	'data-tw-shortcut'?: Class;
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
