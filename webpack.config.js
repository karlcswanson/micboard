const path = require('path');
const webpack = require('webpack');


module.exports = {
  devtool: 'source-map',
  mode: 'development',
  // entry: ['./js/script.js','./js/gif.js','./js/chart-smoothie.js','./js/demodata.js'],
  entry: {
    app: ['whatwg-fetch', './js/app.js'],
    venue: ['./js/venues.js'],
    web: ['./js/web.js'],
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [{
          loader: 'style-loader',
        }, {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
          },
        }],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        }
      },
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          // presets: ['env', 'react']
        },
      },
    ],
  },
};
