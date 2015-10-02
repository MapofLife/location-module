angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope', '$state', 'MOLSpeciesList',

    function($scope, $state, MOLSpeciesList) {
      $scope.model =
        {region : undefined, //the region of interest
        taxa : undefined, //the list of taxa
        taxon : undefined, //the selected taxon (species list)
        species : undefined, //the selected species
        filters : {"elev" : {min:-500,max:8500}}};

      $scope.$watch('model.region',function(newValue,oldValue){
         if(newValue) {

             // update the $state.params for url if different
             checkLocationState(newValue, oldValue);

            $scope.model.taxa = undefined;
            MOLSpeciesList.searchRegion(newValue).then(
               function(result) {
                  $scope.model.taxa = result.data;
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
