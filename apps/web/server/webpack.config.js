// Helper for combining webpack config objects
const path = require('path');
const { merge } = require('webpack-merge');

module.exports = (config, context) => {
  config.resolve.extensions.push('.mjml');
  config.module.rules.push({
    test: /\.mjml/,
    type: 'asset/resource',
    generator: {
      filename: 'mails/[hash][ext][query]',
    },
  });

  return merge(config, {
    // overwrite values here
  });
};
