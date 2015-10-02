angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','$filter','MOLSpeciesList',

    function($scope,$filter, MOLSpeciesList) {
      $scope.model = {constraints : {"elev" : {min:-500,max:8500}}};

      /*$scope.$watch('model.constraints',function(newValue,oldValue){
          if(newValue) {
            $scope.model.taxa = $filter('taxa')(angular.copy($scope.model.allTaxa),newValue);
          }
      },true)*/

      $scope.$watch('model.region',function(newValue,oldValue){
         if(newValue) {
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

}]);
