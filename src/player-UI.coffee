Namespace('Wordguess').UI = do ->

	# Starting animation.
	_fadeInLetters = (guess) ->
		setTimeout ->
			guess.children[0].style.opacity = 1
		, 100
		setTimeout ->
			guess.children[1].style.opacity = 1
		, 300
		setTimeout ->
			guess.children[2].style.opacity = 1
		, 500
		setTimeout ->
			guess.children[3].style.opacity = 1
		, 700
		setTimeout ->
			guess.children[4].style.opacity = 1
		, 900

	setStartAnimation = (guess) ->
		setTimeout ->
			_fadeInLetters(guess)
		, 400

		return this

	fadeIn = (element) ->
		element.style.display = "block"
		setTimeout ->
			element.style.opacity = 1
		, 1

		return this

	fadeOut = (element, time) ->
		element.style.opacity = 0
		setTimeout ->
			element.style.display = "none"
		, time

		return this

	# Replaces words with input boxes and inserts a paragraph into the DOM.
	showNewParagraph = (qset) ->
		# Regular expression to pull sentences out of the full phrase.
		regexSentence = /[a-zA-Z1-9 </>]+[.!?]?/g
		# Regular expression to identify blanks within sentences
		regexBlank = /(<strong>BLANK<\/strong>)/g

		text = qset.paragraph.split(' ')
		readableText = qset.paragraph.split(' ')

		blankCounter = 0
		blankIndices = {}

		# Case 1: The creator chose to automatically hide words.
		if qset.wordsToSkip != -1
			for i in [qset.wordsToSkip..text.length - 1] by (i + 1)
				fix = Wordguess.Logic.replaceText(text[i])
				text[i] = fix.text
				readableText[i] = fix.readable
				if fix.altered
					blankIndices[blankCounter++] = i

		# Case 2: Manual hiding.
		else
			for i in [0..qset.manualSkippingIndices.length - 1]
				index = qset.manualSkippingIndices[i]
				fix = Wordguess.Logic.replaceText(text[index])
				text[index] = fix.text
				readableText[index] = fix.readable
				if fix.altered
					blankIndices[blankCounter++] = index

		# Injects the title.
		if qset.title != "Enter a title here."
			document.getElementById('game-title').innerHTML = qset.title

		# Builds the full screen reader visible instructions to attach to the welcome screen.
		ariaText = 'Welcome to Word Guess. Now playing: ' + qset.title +
			'. You will be presented a paragraph with some words left blank. ' +
			'Fill in the missing blanks with the words you think belong. ' +
			'Use the Tab key to move between blank words. ' +
			'Hold the Control key and press the W key to hear the entire phrase along with the blanks. ' +
			'Hold the Control key and press the T key to hear the sentence that contains the blank you currently have focused. '
			'Press any key to begin.'
		document.getElementById('welcome-page').setAttribute('aria-label', ariaText)

		# Finalize the screen-readable post-substitution phrase and parse sentences out of it.
		readableText = readableText.join(' ')
		sentences = readableText.match(regexSentence)
		sentences = [] unless sentences

		# Go through the sentences and determine which blanks to associate with which sentences.
		# Screen reader users will be able to read out the sentence associated with any given blank.
		blankCounter = 0
		for s in [0..sentences.length - 1]
			sentences[s] = sentences[s].trim()
			blanksInSentence = sentences[s].match(regexBlank)
			continue unless blanksInSentence
			for b in blanksInSentence
				text[blankIndices[blankCounter]] = text[blankIndices[blankCounter]].replace('replace', s)
				blankCounter++

		# Injects the paragraph.
		document.getElementById('game-paragraph').innerHTML = text.join(' ')

		return [readableText, sentences]

	# Highlights input boxes that haven't been filled.
	showEmptyInput = () ->
		inputs = document.getElementById('game-paragraph').getElementsByTagName('input')

		for i in [0..inputs.length-1]
			inputs[i].className = "highlighted quick-anim" unless inputs[i].value != ""

			inputs[i].addEventListener 'blur', ->
				if this.value != "" then this.className = "quick-anim"

	# Gives each page a neat CSS3 exit transition.
	setExitAnimation = (element, i) ->
		document.getElementsByTagName('body')[0].style.background = 'rgba(0,0,0,0)'
		_this = element
		_i     = i
		setTimeout ->
			_this.className = "paper rotated"
		, (_i*100)+50

	# Triggers the exit transition.
	animateExit = (paper) ->
		for i in [0..3]
			setExitAnimation(paper[i], i)

	# Public methods.
	setStartAnimation : setStartAnimation
	fadeIn            : fadeIn
	fadeOut           : fadeOut
	showNewParagraph  : showNewParagraph
	showEmptyInput    : showEmptyInput
	setExitAnimation  : setExitAnimation
	animateExit       : animateExit
