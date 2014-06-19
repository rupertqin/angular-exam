angular.module('jxbFrontApp').controller('ExamPapersOptionsCtrl', [
    '$rootScope',
    '$scope',
    '$http',
    '$stateParams',
    '$state',
    function($rootScope, $scope, $http, $stateParams, $state) {

        var url = {
            online: '/api/v1/categories/' + $stateParams.category + '/option_types',
            offline: '/json/exampapers/categories/' + $stateParams.category + '/option_types'
        };
        url.current = $stateParams.offline ? url.offline : url.online;

        $scope.filterOptions = function(option_type, chosenId, event){
            event.preventDefault();
            var OptionIds = $scope.option_value_ids;

            //  find siblings' id
            var siblings = _.map(option_type.option_values, function(option_value){
                return option_value.id;
            });

            //  reject siblings
            OptionIds = _.reject( OptionIds, function(id){
                return siblings.indexOf( id ) > -1;
            });

            //  add chosenId
            OptionIds.push( chosenId );

            //  order ids from small to large
            OptionIds = _.sortBy(OptionIds, function( id ){
                return id;
            });

            //  go for target state
            $state.go('examPapers.options.detail', {option_value_ids: OptionIds});
        }

        $scope.checkActive = function(id){
            return $scope.option_value_ids && $scope.option_value_ids.indexOf( id ) > -1
        }

        $http({
                method: "get",
                // cache: true,
                url: url.current
            })
            .success(function(data){
                $scope.option_types = data;
            });

    }
]);
