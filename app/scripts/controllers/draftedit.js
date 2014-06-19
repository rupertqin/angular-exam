'use strict';

angular.module('jxbFrontApp').controller('DraftEditCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    function($scope, $http, $stateParams) {

        // urls
        var urls = {
            get : "/courses/" + $stateParams.course_id + "/quizzes/get_original_html?attachment_id=" + $stateParams.attachment_id,
            post : "/courses/" + $stateParams.course_id + "/quizzes/save_original_html?attachment_id=" + $stateParams.attachment_id
        };

        (function init(){

            $http.get(urls.get)
                .success(function(data){
                    $scope.quiz = data;
                    initEditor();
                })
                .error(function(data){

                });
        })();

        $scope.submitQuiz = function(event){

            event.preventDefault();

            var data = {
                content: $scope.quiz
            };

            $http.post(
                    urls.post, 
                    data
                )
                .success(function(id){
                    window.location.href = '/frontend/#/tools/quiz_builder?course_id=' + $stateParams.course_id + '&quiz_draft_id=' + id
                });
        }

        function initEditor(){

            tinyMCE.init({
                selector : 'div.content',
                language : 'zh_CN',
                inline: true,
                menubar : false,
                plugins : [
                    "advlist lists link image charmap print anchor drawing handwrite uploadimage",
                    "searchreplace visualblocks code fullscreen",
                    "insertdatetime media table paste"
                ],
                toolbar : "insertfile undo redo | styleselect | bold italic fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image drawing handwrite uploadimage"

            });
        }


    }
]);
