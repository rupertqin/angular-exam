'use strict';

angular.module('jxbFrontApp').service('Storage', [
    // dependence inject
    function() {

        this.get = _get;
        this.set = _set;
        this.all = _all;

        var storage = {};

        function _get(key) {
            return storage[key];
        }

        function _set(key, value) {
            storage[key] = value;
        }

        function _all() {
            return storage;
        }

    }
]);
