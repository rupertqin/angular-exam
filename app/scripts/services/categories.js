angular.module('exampapers.categories.service', [

])

// A RESTful factory for retreiving categories from 'categories.json'
.factory('$categories', ['$http', function ($http, utils) {
    var path = '/json/exampapers/categories/index';
    return {
        get: function () {
            return $http.get(path);
        }
    };
}]);