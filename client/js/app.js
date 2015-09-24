//'use strict';

angular.module('mol.controllers',[]);

angular.module('mol', [
  'mol.filters',
  'mol.services',
  'mol.auth',
  'mol.species-search',
  'mol.species-images',
  'mol.species-list',
  'mol.species-wiki',
  'mol.species-detail',
  'mol.consensus-map',
  'mol.point-filters',
  'mol.taxa-counts',
  'mol.location-map',
  'mol.loading-indicator',
  'mol.consensus-map',
  'mol.controllers',
  'ui.bootstrap',
  'ui.select',
  'ui.router',
  'ui.checkbox',
  'imageHelpers',
  'leaflet-directive',
  'angularResizable',
  //'nvd3',
  'ui-rangeSlider',
  'angular-loading-bar',
  'pageslide-directive',
  'percentage',
  'km2',
  'ngSanitize',
  'ngCookies'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    //cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  //send cookies
  $httpProvider.defaults.withCredentials = true;

  $urlRouterProvider.otherwise("/location");

  $stateProvider
   .state(
      'species', //this view contains the bones of the Species Info pages (name, pic, & search bar)
      {
        abstract: true,
        templateUrl: 'app/views/species/main.html'
        //controller: 'molSpeciesCtrl'
      }
    )
    .state(
      'pac',
      {
        abstract: false,
        title: "Species in Reserves",
        templateUrl: 'app/views/species/species-in-reserves/main.html',
        controller: 'molAssessmentCtrl',
        url: '/pa'
      }
    )
    .state(
      'species.not_accessible', //the description page adds wiki text, ed charts, and a map
      {
        title: "Species Information",
        views: {
          "top": {templateUrl: 'app/views/species/not_accessible.html'}
        }
      }
    )
    .state(
      'species.overview', //the description page adds wiki text, ed charts, and a map
      {
        title: "Species Information",
        views: {
          "left_top_1" : {templateUrl:'app/views/species/desc.html'},
          "right_top_1": {templateUrl: 'app/views/species/overview/consensus_map.html'},
          "bottom": {templateUrl: 'app/views/species/overview/ed_charts.html'},
        },
        url: '/species/{scientificname}'
      }
    )
    .state(
      'species.range', //the refine page adds the refine controls, metrics, and a map
      {
        title: "Range Maps",
        views: {
          "left_top_1" : {templateUrl:'app/partials/name.html'},
          "right_top_1": {templateUrl: '/app/partials/map.html'},
          "left_top_2" : {templateUrl: 'app/partials/refine_controls.html'},
          "left_bottom_1" : {templateUrl: 'app/partials/range_metrics.html',controller: 'molRefineCtrl'}
        },
        url: '/species/range/{scientificname}'
      }
    )
    .state(
      'species.habitat', //the change page adds the refine controls, metrics, and change charts
      {
        title: "Habitat Change Analysis",
        views: {
          "left_top_1" : {templateUrl:'app/partials/name.html'},
          "left_top_2" : {templateUrl: 'app/partials/refine_controls.html'},
          "right_top_1":  {
            "templateUrl" : 'app/partials/change_charts.html',
            "controller" : 'molChangeCtrl'
          },
          "left_top_3" : {
            "templateUrl": 'app/partials/habitat_metrics.html'}
        },
        url: '/species/habitat/{scientificname}'
      }
    )
    .state(
      'species.protect', //the change page adds the refine controls, metrics, and change charts
      {
        title: "Protection Status",
        views: {
          "left_top_1" : {templateUrl:'app/partials/name.html'},
          "left_top_2" : { templateUrl : 'app/partials/refine_controls.html'},
          "left_bottom_1" : {templateUrl: 'app/partials/range_metrics.html'},
          "right_bottom_1": {
              "templateUrl": 'app/partials/protect_metrics.html',
              "controller" : 'molProtectCtrl'},
          "right_top_1": {templateUrl: 'app/partials/map.html'}
        },
        url: '/species/protect/{scientificname}'

      }
    )
    .state(
      'detail',
      {
        templateUrl: 'app/views/species/detailed-map/detail_map.html',
        url: '/species/map/{scientificname}',
        controller: 'molDetailMapCtrl'
      }
    )
    .state(
      'location',
      {
        templateUrl: 'app/views/location/main.html',
        url: '/location',

      }
    )
    .state(
      'location.latlng',
      {
        templateUrl: 'app/views/location/main.html',
        url: '/{lat}/{lng}/:taxa'
      }
    )
    .state(
      'location.place',
      {
        templateUrl: 'app/views/location/main.html',
        url: '/{placename}/:taxa'
      }
    );

    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);


});
