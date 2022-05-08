import { type TObs, get, off, onChange, set } from './core/index.js';

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
	type: 'DISPATCH' | 'ACTION';
	state: string;
	payload:
		| string
		| {
				type: 'JUMP_TO_ACTION' | 'JUMP_TO_STATE' | 'IMPORT_STATE' | 'COMMIT' | 'PAUSE_RECORDING' | 'RESET';
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

let _stateCount = 0;

export const obsDevTools = <
	T extends object = object,
	// & {
	// 	REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE?: Message;
	// },
>(
	observantRootState: TObs<T>,
	name: string,
) => {
	const devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({ name: name || `Observant State ${_stateCount++}` });
	if (!devtools) {
		return () => {
			// nope
		};
	}

	let isTimeTraveling = false;
	let isRecording = true;

	onChange(observantRootState, () => {
		if (isTimeTraveling) {
			isTimeTraveling = false;
		} else if (isRecording) {
			const s = get(observantRootState);
			// delete s.REDUXDEVTOOLSEXTENSION_DISPATCH_MESSAGE;
			devtools.send(
				{
					type: 'OBS:$',
					updatedAt: new Date().toLocaleString(),
				},
				s,
			);
		}
	});

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
						set(observantRootState, payloadObj as T);
					}
				} else {
					console.log('devtools.subscribe > ACTION message.payload not string? ', typeof message.payload, message.payload);
				}
				break;
			}
			case 'DISPATCH': {
				if (typeof message.payload !== 'string') {
					switch (message.payload.type) {
						case 'JUMP_TO_STATE':
						case 'JUMP_TO_ACTION': {
							isTimeTraveling = true;

							let stateObj: object | undefined;
							try {
								stateObj = JSON.parse(message.state);
							} catch (e) {
								console.log('devtools.subscribe > DISPATCH JSON.parse() ', message.payload.type, message.state, e);
							}
							if (typeof stateObj === 'object') {
								set(observantRootState, stateObj as T);
							}
							break;
						}
						case 'COMMIT': {
							devtools.init(get(observantRootState));
							break;
						}
						case 'IMPORT_STATE': {
							const actions = message.payload.nextLiftedState?.actionsById || [];
							const computedStates = message.payload.nextLiftedState?.computedStates || [];

							isTimeTraveling = true;

							computedStates.forEach(({ state }, index) => {
								const action = actions[index] || 'NO ACTION?!';

								if (typeof state === 'object') {
									set(observantRootState, state as T);
								}

								if (index === 0) {
									devtools.init(get(observantRootState));
								} else {
									devtools.send(action, get(observantRootState));
								}
							});
							break;
						}
						case 'RESET': {
							break;
						}
						case 'PAUSE_RECORDING': {
							isRecording = !isRecording;
							break;
						}
					}
				} else {
					console.log('devtools.subscribe > DISPATCH message.payload is string? ', typeof message.payload, message.payload);
				}
				break;
			}
		}
	});

	devtools.init(get(observantRootState));

	return () => {
		devToolsUnsubscribe?.();
		off(observantRootState);
	};
};
