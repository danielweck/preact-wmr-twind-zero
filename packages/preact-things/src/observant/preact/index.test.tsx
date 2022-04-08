// @vitest-environment happy-dom

/* eslint-disable jest/no-commented-out-tests */

// CJS vs. ESM woes :(
// https://github.com/vitest-dev/vitest/issues/747#issuecomment-1085860826
// import { cleanup, render, waitFor } from '@testing-library/preact';
// ... so we use our local preact-testing-library.js file instead (copy-paste, including .d.ts typings)

import { type ComponentChildren, Fragment, h, render as preactRender } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ErrorBoundary } from 'preact-iso/lazy';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { cleanup, render, waitFor } from '../../../preact-testing-library.js';
import { clearCache, suspendCache } from '../../suspend-cache.js';
import { Suspense } from '../../xpatched/suspense.js';
import { type Obs, fallbackTick, obs, setErrorHandler, setTick, tick } from '../index.js';
import { preactObservant } from './index.js';

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(`VITEST: (${msg})`, err);
};

// const syncTick = () => {
// 	// sync! (no process tick / microtask)
// 	setTick((func, ...args) => {
// 		func(...args);
// 	});
// };

let _unhandledEvents: PromiseRejectionEvent[] = [];
function onUnhandledRejection(event: PromiseRejectionEvent) {
	console.log('onUnhandledRejection', event);
	_unhandledEvents.push(event);
}

// let scratch;
// let rerender: () => void;
beforeEach(() => {
	// scratch = setupScratch();
	// rerender = setupRerender();

	_unhandledEvents = [];
	if ('onunhandledrejection' in window) {
		window.addEventListener('unhandledrejection', onUnhandledRejection);
	}

	// the default NodeJS process tick works fine when tests are executed in isolation,
	// but causes failure when sequenced within the same Vitest launch
	// ... so we use the Promise -based tick
	if (fallbackTick) {
		setTick(fallbackTick);
	} else {
		setTick(tick);
	}
	setErrorHandler(defaultErrorHandler);
});
afterEach(() => {
	clearCache();
	cleanup();
	// teardown(scratch);

	if ('onunhandledrejection' in window) {
		window.removeEventListener('unhandledrejection', onUnhandledRejection);

		if (_unhandledEvents.length) {
			throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
		}
	}

	// the default NodeJS process tick works fine when tests are executed in isolation,
	// but causes failure when sequenced within the same Vitest launch
	// ... so we use the Promise -based tick
	if (fallbackTick) {
		setTick(fallbackTick);
	} else {
		setTick(tick);
	}
	setErrorHandler(defaultErrorHandler);
});

// async function waitFor<T extends () => any>(
// 	fn: T,
// 	{ timeout = 500, interval = 30 }: { timeout?: number; interval?: number } = {},
// ): Promise<ReturnType<T>> {
// 	const timeoutTime = Date.now() + timeout;
// 	let lastError: unknown;

// 	while (Date.now() < timeoutTime) {
// 		await new Promise((resolve) => {
// 			return setTimeout(resolve, interval);
// 		});
// 		try {
// 			return fn();
// 		} catch (error) {
// 			lastError = error;
// 		}
// 	}

// 	throw lastError;
// }

