Namespace('Wordguess').CreatorLogic = do ->

	regexWhitespace        = /\n|\s/
	regexTwoOrMoreSpaces   = /\s{2,}/g
	regexNewlineMultiSpace = /\s{2,}|\n/g
	regexNotAlpha          = /[^A-z]/

	wordsToSkip = 3
	hiddenWords = []
	hiddenWordsIndices = new Set()
	manualSkippingIndices = []
	manuallyHide = off

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
			console.log i, hidden
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
		hiddenWords = previousHiddenWords

		paragraph = replaceTags(paragraph.replace(regexTwoOrMoreSpaces, ' ')).split(regexWhitespace)

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

	buildSaveData = (titleValue) ->
		if manuallyHide is on
			manualSkippingIndices = []

			editables = document.querySelectorAll('#editable span')
			for edit, i in editables
				if edit.classList.contains 'manually-selected'
					manualSkippingIndices.push i

			wordsToSkip = -1

		paragraph = cleanParagraph(document.getElementById('paragraph').value)
		questionsAnswers = buildQuestionsAnswers(paragraph)

		return qset =
			'questions_answers'     : questionsAnswers
			'title'                 : replaceTags(document.getElementById('title').value)
			'paragraph'             : replaceTags(paragraph.join ' ')
			'wordsToSkip'           : wordsToSkip
			'manualSkippingIndices' : manualSkippingIndices

	analyzeParagraph = (paragraph) ->
		resetHiddenWords()

		paragraph = cleanParagraph(paragraph)

		for i in [wordsToSkip..paragraph.length - 1] by (wordsToSkip + 1)
			hiddenWords.push paragraph[i]

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
