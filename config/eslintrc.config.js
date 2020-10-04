module.exports = {
  extends: 'react-app',
  plugins: ['prettier'],
  rules: {
    semi: 'error',
    strict: 1,
    'react-hooks/exhaustive-deps': 0,
    'init-declarations': 1,
    'arrow-spacing': 1,
    'no-var': 2,
    'prefer-template': 1,
    'prettier/prettier': 'error',
  },
};
