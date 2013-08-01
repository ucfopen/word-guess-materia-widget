Namespace('Wordguess').Engine = do ->
	_qset         = null

	# Initializes the starting game state.
	start = (instance, qset, version = 1) ->
		_qset = qset
		Wordguess.Events
			.setEventListeners()
		Wordguess.UI
			.setStartAnimation(document.getElementById('guess'))
			.showNewParagraph(_qset)

	# Returns user input to Materia to be graded.
	saveAnswers = ->
		$('input').each (i) ->
			Materia.Score.submitQuestionForScoring(_qset.questions_answers[i].id, $(this).val().replace(/</g, '&lt;').replace(/>/g, '&gt;'))

	# Tell's Materia to redirect to the score screen.
	endGame = ->
		if saveAnswers()
			setTimeout ->
				Materia.Engine.end()
			, 800

	# Public methods.
	start       : start
	saveAnswers : saveAnswers
	endGame     : endGame