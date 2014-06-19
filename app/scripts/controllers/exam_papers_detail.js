'use strict';

angular.module('jxbFrontApp').controller('ExamPapersDetailCtrl', [
    '$rootScope',
    '$scope',
    '$http',
    '$stateParams',
    function($rootScope, $scope, $http, $stateParams) {

        var option_value_ids = $stateParams.option_value_ids.split(',').map(function(x){return parseInt(x)});
        var url = {
            online: '/api/v1/categories/' + $stateParams.category + '/catalogs',
            offline: '/json/exampapers/categories/' + $stateParams.category + '/catalog/' + option_value_ids[0]
        };
        url.current = $stateParams.offline ? url.offline : url.online;

        var pageNum = 1;

        //  pass to parent scope
        $scope.$parent.option_value_ids = option_value_ids;

        $scope.$watch('selectAll', function(flag){
            var boxes = $scope.itemBoxes;
            if(!boxes) return;
            for(var i=0,len=boxes.length;i<len;i++){
                boxes[i].checked = flag;
            }
        });

        $scope.$watch('inSelect', function(value){
            var boxes = $scope.itemBoxes;
            if(!boxes) return;
            for(var i=0,len=boxes.length;i<len;i++){
                boxes[i].checked = !boxes[i].checked;
            }
        });

        $http({
                method: "get",
                // cache: true,
                url: url.current,
                params: {
                    id: $stateParams.id,
                    page: pageNum,
                    option_value_ids: option_value_ids
                }
            })
            .success(function(data){
                $scope.itemBoxes = data;
            });


    }
]);
