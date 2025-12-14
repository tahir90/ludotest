module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '$assets': './src/assets',
          '$constants': './src/constants',
          '$components': './src/components',
          '$helpers': './src/helpers',
          '$screens': './src/screens',
          '$redux': './src/redux',
          '$hooks': './src/hooks',
          '$navigation': './src/navigation',
          '$services': './src/services',
          '$types': './src/types',
          '$utils': './src/utils',
          '$config': './src/config',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.ts', '.tsx'],
      },
    ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
