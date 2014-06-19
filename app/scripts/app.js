'use strict';

angular.module('jxbFrontApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'ngDragDrop',
    'ui.bootstrap',
    'pascalprecht.translate',
    'duScroll',
    'ui.tree',
    'ui.router',
    'exampapers.categories.service',
    'myservice'
])
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    var routers = _config.routers;

    for(var router in routers) {
        $stateProvider.state(router, {
            url: routers[router].url,
            templateUrl: routers[router].view,
            controller: routers[router].ctrl,
            title: routers[router].title
        });
    }

    $urlRouterProvider.otherwise('/homepage');
}])