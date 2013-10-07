/*global module:false*/
module.exports = function(grunt) {
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        jshint: {
          options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            unused: true,
            boss: true,
            eqnull: true,
            browser: true,
            globals: {
                jQuery: true,
                require: true,
                define: true,
                requirejs: true,
                describe: true,
                expect: true,
                it: true,
                connectFour: true,
                beforeEach: true,
            },
            ignores: ['test/lib/*.js','src/jQuery*']
          },
          gruntfile: {
            src: 'Gruntfile.js'
          },
          lib_test: {
            src: ['src/**/*.js', 'test/**/*.js']
          }
        },

        mocha: {
            all: {
                src: ['./test/index.html'],
                options: {
                    mocha: {
                        ignoreLeaks: false,
                        globals: ['jQuery*', '$']
                    },
                    reporter: 'Spec',
                    run: true,

                    timeout: 10000
                }
            }
        },

        htmllint: {
            all: ["src/**/*.html", "test/**/*.html"]
        }
    });


    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-html');
    grunt.registerTask('default', ['jshint', 'mocha', 'htmllint']);
};
