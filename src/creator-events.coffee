Namespace('Wordguess').CreatorEvents = do ->
	# Divs:
	editRegion        = null
	paragraphTextarea = null
	editable          = null
	hiddenWords       = null
	hiddenWordsBox    = null
	option2           = null
	option1           = null

	# Buttons:
	numUp          = null
	numDown        = null
	numWordsToSkip = null
	nextButton     = null
	backButton     = null
	resetButton    = null
	showAllResponsesDiv = null
	showAllResponsesInput = null
	showAllResponsesLabel = null
	enableScoringDiv = null
	enableScoringInput = null
	enableScoringLabel = null
	autoHide       = null
	manHide        = null

	# Inputs:
	title          = null
	paragraphTitle = null
	wordsToSkipBox = null

	# Information divs:
	noParagraph         = null
	goBack              = null
	manuallySelectInfo  = null

	warningText = null
	saveWarningText = null

	infoBubbles = null
	bigInfo    = null

	manuallyHide = off
	animating    = false
	menu         = 1
	mode 	     = 'automatic'

	# Previous state of manual hidden words
	previousHiddenWords = []

	cacheElements = ->
		# Divs:
		editRegion        = document.getElementById('edit-region')
		paragraphTextarea = document.getElementById('paragraph')
		editable          = document.getElementById('editable')
		hiddenWords       = document.getElementById('hidden-words')
		hiddenWordsBox    = document.getElementById('hidden-words-box')
		options           = document.getElementById('options')

		# Buttons:
		numUp          = document.getElementById('num-up')
		numDown        = document.getElementById('num-down')
		numWordsToSkip = document.getElementById('num-words-to-skip')
		nextButton     = document.getElementById('next')
		showAllResponsesDiv = document.getElementById('showAllResponsesDiv')
		showAllResponsesInput = document.getElementById('showAllResponsesInput')
		showAllResponsesLabel = document.getElementById('showAllResponsesLabel')
		enableScoringDiv = document.getElementById('enableScoringDiv')
		enableScoringInput = document.getElementById('enableScoringInput')
		enableScoringLabel = document.getElementById('enableScoringLabel')
		backButton     = document.getElementById('back')
		resetButton    = document.getElementById('reset')
		autoHide       = document.getElementById('auto-hide')
		manHide        = document.getElementById('man-hide')

		# Inputs:
		title          = document.getElementById('title')
		wordsToSkipBox = document.getElementById('words-to-skip')

		# Information divs:
		noParagraph        = document.getElementById('no-paragraph')
		goBack             = document.getElementById('go-back')
		manuallySelectInfo = document.getElementById('manually-select-info')

		infoBubbles = document.getElementsByClassName('info-bubble')
		bigInfo    = document.getElementsByClassName('big-info')

		warningText = document.getElementById('warning-text')

		saveWarningText = document.getElementById('save-warning-text')

		return this

	storeHiddenWords = ->
		# store the hidden words
		previousHiddenWords = Wordguess.CreatorLogic.getHiddenWords().slice()

		return this

	initializeWordsToSkip = (wordsToSkip) ->
		numWordsToSkip.innerHTML = wordsToSkip
		Wordguess.CreatorLogic
			.setWordsToSkip(wordsToSkip)

		return this

	onNextClick = (previousMode) ->


		if not animating
			animating = true
			setTimeout ->
				animating = false
			, 400

			autoHide.classList.add 'selected'
			manHide.classList.remove 'selected'

			if Wordguess.CreatorLogic.noParagraph(paragraphTextarea)
				document.removeEventListener 'click', removeNoParagraphBox
				Wordguess.CreatorUI
					.alertNoParagraph(noParagraph.style)
				setTimeout ->
					document.addEventListener 'click', removeNoParagraphBox

			else # A paragraph has been entered.
				menu = 2

				Wordguess.CreatorLogic
					.resetWordsToSkip(paragraph, numWordsToSkip)
					.analyzeParagraph(paragraphTextarea.value)

				previousHiddenWords = Wordguess.CreatorLogic
					.updateHiddenWords(paragraphTextarea.value, previousHiddenWords)


				Wordguess.CreatorUI
					.hideFirstMenu(paragraphTextarea, resetButton, nextButton)
					.showSecondMenu(title, backButton, editable)
					.hideWarningText(warningText)
					.animateInSecondMenu(editRegion.style, hiddenWords.style, options)
					.showHiddenWords(hiddenWordsBox)
					.highlightWords(numWordsToSkip, paragraphTextarea.value, editable)

				# set mode to previous mode
				if previousMode is 'manual'
					Wordguess.CreatorEvents
						.onManHideClick()

				else if previousMode is 'automatic'
					Wordguess.CreatorEvents
						.onAutoHideClick()


	onManHideClick = ->

		# if im already on manual mode, dont do anything
		if mode is 'manual'
			return


		manHide.classList.add 'selected'
		autoHide.classList.remove 'selected'

		mode = 'manual'
		manuallyHide = on

		options.children[2].style.display = 'none'
		options.children[3].style.display = 'block'
		options.children[3].style.opacity = 1

		resetButton.style.opacity = 1

		hiddenWordsBox.innerHTML = ''

		Wordguess.CreatorLogic
			.setUpManualHiding(paragraphTextarea.value, editable, previousHiddenWords)
		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox)

		document.removeEventListener 'click', removeManHideBox
		manuallySelectInfo.style.display = 'block'
		setTimeout ->
			manuallySelectInfo.style.margin = '-397px 0 0 5px'
			manuallySelectInfo.style.opacity = 0.8
		, 5

		setTimeout ->
			document.addEventListener 'click', removeManHideBox
		, 1

	onAutoHideClick = ->
		# if im already on automatic mode, dont do anything
		if mode is 'automatic'
			return

		# save the previous hidden words
		storeHiddenWords()

		autoHide.classList.add 'selected'
		manHide.classList.remove 'selected'

		mode = 'automatic'
		manuallyHide = off
		Wordguess.CreatorLogic
			.turnOffManualHiding()

		options.children[2].style.display = 'block'
		options.children[3].style.display = 'none'

		resetButton.style.opacity = 0

		Wordguess.CreatorLogic
			.analyzeParagraph(paragraphTextarea.value)
		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox)
			.highlightWords(numWordsToSkip, paragraphTextarea.value, editable)

		unsetManualChoiceEventListeners()


	setEventListeners = (isMobile) ->
		# Disable right click.
		document.oncontextmenu = -> false
		document.addEventListener 'mousedown', (e) ->
			if e.button is 2 then false else true

		# Events for information bubbles.
		if !isMobile
			for bubble in infoBubbles
				bubble.addEventListener 'mouseenter', ->
					if not animating
						animating = true
						setTimeout ->
							animating = false
						, 300
						Wordguess.CreatorUI.showInfoBox(this)

				bubble.addEventListener 'mouseleave', ->
					Wordguess.CreatorUI.hideInfoBox(this)

			for info in bigInfo
				info.addEventListener 'mouseover', ->
					Wordguess.CreatorUI.hideBigInfoBox(this.style)

		# Reset will either clear a paragraph on the first menu,
		# or clear the manually selected words on the second.
		resetButton.addEventListener 'click', ->
			if menu is 1
				paragraphTextarea.value  = ''
				console.log('reset paragraph', paragraphTextarea.value)
				editable.innerHTML       = ''
				hiddenWordsBox.innerHTML = ''
				Wordguess.CreatorLogic
					.resetHiddenWords()

			else if manuallyHide is on
				Wordguess.CreatorLogic
					.setUpManualHiding(paragraph, editable)
					.showHiddenWords(hiddenWordsBox)


		showAllResponsesDiv.addEventListener 'click', ->
			showAllResponsesInput.checked = !showAllResponsesInput.checked
			if showAllResponsesInput.checked
				showAllResponsesDiv.style.backgroundColor = '#004f00' #dark green
				showAllResponsesLabel.textContent = 'Show All Responses:On'
			else
				showAllResponsesDiv.style.backgroundColor = '#2E2E2E' #default grey color
				showAllResponsesLabel.textContent = 'Show All Responses:Off'


		enableScoringDiv.addEventListener 'click', ->
			enableScoringInput.checked = !enableScoringInput.checked
			if enableScoringInput.checked
				enableScoringDiv.style.backgroundColor = '#004f00' #dark green
				enableScoringLabel.textContent = 'Enable Scoring:On'
			else
				enableScoringDiv.style.backgroundColor = '#2E2E2E' #default grey color
				enableScoringLabel.textContent = 'Enable Scoring:Off'

		nextButton.addEventListener 'click', ->
			previousMode = mode

			# default mode is automatic
			mode = 'automatic'
			onNextClick(previousMode)


		return this


	setSecondMenuEventListeners = ->
		numUp.addEventListener 'click', ->
			Wordguess.CreatorLogic
				.wordsToSkipUp(paragraphTextarea.value, numWordsToSkip)
				.analyzeParagraph(paragraphTextarea.value)
			Wordguess.CreatorUI
				.showHiddenWords(hiddenWordsBox)
				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable)

		numDown.addEventListener 'click', ->
			Wordguess.CreatorLogic
				.wordsToSkipDown(numWordsToSkip)
				.analyzeParagraph(paragraphTextarea.value)
			Wordguess.CreatorUI
				.showHiddenWords(hiddenWordsBox)
				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable)

		manHide.addEventListener 'click', ->
			onManHideClick()

		autoHide.addEventListener 'click', ->
			onAutoHideClick()


		backButton.addEventListener 'click', ->
			if not animating
				animating = true
				setTimeout ->
					animating = false
				, 400

				menu = 1

				Wordguess.CreatorUI
					.showFirstMenu(paragraphTextarea, resetButton, nextButton)
					.hideSecondMenu(title, backButton, editable)
					.showWarningText(warningText)
					.animateOutSecondMenu(editRegion.style, hiddenWords.style, options)

				if manuallyHide is off
					resetButton.style.opacity = 1

		editable.addEventListener 'click', ->
			document.removeEventListener('click', removeGoBackBox)

			if menu is 2
				if manuallyHide is off
					goBack.style.display = 'block'
					setTimeout ->
						goBack.style.margin = '-62px 0 0 -10px'
						goBack.style.opacity = 0.8
					, 5

			setTimeout ->
				document.addEventListener 'click', -> removeGoBackBox
			, 1

		return this

	removeNoParagraphBox = ->
		elementStyle = noParagraph.style
		elementStyle.margin = '72px 0 0 10px'
		elementStyle.opacity = 0
		setTimeout ->
			elementStyle.display = 'none'
		, 300

	removeGoBackBox = ->
		elementStyle = goBack.style
		elementStyle.margin  = '-72px 0 0 -10px'
		elementStyle.opacity = 0
		setTimeout ->
			goBack.display = 'none'
		, 300

	removeManHideBox = ->
		elementStyle = manuallySelectInfo.style
		elementStyle.margin = '-407px 0 0 5px'
		elementStyle.opacity = 0
		setTimeout ->
			elementStyle.display = 'none'
		, 300


	onEditableOver = ->
		this.classList.add('yellow')

	onEditableOut = ->
		this.classList.remove('yellow')

	onEditableClick = ->
		if this.classList.contains 'manually-selected'
			this.classList.remove 'manually-selected'

			index = parseInt(this.getAttribute('data-index'))
			Wordguess.CreatorLogic.removeHiddenWord(this, index)

		# adding a word to the hidden words
		else
			Wordguess.CreatorUI
				.hideWarningText(saveWarningText)

			# store the index of the word in the paragraph
			index = parseInt(this.getAttribute('data-index'))

			this.classList.add 'manually-selected'
			Wordguess.CreatorLogic
				.pushHiddenWord(this.innerHTML, index)

		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox)

		manuallySelectInfo.style.margin = '-407px 0 0 5px'
		manuallySelectInfo.style.opacity = 0
		setTimeout ->
			manuallySelectInfo.style.display = 'none'
		, 300

	setManualChoiceEventListeners = ->
		editables = document.querySelectorAll('#editable span')
		for edit in editables
			edit.addEventListener 'mouseover', onEditableOver
			edit.addEventListener 'mouseout', onEditableOut
			edit.addEventListener 'click', onEditableClick

	unsetManualChoiceEventListeners = ->
		editables = document.querySelectorAll('#editable span')
		for edit in editables
			edit.removeEventListener 'mouseover', onEditableOver
			edit.removeEventListener 'mouseout', onEditableOut
			edit.removeEventListener 'click', onEditableClick


	# Public methods.
	cacheElements                 : cacheElements
	setEventListeners             : setEventListeners
	setSecondMenuEventListeners   : setSecondMenuEventListeners
	setManualChoiceEventListeners : setManualChoiceEventListeners
	onNextClick                   : onNextClick
	onManHideClick				  : onManHideClick
	onAutoHideClick				  : onAutoHideClick
	storeHiddenWords			  : storeHiddenWords
	initializeWordsToSkip		  : initializeWordsToSkip
