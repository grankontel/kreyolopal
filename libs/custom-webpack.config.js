// Helper for combining webpack config objects
// const nrwlConfig = require('@nrwl/react/plugins/webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = (config, context) => {
  // const nxConfig = nrwlConfig(config);

  return merge(config, {
    // overwrite values here
    plugins: [new NodePolyfillPlugin()],
  });
};
