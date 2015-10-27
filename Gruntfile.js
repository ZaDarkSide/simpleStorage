/* jshint node: true */

'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: ['test/**/*.js', 'Gruntfile.js', 'simpleStorage.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },

        uglify: {
            options: {
                banner: '/*! simpleStorage v<%= pkg.version %>, Unlicense <%= grunt.template.today("yyyy") %>. https://github.com/andris9/simpleStorage */\n'
            },
            build: {
                src: 'simpleStorage.js',
                dest: 'simpleStorage.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['jshint', 'uglify']);

};
