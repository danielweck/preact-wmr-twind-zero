import { css } from 'twind';

import { KEYBOARD_INTERACT } from './utils.js';

export const twindReset = () => css`
	@layer base {
		:root#twind.${KEYBOARD_INTERACT} > body * {
			@apply focus:outline-none
				ring(
					focus:4
					focus:purple-600
					focus:offset-2
				)
				focus:border-transparent;
		}

		:root#twind:not(.${KEYBOARD_INTERACT}) > body * {
			@apply focus:outline-none;
		}

		:root#twind:not(.${KEYBOARD_INTERACT}) > body input[type~='text'],
		:root#twind:not(.${KEYBOARD_INTERACT}) > body input[type~='password'],
		:root#twind:not(.${KEYBOARD_INTERACT}) > body input:not([type]) {
			@apply focus:outline-none
				ring(
					focus:4
					focus:green-800
					focus:offset-2
				)
				focus:border-transparent;
		}
	}
`;

/** @type {import('twind').TwindUserConfig<import('twind').BaseTheme, import('twind').Preset<import('twind').BaseTheme>[]>} */
export const twindConfig = {
	variants: [['is-rtl', '&[dir=rtl]']],
	hash: false,
	// hash(className, defaultHash) {
	// if (/^[~@]\(/.test(className)) {
	// 	// shortcut `~(...)`
	// 	// apply `@(...)`
	// 	return defaultHash(className)
	//   }
	// 	return defaultHash(className);
	// },
	rules: [
		[
			'child-span', //  { /* ${theme('colors.black')} */}
			(_, { e: _escape, h: _hash, theme: _theme }) => {
				return {
					'& > span': {
						// eslint-disable-next-line
						'@apply': "bg-red-200 after:content-['*']",
					},
				};
			},
		],
		[
			'test-scope',
			{
				'&': {
					'@apply': 'p-4 m-4 bg-black text-white',
				},
				'& p': {
					'@apply': 'p-8 bg-red-100 text-blue-600',
				},
				'& p > span': {
					'@apply': 'underline px-4 py-4 text-red-300',
				},
				'& > p': {
					'font-family': 'serif',
					color: 'magenta',
				},
				'& p span': {
					'font-size': '200%',
				},
				'& > h4': {
					'@apply': 'uppercase font-extrabold',
					padding: '1em',
					'background-color': 'blue',
				},
			},
		],
	],
	// preflight: false, // uncomment this to manually / visually check the generated stylesheet more easily
	preflight: css`
		:root#twind > body {
			font-family: sans-serif;

			@apply bg-yellow-100 text-black;

			border: 3px solid red;
		}

		:root#twind[dir='ltr'] {
			--is-ltr: 'true';
			--is-rtl: 'false';
		}

		:root#twind[dir='rtl'] {
			--is-rtl: 'true';
			--is-ltr: 'false';
		}

		:root#twind > body a[href] {
			@apply underline text-blue-700;

			&:hover {
				@apply font-bold text-blue-800;
			}
		}

		:root#twind > body h1 {
			@apply font-bold uppercase text-3xl m-4;

			&:hover {
				@apply text-blue-800;
			}
		}

		:root#twind > body h2 {
			@apply font-bold uppercase text-xl m-2;
		}

		:root#twind > body h1,
		:root#twind > body h2,
		:root#twind > body h3,
		:root#twind > body h4 {
			font-family: serif;
		}
	`,
	// preflight: [
	// 	{
	// 		'@layer base': {
	// 			':root#twind[dir=ltr]': {
	// 				'--is-ltr': 'true',
	// 				'--is-rtl': 'false',
	// 			},
	// 			':root#twind[dir=rtl]': {
	// 				'--is-rtl': 'true',
	// 				'--is-ltr': 'false',
	// 			},
	// 			':root#twind > body a[href]': {
	// 				'@apply': 'underline text-blue-700',
	// 				'&:hover': {
	// 					'@apply': 'font-bold text-blue-800',
	// 				},
	// 			},
	// 			':root#twind > body h1': {
	// 				'@apply': 'font-bold uppercase text-3xl m-4',
	// 				'&:hover': {
	// 					'@apply': 'text-blue-800',
	// 				},
	// 			},
	// 			':root#twind > body h2': { '@apply': 'font-bold uppercase text-xl m-2' },
	// 			':root#twind > body h1, :root#twind > body h2, :root#twind > body h3, :root#twind > body h4': {
	// 				'font-family': 'serif',
	// 			},
	// 		},
	// 	},
	// ],
};
export default twindConfig;
