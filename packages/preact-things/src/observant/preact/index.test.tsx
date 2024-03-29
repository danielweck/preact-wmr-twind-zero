/**
 * @vitest-environment happy-dom
 */

/* eslint-disable jest/no-commented-out-tests */

import { cleanup, render, waitFor } from '@testing-library/preact';
import { type ComponentChildren, Fragment, h, render as preactRender } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { ErrorBoundary } from 'preact-iso/lazy';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { clearCache, suspendCache } from '../../suspend-cache.js';
import { Suspense } from '../../xpatched/suspense.js';
import { get, obs, on, reset, set, type TObs } from '../core/index.js';
import { preactObservant } from './index.js';

let _unhandledEvents: PromiseRejectionEvent[] = [];
function onUnhandledRejection(event: PromiseRejectionEvent) {
	console.log('onUnhandledRejection', event);
	_unhandledEvents.push(event);
}

// let scratch;
// let rerender: () => void;
beforeEach(() => {
	// Vitest v0.11.0 bug (Happy-DOM globals)
	// window.requestAnimationFrame = window.requestAnimationFrame.bind(window);
	// window.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);

	// scratch = setupScratch();
	// rerender = setupRerender();

	_unhandledEvents = [];
	if ('onunhandledrejection' in window) {
		window.addEventListener('unhandledrejection', onUnhandledRejection);
	}

	reset();
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

test('test8a DOM', async () => {
	expect(globalThis).toBeDefined();
	expect(self).toBeDefined();
	expect(window).toBeDefined();
	// expect(window).toBe(self);
	// expect(window).toBe(globalThis);
	expect(window.queueMicrotask).toBeDefined();
	expect(window.queueMicrotask).toBe(self.queueMicrotask);
	expect(window.queueMicrotask).toBe(globalThis.queueMicrotask);
	expect(window.requestAnimationFrame).toBeDefined();

	let order = '0';

	requestAnimationFrame(() => {
		order += 'a';
	});

	const a = obs(
		1,
		// 	{
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => {
			if (get(a) === 2) {
				order += '3';
				throw new TypeError('!!');
			}
			order += '1';
			return get(a) + 1;
		},
		// {
		// 	name: '_B_',
		// },
	);

	on(b, (error) => {
		if (!error) {
			return;
		}
		order += '4';
		expect(error).instanceOf(TypeError);
		expect(error?.message).toBe('!!');
	});
	expect(get(b)).toBe(2);
	order += '2';
	set(a, 2);
	order += '5';
	let err: Error | undefined;
	try {
		get(b);
		expect(false).toBe(true);
	} catch (e) {
		err = e as Error;
		order += '6';
	}
	expect(err).instanceOf(TypeError);
	expect(err?.message).toBe('!!');
	order += '7';

	await waitFor(() => {
		expect(order).toBe('01234567a');
	});
});

test('preactObservant() makes component reactive', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: TObs<string> }) {
		return <Fragment>{get(signal)}</Fragment>;
	});

	render(<RenderSignal signal={a} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('foo');
		testPlan++;
	});

	set(a, 'bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('bar');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactObservant() makes component reactive 2 A', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = obs('foo');

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: TObs<string> }) {
		return <Fragment>{get(signal)}</Fragment>;
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

	set(a, 'bar');

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

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: TObs<string> }) {
		return <Fragment>{get(signal)}</Fragment>;
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

	set(a, 'bar');
	set(b, 'two');

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
		signal: TObs<string>;
		children?: ComponentChildren;
	}) {
		return (
			<Fragment>
				<Fragment>{get(signal)}</Fragment>
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

	set(a, 'bar');
	set(b, 'two');

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
		return `${get(a)}one`;
	});

	const RenderSignal = preactObservant(function RenderSignal({ signal }: { signal: TObs<string> }) {
		return <Fragment>{get(signal)}</Fragment>;
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

	set(a, 'bar');
	// set(b,'two');

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
		return `${get(a)}one`;
	});

	const RenderSignal = preactObservant(function RenderSignal({
		signal,
		children,
	}: {
		signal: TObs<string>;
		children?: ComponentChildren;
	}) {
		return (
			<Fragment>
				<Fragment>{get(signal)}</Fragment>
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

	set(a, 'bar');
	// set(b,'two');

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

	const RenderSignal = preactObservant(function CompTop({
		name,
		signal,
	}: {
		debug: string;
		name: string;
		signal: TObs<string>;
	}) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{get(signal)}</Fragment>;
	});

	render(
		<Fragment>
			<RenderSignal debug="compA" name="a" signal={a} />
			<RenderSignal debug="compB" name="b" signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('foofoo');
		testPlan++;
	});

	set(a, 'bar');

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

	const RenderSignal = preactObservant(function CompChild({
		name,
		signal,
	}: {
		debug: string;
		name: string;
		signal: TObs<string>;
	}) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{get(signal)}</Fragment>;
	});

	const NameSignal = preactObservant(function CompParent({
		debug,
		name: nameSignal,
		signal,
	}: {
		debug: string;
		name: TObs<string>;
		signal: TObs<string>;
	}) {
		const name = get(nameSignal);
		rerenders[name] = (rerenders[name] || 0) + 1;
		return (
			<Fragment>
				{name}:<RenderSignal debug={`${debug};;`} name={`${name}Signal`} signal={signal} />,
			</Fragment>
		);
	});

	render(
		<Fragment>
			<NameSignal debug="compA" name={aName} signal={a} />
			<NameSignal debug="compB" name={bName} signal={b} />
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('a:foo,b:foo,');
		testPlan++;
	});

	set(a, 'bar');
	set(bName, 'bb');

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

	const NameSignal = preactObservant(function CompNest({
		name,
		signal,
		children,
	}: {
		debug: string;
		name: string;
		signal: TObs<string>;
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
				{`[${name}--${get(signal)}]`}
				{children ? children : null}
			</Fragment>
		);
	});

	render(
		<Fragment>
			<NameSignal debug="compA" name={'n1'} signal={a}>
				<NameSignal debug="compB" name={'n2'} signal={b} />
			</NameSignal>
		</Fragment>,
		{ container },
	);

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--one]');
		testPlan++;
	});

	set(b, 'two');

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--two]');
		testPlan++;
	});

	set(b, 'three');

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--foo][n2--three]');
		testPlan++;
	});

	set(a, 'bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('[n1--bar][n2--three]');
		testPlan++;
	});

	expect(rerenders.n1).toBe(2);
	testPlan++;
	expect(rerenders.n1_).toBe(2);
	testPlan++;
	expect(rerenders.n1__).toBe(1);
	testPlan++;
	expect(rerenders.n2).toBe(3);
	testPlan++;
	expect(rerenders.n2_).toBe(3);
	testPlan++;
	expect(rerenders.n2__).toBe(2);
	testPlan++;

	expect(testPlan).toBe(10);
});

