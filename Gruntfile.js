const sass = require('node-sass');

module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      dev: {
        files: {
          'public/dist/js/app.bundle.js': ['public/src/js/**/*.js','!public/src/js/app.bundle.js']
        },
        options: {
          browserifyOptions: {
            debug: true
          },
          watch: true,
          keepAlive: true,
          transform: ['envify']
        }
      },
      build: {
        files: {
          'public/src/js/app.bundle.js': ['public/src/js/**/*.js','!public/src/js/app.bundle.js']
        },
        options: {
          transform: ['envify']
        }
      }
    },
    concurrent: {
      dev: {
        tasks: [
          'browserify:dev',
          'watch:sass'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    sass: {
      dev: {
        files: {
          'public/dist/css/app.css': ['public/src/css/app.scss']
        },
        options: {
          outputStyle: 'expanded',
          includePaths: [
            'node_modules'
          ]
        }
      },
      build: {
        files: {
          'public/dist/css/app.css': ['public/src/css/app.scss']
        },
        options: {
          implementation: sass,
          outputStyle: 'compressed',
          includePaths: [
            'node_modules'
          ]
        }
      }
    },
    uglify: {
      build: {
        files: {
          'public/dist/js/app.bundle.js': ['public/src/js/app.bundle.js']
        }
      }
    },
    watch: {
      sass: {
        files: ['public/src/css/**/*.scss'],
        tasks: 'sass:dev'
      }
    }
  });


  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build', ['browserify:build', 'uglify:build', 'sass:build']);
};
