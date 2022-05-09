const path = require('path')
const webpack = require('webpack')

const HtmlWebPackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const processRequire = new webpack.ProvidePlugin({
  process: 'process/browser',
})
const htmlPlugin = new HtmlWebPackPlugin({
  template: './frontend/index.html',
  filename: './index.html',
})
// extract css to external stylesheet file
const cssPlugin = new MiniCssExtractPlugin({
  filename: 'styles.css',
})

const copyPlugin = new CopyWebpackPlugin({
  patterns: [
    {
      from: path.resolve(__dirname, 'frontend/public'),
      to: path.resolve(__dirname, 'dist'),
    },
  ],
})

module.exports = (/* env */) => {
  const envPlugin = new webpack.EnvironmentPlugin({
    NOSSR: false,
  })

  return {
    target: 'browserslist',
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    watchOptions: {
      ignored: [
        '**/node_modules',
        path.resolve(__dirname, './db'),
        path.resolve(__dirname, './dist'),
        path.resolve(__dirname, './old'),
        path.resolve(__dirname, './server'),
      ],
    },
    entry: {
      client: './frontend/index.js',
    },
    resolve: {
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer/'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        url: require.resolve('url'),
        util: require.resolve('util/'),
      },
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
          // use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
      ],
    },
    plugins: [processRequire, htmlPlugin, copyPlugin, cssPlugin, envPlugin],
    optimization: {
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,

          vendor: {
            chunks: 'all', // both : consider sync + async chunks for evaluation
            name: 'vendor', // name of chunk file
            test: /node_modules/, // test regular expression
          },
        },
      },
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'frontend/public'),
      },
      historyApiFallback: true,
      proxy: {
        '/api': 'http://localhost:5000',
      },
    },
    devtool: 'source-map',
  }
}
