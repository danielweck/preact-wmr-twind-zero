// Parts of this code are adapted from Statin:
// https://github.com/tomasklaen/statin-preact/blob/ea430a280f1577a7ae80aec5a030765ee3542e78/src/index.tsx

import type { FunctionComponent } from 'preact';
import { type MutableRef, useEffect, useRef, useState } from 'preact/hooks';

import { type TObs, dispose, get, obs, onChange, onError, peek } from '../vanilla/index.js';

export interface ReactionTracking {
	obs: TObs<boolean>;
	cleanAt: number;
	mounted?: boolean;
}

const _uncommittedReactionRefs: Set<MutableRef<ReactionTracking | null>> = new Set();

// ticks (milliseconds), same as Date.now() units
const CLEANUP_TIME = 10_000;

let _cleanupTimeout: ReturnType<typeof setTimeout> | undefined;

const checkCleanupTimeout = () => {
	// skip this timeout as it blocks SSR/SSG NodeJS process (no state changes anyway)
	if (typeof window === 'undefined') {
		return;
	}
	if (_cleanupTimeout) {
		return;
	}
	_cleanupTimeout = setTimeout(() => {
		_cleanupTimeout = undefined;

		const now = Date.now();

		for (const ref of _uncommittedReactionRefs) {
			const tracking = ref.current;

			if (tracking && now >= tracking.cleanAt) {
				dispose(tracking.obs);
				ref.current = null;
				_uncommittedReactionRefs.delete(ref);
			}
		}

		if (_uncommittedReactionRefs.size > 0) {
			checkCleanupTimeout();
		}
	}, CLEANUP_TIME);
};

export const preactObservant = <T extends object>(
	Component: FunctionComponent<T>,
	logError?: (err: Error) => void,
): FunctionComponent<T> => {
	const componentDisplayName = Component.displayName || Component.name || '$';
	const wrappedComponent: FunctionComponent<T> = function C(...args) {
		const [, forceReRender] = useState(NaN);

		const reactionTrackingRef = useRef<ReactionTracking | null>(null);

		if (reactionTrackingRef.current) {
			dispose(reactionTrackingRef.current.obs);
		}

		let effectShouldUpdate = false;

		// const debugComponentDisplayName = `${componentDisplayName}_${
		// 	JSON.stringify((args[0] as Record<string, string>)['debug'])
		// }`;

		useEffect(
			() => {
				if (reactionTrackingRef) {
					_uncommittedReactionRefs.delete(reactionTrackingRef);
				}

				if (reactionTrackingRef.current) {
					reactionTrackingRef.current.mounted = true;
				}

				if (effectShouldUpdate) {
					forceReRender(NaN);
				}

				return () => {
					if (reactionTrackingRef.current) {
						dispose(reactionTrackingRef.current.obs);
					}
					reactionTrackingRef.current = null;
				};
			},
			// effectShouldUpdate
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[],
		);

		let renderedComponent: ReturnType<typeof Component> | undefined;
		let renderedComponentException: unknown | undefined;

		const o = obs<boolean>(() => {
			if (renderedComponent || renderedComponentException) {
				const ret = !peek(o);
				// console.log('CALC (already rendered) ', o._name, ret, debugComponentDisplayName);
				return ret;
			}
			try {
				renderedComponent = Component(...args);
			} catch (exception) {
				renderedComponentException = exception;
			}
			const v = peek(o);
			const ret = v === undefined ? true : !v;
			// console.log('CALC (just rendered) ', o._name, ret, debugComponentDisplayName);
			return ret;
		}) as TObs<boolean>;

		onChange(o, (_current, previous) => {
			if (previous === undefined) {
				// console.log('CHANGE (first) => ignore', o._name, debugComponentDisplayName, evt.current);
				return;
			}
			// console.log(
			// 	'CHANGE (again) => dispose ',
			// 	o._name,
			// 	debugComponentDisplayName,
			// 	evt.previous,
			// 	' => ',
			// 	evt.current,
			// );

			dispose(o);

			if (reactionTrackingRef.current?.mounted) {
				forceReRender(NaN);
			} else {
				effectShouldUpdate = true;
			}
		});
		onError(o, (error) => {
			console.log('preactObservant.onError! ', componentDisplayName, error);
		});
		get(o); // triggers the first 'change' event from undefined to true

		if (reactionTrackingRef.current) {
			reactionTrackingRef.current.obs = o;
			reactionTrackingRef.current.cleanAt = Date.now() + CLEANUP_TIME;
		} else {
			const trackingData: ReactionTracking = {
				cleanAt: Date.now() + CLEANUP_TIME,
				obs: o,
			};
			reactionTrackingRef.current = trackingData;

			_uncommittedReactionRefs.add(reactionTrackingRef);
			checkCleanupTimeout();
		}

		if (renderedComponentException) {
			// "thenable" (Promise)
			// thrown Promise must pass through (handled by Suspense / Error Boundary higher up in the component tree)
			if (typeof (renderedComponentException as Promise<void>)?.then === 'function') {
				// console.log('renderedComponentException PROMISE (re-throwing ==> Suspense / Error Boundary)');
				throw renderedComponentException;
			}

			const error = renderedComponentException instanceof Error ? renderedComponentException : new Error('');
			error.message = `preactObservant.renderedComponentException [${componentDisplayName}] --- ${error.message}`;

			if (logError) {
				try {
					logError(error);
				} catch (exception2) {
					console.log(error);
					console.log('logError => ', exception2);
				}
			} else {
				console.log(error);
			}
			return null;
		}

		return renderedComponent || null;
	};

	wrappedComponent.displayName = `wrappedComponent_${componentDisplayName}`;
	return wrappedComponent;
};
