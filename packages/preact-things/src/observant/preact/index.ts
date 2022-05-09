// Parts of this code are adapted from Statin:
// https://github.com/tomasklaen/statin-preact/blob/ea430a280f1577a7ae80aec5a030765ee3542e78/src/index.tsx

import type { FunctionComponent } from 'preact';
import { type MutableRef, useEffect, useRef, useState } from 'preact/hooks';

import { type TObs, get, obs, off, on, peek } from '../core/index.js';

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
				// console.log('----- OBS tracking cleanup (off)');
				off(tracking.obs);
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
			// console.log('----- OBS comp (off current)');
			off(reactionTrackingRef.current.obs);
		}

		let effectShouldUpdate = false;

		useEffect(
			() => {
				// console.log('----- OBS (effect mount ...)');

				if (reactionTrackingRef) {
					// console.log('----- OBS (effect mount: delete react)');
					_uncommittedReactionRefs.delete(reactionTrackingRef);
				}

				if (reactionTrackingRef.current) {
					// console.log('----- OBS (effect mount: set mounted)');
					reactionTrackingRef.current.mounted = true;
				}

				if (effectShouldUpdate) {
					// console.log('----- OBS (effect mount: effectShouldUpdate => force re-render)');
					forceReRender(NaN);
				}

				return () => {
					// console.log('----- OBS (effect un-mount ...)');

					if (reactionTrackingRef.current) {
						// console.log('----- OBS (effect un-mount: off)');
						off(reactionTrackingRef.current.obs);
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
				// console.log('----- OBS derive func (already rendered) ', ret);
				return ret;
			}
			try {
				renderedComponent = Component(...args);
			} catch (exception) {
				renderedComponentException = exception;
			}
			const v = peek(o);
			const ret = v === undefined ? true : !v;
			// console.log('----- OBS derive func (first rendered) ', v, ret);
			return ret;
		}) as TObs<boolean>;

		on(o, (error, _current, previous) => {
			if (error) {
				console.log('OBS onError! ', componentDisplayName, error);
				return;
			}
			if (previous === undefined) {
				// console.log('----- OBS onChange (first change) ', previous, _current);
				return;
			}
			// console.log('----- OBS onChange (next change) => off ', previous, _current);

			off(o);

			if (reactionTrackingRef.current?.mounted) {
				// console.log('----- OBS onChange (mounted => force re-render)');
				forceReRender(NaN);
			} else {
				// console.log('----- OBS onChange (not mounted => effectShouldUpdate)');
				effectShouldUpdate = true;
			}
		});
		get(o); // triggers the first 'change' event from undefined to true

		if (reactionTrackingRef.current) {
			// console.log('----- OBS comp (current => re-set)');
			reactionTrackingRef.current.obs = o;
			reactionTrackingRef.current.cleanAt = Date.now() + CLEANUP_TIME;
		} else {
			// console.log('----- OBS comp (not current => set)');
			const trackingData: ReactionTracking = {
				cleanAt: Date.now() + CLEANUP_TIME,
				obs: o,
			};
			reactionTrackingRef.current = trackingData;

			_uncommittedReactionRefs.add(reactionTrackingRef);
			checkCleanupTimeout();
		}

		if (renderedComponentException) {
			// console.log('----- OBS comp (ex)');
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
