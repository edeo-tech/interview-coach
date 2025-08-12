// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure platform-specific extensions are resolved correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
