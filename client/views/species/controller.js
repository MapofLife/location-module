angular.module('mol.controllers')
  .controller('molSpeciesCtrl',
  	['$rootScope','$http','$modal','$scope', '$state', '$filter','$timeout',
     '$location','$anchorScroll','$q', 'MOLServices','GetWiki',
   		function($rootScope, $http, $modal, $scope, $state, $filter, $timeout,
         $location, $anchorScroll, $q,  MOLServices, GetWiki) {

      $rootScope.$state = $state;
      $scope.accessible = true;
      $scope.status = {processing:false};
      $scope.toggles = {
        applyRefinement : true,
        disableMetrics: true};

      $scope.cleanURLName = function (name) {
        if(name) {return name.replace(/ /g, '_');}
      }


      $scope.promises = [];
      $scope.canceller = $q.defer();

      $scope.cancelAll = function() {
         $scope.canceller.resolve();
      }

      $scope.runAll = function() {
        $scope.stale = false;
        $scope.ready = false;
        $q.all($scope.promises).then(function(data) {
            $scope.stale = false;

            $scope.ready = true;
            $scope.promises = [];
            $scope.updateMaps();
            $scope.toggleLayers();
          });
      }

      $scope.updateMaps = function() {
        var refine = null,
          protect_refined = null,
          protect_expert = null,
            expert=null;
        $scope.infowindow.close();
        try {
          $scope.species.points = $scope.species.refine.points;
        } catch(e) {
          $scope.species.points = undefined;
        }

        try {
          refine = $scope.species.refine.maps.refined;
        } catch(e) {
          refine = undefined;
        }

        try {
          expert = $scope.species.refine.maps.expert;
        } catch(e) {
          expert = undefined;
        }

        try {
          protect_expert = $scope.species.protect.unrefined.maps[0];
        } catch(e) {
          protect_expert = undefined;
        }

        try {
          protect_refined = $scope.species.protect.refined.maps[0];
        } catch(e) {
          protect_refined = undefined;
        }

      $scope.selected = undefined;


      $scope.wiki = undefined;
      $scope.charts = undefined;





      $scope.toggleLayers = function() {

          switch($state.current.name) {
            case 'maps':
              $scope.accessible = true;
              $scope.map.showConsensusMapType = true;
              $scope.map.showRefineCircles = false;
              $scope.map.showProtectMapType = false;
              $scope.map.showRefineMapType = false;
              $scope.map.showExpertMapType = false;
              $scope.map.showLegend = false;
              break;
            case 'info.description':
              $scope.accessible = true;
              $scope.map.showConsensusMapType = true;
              $scope.map.showRefineCircles = false;
              $scope.map.showProtectMapType = false;
              $scope.map.showRefineMapType = false;
              $scope.map.showExpertMapType = false;
              $scope.map.showLegend = false;
              break;
            case 'info.range':
              $scope.map.showConsensusMapType = false;
              $scope.map.showExpertMapType = true;
              $scope.map.showRefineCircles = true;
              $scope.map.showProtectMapType = false;
              $scope.map.showRefineMapType = true;
              $scope.map.showLegend = true;
              break;
            case 'info.protect':
              $scope.map.showConsensusMapType = false;
              $scope.map.showRefineCircles = true;
              $scope.map.showProtectMapType = true;
              $scope.map.showRefineMapType = true;
              $scope.map.showExpertMapType = true;
              $scope.map.showLegend = true;
              break;
            default:
              $scope.map.showConsensusMapType = false;
              $scope.map.showRefineCircles = false;
              $scope.map.showProtectMapType = false;
              $scope.map.showRefineMapType = false;
              $scope.map.showExpertMapType = false;
              $scope.map.showLegend = false;
          }
      }

      $scope.stale = false; //true when controls are out of sync with results



      $scope.loading = false;



      $scope.$watch("species.prefs", function(newValue,oldValue) {
          if(newValue!=undefined) {
              $scope.stale=true;
              $scope.species.prefs.habitats[2]=$scope.species.prefs.habitats[1];
              $scope.species.prefs.habitats[3]=$scope.species.prefs.habitats[1];
              $scope.species.prefs.habitats[4]=$scope.species.prefs.habitats[1];
              $scope.species.prefs.habitats[5]=$scope.species.prefs.habitats[1];
          }
          $scope.stale=true;

      }, true);




     //Here be dragons .... look for ways to split into individual controllers.
     $scope.status = [];

     $scope.updatePrefs = function() {
        if ($scope.species.prefs) {
          //Convert habitat bool array to a list of index numbers (habitat codes)
          var habitats = $scope.species.prefs.habitats.map(
                function(v,i){if(v){return (i==0) ? "0": i}}
              ).filter(function(d){return d}).join(","),
            params = angular.extend(
              angular.copy($scope.species.prefs),{"habitats":habitats}),
            unrefined_params = {
              use_f : false,
              use_e : false,
              use_h : false,
              mode : 'unrefined',
              ee_id : params.ee_id,
              scientificname : params.scientificname,
              bounds : params.bounds
            };
            $scope.prefs = {'refined': params, 'unrefined': unrefined_params};
            $scope.species.refine = {};
            $scope.species.protect ={};
            $scope.species.maps = {};

            return $scope.prefs;
          } else {
            if(
              $state.current.name in {
                'info.protect':'',
                'info.change':'',
                'info.habitat':'',
                'info.range':''}) {
            $state.transitionTo('info.not_accessible');
            }
          }
      }


      //watch to see when the scientific name changes,
      //then get a new map, and new wiki entries.

      $scope.$watch("species.scientificname", function(newValue, oldValue) {

            $scope.wiki = '';

            if(newValue != undefined) {
              $state.transitionTo(
                $state.current,
                {"scientificname": $scope.cleanURLName(newValue)});




                GetWiki(newValue).query(
                  function(wiki) {
                    $scope.wiki = wiki;
                  }
                );
                if(!$scope.species.prefs && $state.current.name in {
                    'info.protect':'',
                    'info.change':'',
                    'info.habitat':'',
                    'info.range':''}) {
                $state.transitionTo('info.not_accessible');}
                $scope.updatePrefs();
            }
      });


      $scope.infowindow = new google.maps.InfoWindow();
      $scope.initMap = function() {

        $scope.initialLoad = true;

        $scope.map = {
              bounds : $scope.getBounds($scope.species.bounds),
              center: {latitude:0,longitude:0},
              zoom: 0,
              control: {},
              options: {
                  streetViewControl: false,
                  panControl: false,
                  maxZoom: 10,
                  minZoom: 1,
                  styles: styles,
                  mapTypeControlOptions: {}
              },
              grids: {'protect_refined':{},
                'protect_expert':{}},
              maptypes: {
                'consensus': angular.extend(angular.copy(defaultMapType),{"id":"consensus"}),
                'refine':  angular.extend(angular.copy(defaultMapType),{"id":"refine"}),
                'expert':  angular.extend(angular.copy(defaultMapType),{"id":"expert"}),
                'protect_expert': angular.extend(angular.copy(defaultMapType),{"id":"protect_expert"}),
                'protect_refined': angular.extend(angular.copy(defaultMapType),{"id":"protect_refined"})},
              showOverlay: true,
              showConsensusMapType: false,
              showRefineMapType: false,
              showRefineCircles: false,
              showProtectMapType: false,
              refresh: {
                consensus: false,
                refine: false,
                expert: false,
                protect_expert: false,
                protect_refined: false
              },
              overlays: [],
              circles: [],
              events: {
                  click: function(map, eventName, event) {
                      var i, grid, key, keyStr, value, zoom = map.getZoom(), numTiles = 1 << zoom,
                      projection = new MercatorProjection(),
                      worldCoordinate = projection.fromLatLngToPoint(event[0].latLng),
                      pixelCoordinate = new google.maps.Point(
                      worldCoordinate.x * numTiles,
                      worldCoordinate.y * numTiles),
                      tileCoordinate = new google.maps.Point(
                        Math.floor(pixelCoordinate.x / 256),
                        Math.floor(pixelCoordinate.y / 256)),
                      gridCoordinate = new google.maps.Point(
                        Math.floor((pixelCoordinate.x - tileCoordinate.x*256)/4),
                        Math.floor((pixelCoordinate.y - tileCoordinate.y*256)/4));

                      if($scope.toggles.applyRefinement) {
                        grid = $scope.map.grids.protect_refined;
                      } else {
                        grid = $scope.map.grids.protect_expert;
                      }


                    try {
                      i = grid[zoom][tileCoordinate.x][tileCoordinate.y]
                            .grid[gridCoordinate.y].charCodeAt(gridCoordinate.x);

                      //decode the UTF code per UTF-grid spec
                      //https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md
                      if(i>=93) {i--};
                      if(i>=35) {i--};
                      i-=32;
                      key = grid[zoom][tileCoordinate.x][tileCoordinate.y].keys[i]

                      value = grid
                          [zoom][tileCoordinate.x][tileCoordinate.y]
                            .data[key];
                      if (value) {
                        /* Sorry Angular! */
                        var tmpl = '' +
                          '<div style="max-width: 400px;'+
                            'line-height: normal;'+
                            'white-space: nowrap;'+
                            'overflow: auto;">'+
                            '<div>{0}</div>' +
                            '<div>IUCN Category {1} {2}</div>' +
                          '</div>',
                          content = tmpl.format(
                            value.name,
                            value.iucn_cat,
                            (value.cat === 'strict') ? '(Strict)': '');
                        $scope.infowindow.setOptions({
                          content: content,
                          position: event[0].latLng
                        });
                        $scope.infowindow.setMap(map);
                        if(!$scope.infowindow.isOpen()) {
                          $scope.infowindow.open();
                        }

                      } else {
                        $scope.infowindow.close();

                      }
                    } catch(e) {}
                  },
                  mousemove: function(map, eventName, event) {
                   var i, key, grid, value, zoom = map.getZoom(),
                      numTiles = 1 << zoom,
                      projection = new MercatorProjection(),
                      worldCoordinate = projection.fromLatLngToPoint(event[0].latLng),
                      pixelCoordinate = new google.maps.Point(
                      worldCoordinate.x * numTiles,
                      worldCoordinate.y * numTiles),
                      tileCoordinate = new google.maps.Point(
                        Math.floor(pixelCoordinate.x / 256),
                        Math.floor(pixelCoordinate.y / 256)),
                      gridCoordinate = new google.maps.Point(
                        Math.floor((pixelCoordinate.x - tileCoordinate.x*256)/4),
                        Math.floor((pixelCoordinate.y - tileCoordinate.y*256)/4));

                      if($scope.toggles.applyRefinement) {
                        grid = $scope.map.grids.protect_refined;
                      } else {
                        grid = $scope.map.grids.protect_expert;
                      }


                    try {
                      i = grid[zoom][tileCoordinate.x][tileCoordinate.y]
                            .grid[gridCoordinate.y].charCodeAt(gridCoordinate.x);
                      //decode the UTF code per UTF-grid spec
                      //https://github.com/mapbox/mbtiles-spec/blob/master/1.1/utfgrid.md
                      if(i>=93) {i--};
                      if(i>=35) {i--};
                      i-=32;
                      key = grid[zoom][tileCoordinate.x][tileCoordinate.y].keys[i]

                      value = grid
                          [zoom][tileCoordinate.x][tileCoordinate.y]
                            .data[String(key)];
                      if (value) {
                        map.setOptions({ draggableCursor: 'pointer' });
                      } else {
                        map.setOptions({ draggableCursor: 'default' });

                      }
                    } catch(e) {}
                  },
                  tilesloaded: function(map, eventName, originalEventArgs) {
                      $scope.$apply(function () {
                        if($scope.initialLoad) {
                          $rootScope.mapInstance = map;
                          $scope.fitBounds($scope.species.bounds);
                          $scope.updateMaps();
                          $scope.toggleLayers();
                          $scope.initialLoad = false;
                        }
                      });

                  }
              }
        };

        $scope.updateMaps();


      }

      function getTileUrl(c,z,d,o) {
          var u = '/app/img/blank_tile.png',
            x = c.x, y = c.y;
          if (o && c.y < Math.pow(2,z) && c.y >= 0) {
            u = o.tile_url;
            while(x < 0) {x += Math.pow(2,z);}
            while(x>= Math.pow(2,z)) {x-=Math.pow(2,z);}
            u = u.replace('{z}',z).replace('{x}',x).replace('{y}',c.y);
          }
          return u;
        }

      function getGridUrl(c,z,d,o) {
          var u = null,
            x = c.x, y = c.y;
          if (o && c.y < Math.pow(2,z) && c.y >= 0) {
            u = o.grid_url;
            while(x < 0) {x += Math.pow(2,z);}
            while(x>= Math.pow(2,z)) {x-=Math.pow(2,z);}
            u = u.replace('{z}',z).replace('{x}',x).replace('{y}',c.y);
          }
          return u;
        }

      $scope.addOverlay = function(overlay,type) {

          if($scope.map) {

          $scope.map.grids[type] ={};

          $scope.tiles = {};

          $scope.map.maptypes[type] = {
              getTile : function (c,z,d) {
                var img = document.createElement('img'),
                  tile_url = getTileUrl(c,z,d,this.overlay),
                 grid_url, grid = $scope.map.grids[type];

                  try{
                    if(this.overlay.grid_url) {
                      grid_url = getGridUrl(c,z,d,this.overlay);
                      if(!grid) {grid = {}}
                      if(!grid[z]) {grid[z]={}};
                      if(!grid[z][c.x]) {grid[z][c.x]={}};
                      if(!grid[z][c.x][c.y]) {
                        $http.get(grid_url)
                          .success(
                            function(data, status, headers, config) {
                              grid[z][c.x][c.y] = data;
                            }
                          );
                        }
                    }
                  } catch (e){}


                img.style.opacity = this.opacity;
                img.width=this.tileSize.width;
                img.height=this.tileSize.height;


                img.onload = function(e) {
                  delete $scope.tiles[tile_url];
                  if (Object.keys($scope.tiles).length<5) {

                    $scope.$emit('cfpLoadingBar:completed');
                  }
                }
                img.onerror = function(e) {
                  delete $scope.tiles[tile_url];
                  if (Object.keys($scope.tiles).length<5) {

                    $scope.$emit('cfpLoadingBar:completed');
                  }
                }

                $scope.$emit('cfpLoadingBar:started');
                $scope.tiles[tile_url] = "loading";

                img.src = tile_url;
                return img;

              },
              tileSize: new google.maps.Size(256, 256),
              name: overlay.type,
              overlay: overlay,
              id: type,
              opacity: overlay.opacity,
              maxZoom: 10
          }


        $scope.map.refresh[overlay.type] != $scope.map.refresh[overlay.type];
      }
      }

      $scope.getBounds = function(bnds) {
        var nbnds = {southwest: {
                latitude: bnds.southWest.lat,
                longitude: bnds.southWest.lng
                },
                northeast: {
                    latitude: bnds.northEast.lat,
                    longitude: bnds.northEast.lng
                }
            };
        return nbnds;
      }

      $scope.fitBounds = function(bnds, tilesLoaded) {
          var nbnds = {southwest: {
              latitude: bnds.southWest.lat,
              longitude: bnds.southWest.lng
              },
              northeast: {
                  latitude: bnds.northEast.lat,
                  longitude: bnds.northEast.lng
              }},
              gbnds;


            $scope.map.bounds = nbnds;
            if($rootScope.mapInstance) {
                gbnds = new google.maps.LatLngBounds(
                  new google.maps.LatLng(bnds.southWest.lat,bnds.southWest.lng),
                  new google.maps.LatLng(bnds.northEast.lat,bnds.northEast.lng)
                );
              $rootScope.mapInstance.fitBounds(gbnds);
            }
            $scope.toggleLayers();

      }

      $scope.$watch("species.bounds", function(newValue, oldValue) {
          if(newValue != undefined) {
            $scope.initMap();
          }
      });


      $scope.addOverlays = function() {
        angular.forEach(
              $scope.species.maps,
              function(overlay, type) {
                if (overlay!=undefined) {
                  $scope.addOverlay(overlay,type)
                };
              }
            );
      }

      /*$scope.$watch("species.updateMaps", function (newValue, oldValue) {
          if(newValue != undefined) {
            angular.forEach(
              $scope.species.maps,
              function(overlay, type) {
                if (overlay!=undefined) {
                  $scope.addOverlay(overlay,type)
                };
              }
            );
          }
      },true);*/
        $scope.$watch("species.points", function (newValue, oldValue) {
            if (newValue != undefined) {

                var i=0;
                var circles = [];
                newValue.forEach(
                    function(point) {

                        if (point[3] > 0 && point[3] < 3) {
                            var circle = {
                                id: ++i,
                                clickable: false,
                                draggable: false,
                                center: {
                                    latitude: point[0],
                                    longitude: point[1]
                                },
                                radius: point[2],
                                stroke: {
                                    color: '#c0392b',
                                    weight: 2,
                                    opacity: 1
                                },
                                fill: {
                                    color: '#c0392b',
                                    opacity: 0.5
                                }
                            };

                            if (point[3] == 2) {
                                circle.stroke.color = '#3498db';
                                circle.fill.color = '#3498db';
                            }

                            circles.push(circle);
                        }
                    }
                );
                $scope.map.circles = circles;
            }
        });


            $scope.fullmap = false;
            $scope.toggleMap = function() {
                $scope.fullmap = !$scope.fullmap;
                $timeout(function() {
                    $scope.map.control.refresh();
                }, 10);
            };


            /** help modal **/
            $scope.learnMore = function () {

             var modalInstance = $modal.open({
                templateUrl: '/app/partials/learn_more.html',
                controller: 'molLearnMoreCtrl',
                size: 'lg',
                resolve: {
                  items: function () {
                    return $scope.items;
                  }
                }
              });
            }


            /** start of tooltips **/

            /* refine */
            $scope.tt_hab_asst_short = 'Select suitable habitat conditions for this species. ' +
            'Default is current expert opinion';

            $scope.tt_hab_asst_long = 'Your selections for suitable habitats are combined with ' +
            'high-resolution remotely sensed information on local habitat conditions that is summarized ' +
            'at 1km spatial resolution. Elevation is based on the GTOPO30 product, originally in ca. 1km ' +
            'resolution. Tree Cover information is derived from an originally 30m resolution Landsat product ' +
            '(Hansen et al., Science 342: 850-853) and land cover from the MODIS MCD12Q1 product ' +
            '(Friedl et al. 2010; RSE 114:168-182), and both are aggregated over 2000/2001-2012. Expert ' +
            'opinion from the literature or IUCN Red List assessments is used to inform default selections ' +
            'for suitable habitat conditions.';

            $scope.tt_rerun_button = 'Apply your changes';

            $scope.tt_elevation = 'Mean elevation of 1km pixel';

            $scope.tt_tree_cover = 'Average percent of 1km pixel with vegetation taller than 5m (Landsat, 30m)';

            $scope.tt_land_cover = 'Dominant land cover type in at least a quarter of a 1 km ' +
            'pixel (MODIS 2001-2012, 500m)';

            $scope.tt_woodlands = "Canopy cover of trees (>2m) is >60% ('Forest') or >30% ('Woody Savannas')";

            $scope.tt_shrublands = "Woody vegetation <2m, including shrubby crops, " +
            "covering most ('Closed') or some ('Open') land";

            $scope.tt_herbaceous = "Herbaceous vegetation with very few ('Grasslands') or some ('Savannas') trees";

            $scope.tt_cultivated = "Temporary crops that cover most or part of the area ('Mosaics')";

            $scope.tt_barren = 'Exposed soil, sand, rocks, snow; always < 10% vegetated';

            $scope.tt_urban = 'Land covered by buildings and other man-made structures';

            $scope.tt_water = "Mixture of water and vegetation ('Wetlands') or oceans, seas, " +
            "lakes, rivers ('Water bodies').";

            /* Geographic distribution */
            $scope.tt_geo_dist = 'Range size characteristics and improvements in distribution estimate ' +
            'from currently selected habitat associations.';
            $scope.tt_range_size = 'Area covered by total (suitable + unsuitable) or suitable range ' +
            'given habitat selection.';

            /* protect */
            $scope.tt_pac_short = 'Provides the maximum number and area of reserves ' +
            'that overlap with the species’ potential total or suitable distribution, ' +
            'as selected in Habitat Associations, and progress toward a conservation ' +
            'target. <br /><b>Note</b>: Species typically occur in much fewer areas than these ' +
            'distributions suggest and observed coverage may be much smaller.';

            $scope.tt_pac_long = 'An intersection with the World Protected Area Database (version x) ' +
            'is performed in 1km resolution. Only reserves designated at the national level are included (total xxx).';

            $scope.tt_strict_parks = 'Parks with IUCN category Ia, Ib, II, III';

            $scope.tt_all_parks = 'All parks  designated at the national level';

            $scope.tt_all_parks_area = 'Total non-overlapping area covered by All parks';

            $scope.tt_target_area = 'For species <1,000km2 equals range size, for those >250,000km2 equals ' +
            '10% of range size. For species with range sizes in between the target is a log-linear ' +
            'interpolation of these two area values.';

            $scope.tt_target_realized = 'All parks area in relation to Target area. Note that the observed ' +
            'species ‘All parks area’ is likely much smaller than the estimated maximum value, so percent ' +
            'of target realize may be much lower.';

            $scope.tt_min_reserve_size = 'Select the minimum park size.';

            $scope.tt_learnmore_button = 'Learn how to use this tool.'


            /** end of tooltips **/

  }]);
