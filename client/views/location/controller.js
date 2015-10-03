angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','$state','$filter','MOLSpeciesList',

    function($scope,$state,$filter, MOLSpeciesList) {
      $scope.model = {constraints : {"elev" : {min:-500,max:8500}}};

      /*$scope.$watch('model.constraints',function(newValue,oldValue){
          if(newValue) {
            $scope.model.taxa = $filter('taxa')(angular.copy($scope.model.allTaxa),newValue);
          }
      },true)*/

        $scope.reset = function() {
            $scope.model.region = {};
            $state.transitionTo('location');
        };

      $scope.$watch('model.region',function(newValue,oldValue){
         if(newValue) {

             // update the $state.params for url if different
             checkLocationState(newValue, oldValue);

            $scope.model.taxa = undefined;
            $scope.model.taxon = undefined;
            $scope.model.species = undefined;
            $scope.model.loadingMessage="" +
              "Searching for species in the "
              "{0} {1} region.".format(newValue.name, newValue.type);
            MOLSpeciesList.searchRegion(newValue).then(
               function(result) {
                  $scope.model.taxa = result.data;
                  //$scope.model.filTaxa = $filter('taxa')(angular.copy(result.data),$scope.model.constraints);
               }
            );
          }
      });

        function checkLocationState(newValue, oldValue) {
             if (oldValue && oldValue.lat !== undefined) {
                 if (newValue.lat !== undefined && newValue.lat != oldValue.lat) {
                    setLocationUrlState(newValue);
                 } else if (newValue.id !== undefined) {
                     setLocationUrlState(newValue.name);
                 } else if (newValue.type !== undefined) {
                     setLocationUrlState(newValue.type);
                 }
             } else if (oldValue && oldValue.id !== undefined) {
                 if (newValue.id !== undefined && newValue.id != oldValue.id) {
                    setLocationUrlState(newValue.name);
                 } else if (newValue.lat !== undefined) {
                     setLocationUrlState(newValue);
                 } else if (newValue.type !== undefined) {
                     setLocationUrlState(newValue.type);
                 }
             } else {
                 if (newValue.lat !== undefined) {
                     setLocationUrlState(newValue);
                 } else if (newValue.id !== undefined) {
                     setLocationUrlState(newValue.name);
                 } else if (newValue.type !== undefined) {
                     setLocationUrlState(newValue.type);
                 }
             }

        }
        function setLocationUrlState(value) {
            if (value.lat !== undefined) {
                $state.transitionTo('location.latlng', {
                   lat: value.lat,
                   lng: value.lng
                });
            } else {
                $state.transitionTo('location.place', {
                   placename: value
                });
            }
        }

}]);
