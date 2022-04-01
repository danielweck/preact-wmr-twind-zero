/* eslint-disable @typescript-eslint/ban-ts-comment */

// https://github.com/testing-library/preact-testing-library/blob/27e175f29a3f5802a5b83740ecc7acb521f5c560/src/pure.js

import { configure as configureDTL, getQueriesForElement, prettyDOM } from '@testing-library/dom';
import { h, hydrate as preactHydrate, render as preactRender } from 'preact';
import { act, setupRerender } from 'preact/test-utils';

configureDTL({
	asyncWrapper: async (cb) => {
		let result;
		await act(() => {
			result = cb();
		});
		return result;
	},
	eventWrapper: async (cb) => {
		let result;
		await act(() => {
			result = cb();
		});
		return result;
	},
});

const mountedContainers = new Set();

// @ts-ignore
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

	// @ts-ignore
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
		// @ts-ignore
		debug: (el = baseElement, maxLength, options) =>
			Array.isArray(el)
				? // eslint-disable-next-line no-console
				  el.forEach((e) => console.log(prettyDOM(e, maxLength, options)))
				: // eslint-disable-next-line no-console,
				  console.log(prettyDOM(el, maxLength, options)),
		unmount: () => preactRender(null, container),
		// @ts-ignore
		rerender: (rerenderUi) => {
			setupRerender()();
			// @ts-ignore
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

export * from '@testing-library/dom';

export { act, cleanup, render };