test('preactObservant() makes component reactive', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: Obs<string> }) {
		return <Fragment>{signal.get()}</Fragment>;
	});

	render(<RenderSignal signal={a} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('foo');
		testPlan++;
	});

	a.set('bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('bar');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: Obs<string> }) {
		return <Fragment>{signal.get()}</Fragment>;
	});

	render(
		<Fragment>
			<RenderSignal signal={a} />
			<RenderSignal signal={a} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('foofoo');
		testPlan++;
	});

	a.set('bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('barbar');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2 diff', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs('one');

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: Obs<string> }) {
		return <Fragment>{signal.get()}</Fragment>;
	});

	render(
		<Fragment>
			<RenderSignal signal={a} />
			<RenderSignal signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('fooone');
		testPlan++;
	});

	a.set('bar');
	b.set('two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('bartwo');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2 diff nested', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs('one');

	const RenderSignal = preactObservant(function RenderSignal({
		signal,
		children,
	}: {
		signal: Obs<string>;
		children?: ComponentChildren;
	}) {
		return (
			<Fragment>
				<Fragment>{signal.get()}</Fragment>
				{children ? <Fragment>{children}</Fragment> : null}
			</Fragment>
		);
	});

	render(
		<Fragment>
			<RenderSignal signal={a}>
				<RenderSignal signal={b} />
			</RenderSignal>
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('fooone');
		testPlan++;
	});

	a.set('bar');
	b.set('two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('bartwo');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2 diff calc', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs(() => {
		return `${a.get()}one`;
	});

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: Obs<string> }) {
		return <Fragment>{signal.get()}</Fragment>;
	});

	render(
		<Fragment>
			<RenderSignal signal={a} />
			<RenderSignal signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('foofooone');
		testPlan++;
	});

	a.set('bar');
	// b.set('two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('barbarone');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2 diff nested calc', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs(() => {
		return `${a.get()}one`;
	});

	const RenderSignal = preactObservant(function RenderSignal({
		signal,
		children,
	}: {
		signal: Obs<string>;
		children?: ComponentChildren;
	}) {
		return (
			<Fragment>
				<Fragment>{signal.get()}</Fragment>
				{children ? <Fragment>{children}</Fragment> : null}
			</Fragment>
		);
	});

	render(
		<Fragment>
			<RenderSignal signal={a}>
				<RenderSignal signal={b} />
			</RenderSignal>
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('foofooone');
		testPlan++;
	});

	a.set('bar');
	// b.set('two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('barbarone');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() isolates re-renders to current component', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs('foo');
	const rerenders: Record<string, number> = {};

	const RenderSignal = preactObservant(function RenderSignal({ name, signal }: { name: string; signal: Obs<string> }) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{signal.get()}</Fragment>;
	});

	render(
		<Fragment>
			<RenderSignal name="a" signal={a} />
			<RenderSignal name="b" signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('foofoo');
		testPlan++;
	});

	a.set('bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('barfoo');
		testPlan++;
	});

	expect(rerenders.a).toBe(2);
	testPlan++;

	expect(rerenders.b).toBe(1);
	testPlan++;

	expect(testPlan).toBe(4);
});

test('preactObservant() isolates re-renders to current nested component', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const aName = obs('a');
	const b = obs('foo');
	const bName = obs('b');
	const rerenders: Record<string, number> = {};

	const RenderSignal = preactObservant(function RenderSignal({ name, signal }: { name: string; signal: Obs<string> }) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{signal.get()}</Fragment>;
	});

	const NameSignal = preactObservant(function NameSignal({
		name: nameSignal,
		signal,
	}: {
		name: Obs<string>;
		signal: Obs<string>;
	}) {
		const name = nameSignal.get();
		rerenders[name] = (rerenders[name] || 0) + 1;
		return (
			<Fragment>
				{name}:<RenderSignal name={`${name}Signal`} signal={signal} />,
			</Fragment>
		);
	});

	render(
		<Fragment>
			<NameSignal name={aName} signal={a} />
			<NameSignal name={bName} signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('a:foo,b:foo,');
		testPlan++;
	});

	a.set('bar');
	bName.set('bb');

	await waitFor(() => {
		expect(container.innerHTML).toBe('a:bar,bb:foo,');
		testPlan++;
	});

	expect(rerenders.a).toBe(1);
	testPlan++;
	expect(rerenders.aSignal).toBe(2);
	testPlan++;
	expect(rerenders.b).toBe(1);
	testPlan++;
	expect(rerenders.bb).toBe(1);
	testPlan++;
	expect(rerenders.bSignal).toBe(1);
	testPlan++;

	expect(testPlan).toBe(7);
});

