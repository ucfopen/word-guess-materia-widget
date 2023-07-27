Namespace('Wordguess').Engine = do ->
	regexLT  = /</g
	regexGT  = />/g
	escapeLT = '&lt;'
	escapeGT = '&gt;'
	_qset    = null

	# Initializes the starting game state.
	start = (instance, qset, version = 1) ->
		_qset = qset
		[phrase, sentences] = Wordguess.UI
			.setStartAnimation(document.getElementById('guess'))
			.showNewParagraph(_qset)

		Wordguess.Events
			.setEventListeners(phrase, sentences)

	# Returns user input to Materia to be graded.
	saveAnswers = ->
		inputs = document.getElementById('game-paragraph').getElementsByTagName('input')

		for i in [0..inputs.length-1]
			Materia.Score
				.submitQuestionForScoring(
					_qset.questions_answers[i].id,
					inputs[i].value.replace(regexLT, escapeLT).replace(regexGT, escapeGT))

	# Tells Materia to redirect to the score screen.
	endGame = ->
		if saveAnswers()
			setTimeout ->
				Materia.Engine.end()
			, 800

	# Public methods.
	start       : start
	saveAnswers : saveAnswers
	endGame     : endGame
