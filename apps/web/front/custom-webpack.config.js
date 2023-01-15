// Helper for combining webpack config objects
const nrwlConfig = require('@nrwl/react/plugins/webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { merge } = require('webpack-merge');

module.exports = (config, context) => {
  const nxConfig = nrwlConfig(config);

  return merge(nxConfig, {
    // overwrite values here

/*     optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          admin: {
            test: /[\\/]node_modules[\\/](react-admin|ra-core|@mui|ra-)/,
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
            name: 'vendors~admin',
          },
          non_admin: {
            test: /[\\/]node_modules[\\/](?!(react-admin|ra-core|@mui|ra-))/,
            priority: 20,
            reuseExistingChunk: true,
            chunks: 'all',
            enforce: true,
            name: 'vendors',
          },
          bulma: {
            test: /[\\/]node_modules[\\/](react-bulma-components|feather-icons)[\\/]/,
            priority: 30,
            chunks: 'all',
            enforce: true,
            name: 'gui',
          },
          react: {
            test: /(react|web-vitals|react-scripts|react-query|react-hook-form|react-helmet-async|react-router|react-router-dom|react-dom)[\\/]/,
            name: 'react',
            priority: 40,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
    },
 */    
    plugins: [new NodePolyfillPlugin()],
  });
};
