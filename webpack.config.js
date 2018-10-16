var path = require('path');
const webpack = require('webpack');



module.exports = {
  devtool: 'source-map',
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
    })
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
      },
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ["@babel/preset-env","@babel/preset-react"]
          // presets: ['env', 'react']
        }
      }
    ]
  }
};
