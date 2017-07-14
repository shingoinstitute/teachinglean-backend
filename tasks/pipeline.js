/**
* grunt/pipeline.js
*
* The order in which your css, javascript, and template files should be
* compiled and linked from your views and static HTML files.
*
* (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
* for matching multiple files, and ! in front of an expression to ignore files.)
*
* For more information see:
*   https://github.com/balderdashy/sails-docs/blob/master/anatomy/myApp/tasks/pipeline.js.md
*/


// CSS files to inject in order

var cssFilesToInject = [
  'node_modules/bootstrap/dist/css/*.css',
  'node_modules/angular-material/angular-material.min.css',
  'node_modules/summernote/dist/summernote.css',
  'css/materialize.css',
  'css/master.css'
];

var jsFilesToInject = [
  // load dependencies
  'bower_components/jquery/dist/jquery.min.js',

  'js/materialize/materialize.min.js',
  // 'node_modules/lodash/lodash.min.js',
  // 'node_modules/summernote/dist/summernote.min.js',

  'bower_components/es6-shim/es6-shimjs',
  // 'bower_components/reflect-metadata/Reflect.js',
  'bower_componenets/rxjs/index.js',
  // 'node_modules/reflect-metadata/Reflect.js',
  // 'node_modules/systemjs/dist/system.src.js',

  // 'node_modules/trix/dist/trix.js',
  // 'node_modules/moment/moment.js',

  // Load angular modules
  // 'node_modules/angular/angular.js',
  // 'node_modules/angular-route/angular-route.js',
  // 'node_modules/angular-aria/angular-aria.js',
  // 'node_modules/angular-animate/angular-animate.js',
  // 'js/dependencies/angular-material.min.js',
  // 'node_modules/angular-messages/angular-messages.js',
  // 'node_modules/angular-sanitize/angular-sanitize.js',
  // 'node_modules/angular-cookies/angular-cookies.js',
  // 'node_modules/angular-moment/angular-moment.js',
  // 'node_modules/angular-trix/dist/angular-trix.js',
  // 'node_modules/angular-bootstrap/ui-bootstrap.js',
  // 'node_modules/angular-summernote/dist/angular-summernote.js',

  'src/systemjs.config.server.js',
];

var templateFilesToInject = [
  'templates/**/*.html'
];

// Default path for public folder (see documentation for more information)
var tmpPath = '.tmp/public/';

module.exports.cssFilesToInject = cssFilesToInject.map(function (cssPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (cssPath[0] === '!') {
    return require('path').join('!.tmp/public/', cssPath.substr(1));
  }
  return require('path').join('.tmp/public/', cssPath);
});
module.exports.jsFilesToInject = jsFilesToInject.map(function (jsPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (jsPath[0] === '!') {
    return require('path').join('!.tmp/public/', jsPath.substr(1));
  }
  return require('path').join('.tmp/public/', jsPath);
});
module.exports.templateFilesToInject = templateFilesToInject.map(function (tplPath) {
  // If we're ignoring the file, make sure the ! is at the beginning of the path
  if (tplPath[0] === '!') {
    return require('path').join('!assets/', tplPath.substr(1));
  }
  return require('path').join('assets/', tplPath);
});
