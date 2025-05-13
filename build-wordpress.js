/**
 * Custom build script for WordPress integration
 * This script builds the React application for WordPress integration
 * without needing to modify package.json
 */

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

console.log('Starting WordPress build...');

// Define the webpack configuration
const webpackConfig = {
  mode: 'production',
  entry: './client/src/wordpress-integration.js',
  output: {
    path: path.resolve(__dirname, 'weparlay-wp-plugin/assets/js'),
    filename: 'fantasy-app.js',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: '../images/[name][ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: '../fonts/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../css/fantasy-styles.css',
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@components': path.resolve(__dirname, 'client/src/components'),
      '@hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@lib': path.resolve(__dirname, 'client/src/lib'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  }
};

// Run webpack
const compiler = webpack(webpackConfig);
compiler.run((err, stats) => {
  if (err) {
    console.error('Webpack compilation error:', err);
    return;
  }

  console.log(stats.toString({
    chunks: false,
    colors: true
  }));

  console.log('WordPress build complete!');
  console.log('Files created:');
  console.log('- weparlay-wp-plugin/assets/js/fantasy-app.js');
  console.log('- weparlay-wp-plugin/assets/css/fantasy-styles.css');
  
  // Create a zip file of the plugin if we have the capability
  console.log('\nTo manually create a ZIP file of the plugin:');
  console.log('1. Navigate to the project directory');
  console.log('2. Run: zip -r weparlay-wp-plugin.zip weparlay-wp-plugin/');
  
  // Installation instructions
  console.log('\nInstallation Instructions:');
  console.log('1. In your WordPress admin, go to Plugins > Add New > Upload Plugin');
  console.log('2. Upload the weparlay-wp-plugin.zip file');
  console.log('3. Activate the plugin');
  console.log('4. Configure via the WeParlay menu in WordPress admin');
});