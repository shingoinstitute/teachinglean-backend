/**
* Running Unit and E2E tests
*/

module.exports = function(grunt) {
  grunt.registerTask('test', [ 'jasmine:angular' ]);
};