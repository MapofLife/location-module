angular.module('mol.location-model-ctrl',[])
  .controller('molLocationCtrl',[
    '$scope','$state','$rootScope',

    function($scope,$state,$rootScope) {
      $rootScope.$state = $state;
      $scope.defaults = {
        zoom : {position: 'topright'},
        scrollWheelZoom: true
      }


}]);
