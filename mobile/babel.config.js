module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.native.js'],
        alias: {
          '@services':   './src/services',
          '@screens':    './src/screens',
          '@components': './src/components',
          '@store':      './src/store',
          '@types':      './src/types',
          '@navigation': './src/navigation',
        },
      },
    ],
  ],
};
