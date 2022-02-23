/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');

const defaultSettings = {
	react: {
		version: '17',
	},
	'import/parsers': {
		'@typescript-eslint/parser': ['.ts', '.tsx'],
	},
	'import/resolver': {
		// https://github.com/alexgorbatchev/eslint-import-resolver-typescript
		typescript: {
			alwaysTryTypes: true,
			project: ['./tsconfig.json', 'packages/*/tsconfig.json', 'packages/*/tsconfig.*.json'],
		},
		// https://github.com/import-js/eslint-plugin-import/tree/main/resolvers/node
		// node: {
		// 	extensions: ['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs'],
		// 	// paths:
		// 	// moduleDirectory:
		// },
		[path.resolve('./eslint-plugin-import-resolver.cjs')]: { someConfig: 1 },
	},
};
// 'unused-imports' '@typescript-eslint'
const defaultPlugins = ['import', 'simple-import-sort', 'prettier', 'promise'];
const defaultExtends = [
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
	'plugin:promise/recommended',
	'plugin:node/recommended',
];
const defaultRules = {
	'node/no-unpublished-import': 0,
	'node/no-missing-import': 0,
	'node/no-unpublished-require': 0,
	'node/no-extraneous-import': 0,
	'node/no-unsupported-features/es-syntax': 0,
	'simple-import-sort/imports': 'error',
	'simple-import-sort/exports': 'error',
	'import/order': 0,
	// 'import/no-unresolved': 'error',
	// 'import/no-unresolved': ['error', { ignore: ['^@preact-wmr-twind-zero.+'] }],
	// 'import/extensions': 0,
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
};
const defaultEnv = {
	node: true,
	browser: true,
	es6: true,
	es2020: true,
	'shared-node-browser': true,
};
const defaultParserOptions = {
	ecmaVersion: 2020,
	sourceType: 'module',
	ecmaFeatures: {
		jsx: true,
	},
	// PACKAGE.JSON "scripts": { "lint": "eslint **/*.ts --parser-options={tsconfigRootDir:null}",
	// project: ['tsconfig.json'],
	// tsconfigRootDir: "." ,
	// extraFileExtensions: ['.cjs'],
	// extensions: ['.cjs'],
};
// const defaultTsObj = {
// 	extends: [...defaultExtends, 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
// 	plugins: [...defaultPlugins, '@typescript-eslint'],
// 	rules: {
// 		...defaultRules,
// 	},
// 	settings: defaultSettings,
// 	env: defaultEnv,
// };

module.exports = {
	parser: '@typescript-eslint/parser',
	env: defaultEnv,
	parserOptions: defaultParserOptions,
	settings: defaultSettings,
	extends: defaultExtends,
	plugins: defaultPlugins,
	rules: defaultRules,
	overrides: [
		{
			files: ['./**/*.cjs'],
			rules: { '@typescript-eslint/no-var-requires': 0 },
		},
		// {
		// 	files: ['./**/*.cjs'],
		// 	env: {
		// 		...defaultEnv,
		// 		node: true,
		// 	},
		// },
		// {
		// 	...defaultTsObj,
		// 	parserOptions: {
		// 		...defaultParserOptions,
		// 		project: ['./packages/shared/tsconfig.json'],
		// 	},
		// 	files: [
		// 		'./packages/shared/**/*.ts',
		// 		'./packages/shared/**/*.tsx',
		// 		'./packages/shared/**/*.js',
		// 		'./packages/shared/**/*.jsx',
		// 	],
		// },
		// {
		// 	...defaultTsObj,
		// 	parserOptions: {
		// 		...defaultParserOptions,
		// 		project: ['./packages/wmr1/tsconfig.build.json'],
		// 	},
		// 	files: [
		// 		'./packages/wmr1/**/*.ts',
		// 		'./packages/wmr1/**/*.tsx',
		// 		'./packages/wmr1/**/*.js',
		// 		'./packages/wmr1/**/*.jsx',
		// 	],
		// },
	],
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