test('preactObservant() isolates re-renders to current nested component 2', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');
	const b = obs('one');

	const rerenders: Record<string, number> = {};

	const NameSignal = preactObservant(function NameSignal({
		name,
		signal,
		children,
	}: {
		name: string;
		signal: Obs<string>;
		children?: ComponentChildren;
	}) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		useEffect(() => {
			rerenders[`${name}_`] = (rerenders[`${name}_`] || 0) + 1;
			return () => {
				rerenders[`${name}__`] = (rerenders[`${name}__`] || 0) + 1;
			};
		});
		return (
			<Fragment>
				{`[${name}--${signal.get()}]`}
				{children ? children : null}
			</Fragment>
		);
	});

	render(
		<Fragment>
			<NameSignal name={'n1'} signal={a}>
				<NameSignal name={'n2'} signal={b} />
			</NameSignal>
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--one]');
		testPlan++;
	});

	// a.set('bar');
	b.set('two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--two]');
		testPlan++;
	});

	b.set('three');

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--three]');
		testPlan++;
	});

	expect(rerenders.n1).toBe(1);
	testPlan++;
	expect(rerenders.n1_).toBe(1);
	testPlan++;
	expect(rerenders.n1__).toBe(undefined);
	testPlan++;
	expect(rerenders.n2).toBe(3);
	testPlan++;
	expect(rerenders.n2_).toBe(3);
	testPlan++;
	expect(rerenders.n2__).toBe(2);
	testPlan++;

	expect(testPlan).toBe(9);
});

test('preactObservant() caches, logs, and renders the error in place of a component', async () => {
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});

	let testPlan = 0;

	const container = document.createElement('div');

	const Thrower = preactObservant(
		function Thrower() {
			throw new Error('MyFooError');
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactObservant.renderedComponentException [Thrower2] --- MyFooError');
			testPlan++;
		},
	);

	render(<Thrower />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('');
		testPlan++;
	});

	expect(testPlan).toBe(2);
});

test('preactObservant() recovers from errors', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = obs(true);

	const Thrower = preactObservant(
		function Thrower({ throwSignal }: { throwSignal: Obs<boolean> }) {
			if (throwSignal.get()) {
				throw new Error('MyFooError');
			}
			return <Fragment>success</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactObservant.renderedComponentException [Thrower2] --- MyFooError');
			testPlan++;
		},
	);

	render(<Thrower throwSignal={doThrow} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('');
		testPlan++;
	});

	doThrow.set(false);

	await waitFor(() => {
		expect(container.innerHTML).toBe('success');
		testPlan++;
	});

	expect(testPlan).toBe(3);
});

test('preact Component handles Suspense / Lazy - thrown Promise that resolves', async () => {
	let testPlan = 0;
	const container = document.createElement('div');

	const asyncFunc = async (): Promise<string> => {
		return new Promise((resolve, _reject) => {
			setTimeout(() => {
				resolve('success');
			}, 500);
		});
	};

	function Thrower() {
		const [state, setState] = useState(0);
		const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
		const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
		setTimeout(() => {
			setState(1);
		}, 500);
		return <Fragment>{`${str}${state}`}</Fragment>;
	}

	// ErrorBoundary because of disabled options._catchError in patched Suspense! (if (0))
	const comp = (
		<div>
			<ErrorBoundary
				onError={(err) => {
					console.log('ErrorBoundary onError', err);
				}}
			>
				<Suspense fallback={<Fragment>suspended</Fragment>}>
					<Thrower />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
	// const comp = (
	// 	<Suspense fallback={<Fragment>suspended</Fragment>}>
	// 		<Thrower />
	// 	</Suspense>
	// );

	preactRender(comp, container);
	// const { rerender } =
	// render(comp, { container });
	// rerender();

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>suspended</div>');
			testPlan++;
		},
		{ timeout: 300, interval: 200 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>success0</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>success1</div>');
			testPlan++;
		},
		{ timeout: 1000, interval: 600 },
	);

	expect(testPlan).toBe(3);
});

