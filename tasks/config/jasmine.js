/**
 * Jasmine Test Suite Integration
 */

var vendorPath = 'assets/bower_components/';
var _ = require('lodash');

module.exports = function(grunt) {
  grunt.config.set('jasmine', {
      angular: {
        // Your AngularJS source files
        src : 'assets/js/**/*.js',
        options: {
          // Your Jasmine spec files
          specs : _.shuffle(grunt.file.expand('assets/test/specs/**/*.js')),
          vendor: [ vendorPath + 'angular/angular.js', vendorPath + 'lodash/lodash.js', vendorPath + '/moment/moment.js', vendorPath + 'jquery/dist/jquery.js', vendorPath + '/summernote/dist/summernote.js', vendorPath + '/angular-summernote/dist/angular-summernote.js', vendorPath + 'angular-*/angular-*.js', vendorPath + 'clipboard/dist/clipboard.js', vendorPath + 'ngclipboard/dist/ngclipboard.js'],
          // template: require('grunt-template-jasmine-istanbul'),
          // templateOptions: {
          //     coverage: 'bin/angular-coverage/coverage.json',
          //     report: 'bin/angular-coverage',
          //     thresholds: {
          //         lines: 75,
          //         statements: 75,
          //         branches: 75,
          //         functions: 90
          //     }
          // },
          keepRunner: true,
          display: 'short',
          summary: true
        }
      }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};