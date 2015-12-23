angular.module('mol.region-model-ctrl',[])
  .controller('molRegionModelCtrl',[
    '$scope','$timeout','$state','$filter','MOLSpeciesList','$q','$http','$window',

    function($scope,$timeout, $state,$filter, MOLSpeciesList,$q,$http,$window) {

      $scope.defaults = {
        zoom : {position: 'topright'},
        scrollWheelZoom: true
      }

      $scope.canceller = $q.defer();
      $scope.model = {
          stale : false,
          constraints : {
            palette: "region",
            selected: {
              elevation : [0,8500],
              scaled_ruggedness: [1000,2800],
              ruggedness : [10,600],
              tvz: [1,2,3,4,5,6,7],
              slope: [0,70],
              regions: []
            },
            region: {
              "type": "mountain_region",
              "bounds": {
                "southWest":{"lat":-90,"lng":-180},
                "northEast": {"lat":90,"lng":180}
              }
            }
          },
          statistics : {}
      }




      $scope.removeRegion = function(region) {
          $scope.model.map_constraints.regions =
            $scope.model.map_constraints.regions.filter(
              function(r) {return (r.id!=region.id)}
            );
            $scope.model.selection.regions =
              $scope.model.selection.regions.filter(
                function(r) {return (r.id!=region.id)}
              );
      }
      $scope.removeSelectedRegion = function(region) {
          $scope.model.constraints.selected.regions =
            $scope.model.constraints.selected.regions.filter(
              function(r) {return (r.id!=region.id)}
            );
      }

      $scope.applyConstraints = function() {
        $scope.model.stale = undefined;
        $scope.model.statistics = {};
        $scope.model.constraints.applied =
          angular.extend(
            angular.copy($scope.model.constraints.selected),
              {"palette":angular.copy(
                $scope.model.constraints.palette),"region":
                angular.copy($scope.model.constraints.region)});


      }

      $scope.updateStats = function() {

          $scope.applyConstraints();
          $timeout(
            function() {

              $scope.model.statistics.calculating = true;
              $scope.canceller.resolve();
              $scope.canceller = $q.defer();

              var constraints = angular.extend(
                angular.copy($scope.model.constraints.applied),
                {"palette": $scope.model.constraints.palette,
                 "region": $scope.model.constraints.region});


              $http({
                  "withCredentials": false,
                  "method": "POST",
                  "url": "/location/api/mountain_region/stats",
                  "data": constraints,
                  "timeout" : $scope.canceller.promise,
                  "ignoreLoadingBar":true
              }).then(
                  function(result, status, headers, config) {
                    $scope.model.statistics.calculating = false;
                    angular.extend($scope.model.statistics, result.data);
                }).error(
                  function(result) {
                    $scope.model.statistics.calculating = false;
                  }
                );
              },
              1000);
      }

      $scope.downloadImage = function() {

          var constraints = angular.extend(
            angular.copy($scope.model.constraints.applied),
            {"palette": $scope.model.constraints.palette,
             "region": $scope.model.constraints.region});

          $http({
              "withCredentials": false,
              "method": "POST",
              "url": "/location/api/mountain_region/download",
              "data": constraints,
              "timeout" : $scope.canceller.promise,
              "ignoreLoadingBar":false,
              "headers": {
                    'Content-Type': 'application/json'
                }
          }).then(
              function(result, status, headers, config) {
                $window.open(result.data.url)
            });
      }

      $scope.checkPalette = function() {
        //if($scope.model.constraints.palette==='region'&&$scope.model.constraints.selected.region.type==='global') {
        //  $scope.model.constraints.palette='tvz'
        //}
      }
      $scope.updateMinMax = function() {

          //$scope.model.statistics.calculating = true;
          $scope.canceller.resolve();
          $scope.canceller = $q.defer();

          var constraints = angular.copy($scope.model.constraints.applied);

          $http({
              "withCredentials": false,
              "method": "POST",
              "url": "/location/api/mountain_region/minmax",
              "data": constraints,
              "timeout" : $scope.canceller.promise
          }).then(
              function(result, status, headers, config) {
                //$scope.model.statistics.calculating = false;
                console.log(result.data);
                angular.forEach(
                  result.data,
                  function(val,key) {
                    var metric = key.split('_'), tvz={};
                    if(metric[0]!="tvz") {
                      $scope.model.constraints
                        .selected[metric[0]][(metric[1]==='min')?0:1]=val;
                    } else {
                        angular.forEach(
                          $scope.model.constraints
                            .selected.tvz,
                            function(t,i) {
                              switch(metric[1]) {
                                case 'min':
                                  if(val>t) $scope.model.constraints
                                    .selected.tvz.splice(i,1);
                                  break;
                                case 'max':
                                  if(val<t) $scope.model.constraints
                                    .selected.tvz.splice(i,1);
                                break;
                              }
                            }
                        );
                    }
                  }
                );
            });
      }


      $scope.$watchGroup(
          [function(){return JSON.stringify($scope.model.constraints.selected)},'model.constraints.region.type'],
          function(newValue, oldValue) {
            if(!angular.equals(newValue,oldValue)) {
              console.log("constraints changed")
              console.log(newValue);
              $scope.model.stale = true;
            }
          },
          true
      );
      console.log("view loaded applying constraints")


      $scope.$watch('model.constraints.selected.scaled_ruggedness',
      function(newValue,oldValue){
          if(newValue) {
            $scope.model.constraints.selected.ruggedness[0]=Math.pow(10,$scope.model.constraints.selected.scaled_ruggedness[0]/1000);
            $scope.model.constraints.selected.ruggedness[1]=Math.pow(10,$scope.model.constraints.selected.scaled_ruggedness[1]/1000);
          }
      },true)

      $timeout(  $scope.applyConstraints,1500);

      /* $scope.$watch('model.map_constraints',function(newValue,oldValue){
         if(newValue) if (newValue.region) if(newValue.region != {}){
            // update the $state.params for url if different
            //checkLocationState(newValue, oldValue);
            var taxon = ($scope.model.taxon) ? angular.copy($scope.model.taxon.taxa) : undefined,
              scientificname = ($scope.model.species) ? angular.copy($scope.model.species.scientificname) : undefined;
            $scope.model.taxa = undefined;
            $scope.model.taxon = undefined;
            $scope.model.species = undefined;

           $scope.model.loadingMessage= "" +
              "Searching for species in the "
              "{0} {1} region.".format(newValue.region.name, newValue.region.type);

            MOLSpeciesList.searchRegion(newValue.region).then(
               function(result) {
                  $scope.model.taxa = result.data;
                  angular.forEach(
                     $scope.model.taxa,
                     function(value, index) {
                       if(value.taxa === taxon) {
                         $scope.model.taxon = angular.extend(
                           angular.copy(value),
                           {"species": $filter('taxon')(
                             angular.copy(value.species),
                             $scope.model.map_constraints)
                           });
                       }
                     }
                  );
                  if($scope.model.taxon) {
                    angular.forEach(
                       $scope.model.taxon.species,
                       function(value, index) {
                         if(value.scientificname === scientificname) {
                           $scope.model.species = $filter('species')(angular.copy(value),$scope.model.map_constraints);
                         }
                       }
                    );
                  }
                }
            );
          }
      },true);*/

        /*function checkLocationState(newValue, oldValue) {
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


        if ( $state.params.placename == 'mountain_region') {
                $scope.model.constraints.region = {
                    type: $state.params.placename
                }
        } else {
               MOLApiX('searchregion', {name: $state.params.placename})
                   .then(
                   function(response) {
                       $scope.setRegion(response.data[0]);
                   }
               );
            }
*/

}]);
