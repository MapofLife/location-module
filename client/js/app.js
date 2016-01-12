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
  'mol.directives',
  //'mol.controllers',
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
    'privacy', //this view contains the bones of the Species Info pages (name, pic, & search bar)
    {
      url: '/about/privacy_policy',
      templateUrl: '/location/assets/partials/privacy_policy.html'
    }
  )
    .state(
      'location',
      {
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
