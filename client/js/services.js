'use strict';

/* Services */


// Service to get Species Info from CartoDB
var molServices = angular.module('mol.services', ['ngResource']);


molServices.factory( 'MOLServices', ['$http',
	function($http) {
		return function(service, params, canceller, loading) {

			loading = (typeof loading === undefined) ? false : loading;
			return $http({
				method:'GET',
				url: '/api/services/{0}/{1}'.format(
					service,
					params),
				timeout: (canceller) ? canceller.promise : undefined,
				ignoreLoadingBar: loading
				});
		}
	}
]);

molServices.factory( 'MOLApi', ['$http',
	function($http) {
		return function(service, params, canceller, loading) {

			loading = (typeof loading === undefined) ? false : loading;
			return $http({
				method:'GET',
				url: 'https://api.mol.org/0.1/{0}'.format(
					service),
				params: params,
				withCredentials: false,
				cache: true,
				timeout: (canceller) ? canceller.promise : undefined,
				ignoreLoadingBar: loading
				});
		}
	}
]);


molServices.factory(
	'GetWiki',
	[
		'$resource','$q',
		function($resource, $q) {
			return function(name) {
				var abort = $q.defer();
				return $resource(
					'https://api.mol.org/wiki',
					{},
					{
						query: {
							method:'GET',
							params:{
								name: name,
							},
							ignoreLoadingBar: true,
							isArray:false,
							timeout: abort,
							transformResponse : function(data, headersGetter) {
								return JSON.parse(data);
							}

						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetSpeciesList',
	[
		'$resource','$q',
		function($resource, $q) {
			return function(lat,lng,lang) {
				var abort = $q.defer();
				return $resource(
					'https://api.mol.org/counts/{0}/{1}/50000/{2}'
						.format(lat,lng,lang),
					{},
					{
						query: {
							method:'GET',
							params:{},
							ignoreLoadingBar: true,
							isArray:false,
							timeout: abort,
							transformResponse : function(data, headersGetter) {
								return JSON.parse(data);
							}

						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetImages',
	[
		'$resource','$q',
		function($resource,$q) {
			return function(name,size) {
				var abort = $q.defer();

				return $resource(
					'https://api.mol.org/1.0/species/images/list',
					{},
					{
						query: {
							method:'GET',
							origin: '*',
							withCredentials:false,
							params:{
								scientificname: name
							},
							ignoreLoadingBar: true,
							isArray: true,
							timeout: abort,
							transformResponse : function(data, headersGetter) {
								try {
									var result = JSON.parse(data);
									return result[0].images.map(
            			function(v,i){
										v.url = '{0}=s{1}-c'.format(v.url,size)
            				return v
            			});
								} catch (e){
									return undefined;
								}
						}
					}
				}
				);
			}
		}
	]
);

molServices.factory(
	'GetProtectedAreas',
	[
		'$resource','$q',
		function($resource, $q) {
			var abort = $q.defer();

			return function(refineParams) {
				var url = 'https://' +document.location.host + '/api/protect?' + $.param(refineParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/protect',
					{},
					{
						query: {
							method:'GET',
							params: refineParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetRefinedRange',
	[
		'$resource','$q',
		function($resource,$q) {
			var abort = $q.defer();
			return function(refineParams) {

				var url = 'https://' +document.location.host + '/api/refine?' + $.param(refineParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/refine',
					{},
					{
						query: {
							method:'GET',
							params: refineParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'GetHabitatChange',
	[
		'$resource','$q',
		function($resource,$q) {
			var abort = $q.defer();
			return function(changeParams) {
				var url = 'https://' +document.location.host + '/api/change?' + $.param(changeParams);
				$('#debug').html('<a target="debug" href="{0}">{0}</a>'.format(url));
				return $resource(
					'api/change',
					{},
					{
						query: {
							method:'GET',
							params: changeParams,
							timeout: abort,
							isArray: false
						}
					}
				);
			}
		}
	]
);

molServices.factory(
	'loginModal',
	['$modal','$rootScope',
	function ($modal, $rootScope) {

	  function assignCurrentUser (user) {
	    $rootScope.currentUser = user;
	    return user;
	  }

  return function() {
    var instance = $modal.open({
      templateUrl: 'app/partials/molAuth/loginModal.html',
      controller: 'LoginModalCtrl',
      controllerAs: 'LoginModalCtrl'
    })
    return instance.result.then(assignCurrentUser);
  };
}]);
