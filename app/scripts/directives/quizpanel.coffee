angular.module('jxbFrontApp').directive 'quizPanel',($document)->
	returnObj = 
		link : (scope, el, attrs)->
			$well = el.find '.inner'
			$($document).scroll ->
				curScrollTop = $(this).scrollTop()

				# scroll down animate start
				if scope.ref.panel and curScrollTop >= scope.ref.panel.offset.top
					$well.css
						position: 'fixed'
						top: '0'

				# scroll out of document
				else if curScrollTop < 0
					$well.css
						position: 'fixed'
						top: (curScrollTop*1) + scope.ref.panel.offset.top

				# default
				else
					$well.css
						position: 'static'