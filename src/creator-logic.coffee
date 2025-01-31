Namespace('Wordguess').CreatorLogic = do ->

	regexWhitespace        = /\n|\s/
	regexTwoOrMoreSpaces   = /\s{2,}/g
	regexNewlineMultiSpace = /\s{2,}|\n/g

	# Regex to match non-letter characters (non-Unicode letters)
	regexNotAlpha = /[^\p{L}]/u

	wordsToSkip = 3
	hiddenWords = []
	hiddenWordsIndices = new Set()
	manualSkippingIndices = []
	manuallyHide = off

	setWordsToSkip = (num) ->
		wordsToSkip = num

	resetHiddenWords = ->
		hiddenWords = []

	resetHiddenWordsIndices = ->
		hiddenWordsIndices = new Set()

	getHiddenWords = ->
		return hiddenWords

	pushHiddenWord = (word, index) ->
		hiddenWords.push(word)
		hiddenWordsIndices.add(index)

	# Return array of hidden words minus the clicked word.
	removeHiddenWord = (word, index) ->

		hiddenWordsIndices.delete(index)

		text = word.innerHTML
		for hidden, i in hiddenWords
			if hidden == text
				hiddenWords.splice i, 1
				return

	# Tell the user they must enter a paragraph to continue.
	noParagraph = (paragraph) ->
		if paragraph.value.split(regexWhitespace).length < 2
			return true

	wordsToSkipUp = (paragraph, numWordsToSkip) ->
		paragraph = cleanParagraph(paragraph)
		if wordsToSkip < paragraph.length - 1
			wordsToSkip++
			numWordsToSkip.innerHTML = wordsToSkip

		return this

	wordsToSkipDown = (numWordsToSkip) ->
		if wordsToSkip > 1
			wordsToSkip--
			numWordsToSkip.innerHTML = wordsToSkip

		return this

	resetWordsToSkip = (paragraph, numWordsToSkip) ->
		if paragraph.value.split(regexWhitespace).length - 1 < wordsToSkip
			wordsToSkip = 1
			numWordsToSkip.innerHTML = 1

		return this

	# Replace tags with their escape characters to prevent XSS attack.
	replaceTags = (text) ->
		text = Materia.CreatorCore.escapeScriptTags(text)

	cleanParagraph = (paragraph) ->
		cleansedParagraph = replaceTags(paragraph).trim()
		cleansedParagraph = cleansedParagraph.replace(regexTwoOrMoreSpaces, ' ').split(regexWhitespace)
		return cleansedParagraph

	setUpManualHiding = (paragraph, editable, previousHiddenWords) ->
		manuallyHide = on
		resetHiddenWords()


		# show previous hidden words chosen by the user
		hiddenWords = previousHiddenWords.slice()

		paragraph = cleanParagraph(paragraph)

		for i in [0..paragraph.length - 1]

			# make span yellow by default if it was previously chosen
			if hiddenWordsIndices.has(i)
				paragraph[i] = "<span data-index='#{i}' class='manually-selected'>#{paragraph[i]}</span>"
			else
				paragraph[i] = "<span data-index='#{i}'>#{paragraph[i]}</span>"

		editable.innerHTML = paragraph.join ' '

		Wordguess.CreatorEvents.setManualChoiceEventListeners()

	turnOffManualHiding = ->
		manuallyHide = off

	removePunc = (string) ->
		# null check
		if string is undefined
			return ''

		for i in [0..string.length - 1]
			first = string.charAt(0)
			last = string.charAt(string.length - 1)

			if last.match(regexNotAlpha) != null
				string = string.substr(0, string.length - 1)
			else if first.match(regexNotAlpha) != null
				string = string.substr(1)

		return string

	buildQuestionsAnswers = (paragraph) ->
		questionsAnswers = []
		j = 1

		if manuallyHide is on
			for i in [0..manualSkippingIndices.length - 1]
				questionsAnswers.push
					'id'        : 0,
					'type'      : 'QA',
					'questions' :['text': ('word #' + j)],
					'answers'   :['text': removePunc(paragraph[manualSkippingIndices[i]])]
				j++

		else
			for i in [wordsToSkip..paragraph.length - 1] by (i + 1)
				questionsAnswers.push
					'id'        : 0,
					'type'      : 'QA',
					'questions' :['text': 'word #' + j],
					'answers'   :['text': removePunc(paragraph[i])]
				j++


		return questionsAnswers

	buildSaveData = ( showAllOtherAnswersBoolean, enableScoring) ->

		if manuallyHide is on and hiddenWordsIndices.size is 0
			saveWarningText = document.getElementById('save-warning-text')
			Wordguess.CreatorUI.showWarningText(saveWarningText)
			return null


		manualSkippingIndices = Array.from(hiddenWordsIndices)

		previousWordsToSkip = wordsToSkip

		if manuallyHide is on
			wordsToSkip = -1


		paragraph = cleanParagraph(document.getElementById('paragraph').value)
		questionsAnswers = buildQuestionsAnswers(paragraph)


		return qset =
			'questions_answers'     : questionsAnswers
			'title'                 : replaceTags(document.getElementById('title').value)
			'paragraph'             : replaceTags(paragraph.join ' ')
			'wordsToSkip'           : wordsToSkip
			'manualSkippingIndices' : manualSkippingIndices
			'options':
				'showAllOtherAnswersBoolean'   : showAllOtherAnswersBoolean
				'enableScoring'                : enableScoring
			'previousWordsToSkip'   : previousWordsToSkip

	analyzeParagraph = (paragraph) ->
		resetHiddenWords()

		paragraph = cleanParagraph(paragraph)

		# prepares hidden words for automatic hiding
		for i in [wordsToSkip..paragraph.length - 1] by (wordsToSkip + 1)
			hiddenWords.push paragraph[i]

	updateHiddenWords = (paragraph, previousHiddenWords) ->
		paragraph = cleanParagraph(paragraph)

		# update hidden words at the same indices and remove indices out of bounds
		sortedHiddenWordsIndices = Array.from(hiddenWordsIndices).sort()

		newHiddenWords = []
		sortedHiddenWordsIndices.forEach (index) ->
			if index < paragraph.length
				newHiddenWords.push(paragraph[index])
			else
				hiddenWordsIndices.delete(index)

		previousHiddenWords = newHiddenWords

	initializeHiddenWords = (manualSkippingIndices, paragraph) ->
		hiddenWordsIndices = new Set(manualSkippingIndices)

		# get the hidden words from the paragraph
		previousHiddenWords = []
		spanChunks = cleanParagraph(paragraph)
		hiddenWordsIndices.forEach (index) ->
			previousHiddenWords.push spanChunks[index]

		# save hidden words
		Wordguess.CreatorEvents.previousHiddenWords = previousHiddenWords.slice()
		hiddenWords = previousHiddenWords.slice()

		return this

	# Public methods.
	resetHiddenWords      : resetHiddenWords
	getHiddenWords        : getHiddenWords
	pushHiddenWord        : pushHiddenWord
	removeHiddenWord      : removeHiddenWord
	cleanParagraph        : cleanParagraph
	replaceTags           : replaceTags
	noParagraph           : noParagraph
	wordsToSkipUp         : wordsToSkipUp
	wordsToSkipDown       : wordsToSkipDown
	resetWordsToSkip      : resetWordsToSkip
	buildQuestionsAnswers : buildQuestionsAnswers
	buildSaveData         : buildSaveData
	analyzeParagraph      : analyzeParagraph
	setUpManualHiding     : setUpManualHiding
	turnOffManualHiding   : turnOffManualHiding
	resetHiddenWordsIndices : resetHiddenWordsIndices
	initializeHiddenWords : initializeHiddenWords
	updateHiddenWords     : updateHiddenWords
	setWordsToSkip        : setWordsToSkip
