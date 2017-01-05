//'use strict';

angular.module('mol.controllers',[]);

angular.module('mol', [
  'mol.filters',
  'mol.services',
  'mol.species-images',
  'mol.species-list',
  'mol.species-wiki',
  'mol.species-detail',
  'mol.taxa-counts',
  'mol.location-map',
  'mol.loading-indicator',
  'mol.directives',
  'mol.location-model-ctrl',
  'ui.bootstrap',
  'ui.router',
  'imageHelpers',
  'leaflet-directive',
  'angularResizable',
  'angular-loading-bar',
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
.config(function($stateProvider, $sceDelegateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

  //send cookies
  $httpProvider.defaults.withCredentials = true;

  $urlRouterProvider.otherwise("/location");

  $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'http*://localhost**',
      'http*://127.0.0.1:9001/**',
      'http*://*mol.org/**',
      'http*://api.mol.org/**',
      'http*://mapoflife.github.io/**'
    ]);

  $stateProvider
    .state(
      'location',
      {
        controller: 'molLocationCtrl',
        templateUrl: '/location/assets/views/location/main.html',
        url: '/location',

      }
    )
    .state(
      'location.latlng',
      {
        templateUrl: '/location/assets/views/location/main.html',
        url: '/{lat}/{lng}/:taxa'
      }
    )
    .state(
      'location.place',
      {
        templateUrl: '/location/assets/views/location/main.html',
        url: '/{placename}/:taxa'
      }
    );

    //Gets rid of the # in the querystring. Wont work on IE
    $locationProvider.html5Mode(true);


});