test('preactObservant() caches, logs, and renders the error in place of a component', async () => {
	let testPlan = 0;

	const container = document.createElement('div');

	const Thrower = preactObservant(
		function Thrower() {
			throw new Error('MyFooError');
		},
		(exception) => {
			expect(exception.message).toBe('preactObservant.renderedComponentException [Thrower2] --- MyFooError');
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
		function Thrower({ throwSignal }: { throwSignal: TObs<boolean> }) {
			if (get(throwSignal)) {
				throw new Error('MyFooError');
			}
			return <Fragment>success</Fragment>;
		},
		(exception) => {
			expect(exception.message).toBe('preactObservant.renderedComponentException [Thrower2] --- MyFooError');
			testPlan++;
		},
	);

	render(<Thrower throwSignal={doThrow} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('');
		testPlan++;
	});

	set(doThrow, false);

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
		function Thrower({ throwSignal }: { throwSignal: TObs<boolean> }) {
			if (get(throwSignal)) {
				const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect(exception.message).toBe('preactObservant.renderedComponentException [Thrower2] --- ');
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

	set(doThrow, false);

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
		function Thrower({ throwSignal }: { throwSignal: TObs<boolean> }) {
			if (get(throwSignal)) {
				const [success, failure] = suspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect(exception.message).toBe('preactObservant.renderedComponentException [Thrower2] --- ');
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

	set(doThrow, false);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>no throw</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	expect(testPlan).toBe(3);
});
