'use strict';

angular.module('jxbFrontApp').service('HttpFactory', [
    '$http',
    'storage',
    function($http, storage) {

        this.factory = _factory;
        this.extendAPIKey = _extendAPIKey;

        var config = _config,
            consts = config.consts;

        function _factory(url, method, data) {
            var httpPromise,
                config = {
                    headers: _extendAPIKey()
                };

            if (url && method) {
                httpPromise = (data !== undefined)
                    ? $http[method](url, data, config)
                    : $http[method](url, config);

                return httpPromise;
            }

            return new Error('http factory error');
        }

        function _extendAPIKey(data) {
            var userInfo = store.get(consts.storeKey.USER_INFO);

            return {
                apiKey: userInfo ? userInfo.apiKey : ''
            };
        }

    }
]);
