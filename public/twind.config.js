/** @type {import('twind').TwindUserConfig<import('twind').BaseTheme>} */
export const twindConfig = {
	// preflight: false, // uncomment this to manually / visually check the generated stylesheet more easily

	variants: [['is-rtl', '&[dir=rtl]']],
	hash: false,
	rules: [
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
	preflight: [
		{
			'@layer base': {
				':root#twind[dir=ltr]': {
					'--is-ltr': 'true',
					'--is-rtl': 'false',
				},
				':root#twind[dir=rtl]': {
					'--is-rtl': 'true',
					'--is-ltr': 'false',
				},
				':root#twind > body a[href]': {
					'@apply': 'underline text-blue-700',
					'&:hover': {
						'@apply': 'font-bold text-blue-800',
					},
				},
				':root#twind > body h1': {
					'@apply': 'font-bold uppercase text-3xl m-4',
					'&:hover': {
						'@apply': 'text-blue-800',
					},
				},
				':root#twind > body h2': { '@apply': 'font-bold uppercase text-xl m-2' },
				':root#twind > body h1, :root#twind > body h2, :root#twind > body h3, :root#twind > body h4': {
					'font-family': 'serif',
				},
			},
		},
	],
};
export default twindConfig;
