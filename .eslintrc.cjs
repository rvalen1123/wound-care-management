module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    jest: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  rules: {
    // General rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-trailing-spaces': 'warn',
    'semi': ['warn', 'always'],
    'quotes': ['warn', 'single'],
    'comma-dangle': ['warn', 'never'],
    'indent': ['warn', 2],

    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'warn',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'warn',
    'vue/component-tags-order': ['warn', {
      order: ['template', 'script', 'style']
    }],

    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/consistent-type-assertions': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn'
  }
};
