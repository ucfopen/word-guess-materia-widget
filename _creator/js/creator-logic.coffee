Namespace('Wordguess').CreatorLogic = do ->

	regexWhitespace        = /\n|\s/
	regexTwoOrMoreSpaces   = /\s{2,}/g
	regexNewlineMultiSpace = /\s{2,}|\n/g
	regexNotAlpha          = /[^A-z]/

	wordsToSkip = 3
	hiddenWords = []
	manualSkippingIndices = []
	manuallyHide = off

	resetHiddenWords = ->
		hiddenWords = []

	getHiddenWords = ->
		return hiddenWords

	pushHiddenWord = (word) ->
		hiddenWords.push(word)

	# Return array of hidden words minus the clicked word.
	removeHiddenWord = (word) ->
		$word = $(word)
		hiddenWords = $.grep hiddenWords, (n, i) -> n != ($word.text())

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
		text.replace(/</g, '&lt;').replace(/>/g, '&gt;')

	cleanParagraph = (paragraph) ->
		cleansedParagraph = $.trim(replaceTags(paragraph))
		cleansedParagraph = cleansedParagraph.replace(regexTwoOrMoreSpaces, ' ').split(regexWhitespace)
		return cleansedParagraph

	setUpManualHiding = (paragraph, editable) ->
		manuallyHide = on
		resetHiddenWords()
		paragraph = replaceTags(paragraph.replace(regexTwoOrMoreSpaces, ' ')).split(regexWhitespace)

		for i in [0..paragraph.length - 1]
			paragraph[i] = "<span>#{paragraph[i]}</span>"

		editable.innerHTML = paragraph.join ' '

		Wordguess.CreatorEvents.setManualChoiceEventListeners()

	turnOffManualHiding = ->
		manuallyHide = off

	cleanStringArray = (stringArray) ->
		for i in [0..stringArray.length - 1]
			first = stringArray[i].charAt(0)
			last = stringArray[i].charAt(stringArray[i].length - 1)

			if last.match(regexNotAlpha) != null
				stringArray[i] = stringArray[i].substr(0, stringArray[i].length - 1)
			else if first.match(regexNotAlpha) != null
				stringArray[i] = stringArray[i].substr(1)

		return stringArray

	buildQuestionsAnswers = (paragraph) ->
		questionsAnswers = []
		paragraph = cleanStringArray(paragraph)
		j = 1

		if manuallyHide is on
			for i in [0..manualSkippingIndices.length - 1]
				questionsAnswers.push
					'id'        : 0,
					'type'      : 'QA',
					'questions' :['text': ('word #' + j)],
					'answers'   :['text': paragraph[manualSkippingIndices[i]]]
				j++

		else
			for i in [wordsToSkip..paragraph.length - 1] by (i + 1)
				questionsAnswers.push
					'id'        : 0,
					'type'      : 'QA',
					'questions' :['text': 'word #' + j],
					'answers'   :['text': paragraph[i]]
				j++

		return questionsAnswers

	buildSaveData = (titleValue) ->
		if manuallyHide is on
			manualSkippingIndices = []

			$('#editable span').each (index) ->
				if $(this).hasClass 'manually-selected'
					manualSkippingIndices.push index

			wordsToSkip = -1

		paragraph = cleanParagraph(document.getElementById('paragraph').value)
		questionsAnswers = buildQuestionsAnswers(paragraph)

		return qset =
			'questions_answers'     : questionsAnswers
			'title'                 : replaceTags(document.getElementById('paragraph-title').value)
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
	cleanStringArray      : cleanStringArray
	buildQuestionsAnswers : buildQuestionsAnswers
	buildSaveData         : buildSaveData
	analyzeParagraph      : analyzeParagraph
	setUpManualHiding     : setUpManualHiding
	turnOffManualHiding   : turnOffManualHiding
