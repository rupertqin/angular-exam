'use strict';

angular.module('jxbFrontApp').controller('ExamPapersCtrl', [
    '$rootScope',
    '$scope',
    '$http',
    '$stateParams',
    function($rootScope, $scope, $http, $stateParams) {

        var url = {
            online: '/api/v1/categories',
            offline: '/json/exampapers/categories/index'
        };
        url.current = $stateParams.offline ? url.offline : url.online;
        
        function appendNode(item,list){
            for(var i = 0,len = list.length;i < len; i++){
                var subList = list[i].items || ( list[i].items = [] );

                if(item.parent_id == list[i].id)
                    subList.push(item);
                else if( !_.isEmpty(subList) )
                    appendNode(item, subList);
            }
        }

        function treeFormat(list){
            var rootBranch = _.filter(list, function(item){
                return item.parent_id === null;
            });

            while(list.length > rootBranch.length){
                var item = list.shift();

                if(item.parent_id === null) 
                    list.push(item);
                else appendNode(item,list);
            }
            return rootBranch;
        }

        $http({
                method: "get",
                // cache: true,
                url: url.current
            })
            .success(function(data){
                $scope.items = treeFormat(data);
            });

        $scope.toggle = function(scope) {
            scope.toggle();
        };


    }
]);
