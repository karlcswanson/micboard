var path = require('path');
const webpack = require('webpack');



module.exports = {
  mode: 'development',
  // entry: ['./js/script.js','./js/gif.js','./js/chart-smoothie.js','./js/demodata.js'],
  entry: ['./js/script.js'],
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
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
        }]
      }
    ]
  }

};
