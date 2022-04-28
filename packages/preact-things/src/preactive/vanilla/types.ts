export interface ForbidLength {
	length: never;
}

// takes precedence over Function.name
export interface DisplayNamed {
	displayName?: string;
}

export type PreactiveFunction<T> = (() => T) & DisplayNamed;

export type PreactiveDisposerFunction = PreactiveFunction<void>;

export interface IsComputed {
	isComputed: true;
}

export type PreactiveDependency<T> = PreactiveSignal<T> | PreactiveFunction<void>;

// export interface ToJson<T> {
// 	toJSON: () => T;
// }

// extends ToJson<T>
export interface PreactiveSignal<T> extends PreactiveFunction<T>, ForbidLength {
	(reactiveValue: T): T;
	reactiveValue: T;
	onReactiveValueChanged: () => void;
	editReactiveValue: (editor: (reactiveValue: T) => T) => T;
	stringifiable: () => T;
}

// extends ToJson<T>
export interface PreactiveComputedSignal<T> extends PreactiveFunction<T>, ForbidLength {}

export type PreactiveReactionAction<T> = ((dispose: PreactiveDisposerFunction) => T) & DisplayNamed;

export type PreactiveReactionEffect<T> = ((reactiveValue: T, dispose: PreactiveDisposerFunction) => void) &
	DisplayNamed;

export interface OnErrorWithDisposer {
	onErrorWithDisposer?: (exception: unknown, dispose: PreactiveDisposerFunction) => void;
}
export interface OnError {
	onError?: (exception: unknown) => void;
}

export interface PreactiveReactionOptions extends OnErrorWithDisposer {
	immediateEffect?: boolean;
}