
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
            "client/components/jquery/dist/jquery.min.js",
            "client/components/angular/angular.min.js",
            "client/components/angular-resource/angular-resource.min.js",
            //"client/components/angular-sanitize/angular-sanitize.min.js",
            "client/components/angular-cookies/angular-cookies.min.js",
            "client/components/angular-bootstrap/ui-bootstrap-tpls.min.js",
            "client/components/angular-ui-select/dist/select.min.js",
            "client/components/angular-ui-router/release/angular-ui-router.min.js",
            "client/components/angular-resizable/angular-resizable.min.js",
            //"client/components/d3/d3.min.js",
            //"client/components/nvd3/nv.d3.min.js",
            //"client/components/angular-nvd3/dist/angular-nvd3.min.js",
            "client/components/angular-rangeslider/angular.rangeSlider.js",
            "client/components/angular-loading-bar/build/loading-bar.min.js",
            "client/components/lodash/lodash.min.js",
            "client/components/leaflet/dist/leaflet.js",
            "client/components/Leaflet.utfgrid/dist/leaflet.utfgrid.js",
            "client/components/leaflet.loading/src/Control.Loading.js",
            "client/components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js",
            "client/components/angular-simple-logger/dist/angular-simple-logger.light.min.js",
            "client/components/angular-leaflet-directive/dist/angular-leaflet-directive.min.js",
            //"client/components/angular-bootstrap-checkbox/angular-bootstrap-checkbox.js",
            //"client/components/ng-pageslide/dist/angular-pageslide-directive.min.js",
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
            "client/components/mol/region-selector/component.min.js",
            "client/components/mol/auth/component.min.js",
            //mol app files
            "client/js/helpers.js",
            "client/js/services.js",
            "client/js/filters.js",
            "client/js/app.js"
          ]
        }
      }
    },
    cssmin : {
      options: {
        report: 'gzip',
        rebase: true,
        root: './',
        keepSpecialComments: 0
      },
      combine : {
        files: {
          "client/css/app.min.css": [
            //"client/components/font-awesome/font-awesome.min.css",
            //"client/components/sortable/css/sortable-theme-bootstrap.css",
            "client/components/bootstrap/dist/css/bootstrap.min.css",
            "client/components/angular-ui-select/dist/select.css",
            "client/components/angular-rangeslider/angular.rangeSlider.css",
            "client/components/angular-loading-bar/src/loading-bar.css",
            "client/components/leaflet/dist/leaflet.css",
            "client/components/leaflet.loading/src/Control.Loading.css",
            "client/components/angular-resizable/angular-resizable.min.css",
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
