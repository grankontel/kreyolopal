const path = require('path')
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')
/* const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin
 */
module.exports = {
  webpack: {
    configure: (config) => {
      config.optimization.splitChunks = {
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -30,
            reuseExistingChunk: true,
          },
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
          bulma : {
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
      }

      // Remove guard against importing modules outside of `src`.
      // Needed for workspace projects.
      config.resolve.plugins = config.resolve.plugins.filter(
        (plugin) => !(plugin instanceof ModuleScopePlugin)
      )
      // Add support for importing workspace projects.
      config.resolve.plugins.push(
        new TsConfigPathsPlugin({
          configFile: path.resolve(__dirname, 'tsconfig.json'),
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          mainFields: ['module', 'main'],
        })
      )

      // Add BundleAnalyzerPlugin
/*       config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'json',
          generateStatsFile: true,
        })
      )
 */
      // Replace include option for babel loader with exclude
      // so babel will handle workspace projects as well.
      config.module.rules[1].oneOf.forEach((r) => {
        if (r.loader && r.loader.indexOf('babel') !== -1) {
          r.exclude = /node_modules/
          delete r.include
        }
      })
      return config
    },
  },
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/backend': 'http://localhost:5000',
    },
  },

  jest: {
    configure: (config) => {
      config.resolver = '@nrwl/jest/plugins/resolver'
      return config
    },
  },
}
