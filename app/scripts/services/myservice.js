angular.module('myservice', ['ngResource'])
  .factory('Myservice', ['$resource', 
  	function ($resource) {
	    // AngularJS will instantiate a singleton by calling "new" on this function
	    return $resource('json/:name.json', {}, {
	    	query: {method: 'GET', params: {phoneId: 'phones'}}
	    });
  }])
