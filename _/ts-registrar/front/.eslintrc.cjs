// .eslintrc.cjs
module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        // отключаем ложные срабатывания в сложных паттернах (Proxy, Fluent API)
        'no-inner-declarations': 'off', // нужно для loader внутри get
        'no-warning-comments': 'off',

        // отключаем ограничение на вложенность
        'max-depth': 'off',
        'max-nested-callbacks': 'off',

        // специально создаём then-able объект (fluent API!)
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',

        // отключаем ложные предупреждения о typeof symbol
        '@typescript-eslint/no-unsafe-return': 'off',

        // защита от symbol
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',

        // отключаем правило о "не добавлять then к объекту"
        'no-thenable': 'off',
        '@typescript-eslint/no-thenable': 'off',

        // отключаем правило о глубине вложенности — это наш легитимный паттерн
        'max-depth': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-nested-functions': 'off',
    },
    overrides: [
        {
            files: ['src/utils/Fluent.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                'no-inner-declarations': 'off',
                'max-nested-callbacks': ['off'],
                'max-depth': 'off',
                '@typescript-eslint/no-thenable': 'off',
                'no-thenable': 'off',
                '@typescript-eslint/no-unsafe-*': 'off',
                '@typescript-eslint/no-unnecessary-type-assertion': 'off',
            },
        },
    ],
};