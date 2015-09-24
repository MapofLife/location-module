
var thirdparty = function ($window, name) {
  if($window[name]){
    $window._thirdParty = $window._thirdParty || {};
    $window._thirdParty[name] = $window[name];
    try { delete $window[name]; } catch (e) {$window[name] = undefined;
  }
  var mod = $window._thirdParty[name];
  return mod;
}

angular.module('turfjs',[])
  .factory('turf', function ($window) {
    if($window.turf){
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.turf = $window.turf;
      try { delete $window.turf; } catch (e) {$window.turf = undefined;
      /*<IE8 doesn't do delete of window vars, make undefined if delete error*/}
    }
    var turf = $window._thirdParty.turf;
    return moment;
  });
