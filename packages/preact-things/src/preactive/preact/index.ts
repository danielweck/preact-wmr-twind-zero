// This code was shamelessly adapted from Statin, for educational / learning purposes (lots of renaming, type re-organisation, etc. ... but otherwise same logic):
// https://github.com/tomasklaen/statin-preact/blob/ea430a280f1577a7ae80aec5a030765ee3542e78/src/index.tsx

import type { FunctionComponent } from 'preact';
import { type MutableRef, useEffect, useRef, useState } from 'preact/hooks';

import { preactiveOnceReaction } from '../vanilla/reaction.js';
import type { OnError, PreactiveDisposerFunction } from '../vanilla/types.js';

export interface ReactionTracking {
	dispose: PreactiveDisposerFunction;
	cleanAt: number;
	mounted?: boolean;
}

const _uncommittedReactionRefs: Set<MutableRef<ReactionTracking | null>> = new Set();

// ticks (milliseconds), same as Date.now() units
const CLEANUP_TIME = 10_000;

let _cleanupTimeout: ReturnType<typeof setTimeout> | undefined;

const checkCleanupTimeout = () => {
	if (_cleanupTimeout) {
		return;
	}
	_cleanupTimeout = setTimeout(() => {
		_cleanupTimeout = undefined;

		const now = Date.now();

		for (const ref of _uncommittedReactionRefs) {
			const tracking = ref.current;

			if (tracking && now >= tracking.cleanAt) {
				tracking.dispose();
				ref.current = null;
				_uncommittedReactionRefs.delete(ref);
			}
		}

		if (_uncommittedReactionRefs.size > 0) {
			checkCleanupTimeout();
		}
	}, CLEANUP_TIME);
};

export const preactiveComponent = <T extends object>(
	Component: FunctionComponent<T>,
	onError?: OnError['onError'],
): FunctionComponent<T> => {
	const componentDisplayName = Component.displayName || Component.name || '$';
	const wrappedComponent: FunctionComponent<T> = function C(...args) {
		const [, forceReRender] = useState(NaN);

		const reactionTrackingRef = useRef<ReactionTracking | null>(null);

		if (reactionTrackingRef.current) {
			reactionTrackingRef.current.dispose();
		}

		let effectShouldUpdate = false;

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
						reactionTrackingRef.current.dispose();
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

		const dispose = preactiveOnceReaction(
			(_dispose) => {
				try {
					renderedComponent = Component(...args);
				} catch (exception) {
					renderedComponentException = exception;
				}
			},
			() => {
				if (reactionTrackingRef.current?.mounted) {
					forceReRender(NaN);
				} else {
					effectShouldUpdate = true;
				}
			},
		);

		if (reactionTrackingRef.current) {
			reactionTrackingRef.current.dispose = dispose;
		} else {
			const trackingData: ReactionTracking = {
				cleanAt: Date.now() + CLEANUP_TIME,
				dispose,
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
			error.message = `preactiveComponent.renderedComponentException [${componentDisplayName}] --- ${error.message}`;

			if (onError) {
				try {
					onError(error);
				} catch (exception2) {
					console.log(error);
					console.log('onError => ', exception2);
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
