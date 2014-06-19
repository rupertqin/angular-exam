'use strict';

angular.module('jxbFrontApp').directive('loading', [
    '$window',
    'Observer',
    function($window, Observer) {
        return {
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div class="loading-icon"></div>' +
                    '<div ng-transclude class="loading-context"></div>' +
                '</div>',
            link: function(scope, element, attrs) {
                element.addClass('loading');
                element.addClass('hide');

                var observerKey = $window._config.consts.observerKey;

                Observer.subscribe(observerKey.EVENT_LOADING_START, function() {
                    element.removeClass('hide');
                });
                Observer.subscribe(observerKey.EVENT_LOADING_END, function() {
                    element.addClass('hide');
                });

            }
        };
    }
]);