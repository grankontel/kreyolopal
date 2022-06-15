const webpack = require('webpack')
// Helper for combining webpack config objects
const { merge } = require('webpack-merge')

module.exports = (config, context) => {
  const nodeenv = new webpack.DefinePlugin({
    NODE_ENV: config.mode,
  })

  config.plugins.push(nodeenv)

  config.resolve.extensions.push('.mjml')
  config.module.rules.push({
    test: /\.mjml/,
    type: 'asset/resource',
    generator: {
      filename: 'mails/[hash][ext][query]',
    },
  })

  return merge(config, {
    // overwrite values here
  })
}
