angular.module('jxbFrontApp').directive 'contenteditable', ($compile)->
	returnObj = 
		restrict : 'A'
		require : '?ngModel'
		link : (scope, element, attrs, ngModel)->
			return if !ngModel

			ngModel.$render = ->
				element.html ngModel.$viewValue

			element.on 'blur keyup change', ->
				# ngModel method
				html = element.html()
				ngModel.$setViewValue html

				# if in quiz builder page
				if scope.contentChange
					scope.contentChange scope.question

				scope.$apply()