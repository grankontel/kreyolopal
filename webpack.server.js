const path = require('path')
const nodeExternals = require('webpack-node-externals')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// extract css to external stylesheet file
const cssPlugin = new MiniCssExtractPlugin({
  filename: 'styles.css',
})

module.exports = {
  entry: './server/react.js',

  target: 'node',

  externalsPresets: { node: true },
  externals: [nodeExternals()],

  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  output: {
    path: path.resolve('server'),
    filename: 'react.strict.js',

    library: {
      name: 'reactRoute',
      type: 'commonjs',
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [cssPlugin],
  devtool: 'source-map',
}
