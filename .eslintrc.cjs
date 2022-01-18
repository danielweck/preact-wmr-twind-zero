module.exports = {
	parser: '@typescript-eslint/parser',
	env: {
		node: true,
		browser: true,
		es6: true,
		es2020: true,
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	extends: [
		'preact',
		'eslint:recommended',
		// 'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended',
	],
	plugins: ['unused-imports', 'prettier'],
	rules: {
		'jest/no-deprecated-functions': 0,
		eqeqeq: 2,
		quotes: ['error', 'single'],
		'comma-dangle': ['error', 'always-multiline'],
		'eol-last': ['error', 'always'],
		semi: ['error', 'always'],
		'no-unused-vars': 0,
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'all',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				caughtErrors: 'all',
			},
		],
		// 'sort-imports': [
		// 	'error',
		// 	{
		// 		ignoreCase: false,
		// 		ignoreDeclarationSort: false,
		// 		ignoreMemberSort: false,
		// 		memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
		// 		allowSeparatedGroups: false,
		// 	},
		// ],
		'unused-imports/no-unused-imports': 'error',
		'unused-imports/no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'all',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				caughtErrors: 'all',
			},
		],
		'react/jsx-key': 0,

		'react/no-unknown-property': 0,
		'react/react-in-jsx-scope': 0,

		// react/jsx-uses-react
		// react/jsx-uses-vars

		// TypeScript => no need for PropTypes
		'react/prop-types': 0,

		'react/no-unescaped-entities': 0,

		// TODO (missing return types on functions)
		'@typescript-eslint/explicit-module-boundary-types': 0,
		// "@typescript-eslint/explicit-module-boundary-types": [
		//     "error",
		//     {
		//         allowArgumentsExplicitlyTypedAsAny: true,
		//         allowDirectConstAssertionInArrowFunctions: true,
		//         allowedNames: [],
		//         allowHigherOrderFunctions: true,
		//         allowTypedFunctionExpressions: true,
		//     },
		// ],

		// "@typescript-eslint/explicit-function-return-type": 0,
		// "@typescript-eslint/explicit-function-return-type": [
		//     "error",
		//     {
		//         allowExpressions: true,
		//         allowTypedFunctionExpressions: true,
		//     },
		// ],

		'prettier/prettier': 'error',
	},
	overrides: [
		{
			files: ['./**/*.ts'],
			excludedFiles: ['./**/*.spec.ts'],
			rules: {},
		},
	],
	// overrides: [
	//     {
	//         files: ["*.ts", "*.tsx"],
	//         rules: {
	//             "@typescript-eslint/explicit-function-return-type": [
	//                 "error",
	//                 {
	//                     allowExpressions: true,
	//                 },
	//             ],
	//         },
	//     },
	// ],
};
