
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

            //compiled css
            "client/js/app.min.css.js",
            //third party components
            "client/components/bower/jquery/dist/jquery.min.js",
            "client/components/bower/angular/angular.min.js",
            "client/components/bower/angular-resource/angular-resource.min.js",
            "client/components/bower/angular-sanitize/angular-sanitize.min.js",
            "client/components/bower/angular-cookies/angular-cookies.min.js",
            "client/components/bower/angular-bootstrap/ui-bootstrap-tpls.min.js",
            "client/components/bower/angular-ui-select/dist/select.min.js",
            "client/components/bower/angular-ui-router/release/angular-ui-router.min.js",
            "client/components/bower/angular-resizable/angular-resizable.min.js",
            //"client/components/bower/d3/d3.min.js",
            //"client/components/bower/nvd3/nv.d3.min.js",
            //"client/components/bower/angular-nvd3/dist/angular-nvd3.min.js",
            "client/components/bower/angular-rangeslider/angular.rangeSlider.js",
            "client/components/bower/angular-loading-bar/build/loading-bar.min.js",
            "client/components/bower/lodash/lodash.min.js",
            "client/components/bower/leaflet/dist/leaflet.js",
            "client/components/bower/Leaflet.utfgrid/dist/leaflet.utfgrid.js",
            "client/components/bower/leaflet.loading/src/Control.Loading.js",
            "client/components/bower/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js",
            "client/components/bower/angular-leaflet-directive/dist/angular-leaflet-directive.js",
            "client/components/bower/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js",
            "client/components/bower/ng-pageslide/dist/angular-pageslide-directive.min.js",
            //mol components
            "client/components/mol/species-search/component.min.js",
            "client/components/mol/species-list/component.min.js",
            "client/components/mol/species-detail/component.min.js",
            "client/components/mol/species-images/component.min.js",
            "client/components/mol/point-filters/component.min.js",
            "client/components/mol/species-wiki/component.min.js",
            "client/components/mol/loading-indicator/component.min.js",
            "client/components/mol/location-map/component.min.js",
            "client/components/mol/consensus-map/component.min.js",
            "client/components/mol/taxa-counts/component.min.js",
            "client/components/mol/auth/component.min.js",
            //mol app files
            "client/js/helpers.js",
            "client/js/app.js",
            "client/js/services.js",
            //"client/js/species_controller.js",
            "client/js/detail_map_controller.js",
            "client/js/desc_controller.js",
            "client/js/protect_controller.js",
            "client/js/change_controller.js",
            "client/js/refine_controller.js",
            "client/js/consensus_controller.js",
            "client/js/assessment_controller.js",
            "client/js/location_controller.js",
            "client/js/learnmore_controller.js",
            "client/js/filters.js",
            "client/js/directives.js"
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
          "client/css/app.min.css": [
            //"client/components/font-awesome/font-awesome.min.css",
            "client/components/bower/sortable/css/sortable-theme-bootstrap.css",
            "client/components/bower/bootstrap/dist/css/bootstrap.min.css",
            "client/components/bower/angular-ui-select/dist/select.css",
            "client/components/bower/angular-rangeslider/angular.rangeSlider.css",
            "client/components/bower/angular-loading-bar/src/loading-bar.css",
            "client/components/bower/leaflet/dist/leaflet.css",
            "client/components/bower/leaflet.loading/src/Control.Loading.css",
            "client/components/bower/angular-resizable/angular-resizable.min.css",
            "client/css/mol-footer.css",
            "client/css/mol-basic.css",
            "client/css/mol-theme.css",
            "client/css/goog.css",
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
