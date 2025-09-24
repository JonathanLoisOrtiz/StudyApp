const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript path aliases
config.resolver.alias = {
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@db': path.resolve(__dirname, 'src/db'),
  '@scheduler': path.resolve(__dirname, 'src/scheduler'),
  '@state': path.resolve(__dirname, 'src/state'),
  '@theme': path.resolve(__dirname, 'src/theme'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@models': path.resolve(__dirname, 'src/models'),
  '@graphics': path.resolve(__dirname, 'src/graphics'),
  '@notifications': path.resolve(__dirname, 'src/notifications'),
};

module.exports = config;
