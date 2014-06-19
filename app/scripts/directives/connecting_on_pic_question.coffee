angular.module('jxbFrontApp').directive 'connectingPic',($document, $timeout, $rootScope)->
	returnObj = 
		templateUrl: 'views/templates/connecting_on_pic_question.html'
		scope: false
		controller : ($scope, $element, $attrs)->
			$container = $element.find('.factory-container')
			containerOffset = {}
			containerW = ''
			containerH = ''
			isDragging = false

			$scope.question.ballGroups = $scope.question.ballGroups or []
			$scope.question.balls = $scope.question.balls or []

			$timeout ->
				containerOffset = $container.offset()
				containerW = $container.width()
				containerH = $container.height()
			, 1000

			$scope.readyBalls = [
				{
					type: 'red'
				}
				{
					type: 'yellow'
				}
			]

			$document.
			on 'click', ->
				_.each $scope.question.balls, (ball)->
					delete ball.active if ball.active
			.on 'dblclick', 'svg line', (event)->
				event.stopPropagation()
				idx = $(this).attr('idx')
				$scope.question.ballGroups.splice idx, 1
				$scope.$apply()

			$element.on 'submit' ,'.upload-image-form', (event)->
				token = $("#ajax_authenticity_token").text()
				event.preventDefault()
				$(this).ajaxSubmit
					clearForm: true
					dataType: 'json'
					headers: {
						'X-CSRF-Token': $rootScope.token
					}
					beforeSubmit: ->
					success: (data)->
						$scope.question.connecting_on_pic_image = data.url
						$scope.$apply()

			if _.isEmpty $scope.question.answers
				maxBall = 
					id: 0
			else
				maxBall = _.max $scope.question.answers, (answer)->
					answer.id

			pairBalls = (ballA, ballB)->
				return false if ballA.type is ballB.type
				pair = if ballB.type is 'yellow' then [ballA.id, ballB.id] else [ballB.id, ballA.id]
				duplicateBall = _.find $scope.question.ballGroups, (group)->
					_.isEqual group, pair
				$scope.question.ballGroups.push pair if _.isEmpty duplicateBall

			updatePosition = (event, ballObj, ball)->
				ball.x = ballObj.offset.left - containerOffset.left
				ball.y = ballObj.offset.top - containerOffset.top

			$scope.startDragging = (ball)->
				isDragging = true

			$scope.deleteBall = (currball)->
				$scope.question.balls = _.reject $scope.question.balls, (ball)->
					currball.id is ball.id
				$scope.cleanLines(currball.id)

			$scope.percentify = (ball)->
				ball.x = (100*ball.x/containerW).toFixed(2)
				ball.y = (100*ball.y/containerH).toFixed(2)


			$scope.onStopDragging = (event, ballObj, currball)->
				updatePosition(event, ballObj, currball)
				if currball.x > containerW or ballObj.offset.left < containerOffset.left or currball.y > containerH or ballObj.offset.top < containerOffset.top
					$scope.deleteBall(currball)


			$scope.cleanLines = (currId)->
				$scope.question.ballGroups = _.reject $scope.question.ballGroups, (pair)->
					_.some pair, (id)->
						currId is id


			$scope.dragOut = (event, ballObj)->
				$scope.highLine = true

			$scope.dragOver = (event, ballObj)->
				$scope.highLine = false

			$scope.indexCoords = (ballId, coord)->
				currball = _.find $scope.question.balls, (ball)->
					ball.id is ballId
				currball[coord] + 13

			$scope.stopPopoverPropagation = (event)->
				event.stopPropagation()


			$scope.deleteImage = (event, clickedball)->
				$scope.question.connecting_on_pic_image = ''

			$scope.triggerBall = (event, clickedball)->
				event.stopPropagation()
				return isDragging = false if isDragging
				activeBall = _.find $scope.question.balls, (ball)->
					ball.active
				if _.isEmpty(activeBall)
					clickedball.active = true
				else if clickedball.active is true
					clickedball.active = false
				else
					pairBalls clickedball, activeBall
					activeBall.active = false

			$scope.cloneBall = (event, ballObj)->
				type = if ballObj.draggable.is('.yellow') then 'yellow' else 'red'
				ball = 
					type : type
					x    : ballObj.offset.left - containerOffset.left
					y    : ballObj.offset.top - containerOffset.top
					id   : maxBall.id + +_.uniqueId()
				$scope.question.balls.push ball




