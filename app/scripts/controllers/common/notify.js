'use strict';

angular.module('jxbFrontApp').controller('NotifyCtrl', [
    '$scope',
    '$window',
    '$timeout',
    'Observer',
    function($scope, $window, $timeout, Observer) {

        var config = $window._config,
            observerKey = config.consts.observerKey,
            notify = config.notify,
            types = notify.types,
            stop;

        $scope.show = false;


        /***********************************************************************
         * publish and subscribe
         **********************************************************************/
        Observer.subscribe(observerKey.EVENT_LOCALE_UPDATE, _pullMessage);


        $scope.stopTimeout = function() {
            _hideAlert();
        };

        function _pullMessage(data) {
            // data -> {type: '', title: '', message: ''}
            if (!types[data.type]) {
                console.log('can not show alert because of having no', data.type, 'type');
            }

            if (stop) {
                // how to do with current pull action when last pull action is still uncomplete?
                return;
                //$timeout.cancel(stop) && (stop = null);
            }

            $scope.show = true;
            $scope.clazz = types[data.type].clazz;
            $scope.title = data.title || types[data.type].title;
            $scope.message = data.message || types[data.type].message;

            stop = $timeout(function() {
                _hideAlert();
            }, alert.timeout);
        }

        function _hideAlert() {
            $scope.show = false;
            stop && $timeout.cancel(stop);
            stop = null;
        }

    }
]);
