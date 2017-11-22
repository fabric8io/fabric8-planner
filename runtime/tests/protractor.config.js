let SpecReporter = require('jasmine-spec-reporter').SpecReporter;

exports.config = {
    useAllAngular2AppRoots: true,
    directConnect: true,
    getPageTimeout: 120000,
    allScriptsTimeout: 120000,
    specs: ['./../src/tests/**/*.spec.js'],
    exclude: ['./../src/tests/**/*test-template.spec.js','./../src/tests/**/*work-item-dynamic-fields.spec.js','./../src/tests/**/EXCLUDED/*.spec.js'],
    suites: {
      smokeTest: './../src/tests/**/smokeTest.spec.js',
      fullTest:  './../src/tests/**/*.spec.js',
      loginTest: './../src/tests/**/login.spec.js',
    },

    jasmineNodeOpts: {
        isVerbose: true,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 120000,
        print: function () {
        }
    },

    troubleshoot: true,

    capabilities: {
      'browserName': 'chrome',
//      'maxInstances': 2,
      'shardTestFiles': true,
      'loggingPrefs': {
      'driver': 'WARNING',
      'server': 'WARNING',
      'browser': 'INFO'
      },
      'chromeOptions': {
//      'args': [ '--no-sandbox', '--window-workspace=1']
       'args': [ '--no-sandbox']
      }
    },

    onPrepare: function () {
      jasmine.getEnv().addReporter(new SpecReporter({
        spec: {
          displayStacktrace: true,
          displayDuration: true,
        },
        summary: {
          displayDuration: true
        }
      }));
    }
};
