Namespace('Wordguess').Engine = do ->
	regexLT  = /</g
	regexGT  = />/g
	escapeLT = '&lt;'
	escapeGT = '&gt;'
	_qset    = null

	# Initializes the starting game state.
	start = (instance, qset, version = 1) ->
		_qset = qset
		paragraph  = Wordguess.UI
			.setStartAnimation(document.getElementById('guess'))
			.showNewParagraph(_qset)

		Wordguess.Events
			.setEventListeners(paragraph)

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

	# Builds the full screen reader visible instructions to attach to the welcome screen.
	helpText = ->
		return 'Welcome to Word Guess. Now playing: ' + _qset.title +
			'. You will be presented a paragraph with some words left blank. ' +
			'Fill in the missing blanks with the words you think belong. ' +
			'Use the Tab key to move between blank words. ' +
			'Hold the Control key and press Escape to hear the entire paragraph along with the blanks. ' +
			'Hold the Control key and press Space to hear these instructions again. '
			'Click or press any key to begin.'

	# Public methods.
	start       : start
	saveAnswers : saveAnswers
	endGame     : endGame
	helpText    : helpText
