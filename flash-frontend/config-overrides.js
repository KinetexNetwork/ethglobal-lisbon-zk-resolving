const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const ANALYZE_BUNDLE = false;

const plugins = [
  new webpack.ProvidePlugin({
    process: 'process/browser.js',
    Buffer: ['buffer', 'Buffer'],
  }),
];
if (ANALYZE_BUNDLE) {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    buffer: 'buffer',
    assert: 'assert',
    stream: 'stream-browserify',
    http: 'stream-http',
    https: 'https-browserify',
    os: 'os-browserify/browser',
  };
  config.plugins.push(...plugins);
  config.ignoreWarnings = [/Failed to parse source map/];
  return config;
};
