import { preactiveAction } from './vanilla/action.js';
import { preactiveReaction } from './vanilla/reaction.js';
import type { PreactiveSignal } from './vanilla/types.js';

// https://github.com/reduxjs/redux-devtools/blob/14e4178d598b09d1c6936a470056bc04b35a88d8/extension/src/app/api/index.ts#L522-L536
// export interface ConnectResponse {
//     init: <S, A extends Action<unknown>>(
//       state: S,
//       liftedData?: LiftedState<S, A, unknown>
//     ) => void;
//     subscribe: <S, A extends Action<unknown>>(
//       listener: (message: ListenerMessage<S, A>) => void
//     ) => (() => void) | undefined;
//     unsubscribe: () => void;
//     send: <S, A extends Action<unknown>>(
//       action: A,
//       state: LiftedState<S, A, unknown>
//     ) => void;
//     error: (payload: string) => void;
//   }

export type Message = {
	type: string;
	state: string;
	payload:
		| string
		| {
				type: string;
				nextLiftedState?: {
					actionsById: string[];
					computedStates: {
						state?: object;
					}[];
				};
		  };
};

export interface ReduxDevToolsExtension {
	__REDUX_DEVTOOLS_EXTENSION__?: {
		connect: (preConfig: { name: string }) => {
			init: (state: object) => void;
			send: (action: string | { type: string; updatedAt: string }, state: object) => void;
			subscribe: (func: (message: Message) => void) => (() => void) | undefined;
		};
	};
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Window extends ReduxDevToolsExtension {}
}

const _stateCount = 0;

export const preactiveDevTools = <
	T extends object,
	// & {
	// 	REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE?: Message;
	// },
>(
	preactiveRootState: PreactiveSignal<T>,
	name: string,
) => {
	const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({ name: name || `Preactive State ${_stateCount}` });
	if (!devtools) {
		return () => {
			// nope
		};
	}

	let isTimeTraveling = false;

	const preactiveDispose = preactiveReaction(
		(_dispose) => {
			// TODO: walk down object to access signals + trigger reaction effects on mutations?
			// const s =
			preactiveRootState();
		},
		(_preactiveValue, _dispose) => {
			if (isTimeTraveling) {
				isTimeTraveling = false;
			} else {
				const s = preactiveRootState.reactiveValue;
				// delete s.REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE;
				devtools.send(
					{
						type: 'PREACTIVE:$',
						updatedAt: new Date().toLocaleString(),
					},
					s,
				);
			}
		},
		{
			immediateEffect: false,
		},
	);

	const devToolsUnsubscribe = devtools.subscribe((message) => {
		switch (message.type) {
			case 'ACTION': {
				if (typeof message.payload === 'string') {
					let payloadObj: object | undefined;
					try {
						payloadObj = JSON.parse(message.payload);
					} catch (e) {
						console.log('devtools.subscribe > ACTION JSON.parse() ', message.payload, e);
					}
					if (typeof payloadObj === 'object') {
						preactiveAction(() => {
							return preactiveRootState.editReactiveValue((_val) => {
								// Object.assign(val, payloadObj);
								return payloadObj as T;
							});
						});
					}
				} else {
					console.log('devtools.subscribe > ACTION message.payload not string? ', typeof message.payload, message.payload);
				}
				break;
			}
			case 'DISPATCH': {
				const payloadType = (message.payload as { type: string })?.type;
				if (message.state) {
					if (payloadType === 'JUMP_TO_ACTION' || payloadType === 'JUMP_TO_STATE') {
						isTimeTraveling = true;

						let stateObj: object | undefined;
						try {
							stateObj = JSON.parse(message.state);
						} catch (e) {
							console.log('devtools.subscribe > DISPATCH JSON.parse() ', payloadType, message.state, e);
						}
						if (typeof stateObj === 'object') {
							preactiveAction(() => {
								return preactiveRootState.editReactiveValue((_val) => {
									// Object.assign(val, stateObj);
									// (stateObj as T).REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE = message;
									return stateObj as T;
								});
							});
						}
					}
				} else if (payloadType === 'COMMIT') {
					devtools.init(preactiveRootState.reactiveValue);
				} else if (payloadType === 'IMPORT_STATE' && typeof message.payload !== 'string') {
					const actions = message.payload.nextLiftedState?.actionsById || [];
					const computedStates = message.payload.nextLiftedState?.computedStates || [];

					isTimeTraveling = true;

					computedStates.forEach(({ state }, index) => {
						const action = actions[index] || 'NO ACTION?!';

						if (typeof state === 'object') {
							preactiveAction(() => {
								preactiveRootState.editReactiveValue((_val) => {
									// Object.assign(val, stateObj);
									// (state as T).REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE = message;
									return state as T;
								});
							});
						}

						if (index === 0) {
							devtools.init(preactiveRootState.reactiveValue);
						} else {
							devtools.send(action, preactiveRootState.reactiveValue);
						}
					});
				}
				break;
			}
		}
	});

	devtools.init(preactiveRootState.reactiveValue);

	return () => {
		devToolsUnsubscribe?.();
		preactiveDispose();
	};
};
