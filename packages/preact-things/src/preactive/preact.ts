/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FunctionComponent } from 'preact';
import { type MutableRef, useEffect, useRef, useState } from 'preact/hooks';

import { preactiveOnce } from './reaction.js';
import type { OnError, PreactiveFunction } from './types.js';

export interface ReactionTracking {
	dispose: PreactiveFunction<void>;
	cleanAt: number;
	mounted?: boolean;
}

// ticks (milliseconds), same as Date.now() units
const CLEANUP_TIME = 10_000;

const uncommittedReactionRefs: Set<MutableRef<ReactionTracking | null>> = new Set();

let reactionCleanupHandle: ReturnType<typeof setTimeout> | undefined;

const ensureCleanupTimerRunning = () => {
	if (reactionCleanupHandle === undefined) {
		reactionCleanupHandle = setTimeout(cleanUncommittedReactions, CLEANUP_TIME);
	}
};

const scheduleCleanupOfReactionIfLeaked = (ref: MutableRef<ReactionTracking | null>) => {
	uncommittedReactionRefs.add(ref);
	ensureCleanupTimerRunning();
};

const recordReactionAsCommitted = (reactionRef: MutableRef<ReactionTracking | null>) => {
	uncommittedReactionRefs.delete(reactionRef);
};

const cleanUncommittedReactions = () => {
	reactionCleanupHandle = undefined;

	const now = Date.now();
	uncommittedReactionRefs.forEach((ref) => {
		const tracking = ref.current;

		if (tracking && now >= tracking.cleanAt) {
			tracking.dispose();
			ref.current = null;
			uncommittedReactionRefs.delete(ref);
		}
	});

	if (uncommittedReactionRefs.size > 0) {
		ensureCleanupTimerRunning();
	}
};

export const preactiveComponent = <T extends object>(
	Component: FunctionComponent<T>,
	onError?: OnError['onError'],
): FunctionComponent<T> => {
	const componentDisplayName = Component.displayName || Component.name || '$';
	const wrappedComponent: FunctionComponent<T> = function C(...args) {
		const [, passNaNToUpdate] = useState(NaN);

		const reactionTrackingRef = useRef<ReactionTracking | null>(null);

		let effectShouldUpdate = false;

		useEffect(
			() => {
				recordReactionAsCommitted(reactionTrackingRef);

				if (reactionTrackingRef.current) {
					reactionTrackingRef.current.mounted = true;
				}

				if (effectShouldUpdate) {
					passNaNToUpdate(NaN);
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

		reactionTrackingRef.current?.dispose();

		const render = () => {
			try {
				renderedComponent = Component(...args);
			} catch (exception) {
				renderedComponentException = exception;
			}
		};
		// render.displayName = `render_${componentDisplayName}`;

		const preactStatinObserverEffect = () => {
			if (reactionTrackingRef.current?.mounted) {
				passNaNToUpdate(NaN);
			} else {
				effectShouldUpdate = true;
			}
		};

		const dispose = preactiveOnce(render, preactStatinObserverEffect);

		if (reactionTrackingRef.current) {
			reactionTrackingRef.current.dispose = dispose;
		} else {
			const trackingData: ReactionTracking = {
				cleanAt: Date.now() + CLEANUP_TIME,
				dispose,
			};
			reactionTrackingRef.current = trackingData;
			scheduleCleanupOfReactionIfLeaked(reactionTrackingRef);
		}

		if (renderedComponentException) {
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
