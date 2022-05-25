/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-nocheck

// https://github.com/testing-library/preact-testing-library/blob/1f9851894ff4fc772addef39855ecc0d8b219dca/src/pure.js

import {
	configure as configureDTL,
	createEvent,
	fireEvent as domFireEvent,
	getQueriesForElement,
	prettyDOM,
} from '@testing-library/dom';
import { h, hydrate as preactHydrate, render as preactRender } from 'preact';
import { act } from 'preact/test-utils';

// Similar to RTL we make are own fireEvent helper that just calls DTL's fireEvent with that
// we can that any specific behaviors to the helpers we need
const fireEvent = (...args) => domFireEvent(...args);

Object.keys(domFireEvent).forEach((key) => {
	fireEvent[key] = (elem) => {
		// Preact registers event-listeners in lower-case, so onPointerStart becomes pointerStart
		// here we will copy this behavior, when we fire an element we will fire it in lowercase so
		// we hit the Preact listeners.
		const eventName = `on${key.toLowerCase()}`;
		const isInElem = eventName in elem;
		return isInElem
			? domFireEvent[key](elem)
			: domFireEvent(elem, createEvent(key[0].toUpperCase() + key.slice(1), elem));
	};
});

configureDTL({
	asyncWrapper: async (cb) => {
		let result;
		await act(() => {
			result = cb();
		});
		return result;
	},
	eventWrapper: (cb) => {
		let result;
		act(() => {
			result = cb();
		});
		return result;
	},
});

const mountedContainers = new Set();

function render(ui, { container, baseElement = container, queries, hydrate = false, wrapper: WrapperComponent } = {}) {
	if (!baseElement) {
		// Default to document.body instead of documentElement to avoid output of potentially-large
		// head elements (such as JSS style blocks) in debug output.
		baseElement = document.body;
	}

	if (!container) {
		container = baseElement.appendChild(document.createElement('div'));
	}

	// We'll add it to the mounted containers regardless of whether it's actually
	// added to document.body so the cleanup method works regardless of whether
	// they're passing us a custom container or not.
	mountedContainers.add(container);

	const wrapUiIfNeeded = (innerElement) => (WrapperComponent ? h(WrapperComponent, null, innerElement) : innerElement);

	act(() => {
		if (hydrate) {
			preactHydrate(wrapUiIfNeeded(ui), container);
		} else {
			preactRender(wrapUiIfNeeded(ui), container);
		}
	});

	return {
		container,
		baseElement,
		debug: (el = baseElement, maxLength, options) =>
			Array.isArray(el)
				? // eslint-disable-next-line no-console
				  el.forEach((e) => console.log(prettyDOM(e, maxLength, options)))
				: // eslint-disable-next-line no-console,
				  console.log(prettyDOM(el, maxLength, options)),
		unmount: () => preactRender(null, container),
		rerender: (rerenderUi) => {
			act(() => {
				// noop
			});
			render(wrapUiIfNeeded(rerenderUi), { container, baseElement });
			// Intentionally do not return anything to avoid unnecessarily complicating the API.
			// folks can use all the same utilities we return in the first place that are bound to
			// the container
		},
		asFragment: () => {
			if (typeof document.createRange === 'function') {
				return document.createRange().createContextualFragment(container.innerHTML);
			}

			const template = document.createElement('template');
			template.innerHTML = container.innerHTML;
			return template.content;
		},
		...getQueriesForElement(baseElement, queries),
	};
}

// Maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
// @ts-ignore
function cleanupAtContainer(container) {
	preactRender(null, container);

	if (container.parentNode === document.body) {
		document.body.removeChild(container);
	}

	mountedContainers.delete(container);
}

function cleanup() {
	mountedContainers.forEach(cleanupAtContainer);
}

// eslint-disable-next-line import/export
export * from '@testing-library/dom';
// eslint-disable-next-line import/export
export { act, cleanup, fireEvent, render };
