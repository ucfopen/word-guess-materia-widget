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

		# Case 2: Manual hiding.
		else
			for i in [0..qset.manualSkippingIndices.length - 1]
				index = qset.manualSkippingIndices[i]
				fix = Wordguess.Logic.replaceText(text[index])
				text[index] = fix.text
				readableText[index] = fix.readable

		# Injects the title.
		if qset.title != "Enter a title here."
			document.getElementById('game-title').innerHTML = qset.title

		document.getElementById('welcome-page').setAttribute('aria-label', Wordguess.Engine.helpText())

		# Injects the paragraph.
		document.getElementById('game-paragraph').innerHTML = text.join(' ')

		return readableText.join(' ')

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
