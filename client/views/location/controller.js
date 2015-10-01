angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','MOLSpeciesList',

    function($scope,MOLSpeciesList) {
      $scope.region = undefined;
      $scope.taxa = undefined;
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
