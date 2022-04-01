// @vitest-environment happy-dom

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-commented-out-tests */

// CJS vs. ESM woes :(
// https://github.com/vitest-dev/vitest/issues/747#issuecomment-1085860826
// import { cleanup, render, waitFor } from '@testing-library/preact';
// ... so we use our local preact-testing-library.js file instead (copy-paste, including .d.ts typings)

// This code was shamelessly adapted from Statin, for educational / learning purposes (lots of renaming, type re-organisation, etc. ... but otherwise same logic):
// https://github.com/tomasklaen/statin-preact/blob/ea430a280f1577a7ae80aec5a030765ee3542e78/test.tsx#L1

import { Fragment, h, render as preactRender } from 'preact';
import { useState } from 'preact/hooks';
import { ErrorBoundary } from 'preact-iso/lazy';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { cleanup, render, waitFor } from '../../../preact-testing-library.js';
import { clearCache, useSuspendCache } from '../../suspend-cache.js';
import { Suspense } from '../../xpatched/suspense.js';
import { preactiveAction } from '../vanilla/action.js';
import { preactiveSignal, setStrictSignalMustChangeInsideAction } from '../vanilla/signal.js';
import type { PreactiveSignal } from '../vanilla/types.js';
import { preactiveComponent } from './index.js';

setStrictSignalMustChangeInsideAction(false);

let _unhandledEvents: any[] = [];
function onUnhandledRejection(event: any) {
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

test('preactiveComponent() makes component reactive', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = preactiveSignal('foo');

	const RenderSignal = preactiveComponent(function RenderSignal({ signal }: { signal: PreactiveSignal<string> }) {
		return <Fragment>{signal()}</Fragment>;
	});

	render(<RenderSignal signal={a} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('foo');
		testPlan++;
	});

	a('bar');

	await waitFor(() => {
		expect(container.innerHTML).toBe('bar');
		testPlan++;
	});

	expect(true).toBe(true);
	testPlan++;

	expect(testPlan).toBe(3);
});

test('preactiveComponent() isolates re-renders to current component', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = preactiveSignal('foo');
	const b = preactiveSignal('foo');
	const rerenders: Record<string, number> = {};

	const RenderSignal = preactiveComponent(function RenderSignal({
		name,
		signal,
	}: {
		name: string;
		signal: PreactiveSignal<string>;
	}) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{signal()}</Fragment>;
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

	a('bar');

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

test('preactiveComponent() isolates re-renders to current nested component', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const a = preactiveSignal('foo');
	const aName = preactiveSignal('a');
	const b = preactiveSignal('foo');
	const bName = preactiveSignal('b');
	const rerenders: Record<string, number> = {};

	const RenderSignal = preactiveComponent(function RenderSignal({
		name,
		signal,
	}: {
		name: string;
		signal: PreactiveSignal<string>;
	}) {
		rerenders[name] = (rerenders[name] || 0) + 1;
		return <Fragment>{signal()}</Fragment>;
	});

	const NameSignal = preactiveComponent(function NameSignal({
		name: nameSignal,
		signal,
	}: {
		name: PreactiveSignal<string>;
		signal: PreactiveSignal<string>;
	}) {
		const name = nameSignal();
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

	preactiveAction(() => {
		a('bar');
		bName('bb');
	});

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

test('preactiveComponent() caches, logs, and renders the error in place of a component', async () => {
	let testPlan = 0;

	const container = document.createElement('div');

	const Thrower = preactiveComponent(
		function Thrower() {
			throw new Error('MyFooError');
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactiveComponent.renderedComponentException [Thrower2] --- MyFooError');
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

test('preactiveComponent() recovers from errors', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = preactiveSignal(true);

	const Thrower = preactiveComponent(
		function Thrower({ throwSignal }: { throwSignal: PreactiveSignal<boolean> }) {
			if (throwSignal()) {
				throw new Error('MyFooError');
			}
			return <Fragment>success</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactiveComponent.renderedComponentException [Thrower2] --- MyFooError');
			testPlan++;
		},
	);

	render(<Thrower throwSignal={doThrow} />, { container });

	await waitFor(() => {
		expect(container.innerHTML).toBe('');
		testPlan++;
	});

	doThrow(false);

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
		const [success, failure] = useSuspendCache(asyncFunc, [], 'my cache key');
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

		const [success, failure] = useSuspendCache(asyncFunc, [], 'my cache key');
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

test('preactiveComponent handles Suspense / Lazy - thrown Promise that resolves', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = preactiveSignal(true);

	const asyncFunc = async (): Promise<string> => {
		return new Promise((resolve, _reject) => {
			setTimeout(() => {
				resolve('success');
			}, 500);
		});
	};

	const Thrower = preactiveComponent(
		function Thrower({ throwSignal }: { throwSignal: PreactiveSignal<boolean> }) {
			if (throwSignal()) {
				// eslint-disable-next-line react-hooks/rules-of-hooks
				const [success, failure] = useSuspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactiveComponent.renderedComponentException [Thrower2] --- ');
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

	doThrow(false);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>no throw</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	expect(testPlan).toBe(3);
});

test('preactiveComponent handles Suspense / Lazy - thrown Promise that rejects', async () => {
	let testPlan = 0;
	const container = document.createElement('div');
	const doThrow = preactiveSignal(true);

	const asyncFunc = async (): Promise<string> => {
		return new Promise((_resolve, reject) => {
			setTimeout(() => {
				reject('failure');

				// throw new Error('failure'); // gets caught in the timeout closure
				// reject(new Error('failure')); // error.message === 'Error: failure'
			}, 500);
		});
	};

	const Thrower = preactiveComponent(
		function Thrower({ throwSignal }: { throwSignal: PreactiveSignal<boolean> }) {
			if (throwSignal()) {
				// eslint-disable-next-line react-hooks/rules-of-hooks
				const [success, failure] = useSuspendCache(asyncFunc, [], 'my cache key');
				const str = typeof success !== 'undefined' ? success : typeof failure !== 'undefined' ? `${failure}` : '?!';
				return <Fragment>{str}</Fragment>;
			}
			return <Fragment>no throw</Fragment>;
		},
		(exception) => {
			expect((exception as Error).message).toBe('preactiveComponent.renderedComponentException [Thrower2] --- ');
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

	doThrow(false);

	await waitFor(
		() => {
			expect(container.innerHTML).toBe('<div>no throw</div>');
			testPlan++;
		},
		{ timeout: 500, interval: 30 },
	);

	expect(testPlan).toBe(3);
});
