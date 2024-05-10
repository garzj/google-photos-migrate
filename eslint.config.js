import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    files: ['**/*.{js,ts,d.ts}'],
    ignores: ['lib/**/*', 'eslint.config.js', '.vscode/eslint-vsc.config.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: '2022',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      ts,
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      ...ts.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^[A-Z]',
            match: true,
          },
        },
      ],
      'react/prop-types': 0,
      'react/display-name': 0,
      '@typescript-eslint/ban-ts-comment': 'off',
      'ts/return-await': 2,
    },
  },
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
];