test('preact Component handles Suspense / Lazy - thrown Promise that rejects', async () => {
	let testPlan = 0;
	const container = document.createElement('div');

	const asyncFunc = async (): Promise<string> => {
		return new Promise((_resolve, reject) => {
			setTimeout(() => {
				reject('failure');

				// throw new Error('failure'); // gets caught in the timeout closure
				// reject(new Error('failure')); // error.message === 'Error: failure'
			}, 500);
		});
	};

	function Thrower() {
		const [state, setState] = useState(0);

		const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
		const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';

		setTimeout(() => {
			setState(1);
		}, 500);
		return <Fragment>{`${str}${state}`}</Fragment>;
	}

	// ErrorBoundary because of disabled options._catchError in patched Suspense! (if (0))
	const comp = (
		<div>
			<ErrorBoundary
				onError={(err) => {
					console.log('ErrorBoundary onError', err);
				}}
			>
				<Suspense fallback={<Fragment>suspended</Fragment>}>
					<Thrower />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
	// const comp = (
	// 	<Suspense fallback={<Fragment>suspended</Fragment>}>
	// 		<Thrower />
	// 	</Suspense>
	// );

	preactRender(comp, container);
	// const { rerender } =
	// render(comp, { container });
	// rerender();

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>suspended</div>');
			testPlan++;
		},
		{ timeout: 300, interval: 200 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>failure0</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>failure1</div>');
			testPlan++;
		},
		{ timeout: 1000, interval: 600 },
	);

	expect(testPlan).toBe(3);
});

test('preactObservant handles Suspense / Lazy - thrown Promise that resolves', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = obs(true);

	const asyncFunc = async (): Promise<string> => {
		return new Promise((resolve, _reject) => {
			setTimeout(() => {
				resolve('success');
			}, 500);
		});
	};

	const Thrower = preactObservant(
		function Thrower({ throwSignal }: { throwSignal: Obs<boolean> }) {
			if (throwSignal.get()) {
				const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactObservant.renderedComponentException [Thrower2] --- ');
			testPlan++;
		},
	);

	// ErrorBoundary because of disabled options._catchError in patched Suspense! (if (0))
	const comp = (
		<div>
			<ErrorBoundary
				onError={(err) => {
					console.log('ErrorBoundary onError', err);
				}}
			>
				<Suspense fallback={<Fragment>suspended</Fragment>}>
					<Thrower throwSignal={doThrow} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
	// const comp = (
	// 	<Suspense fallback={<Fragment>suspended</Fragment>}>
	// 		<Thrower />
	// 	</Suspense>
	// );

	preactRender(comp, container);
	// const { rerender } =
	// render(comp, { container });
	// rerender();

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>suspended</div>');
			testPlan++;
		},
		{ timeout: 300, interval: 200 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>success</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	doThrow.set(false);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>no throw</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	expect(testPlan).toBe(3);
});

test('preactObservant handles Suspense / Lazy - thrown Promise that rejects', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = obs(true);

	const asyncFunc = async (): Promise<string> => {
		return new Promise((_resolve, reject) => {
			setTimeout(() => {
				reject('failure');

				// throw new Error('failure'); // gets caught in the timeout closure
				// reject(new Error('failure')); // error.message === 'Error: failure'
			}, 500);
		});
	};

	const Thrower = preactObservant(
		function Thrower({ throwSignal }: { throwSignal: Obs<boolean> }) {
			if (throwSignal.get()) {
				const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactObservant.renderedComponentException [Thrower2] --- ');
			testPlan++;
		},
	);

	// ErrorBoundary because of disabled options._catchError in patched Suspense! (if (0))
	const comp = (
		<div>
			<ErrorBoundary
				onError={(err) => {
					console.log('ErrorBoundary onError', err);
				}}
			>
				<Suspense fallback={<Fragment>suspended</Fragment>}>
					<Thrower throwSignal={doThrow} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
	// const comp = (
	// 	<Suspense fallback={<Fragment>suspended</Fragment>}>
	// 		<Thrower />
	// 	</Suspense>
	// );

	preactRender(comp, container);
	// const { rerender } =
	// render(comp, { container });
	// rerender();

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>suspended</div>');
			testPlan++;
		},
		{ timeout: 300, interval: 200 },
	);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>failure</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	doThrow.set(false);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>no throw</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	expect(testPlan).toBe(3);
});
