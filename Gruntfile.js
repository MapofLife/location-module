
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      scripts: {
        files: [
          'client/components/mol/**/component.min.js',
          'client/components/mol/**/component.min.css',
          'client/js/*.js',
          'client/css/*.css'],
        tasks: ['default']
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        mangle: false,
        preserveComments: false
      },
      min: {
        files: {
          "client/app.min.js": [


            //third party components
            "client/components/bower/jquery/dist/jquery.min.js",
            "client/components/bower/angular/angular.min.js",
            "client/components/bower/angular-resource/angular-resource.min.js",
            "client/components/bower/angular-sanitize/angular-sanitize.min.js",
            "client/components/bower/angular-cookies/angular-cookies.min.js",
            "client/components/bower/angular-bootstrap/ui-bootstrap-tpls.min.js",
            "client/components/bower/angular-ui-router/release/angular-ui-router.min.js",
            "client/components/bower/angular-resizable/angular-resizable.min.js",
            "client/components/bower/angular-loading-bar/build/loading-bar.min.js",
            "client/components/bower/lodash/lodash.min.js",
            "client/components/bower/leaflet/dist/leaflet.js",
            "client/components/bower/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js",
            "client/components/bower/angular-leaflet-directive/dist/angular-leaflet-directive.js",
            //mol components
            "client/components/mol/species-list/component.min.js",
            "client/components/mol/species-detail/component.min.js",
            "client/components/mol/species-images/component.min.js",
            "client/components/mol/species-wiki/component.min.js",
            "client/components/mol/loading-indicator/component.min.js",
            "client/components/mol/location-map/component.min.js",
            "client/components/mol/taxa-counts/component.min.js",
            //mol app files
            "client/js/helpers.js",
            "client/js/app.js",
            "client/js/services.js",
            "client/js/location_controller.js",
            "client/js/filters.js",
            "client/js/directives.js",
            "client/views/location/controller.js",

            //app cssmin
            "client/js/app.min.css.js"
          ]
        }
      }
    },
    cssmin : {
      options: {
        report: 'gzip',
        rebase: true,
        root: 'client',
        keepSpecialComments: 0
      },
      combine : {
        files: {
          "client/app.min.css": [
            "client/components/bower/sortable/css/sortable-theme-bootstrap.css",
            "client/components/bower/angular-loading-bar/src/loading-bar.css",
            "client/components/bower/leaflet/dist/leaflet.css",
            "client/components/bower/leaflet.loading/src/Control.Loading.css",
            "client/components/bower/angular-resizable/angular-resizable.min.css",
            "client/views/**/*.css"

          ]
        }
      }
    },
    css2js: {
        compile: {
            src: 'client/css/app.min.css',
            dest: 'client/js/app.min.css.js'
        }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-css2js');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['cssmin','css2js','uglify']);

  grunt.loadNpmTasks('grunt-html2js');

};
