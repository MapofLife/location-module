angular.module('mol.controllers')
  .controller('molDetailMapCtrl',
  	["leafletBoundsHelpers","leafletData", "leafletEvents", '$compile',
      '$window','$rootScope','$http','$modal','$scope', '$state', '$filter',
      '$timeout','$location','$anchorScroll','$q', 'MOLServices',
      'GetWiki',
   		function(leafletBoundsHelpers, leafletData, leafletEvents,
         $compile, $window, $rootScope, $http, $modal, $scope, $state, $filter,
          $timeout, $location, $anchorScroll, $q,  MOLServices, GetWiki) {

      $rootScope.$state = $state;
      $scope.visibleDatasets = undefined;


      $scope.$on(
        'cfpLoadingBar:started',
        function() {
          $scope.processing = true;
        }
      );

      $scope.$on(
        'cfpLoadingBar:completed',
        function() {
          $scope.processing = false;
        }
      );


      $scope.map = {
          center: {
            lat: 0,
            lng: 0,
            zoom: 8
          },
          layers: {
              baselayers: {
                  positron: {
                      name: 'Positron',
                      type: 'xyz',
                      url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                      layerOptions: {
                          subdomains: ['a', 'b', 'c'],
                          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                          continuousWorld: false

                      },
                      errorTileUrl: '/app/img/blank_tile.png'
                  }
              },
              overlays: {}
          },
          controls: {
              loading:{
                    separate: true
              }
          },
          options: {
            minZoom:2
          },
          markers: {

          },
          events : {
            map: {
                enable: ['zoomstart','popupopen','resize', 'drag',
                  'click', 'dblclick', 'mousemove','layeradd','overlayadd',
                  'loading','load','viewreset','tileload'],
                logic: 'emit'
            }
          }
        }

      $scope.species = undefined;
      $scope.tilesloaded = true;
      $scope.accessible = true;
      $scope.toggles = {
        applyRefinement : true,
        disableMetrics: true};
      $scope.sidebar_open =true;

      $scope.uncertainty = {
        min:0,max:32000,def:8000};
      $scope.year = {min:1970,max:2015, nulls:false};


      $scope.filters = {
        uncertainty: true,
        years: true,
        limit: true,
        points: 5000
      }

      $scope.$watch('uncertainty',function(newValue,oldValue){
        if(newValue){
          $scope.updateMaps();}
      },true);

      $scope.$watch('year',function(newValue,oldValue){
        if(newValue){
          $scope.updateMaps();}
      },true);

      $scope.$watch('filters',function(newValue,oldValue){
        if(newValue){
          $scope.updateMaps();}
      },true);



      $scope.hideSidebar = function() {
        $scope.sidebar_open = false;
      }
      $scope.showSidebar = function() {
        $scope.sidebar_open = true;
      }

      $scope.cleanURLName = function (name) {
        if(name) {return name.replace(/ /g, '_');}
      }

      $scope.promises = [];

      $scope.canceller = $q.defer();

      $scope.cancelAll = function() {
         $scope.canceller.resolve();
      }

      $scope.updateMaps = function() {
        $scope.stale = true;

      }


      $scope.sizeMap = function () {
        leafletData.getMap().then(
          function(map) {
            map.invalidateSize();
          });
      }

      angular.element($window).bind('resize',$scope.sizeMap);

      $scope.updateMap = function() {

        $scope.sizeMap();
        $scope.removeMarkers();
        $scope.stale = false;
        //$scope.cancelAll();

        $scope.$on("leafletDirectiveMap.resize", function(event, args) {
          scope = event.currentScope;
        });

        $http({
          "withCredentials":false,
          "method":"POST",
          "url":"https://mol.cartodb.com/api/v1/map/named/detail_map_beta",
          "data": {
             "min_year" : ($scope.filters.years)?$scope.year.min:-5555555,
             "max_year" : ($scope.filters.years)?$scope.year.max:5555555,
             "min_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.min:-5555555,
             "max_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.max:5555555,
             "scientificname": $scope.species.scientificname,
             "datasets": $scope.visibleDatasets,
             "null_years":($scope.filters.years)?$scope.year.nulls.toString():true.toString(),
             "default_uncertainty":20000,
             "point_limit": ($scope.filters.limit&&$scope.filters.limit!=undefined)?$scope.filters.points:0,
           }}).success(function(result, status, headers, config) {

        if($scope.species) {

          $scope.tilesloaded=false;


          $scope.species.maps = {
            detail: {
              tile_url: ""+
                "https://{0}/mol/api/v1/map/{1}/{z}/{x}/{y}.png"
                  .format(
                    result.cdn_url.https,
                    result.layergroupid),
              grid_url: ""+
                "https://{0}/mol/api/v1/map/{1}/0/{z}/{x}/{y}.grid.json?callback={cb}"
                  .format(
                    result.cdn_url.https,
                    result.layergroupid),
              key: result.layergroupid,
              attr: '©2014 Map of Life',
              name: 'detail',
              opacity: 0.8,
              type: 'detail'
            }
          }
          $scope.addOverlays();
        }});

      }

      $scope.selected = undefined;
      $scope.wiki = undefined;
      $scope.charts = undefined;

      $scope.toggleLayers = function() {
         $scope.map.showDetailMapType = true;
      }

      $scope.stale = false; //true when controls are out of sync with results


      $scope.loading = false;


      $scope.datasetMetadata = function(dataset) {

         MOLServices(
          'datasetmetadata',
          {
            "dataset_id": dataset.id
          },
          $scope.canceller
        ).then(
          function(results) {
            var modalInstance, metadata = results.data;
            modalInstance = $modal.open({
              templateUrl: '/app/partials/metadata_modal.html',
              controller: function($scope, $modalInstance) {
                  console.log(dataset);
                  var items =[{"collapsed":false,"items":metadata}];
                  $scope.modal = {
                    "title": dataset.title,
                    "items":items
                  };
                  $scope.close = function () {
                    $modalInstance.dismiss('cancel');
                  };
                },
              size: 'lg'
            });

          }
        );

      };


      $scope.typeMetadata = function(type) {

         MOLServices(
          'typemetadata',
          {
            "type_id": type.id
          },
          $scope.canceller,true
        ).then(
          function(results) {
            var modalInstance, metadata = results.data;
            modalInstance = $modal.open({
              templateUrl: '/app/partials/metadata_modal.html',
              controller: function($scope, $modalInstance) {

                  var items =[{"collapsed":false,"items":metadata}];
                  $scope.modal = {
                    "title": type.title,
                    "items":items
                  };
                  $scope.close = function () {
                    $modalInstance.dismiss('cancel');
                  };
                },
              size: 'lg'
            });

          }
        );

      };

      $scope.featureMetadataModal = function(dataset) {
        var modalInstance;

        modalInstance = $modal.open({
          templateUrl: '/app/partials/metadata_modal.html',
          controller: function($scope, $modalInstance) {
              console.log(dataset);
              var items = [],ct=1;
              angular.forEach(
                dataset.features,
                function(feature) {

                  var item = {
                    "title":"{0} record at {1}, {2}".format(
                      dataset.dataset_meta.dataset_title,
                      $filter('lat')(feature.lat),
                      $filter('lon')(feature.lng)
                    ),
                    "collapsed": (ct==1) ? false : true,
                    "items":[]
                  };

                  ct++;
                  angular.forEach(
                    feature.metadata,
                    function(v,k) {
                      item.items.push({"label":k,"value":v});
                    }
                  );
                  items.push(item);
                }
              );

              $scope.modal = {
                "title": dataset.title,
                "items": items
              };
              $scope.close = function () {
                $modalInstance.dismiss('cancel');
              };
            },
          size: 'lg'
        });
      }

      //Get metdata for features on the map
      $scope.getFeatures = function(lat,lng,zoom,scientificname) {

        $scope.removeMarkers = function() {
            $scope.map.markers = {};
        }

        $scope.addFeatureMarker(lat,lng);

          return MOLServices(
            'featuremetadata',
            {
              "scientificname": scientificname,
              "lat": lat,
              "lng": lng,
              "zoom": zoom,
              "datasets":$scope.visibleDatasets,
              "min_year" : ($scope.filters.years)?$scope.year.min:-5555555,
              "max_year" : ($scope.filters.years)?$scope.year.max:5555555,
              "min_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.min:-5555555,
              "max_uncertainty": ($scope.filters.uncertainty)?$scope.uncertainty.max:5555555,
              "scientificname": $scope.species.scientificname,
              "datasets": $scope.visibleDatasets,
              "null_years":($scope.filters.years)?$scope.year.nulls.toString():true.toString(),
              "default_uncertainty":20000,
              "point_limit": ($scope.filters.limit)?$scope.filters.points:0,
            },
            $scope.canceller
          ).then(
            function(results) {

              $scope.map.markers.f.icon.spin = false;
              $scope.map.markers.f.icon.icon = null;
              return results.data;




              //$scope.map.markers.f.message = null;

            }
          );
        };


    /*    $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent){

          // Create the popup view when is opened
          var feature = leafletEvent.leafletEvent.popup.options.feature;

          var newScope = $scope.$new();
          newScope.stream = feature;

          $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);
      })  ;*/

      $scope.addFeatureMarker = function(lat, lng) {
        $scope.map.markers = {
           f: {
               lat: lat,
               lng: lng,
               focus: true,
               compileMessage: true,
               icon: {
                type: 'awesomeMarker',
                prefix:'fa',
                icon: 'refresh',
                spin: true
                }
              }
        };

       };
       $scope.removeMarkers = function() {
           $scope.map.markers = {};
       }


      $scope.unionBounds = function(b1,b2) {
        var b = b1;
        try {
          b.southWest.lat = Math.min(b1.southWest.lat,b2.southWest.lat);
          b.southWest.lng = Math.min(b1.southWest.lng,b2.southWest.lng);
          b.northEast.lat = Math.max(b1.northEast.lat,b2.northEast.lat);
          b.northEast.lng = Math.max(b1.northEast.lng,b2.northEast.lng);
          return b;
        } catch (e) {return b1;}
      }

      $scope.getLayers = function(scientificname) {

        MOLServices(
          'layermetadata',
          {"scientificname" : scientificname, "key" : "0518"},
          $scope.canceller,true
        ).success(function(layers) {

            if(layers == undefined) return;
            $scope.layers = layers;
            $scope.types = {};
            $scope.datasets = {};
            $scope.selectedFeatures = {}
            $scope.species.bounds = null;

            angular.forEach(
              layers,
              function(layer) {
                $scope.datasets[layer.dataset_id] = layer;

                if($scope.types[layer.type]===undefined) {
                  $scope.types[layer.type]={
                    "id": layer.type,
                    "title":layer.type_title,
                    "bounds": layer.bounds,
                    "visible": (layer.type!='regionalchecklist'),
                    "feature_ct":0,
                    "datasets":{}};
                } else {
                  $scope.types[layer.type].bounds =
                    $scope.unionBounds(
                      angular.copy($scope.types[layer.type].bounds),
                      angular.copy(layer.bounds));
                }

                if(layer.type!='regionalchecklist') {
                  $scope.species.bounds = $scope.unionBounds(
                    angular.copy(layer.bounds),
                    angular.copy($scope.species.bounds));
                }



                $scope.types[layer.type].datasets[layer.dataset_id] = {
                  "visible":layer.visible,
                  "id" : layer.dataset_id,
                  "title": layer.dataset_title,
                  "bounds": layer.bounds,
                  "metadata": undefined,
                  "feature_ct": layer.feature_count,
                  "features":[]
                }

                if (layer.type != 'range') {
                  $scope.types[layer.type].feature_ct+=layer.feature_count;
                } else {
                  $scope.types[layer.type].feature_ct++;
                }

                $scope.datasets[layer.dataset_id] = layer;



              }

            );

            $scope.fitBounds($scope.species.bounds);
            $scope.newSpecies = true;
            $scope.updateLayers();


          });
      }


      $scope.$watch(
        "types",
        function(newValue,oldValue) {
          if(newValue) {
            $scope.updateLayers();
            $scope.updateMaps();
          }
          if($scope.newSpecies) {
            $scope.updateMap();
            $scope.newSpecies = false;
          }
        },
        true
      );

      $scope.toggleType = function(type, bool) {
        angular.forEach(
          $scope.types[type].datasets,
          function(dataset) {
            dataset.visible = bool;
          }
        );
      }

      $scope.toggleDataset = function(type) {
        var visible = 0;
        angular.forEach(
          type.datasets,
          function(dataset) {
            if(dataset.visible) {visible++;}
          }
        );
        type.visibleDatasets = visible;
        if (visible == 0) {type.visible = false;}
        else  {type.visible = true;}

        type.partial = (visible < Object.keys(type.datasets).length && visible > 0) ? true : false;

      }

      $scope.selectedLayers = [];
      $scope.updateLayers = function() {
        var datasets = []

        angular.forEach(
          $scope.types,
          function(type) {
            if(type.visible) {
              angular.forEach(
                type.datasets,
                function(dataset) {
                  if(dataset.visible) {
                    datasets.push(dataset.id);
                  }
                }
              );
            }
          }
        );
        $scope.visibleDatasets = datasets.join(',')



      }

      //watch to see when the scientific name changes,
      //then get a new map, new image, and new wiki entries.

      $scope.$watch("species.scientificname", function(newValue, oldValue) {

            $scope.wiki = '';
            //$scope.toggles.sidebarVisible = false;
            $scope.toggles.featuresActive = false;
            $scope.toggles.looking = false;
            $scope.removeOverlays();

            if(newValue != undefined) {

              $state.transitionTo ($state.current, {"scientificname": $scope.cleanURLName(newValue)},
              { location:true, inherit: true, relative: $state.$current, notify: false })
              $scope.types = undefined;
              $scope.getLayers(newValue);


            }
      });


      $scope.toggles ={sidebarVisible:true};
      $scope.toggleSidebar = function(state) {
        $scope.toggles.sidebarVisible=state;
      }

      $scope.featureMetadata = function(result, lat, lng) {
        var hasFeatures = false;
        $scope.toggles.sidebarVisible = true;
        $scope.toggles.featuresActive = true;
        $scope.toggles.looking = false;

        $scope.featuresByType = {};


          angular.forEach(
              result[0].datasets,
              function( features,dataset_id) {
                hasFeatures = true;
                if(!$scope.featuresByType[$scope.datasets[dataset_id].type]) {
                  $scope.featuresByType[$scope.datasets[dataset_id].type] = {
                    "feature_ct": 0,
                    "datasets": {},
                    "title": $scope.types[$scope.datasets[dataset_id].type].title
                  }
                }
                $scope.featuresByType[$scope.datasets[dataset_id].type].feature_ct += features.length;
                $scope.featuresByType[$scope.datasets[dataset_id].type].datasets[dataset_id] = {
                  title: $scope.datasets[dataset_id].dataset_title,
                  latitude: lat,
                  longitude: lng,
                  features : features,
                  feature_ct : features.length,
                  dataset_meta: $scope.datasets[dataset_id]
                }
              }
          );

          if(hasFeatures) {
            $scope.toggles.sidebarVisible = true;
            $scope.toggles.featuresVisible = true;
            $scope.toggles.featuresActive = true;
            //$scope.featureLocation = {lat }
          } else {
            $scope.toggles.featuresVisible = false;
            $scope.toggles.featuresActive = false;
            $scope.parameter = undefined;
            $scope.featureLocation = undefined;
          }

          $http({
            "method":"GET",
            "url":'/app/partials/feature_metadata.html'}).success(
            function(tmpl) {
              $scope.map.markers.f.message = $compile(tmpl);
            }
          );

        }


      $scope.$on("leafletDirectiveMap.click", function(event, args) {
        scope = event.currentScope;
        scope.toggles.looking=true;
        scope.toggles.featuresVisible = true;
        scope.toggles.featuresActive = true;
        scope.featureLocation = {
          latitude: args.leafletEvent.latlng.lat,
          longitude: args.leafletEvent.latlng.lng,
        }
        scope.getFeatures(
          args.leafletEvent.latlng.lat,
          args.leafletEvent.latlng.lng,
          args.leafletObject.getZoom(),
          event.currentScope.species.scientificname).then(
          function(result){
            $scope.toggles.looking=false;
            $scope.featureMetadata(result,
              args.leafletEvent.latlng.lat,
              args.leafletEvent.latlng.lng);
          });
      });

      $scope.addOverlay = function(overlay,type) {


          if($scope.map ) {


            //$scope.map.fireEvent('loading');
            //$scope.processing.push(overlay.tile_url);

            $scope.map.layers.overlays["detail"+Math.random()] = {
              name: 'MOL Detail Map',
              type: 'cartodbInteractive',
              url: overlay.tile_url,
              key: overlay.key,
              host: 'mol',
              layer: '0',
              visible: true,
              layerOptions: {
                  continuousWorld: false,
                  opacity: overlay.opacity,
                  load : function(e){
                    $scope.$emit('cfpLoadingBar:completed');
                    },
                  loading:  function(e){
                    $scope.$emit('cfpLoadingBar:started');

                  }
              },
              refresh: true,
              errorTileUrl: '/app/img/blank_tile.png',


            }

        }
      }
      $scope.getBounds = function(bnds) {
        nbnds = {southwest: {
                latitude: -75,
                longitude: -180
                },
                northeast: {
                    latitude:75,
                    longitude: 180
                }
            };

        if(bnds) {
          nbnds = {southwest: {
                  latitude: bnds.southWest.lat,
                  longitude: bnds.southWest.lng
                  },
                  northeast: {
                      latitude: bnds.northEast.lat,
                      longitude: bnds.northEast.lng
                  }
              };
        }
        return nbnds;

      }

      $scope.toggleSidebar = function() {


      }

      $scope.fitBounds = function(bnds) {
          var nbnds,gbnds;

          if(bnds) {

            $scope.map.bounds = leafletBoundsHelpers.createBoundsFromArray([[bnds.southWest.lat,bnds.southWest.lng],
                    [bnds.northEast.lat,bnds.northEast.lng]]);}


      }

      $scope.$watch("species.bounds", function(newValue, oldValue) {

      });

      $scope.removeOverlays = function() {
        angular.forEach(
          $scope.map.layers.overlays,
          function(overlay,id) {
              delete $scope.map.layers.overlays[id];
          }
        );


      }
      $scope.addOverlays = function() {

        $scope.removeOverlays();

        $scope.sizeMap();

        angular.forEach(
            $scope.species.maps,
              function(overlay, type) {
                if (overlay!=undefined) {
                  $scope.addOverlay(overlay,type)
                };
              }
            );

            $scope.$on('leafletDirectiveMap.utfgridMouseover', function(event, leafletEvent) {
               // the UTFGrid information is on leafletEvent.data
              if(leafletEvent.data.type!="coverage"&&leafletEvent.data.type!="nodata") {
                leafletEvent.target.options.pointerCursor=true;
              } else {
                leafletEvent.target.options.pointerCursor=false;
              }

            });





        }

  }]);
