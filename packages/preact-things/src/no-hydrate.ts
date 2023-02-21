import { Component, type FunctionalComponent, h, type RenderableProps } from 'preact';

// https://gist.github.com/developit/e94cd0da8479aacd1bbdedd612c1975f
// also see: https://github.com/preactjs/preact-www/blob/master/src/lib/hydrator.js

const S = {};

export class NoHydrate extends Component {
	__d: boolean | undefined;

	shouldComponentUpdate() {
		return false;
	}
	componentDidCatch(e: unknown) {
		// mark the component as dirty to trigger suspend,
		// but do not re-render (shouldComponentUpdate false)

		if (e === S) {
			this.__d = true;
		}
	}
	render() {
		return h(Suspender, null, null);
	}
}

export const NO_HYDRATE = h(NoHydrate, null, []);

const Suspender: FunctionalComponent<unknown> = (_props: RenderableProps<unknown>) => {
	throw S;
	// return null;
};

// https://github.com/JoviDeCroock/realworld/blob/19c925a47f9438939fdb7feddea51ab8ec7be4af/src/lib/progressive-hydration.js#L24-L31
// export class Suspense extends Component {
//  __d: boolean | undefined;
//
// 	componentDidCatch(e: unknown) {
// 		// mark the component as dirty to trigger suspend
// 		if ((e as Promise<void>)?.then) this.__d = true;
// 	}
// 	render(props: { children: ComponentChildren }) {
// 		return props.children;
// 	}
// }
//
// https://github.com/JoviDeCroock/realworld/blob/19c925a47f9438939fdb7feddea51ab8ec7be4af/src/lib/progressive-hydration.js#L3-L22
// interface Default<T> {
// 	default: T;
// }
// type MaybeDefault<T> = Default<T> | T;
// export function lazy<P>(load: () => Promise<MaybeDefault<ComponentType<P>>>) {
// 	let component: ComponentType<P> | undefined;
// 	let promise: ReturnType<typeof load> | undefined;
// 	let error: unknown | undefined;

// 	return function Lazy(
// 		this: typeof Lazy & { waiting: boolean; setState: (p: unknown) => void },
// 		props: (Attributes & P) | null,
// 	) {
// 		if (!promise) {
// 			promise = load().then(
// 				// @ts-expect-error TS2339
// 				(exprts) => (component = exprts.default || exprts),
// 				(err) => {
// 					error = err;
// 				},
// 			);
// 		}

// 		// if (!this.waiting) {
// 		// 	this.waiting = !!promise.then((c) => {
// 		// 		this.setState({ c });
// 		// 	});
// 		// }

// 		if (error) {
// 			throw error;
// 		}

// 		if (!component) {
// 			throw promise;
// 		}

// 		Lazy.displayName = 'Lazy';
// 		return h(component, props);
// 	};
// }

// ----- Preact WMR:
// options._catchError
// https://github.com/preactjs/wmr/blob/039f79925ecab2e277d32e1f4f7341d38a222b59/packages/preact-iso/lazy.js#L16-L33
// ErrorBoundary (Suspense, without fallback component render)
// https://github.com/preactjs/wmr/blob/039f79925ecab2e277d32e1f4f7341d38a222b59/packages/preact-iso/lazy.js#L35-L43
//
// Lazy
// https://github.com/preactjs/wmr/blob/039f79925ecab2e277d32e1f4f7341d38a222b59/packages/preact-iso/lazy.js#L4-L14
//
//
// ----- Preact Compat:
// options._catchError
// https://github.com/preactjs/preact/blob/00c8d1ff1498084c15408cf0014d4c7facdb5dd7/compat/src/suspense.js#L4-L23
//
// Suspense + detachedClone + removeOriginal
// https://github.com/preactjs/preact/blob/00c8d1ff1498084c15408cf0014d4c7facdb5dd7/compat/src/suspense.js#L95-L236
// https://github.com/preactjs/preact/blob/00c8d1ff1498084c15408cf0014d4c7facdb5dd7/compat/src/suspense.js#L44-L93
//
// Lazy
// https://github.com/preactjs/preact/blob/00c8d1ff1498084c15408cf0014d4c7facdb5dd7/compat/src/suspense.js#L238-L270
//
// options.unmount
// https://github.com/preactjs/preact/blob/00c8d1ff1498084c15408cf0014d4c7facdb5dd7/compat/src/suspense.js#L25-L42
//
