// Karma configuration
// Generated on Fri Jun 11 2021 14:42:31 GMT+0900 (日本標準時)

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'sinon', 'browserify', 'power-assert'],
    files: [
      'bgs.v2.js',
      'forkarma/**/*.js',
      {
        pattern : 'xmldata/**/*.xml',
        watched : true,
        served  : true,
        included: false,
      }
    ],
    exclude: [],
    browserify: {
      debug: true,
      files: [
        "forkarma/**/*.js",
      ],
      transform: [
        "espowerify"
      ]
    },
    preprocessors: {
      "/**/*.browserify": "browserify"
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    //logLevel: config.LOG_DEBUG,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['FirefoxHeadless'],
    singleRun: true,
    browserConsoleLogOptions: {
      terminal: true,
      level: ""
    },
    concurrency: Infinity
  })
}
