module.exports = function (grunt) {
  grunt.initConfig({
    browserify: {
      dev: {
        files: {
          'public/dist/js/app.bundle.js': ['public/src/js/**/*.js']
        },
        options: {
          watch: true,
          keepAlive: true
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
  grunt.loadNpmTasks('grunt-contrib-watch');
};
