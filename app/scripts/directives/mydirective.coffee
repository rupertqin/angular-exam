'use strict'

angular.module('jxbFrontApp')
  .directive('myDirective', () ->
    template: '<div></div>'
    restrict: 'E'
    link: (scope, element, attrs) ->
      element.text 'this is the myDirective directive'
  )
