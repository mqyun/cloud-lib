const webpack = require('webpack');
const fs = require('fs');

const { smart } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackBar = require('webpackbar');

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;
const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const { cloudWebpackConfig, resolveApp } = require('./cloud.config');
const publicPath = require(resolveApp('package.json')).homepage || '/';

// 项目自定义配置
const customCloudConfig = fs.existsSync(resolveApp('cloud.config.js'))
  ? require(resolveApp('cloud.config.js'))
  : {};

// 多页面配置
const multiplePages = customCloudConfig.multiplePages;

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv.mode === 'development';
  const isEnvProduction = webpackEnv.mode === 'production';
  const shouldUseSourceMap = Boolean(webpackEnv.sourcemap);

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && MiniCssExtractPlugin.loader,
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () =>
            [
              require('postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }),
              customCloudConfig.px2rem &&
                require('postcss-px2rem')({
                  remUnit: 75,
                }),
            ].filter(Boolean),
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      if (preProcessor === 'less-loader') {
        loaders.push({
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: isEnvProduction && shouldUseSourceMap,
            javascriptEnabled: true,
            modifyVars: {
              ...cloudWebpackConfig.antdLessModifyVars,
              ...(customCloudConfig.antd
                ? require('antd/dist/theme').getThemeVariables(
                    customCloudConfig.antd,
                  )
                : {}),
              ...(customCloudConfig.antdLessModifyVars || {}),
            },
          },
        });
      } else if (preProcessor === 'sass-loader') {
        const styleVariables =
          {
            ...cloudWebpackConfig.cloudXyScssModifyVars,
            ...(customCloudConfig.cloudXyScssModifyVars || {}),
          } || {};
        loaders.push({
          loader: require.resolve(preProcessor),
          options: {
            prependData: Object.keys(styleVariables)
              .map((k) => `$${k}: ${styleVariables[k]};`)
              .join('\n'),
          },
        });
      } else {
        loaders.push({
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: isEnvProduction && shouldUseSourceMap,
          },
        });
      }
    }
    return loaders;
  };

  let multiplePagesHtmlPlugin = [
    new HtmlWebpackPlugin({
      publicPath: isEnvProduction ? publicPath : isEnvDevelopment && '/',
      template: './public/index.html',
      hash: true,
      chunks: ['main'],
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
      },
    }),
  ];

  if (multiplePages) {
    multiplePagesHtmlPlugin = multiplePages.map((pageItem) => {
      return new HtmlWebpackPlugin({
        title: pageItem.title || 'cloud-react multiple-pages',
        chunks: [pageItem.name], //引入的js
        template: './public/index.html',
        filename: `${pageItem.name}.html`, //html位置
        minify: {
          removeAttributeQuotes: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
          removeRedundantAttributes: true,
          removeEmptyAttributes: true,
        },
      });
    });
  }

  const plugins = [
    ...multiplePagesHtmlPlugin,
    isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    isEnvProduction &&
      new MiniCssExtractPlugin({
        filename: `${
          multiplePages ? '[name]' : 'static'
        }/css/[name].[contenthash:8].css`,
        chunkFilename: `${
          multiplePages ? '[name]' : 'static'
        }/css/[name].[contenthash:8].chunk.css`,
      }),
    isEnvProduction &&
      new CopyWebpackPlugin([
        {
          from: resolveApp('public'),
          to: '.',
          ignore: ['index.html'],
        },
      ]),
    isEnvProduction &&
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [resolveApp('localBuild')],
      }),
    new WebpackBar({
      name: 'webpack building…',
      color: '#1890FF',
    }),
    new FriendlyErrorsPlugin(),
    isEnvDevelopment &&
      new webpack.DefinePlugin(customCloudConfig.define || {}),
    isEnvProduction &&
      new webpack.DefinePlugin({
        ...(customCloudConfig.define || {}),
        ...(customCloudConfig.define_pro || {}),
      }),
  ].filter(Boolean);

  const baseConfig = {
    mode: webpackEnv.mode || 'production',

    stats: 'errors-only',

    entry: multiplePages
      ? (() => {
          const entry = {};
          multiplePages.map((item) => {
            entry[item.name] = item.path;
          });
          return entry;
        })()
      : [resolveApp('src/index')],

    output: {
      path: resolveApp('localBuild'),
      filename: isEnvProduction
        ? `${multiplePages ? '[name]' : 'static'}/js/[name].[contenthash:8].js`
        : isEnvDevelopment &&
          `${multiplePages ? '[name]/' : ''}static/js/bundle.js`,
      chunkFilename: isEnvProduction
        ? `${
            multiplePages ? '[name]' : 'static'
          }/js/[name].[contenthash:8].chunk.js`
        : isEnvDevelopment &&
          `${multiplePages ? '[name]/' : ''}static/js/[name].chunk.js`,
      publicPath: isEnvProduction ? publicPath : isEnvDevelopment && '/',
    },

    module: {
      rules: [
        {
          parser: {
            requireEnsure: false,
          },
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          enforce: 'pre',
          use: [
            {
              loader: require.resolve('eslint-loader'),
              options: {
                eslintPath: require.resolve('eslint'),
                fix: true,
              },
            },
          ],
          include: [resolveApp('src'), resolveApp('@cloud-lib/library')],
        },
        {
          oneOf: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              loader: 'babel-loader?cacheDirectory=true',
              include: [resolveApp('src'), resolveApp('@cloud-lib/library')],
              options: {
                customize: require.resolve(
                  'babel-preset-react-app/webpack-overrides',
                ),

                plugins: [
                  [
                    require.resolve('babel-plugin-named-asset-import'),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: '@svgr/webpack?-svgo,+ref![path]',
                        },
                      },
                    },
                  ],
                  isEnvDevelopment && 'dynamic-import-node',
                ].filter(Boolean),
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction,
              },
            },
            {
              test: [
                /\.bmp$/,
                /\.gif$/,
                /\.jpe?g$/,
                /\.png$/,
                /\.ttf$/,
                /\.md$/,
              ],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
                publicPath: multiplePages
                  ? isEnvProduction
                    ? publicPath
                    : undefined
                  : undefined,
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                localsConvention: 'camelCase',
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              }),
            },
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'sass-loader',
              ),
              sideEffects: true,
            },
            {
              test: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  localsConvention: 'camelCase',
                  modules: {
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                  },
                },
                'sass-loader',
              ),
            },
            {
              test: lessRegex,
              exclude: sassModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'less-loader',
              ),
              sideEffects: true,
            },
            {
              test: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  localsConvention: 'camelCase',
                  modules: {
                    localIdentName: '[name]__[local]___[hash:base64:5]',
                  },
                },
                'less-loader',
              ),
            },
          ],
        },
      ],
    },

    devServer: {
      contentBase: resolveApp('public'),
      disableHostCheck: true,
      host: '0.0.0.0',
      useLocalIp: true,
      port: customCloudConfig.port || 3000,
      historyApiFallback: true,
      inline: true,
      hot: true,
      overlay: {
        errors: true,
      },
      proxy: customCloudConfig.proxy || {},
    },

    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',

    plugins,

    watchOptions: {
      aggregateTimeout: 500,
      poll: 1000,
      ignored: /node_modules/,
    },

    resolve: {
      extensions: [
        '.js',
        '.jsx',
        '.tsx',
        '.ts',
        '.less',
        '.scss',
        '.css',
        '.json',
      ],
      alias: {
        ...cloudWebpackConfig.alias,
        ...(customCloudConfig.alias || {}),
      },
    },

    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({
          cssProcessor: require('cssnano'),
          cssProcessorOptions: {
            discardComments: {
              removeAll: true,
            },
            parser: require('postcss-safe-parser'),
            autoprefixer: {
              disable: true,
            },
          },
          canPrint: true,
        }),
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          // include: ['src/'],
          exclude: /\.min\.js$/,
          parallel: true,
          cache: true,
          sourceMap: shouldUseSourceMap,
        }),
      ],
      // splitChunks: {
      //   minSize: 3000,
      //   cacheGroups: {
      //     vendors: {
      //       test: /[\\/]node_modules[\\/]/,
      //       name: 'vendors',
      //       priority: 10,
      //     },
      //   },
      // },
    },
  };

  return smart(baseConfig, customCloudConfig.webpackConfig || {});
};
