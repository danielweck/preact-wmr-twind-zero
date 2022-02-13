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
			version: '17',
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: './tsconfig.json',
			},
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
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	plugins: ['import', 'simple-import-sort', 'prettier'], // 'unused-imports'
	rules: {
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'import/order': 0,
		// 'import/no-unresolved': 'error',
		// https://github.com/import-js/eslint-plugin-import/issues/1868
		'import/no-unresolved': ['error', { ignore: ['^@preact-wmr-twind-zero.+'] }],
		'import/extensions': 0,
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
		// 'unused-imports/no-unused-imports': 'error',
		// 'unused-imports/no-unused-vars': [
		// 	'error',
		// 	{
		// 		vars: 'all',
		// 		args: 'all',
		// 		argsIgnorePattern: '^_',
		// 		varsIgnorePattern: '^_',
		// 		caughtErrorsIgnorePattern: '^_',
		// 		caughtErrors: 'all',
		// 	},
		// ],
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
	// overrides: [
	// 	{
	// 		files: ['./**/*.ts', '*.tsx'],
	// 		excludedFiles: ['./**/*.spec.ts'],
	// 		rules: {},
	// 	},
	// ],
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
