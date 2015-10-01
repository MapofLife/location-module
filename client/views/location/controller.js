angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','MOLSpeciesList',

    function($scope,MOLSpeciesList) {
      $scope.model =
        {region : undefined, //the region of interest
        taxa : undefined, //the list of taxa
        taxon : undefined, //the selected taxon (species list)
        species : undefined, //the selected species
        filters : {"elev" : {min:-500,max:8500}}};

      $scope.$watch('model.region',function(newValue,oldValue){
         if(newValue) {
            MOLSpeciesList.searchRegion(newValue).then(
               function(result) {
                  $scope.taxa = result.data;
               }
            );
          }
      });

}]);
