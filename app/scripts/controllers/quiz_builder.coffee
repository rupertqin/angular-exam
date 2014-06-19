angular.module('jxbFrontApp')
	.controller('QuizBuilderCtrl',  
	['$scope', '$route', '$http', '$modal', '$log', '$location', '$anchorScroll', '$stateParams' , '$window', '$document', '$timeout', 
	( $scope, 	$route,   $http,   $modal,   $log, 	 $location,   $anchorScroll,   $stateParams ,   $window,   $document, 	$timeout) -> 
		$scope.ref = 

			all_status :
				allChecked : 
					show : true
					text : '试卷已全部就绪！'
					alertClass: 'alert-success'
				draft_updated :
					show : true
					text : '试卷已暂存成功，但没有全部就绪，请全部就绪后再提交！'
					alertClass: 'alert-warning'
				fail :
					show : false

			status : 
				show : false

			allChecked : false
			submitBtnDisabled : false
			leavePeace : false

			submitBtn :
				all :
					normal :
						disabled : false
						text : '保存'
					loading :
						disabled : true
						text : '正在生成试卷...'

		urls =
			online :
				get_quiz : '/courses/' + $stateParams.course_id + '/quizzes/get_quiz_draft_data?quiz_draft_id=' + $stateParams.quiz_draft_id
				save_as_draft : '/courses/' + $stateParams.course_id + '/quizzes/save_quiz_draft'
				import_quiz : '/courses/' + $stateParams.course_id + '/quizzes/import_quiz'
			offline :
				get_quiz : 'json/lai.json'
				save_as_draft : '/courses/' + $stateParams.course_id + '/quizzes/save_quiz_draft'
				import_quiz : '/courses/' + $stateParams.course_id + '/quizzes/import_quiz'

		urls = if $stateParams.offline then urls.offline else urls.online

		# init submit button
		$scope.ref.submitBtn.current = $scope.ref.submitBtn.all.normal

		$scope.question_types = [
			{
				name:'multiple_choice_question'
				locale:'单项选择'
			}
			{
				name:'multiple_answers_question'
				locale:'多项选择'
			}
			{
				name:'true_false_question'
				locale:'判断题'
			}
			{
				name:'fill_in_multiple_blanks_question'
				locale:'客观填空'
			}
			{
				name:'multiple_dropdowns_question'
				locale:'下拉匹配'
			}
			{
				name:'fill_in_blanks_subjective_question'
				locale:'主观填空'
			}
			{
				name:'essay_question'
				locale:'主观题'
			}
			{
				name:'text_only_question'
				locale:'出题背景'
			}
			{
				name:'matching_question'
				locale:'左右匹配'
			}
			{
				name:'drag_and_drop_question'
				locale:'拖拽匹配'
			}
			{
				name:'connecting_lead_question'
				locale:'文字连线'
			}
			{
				name:'connecting_on_pic_question'
				locale:'图画连线'
			}
		]

		$window.onbeforeunload = ->
			# offline model don't alarm
			if $scope.ref.leavePeace or $stateParams.offline
				null
			else
				'如果离开，本页面的修改将得不到保存！'

		moveUporDown = (operator)->
			$current_tabtable = $(':focus').parents('.tabtable')
			$tabtables = $('.tabtable')

			idx = $tabtables.index $current_tabtable
			if idx isnt -1
				$tobe_focused = $tabtables.eq(idx + operator).find(':input:first').focus()
			else
				$tobe_focused = $tabtables.eq(0).find(':input:first').focus()

		$($document).keydown (event)->
			switch event.keyCode
				when 37
					console.log event.keyCode
				when 38
					console.log event.keyCode
					event.preventDefault()
					moveUporDown -1
				when 39
					console.log event.keyCode
				when 40
					console.log event.keyCode
					event.preventDefault()
					moveUporDown 1

		initEditor = ->
			tinyMCE.init
				# mode : "none"
				# editor_selector: "nilads"
				# elements : $(event.target).attr('id')
				selector: 'div.question_content'
				language : 'zh_CN'
				inline: true
				menubar : false
				# statusbar : false
				plugins : [
					"advlist lists link image charmap print anchor drawing handwrite uploadimage hr"
					"searchreplace visualblocks code fullscreen"
					"insertdatetime media table paste"
				]
				toolbar : "insertfile undo redo | styleselect | bold italic fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image drawing handwrite uploadimage hr"

		renameProperty = (obj, oldKey, newKey)->
			if obj.hasOwnProperty oldKey
				obj[newKey] = obj[oldKey]
				delete obj[oldKey]
			
		createListAnswers = (questionType)->
			weight = if questionType is 'fill_in_multiple_blanks_question' or
						questionType is 'drag_and_drop_question' or
						questionType is 'fill_in_blanks_subjective_question' then 100 else 0
			empty1 = 
				text: ""
				comments: ""
				weight: weight

			angular.copy empty1, empty2 = {}
			angular.copy empty1, empty3 = {}
			angular.copy empty1, empty4 = {}

			if questionType is 'true_false_question'
				[
					{
						text: "正确"
						comments: ""
						weight: weight
					}
					{
						text: "错误"
						comments: ""
						weight: weight
					}
				]
			else if questionType is 'drag_and_drop_question'
				[empty1]
			else
				[empty1,empty2,empty3,empty4]

		createQuestion = (questionType)->
			newAnswers = createListAnswers questionType
			newQuestion = 
				question_type : questionType
				last_question_type : questionType
				checked : false
				points_possible : 2
				question_text : ''
				solution_content : ''
				answers : newAnswers

		formatPostData = ->
			angular.copy $scope.quiz, newQuizData = {}
			for group in newQuizData.groups

				# set group category
				allGroupQuestions = _.reduceRight group.question_sets, (a, b)->
					a.concat b
					, []
				allGroupQuestions = _.reject allGroupQuestions, (question)->
					question.question_type is 'text_only_question'
				allTheSame = _.every allGroupQuestions, (question)->	
					question.question_type is allGroupQuestions[0].question_type
				group.category = if allTheSame then allGroupQuestions[0].question_type else 'all_question'

				for question_set in group.question_sets
					for question in question_set

						switch question.question_type
							when 'multiple_answers_question'
								for answer in question.answers
									answer.weight = parseInt answer.weight
							when 'multiple_dropdowns_question', 'fill_in_multiple_blanks_question', 'drag_and_drop_question', 'fill_in_blanks_subjective_question'
								newAnswers = []
								for answer in question.answers
									for blank in answer.blanks
										# parseInt weight
										blank.weight = parseInt blank.weight
										blank.blank_id = answer.id
									# concat blanks
									newAnswers = newAnswers.concat answer.blanks
								question.answers = newAnswers
							when 'matching_question'
								matches = []
								for answer,i in question.answers
									matches[i] = {}
									answer.id = matches[i]['matching_id'] = _.uniqueId()
									answer['matching_id'] = matches[i].id = 1000 + +_.uniqueId()
									# matches[i].text = answer['matching_text']
									answer.right = answer['matching_text']
								question.matches = matches
							when 'connecting_lead_question'
								matches = {
									left: [],
									right: []
								}
								for answer,i in question.answers
									leftMatch = matches.left[i] = {}
									rightMatch = matches.right[i] = {}
									answer.text = answer.center
									answer.match_left_id = leftMatch.match_id = 1000 + +_.uniqueId()
									answer.match_right_id = rightMatch.match_id = 1000 + +_.uniqueId()
									leftMatch.text = answer.left
									rightMatch.text = answer.right
									delete answer.weight
								question.matches = matches
							when 'connecting_on_pic_question'
								console.log question.answers
								question.matches = {
									left: [],
									right: []
								}
								newAnswers = []
								for group, i in question.ballGroups
									newAnswers[i] = 
										left: 'ball-' + group[0]
										right: 'ball-' + group[1]
										comments: ''
										match_left_id: +group[0] + 1000
										match_right_id: +group[1] + 1000
									question.matches.left[i] = 
										match_id : +group[0] + 1000
										text : ''
									question.matches.right[i] = 
										match_id : +group[1] + 1000
										text : ''
								question.answers = newAnswers

								connecting_on_pic_position = {}
								for ball, i in question.balls
									# i+1 for preview page
									connecting_on_pic_position[i+1] = 
										x: ball.x
										y: ball.y
										Grey: ball.type is 'red'
										text: ball.text
								question.connecting_on_pic_position = JSON.stringify(connecting_on_pic_position)
							when 'drag_and_drop_question'
								for answer,i in question.answers
									_.extend(answer, answer.blanks[0])
									renameProperty answer, 'id', 'blank_id'

						# generate answer id
						for answer in question.answers
							answer.id = 1000 + +_.uniqueId()
							
			newQuizData

		generateHtml = (data)->
			until _.isObject data
				data = data.replace('while(1);', '')
				data = JSON.parse data
			formatQuizData data
			watchGroups()
				
		watchGroups = ->
			$scope.$watch 'quiz.groups', (newGroups, oldGroups)->
				return false if newGroups is undefined
				flag = true
				for group, i in newGroups
					for question_set, ii in group.question_sets
						for question, iii in question_set

							# validate question
							$scope.validate question

							# as long as  one is false, then all checked is failed
							flag = false if question.checked is false
				angular.copy $scope.ref.all_status, new_all_status = {}
				$scope.ref.status = if flag then new_all_status.allChecked else new_all_status.fail
				$scope.ref.allChecked = flag

			, true

		formatQuizData = (data)->
			for group in data.groups

				# rename property
				renameProperty group, 'questions', 'question_sets'

				# set question points
				group.points_possible = group.score.per_question or 1

				for question_set in group.question_sets
					for question in question_set

						# rename property
						renameProperty question, 'sub_category', 'question_type'
						renameProperty question, 'content', 'question_text'
						renameProperty question, 'solution', 'solution_content'

						if question.question_type is "fill_in_multiple_blanks_question" or
						question.question_type is "drag_and_drop_question" or
						question.question_type is "fill_in_blanks_subjective_question" or
						question.question_type is "multiple_dropdowns_question"

							# format answers structure
							answerObj = _.groupBy question.answers, (answer)->
								answer.blank_id
							question.answers = _.map answerObj, (blanks, id)->
								variable = 
									id: id
									blanks: blanks

			$scope.quiz = data
		
		(init = ->

			# get quiz data
			options =
				method : 'GET'
				url : urls.get_quiz
			$http(options)
				.success (data)->
					generateHtml data

					# redirect url to intelligent_paper if quiz is empty
					if $scope.quiz.groups.length is 0 and $stateParams.offline
						$scope.ref.leavePeace = true
						location.href = '/courses/' + $stateParams.course_id + '/quizzes/intelligent_paper'

					$timeout ->
						initEditor() if not $stateParams.offline
						height = $('#quiz-nav').height()
						$scope.ref.panel =
							height : height
							offset : $('#quiz-nav').offset()
						$('#quiz-nav').css 'height', height
					, 0

			# make alert-popup disappear after seconds
			$scope.$watch 'ref.status', (newStatus, oldStatus)->
				return false until newStatus.show
				_.delay ->
					newStatus.show = false 
					$scope.$apply()
				, 1000 
		)()	
		
		$scope.uploadImage = (question)->
			e.preventDefault();
			$(this).ajaxSubmit
				clearForm: true
				dataType: 'json'

				# add token to header
				headers: {
					'X-CSRF-Token': $rootScope.token
				}
				beforeSubmit: ->
					imageValidated = validateImage( $inputFile.val() )
					$confirm.hide().after($textUploading)if imageValidated
					return imageValidated
				
				success: (data)->
					$img = "<img src=" + data.url + ">"
					$div = $("<div></div>")
					$div.append($img)
					_.defer ->
						editor.execCommand('mceInsertContent', false, $div.html())
					$confirm.show()
					$textUploading.remove()
					imageUploaded()

		$scope.removeGroup = (idx)->
			$scope.quiz.groups.splice idx, 1

		$scope.addGroup = (question)->
			newGroup = 
				question_sets : [
					[
						createQuestion('multiple_choice_question')
					]
				]
			$scope.quiz.groups.unshift newGroup


		$scope.validate = (question)->
			switch question.question_type
				when 'multiple_choice_question', 'multiple_answers_question', 'true_false_question'
					question.checked = _.some question.answers, (answer)->
						parseInt(answer.weight) is 100
				when 'multiple_dropdowns_question'
					question.checked = _.every question.answers, (answer)->
						_.some answer.blanks, (blank)->
							parseInt(blank.weight) is 100
				when 'fill_in_multiple_blanks_question', 'drag_and_drop_question'
					allHasContent = _.every question.answers, (answer)->
						_.some answer.blanks, (blank)->
							blank.text isnt ''
					question.checked = allHasContent and question.answers.length > 0
				when 'essay_question', 'text_only_question', 'fill_in_blanks_subjective_question'
					question.checked = true
				when 'matching_question'
					allHasContent = _.every question.answers, (answer)->
						answer.text and answer.matching_text
					question.checked = allHasContent and question.answers.length > 0
				when 'connecting_lead_question'
					allHasContent = _.every question.answers, (answer)->
						if question.connecting_lead_linesNum == 3
							answer.center and answer.left and answer.right
						else
							answer.center and answer.left
					question.checked = allHasContent and question.answers.length > 0

		$scope.saveContent = (id, question)->
			tinyMCE.execCommand('mceToggleEditor',false,id)
			question.text_visibility = !question.text_visibility

		$scope.chooseRadios = (question, list, cell)->
			for answer in list
				answer.weight = 0
			cell.weight = 100

		$scope.checkboxRequied = (answers)->
			_.every answers, (answer)->
				parseInt(answer.weight) is 0

		$scope.stringify = (obj)->
			JSON.stringify obj
		
		$scope.contentChange = (question)->
			if question.question_type is 'fill_in_multiple_blanks_question' or 
			question.question_type is 'drag_and_drop_question' or 
			question.question_type is 'multiple_dropdowns_question' or 
			question.question_type is 'fill_in_blanks_subjective_question'
				$scope.getTagsFromEd(question) 

		$scope.getTagsFromEd = (question)->
			matches = question.question_text.match /\[[A-Za-z0-9_\-.]+\]/g
			console.log matches

			matches = if matches then matches else []

			newAnswers = []
			for variable, i in matches
				# remove '[]'
				variable = variable.substring 1, variable.length - 1  

				# if exit
				answer = _.find question.answers, (answer)->
					answer.id is variable

				# then create new one
				until answer
					blanks = createListAnswers question.question_type
					answer = 
						id: variable
						blanks: blanks
				newAnswers.push answer

			# set weight
			weight = if question.question_type is "multiple_dropdowns_question" then 0 else 100
			for answers in newAnswers
				for blank in answer.blanks
					blank.weight = weight

			# pass to answers
			question.answers = newAnswers

		

		$scope.changeQuestionType = (question)->

			# reset answers
			switch question.question_type 
				when "multiple_choice_question"
					question.answers = createListAnswers question.question_type
				when "multiple_answers_question"
					question.answers = createListAnswers question.question_type
				when "true_false_question"
					question.answers = createListAnswers question.question_type
				when "multiple_dropdowns_question", "fill_in_multiple_blanks_question", "drag_and_drop_question", "fill_in_blanks_subjective_question"
					$scope.getTagsFromEd question
				when "matching_question",  "connecting_lead_question"
					question.answers = createListAnswers question.question_type
				when "drag_and_drop_question"
					$scope.getTagsFromEd question
				when "connecting_on_pic_question"
					$scope.getTagsFromEd question
				when "text_only_question" then

		$scope.selectQuestionType = (question)->
			if !((question.last_question_type is  "multiple_dropdowns_question" or
			question.last_question_type is  "fill_in_multiple_blanks_question" or
			question.last_question_type is  "drag_and_drop_question" or
			question.last_question_type is  "fill_in_blanks_subjective_question") and 
			(question.question_type is  "multiple_dropdowns_question" or
			question.question_type is  "fill_in_multiple_blanks_question" or
			question.question_type is  "drag_and_drop_question" or
			question.question_type is  "fill_in_blanks_subjective_question")) and !$stateParams.offline

				if confirm '提示：切换题型答案会丢失！'
					$scope.changeQuestionType question, event
				else
					$scope.ref.current_select.el.val $scope.ref.current_select.pre_select_value
					question.question_type = question.last_question_type
			else
				$scope.changeQuestionType question, event

		$scope.beforeSelectChange = (question, event)->
			question.last_question_type = question.question_type
			$scope.ref.current_select = 
				el : $(event.target)
				pre_select_value : $(event.target).val()

		$scope.addChoice = (question)->
			answer = 
				text: ""
				comments: ""
				weight: "0"

			question.answers.push answer
		$scope.delChoice = (question)->
			question.answers.pop()

		$scope.addBlank = (question, key, list)->
			weight = if question.question_type is 'multiple_dropdowns_question' then 0 else 100
			answer = 
				text: ""
				comments: ""
				weight: weight
				blank_id: key

			list.push answer

		$scope.delBlank = (list, idx)->
			list.splice idx, 1

		$scope.removeQuestion = (question_set, idx)->
			if confirm '提示：确认要删除题型吗？'
				question_set.splice idx, 1

		$scope.addQuestion = (question_set, idx)->
			questionType = question_set[idx].question_type
			newQuestion = createQuestion(questionType)
			question_set.splice idx+1, 0, newQuestion

		$scope.submitQuiz = (event)->
			event.preventDefault()
			questionJson = formatPostData()

			data = 
				quiz_draft_data : questionJson
				quiz_draft_id : $stateParams.quiz_draft_id

			# disable button
			$scope.ref.submitBtn.current = $scope.ref.submitBtn.all.loading

			# post to draft
			if !$scope.ref.allChecked

				# alert
				angular.copy $scope.ref.all_status, new_all_status = {}
				$scope.ref.status = new_all_status.draft_updated

			# generate quiz
			else
				$http.post(urls.import_quiz, data).success (callback)->

					# add exeption to onbeforeunload event
					$scope.ref.leavePeace = true

					window.location.href = '/courses/' + $stateParams.course_id + '/quizzes/' + callback.quiz_id

			# save draft every time
			$http.post(urls.save_as_draft, data).success ->
					# enable button
					$scope.ref.submitBtn.current = $scope.ref.submitBtn.all.normal
	])
