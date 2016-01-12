//'use strict';

angular.module('mol', [
  //mol components
  'mol.filters',
  'mol.services',
  'mol.auth',
  'mol.species-search',
  'mol.species-images',
  'mol.species-list',
  'mol.species-wiki',
  'mol.species-detail',
  //'mol.consensus-map',
  //'mol.point-filters',
  'mol.species-list-service',
  'mol.taxa-counts',
  'mol.location-map',
  'mol.loading-indicator',
  //'mol.consensus-map',
  'mol.region-selector',
  'mol.region-model-ctrl',
  //3rd party components
  'ui.bootstrap',
  'ui.select',
  'ui.router',
  //'ui.checkbox',
  'imageHelpers',
  'ui-leaflet',
  'angularResizable',
  'ui-rangeSlider',
  'angular-loading-bar',
  'percentage',
  'km2',
  //'ngSanitize',
  'ngCookies'
])
.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
  }])
.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
  //send cookies
  $httpProvider.defaults.withCredentials = true;

  //configure routes
  $urlRouterProvider.otherwise("/location/");

  $stateProvider
    .state(
      'location',
      {
        templateUrl: '/location/assets/views/location/main.html',
        controller: 'molRegionModelCtrl',
        url: '/location/',

      }
    );
    /*.state(
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
    );*/
    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);
});
