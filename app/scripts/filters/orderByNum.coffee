angular.module('jxbFrontApp')
	.filter 'orderByNum', ->
		(answers, field, reverse)->
			newAnswers =[]
			_.each answers, (val, key, obj)->
				blank = 
					id: key
					blanks: val
				newAnswers.push blank
			# newAnswers.sort (a,b)->
			# 	a[field] > b[field]
			newAnswers.reverse() if reverse
			newAnswers

