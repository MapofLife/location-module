angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','MOLSpeciesList',

    function($scope,MOLSpeciesList) {
      $scope.region = undefined; //the region of interest
      $scope.taxa = undefined; //the list of taxa
      $scope.taxon = undefined; //the selected taxon (species list)
      $scope.species = undefined; //the selected species
      $scope.filters = {"elev" : {min:-500,max:8500}}
      $scope.$watch('region',function(newValue,oldValue){
         if(newValue) {
            MOLSpeciesList.searchRegion(newValue).then(
               function(result) {
                  $scope.taxa = result.data;
               }
            );
          }
      });

}]);
