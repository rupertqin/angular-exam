'use strict';

angular.module('jxbFrontApp').filter('percentage', [
    '$filter',
    function($filter) {
        var exports = function(input) {
            return $filter('number')(input * 100, 1) + '%';
        };

        return exports;
    }
]);
