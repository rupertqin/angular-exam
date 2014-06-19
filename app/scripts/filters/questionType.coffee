angular.module('jxbFrontApp')
	.filter 'filterQuestionType', ->
		(question_types, question_type, idx)->
			if idx is 0
				question_types
			else 
				_.filter question_types, (type)->
					type.name isnt 'text_only_question'
