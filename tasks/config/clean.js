/**
 * `clean`
 *
 * ---------------------------------------------------------------
 *
 * Remove the files and folders in your Sails app's web root
 * (conventionally a hidden directory called `.tmp/public`).
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-clean
 *
 */
module.exports = function(grunt) {

  grunt.config.set('clean', {
    dev: ['.tmp/public/**'],
    hash: {
      src: ['.tmp/public/min/*.js'],
      filter: function(filepath) {
        return !/\.[\w]{8}\./.test(filepath);
      }
    },
    build: ['www']
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};