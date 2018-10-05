var path = require('path');
const webpack = require('webpack');



module.exports = {
  mode: 'development',
  entry: ['./static/script.js','./static/gif.js','./static/chart-smoothie.js','./static/demodata.js'],
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }

};
