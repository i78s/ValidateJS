// Karma configuration
// Generated on Sun Sep 27 2015 17:52:54 GMT+0900 (JST)

module.exports = function (config) {
  var webpackConfig = require('./webpack.config');

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/power-assert/build/power-assert.js',
      'node_modules/sinon/pkg/sinon.js',
      'test/fixtures/**/*.html',
      'test/**/*-spec.ts'
    ],

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // add webpack as preprocessor
      'test/fixtures/**/*.html': ['html2js'],
      'test/**/*-spec.ts': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // you can define custom flags
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '-incognito',
          '--headless',
          '--disable-gpu',
          '--remote-debugging-port=9222'
        ]
      }
    },
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    webpack: {
      devtool: 'none',
      resolve: webpackConfig.resolve,
      module: webpackConfig.module
    },
    webpackMiddleware: {
      noInfo: true
    },

    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },

    client: {
      captureConsole: true,
      mocha: {
        reporter: 'html'
      }
    }
  })
};
