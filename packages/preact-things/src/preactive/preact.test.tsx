/* eslint-disable jest/no-commented-out-tests */

// This code was shamelessly adapted from Statin, for educational / learning purposes (lots of renaming, type re-organisation, etc. ... but otherwise same logic):
// https://github.com/tomasklaen/statin-preact/blob/ea430a280f1577a7ae80aec5a030765ee3542e78/test.tsx#L1

import { render } from '@testing-library/preact';
import { Fragment, h } from 'preact';
import { expect, test } from 'vitest';

import { preactiveAction } from './action.js';
import { preactiveComponent } from './preact.js';
import { preactiveSignal, setStrictSignalMustChangeInsideAction } from './signal.js';
import type { PreactiveSignal } from './types.js';

setStrictSignalMustChangeInsideAction(false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function waitFor<T extends () => any>(
	fn: T,
	{ timeout = 500, interval = 30 }: { timeout?: number; interval?: number } = {},
): Promise<ReturnType<T>> {
	const timeoutTime = Date.now() + timeout;
	let lastError: unknown;

	while (Date.now() < timeoutTime) {
		await new Promise((resolve) => setTimeout(resolve, interval));
		try {
			return fn();
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError;
}

test('observe() makes component reactive', async () => {
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

test('observe() isolates re-renders to current component', async () => {
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

test('observe() isolates re-renders to current nested component', async () => {
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

test('observe() caches, logs, and renders the error in place of a component', async () => {
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

test('observe() recovers from errors', async () => {
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
