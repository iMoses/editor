module.exports = {

    env: {
        browser:  true,
        commonjs: true,
        node:     true,
        es6:      true,
    },

    globals: {
        document: true,
        window:   true,
    },

    parser: 'babel-eslint',

    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
    ],

    parserOptions: {
        sourceType: 'module',
    },

    plugins: [
        'babel',
        'react',
    ],

    rules: {
        'indent': ['error', 4, {
            SwitchCase:          1,
            MemberExpression:    1,
            FunctionExpression:  { body: 1, parameters: 'first' },
            FunctionDeclaration: { body: 1, parameters: 'first' },
            CallExpression:      { arguments: 'first' },
            ObjectExpression:    'first',
            ArrayExpression:     'first',
        }],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single', {
            avoidEscape:           true,
            allowTemplateLiterals: true,
        }],
        'babel/semi': ['error', 'always'],
        'react/react-in-jsx-scope': ['off'],
    }
};