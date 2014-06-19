'use strict';

var jxbapp = angular.module('jxbFrontApp')
.controller('MainCtrl', [
    '$window',
    '$scope',
    'I18n',
    '$stateParams',
    'UrlAdapter',
    function($window, $scope, i18n, $stateParams, urlAdapter) {

        $scope.views = $window._config.views;

        i18n.getI18NResource(function() {
            $window.i18n = $scope.i18n = $.i18n.prop;
        });

        $scope.$on( '$stateChangeSuccess', function( event, current, previous ){
            console.log( $scope );
        });

        urlAdapter.devModeAdapter();
        urlAdapter.localeModeAdapter();
    }
])
.value('duScrollDuration', 0)
.run( [ '$location', '$rootScope', '$http', '$state', '$stateParams', function( $location, $rootScope, $http, $state, $stateParams){

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on( '$stateChangeSuccess', function( event, current, previous ){
        // console.log( $routeParams );

        // get token until online
        if(!$stateParams.offline && !$rootScope.token){
            $http.get('/fronts/get_authenticity_token').success(function(data) {
                var token;
                token = data.replace('while(1);', '');
                if (token === 'false') {
                    return location.href = '/login';
                } else {
                    return $rootScope.token = token;
                }
            });
        }

        // $rootScope.title= _.isUndefined( current.$$route.title ) ? 'MyApp' : current.$$route.title;
    });
}]);

angular.forEach(['x1', 'y1', 'x2', 'y2', 'width', 'height'], function(name) {
  var ngName = 'ng' + name[0].toUpperCase() + name.slice(1);
  jxbapp.directive(ngName, function() {
    return function(scope, element, attrs) {
      attrs.$observe(ngName, function(value) {
        attrs.$set(name, value); 
      })
    };
  });
});