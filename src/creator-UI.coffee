Namespace('Wordguess').CreatorUI = do ->

	regexWhitespace        = /\n|\s/
	regexTwoOrMoreSpaces   = /\s{2,}/g
	regexNewlineMultiSpace = /\s{2,}|\n/g

	# Regex to match non-letter characters (non-Unicode letters)
	regexNotAlpha = /[^\p{L}]/u

	setInputValues = (widgetTitle, paragraph, wordsToSkip) ->
		document.getElementById('title').value = widgetTitle
		document.getElementById('paragraph').value       = paragraph
		if wordsToSkip != null
			document.getElementById('num-words-to-skip').innerHTML = wordsToSkip

		return this

	showInfoBox = (element) ->
		element.style.opacity = 1                        # Highlight the question bubble.
		nodeStyle = element.parentNode.children[0].style # Cache the style of our info box.
		nodeStyle.display = 'block'                      # Show the info box paired with this bubble's node.
		setTimeout ->
			nodeStyle.margin  = '-55px 0 0 -13px'        # Adding an small delay triggers CSS transition.
			nodeStyle.opacity = 0.85                     # Fade in the info box.
		, 1

	hideInfoBox = (element) ->
		element.style.opacity = 0.6                      # Remove the bubble's highlight.
		nodeStyle = element.parentNode.children[0].style # Cache the info box.
		nodeStyle.margin  = '-65px 0 0 -13px'            # Slightly changing the margin "bounces-in" the box.
		nodeStyle.opacity = 0                            # Fade out the info box.
		setTimeout ->
			nodeStyle.display = 'none'                   # Remove after animation has concluded.
		, 301

	hideBigInfoBox = (elementStyle) ->                  # Hide info boxes on mouseover.
		elementStyle.opacity = 0
		setTimeout ->
			elementStyle.display = 'none'
		, 300

	alertNoParagraph = (noParagraph) ->
		noParagraph.display = 'block'                    # Set display.
		setTimeout ->
			noParagraph.margin = '62px 0 0 10px'         # Other properties must be set slightly later to trigger animation.
			noParagraph.opacity = 0.6
		, 10

	showFirstMenu = (paragraphTextarea, resetButton) ->
		paragraphTextarea.style.display = 'block'
		resetButton.style.display = 'block'
		resetButton.style.opacity = 1

		return this

	hideFirstMenu = (paragraphTextarea, resetButton) ->
		paragraphTextarea.style.display = 'none'
		resetButton.style.opacity = 0
		setTimeout ->
			resetButton.style.display = 'none'
		, 300

		return this

	showSecondMenu = (paragraphTitle, backButton, editable) ->
		paragraphTitle.style.width = '93%'
		backButton.style.display = 'inline'

		editable.className = 'edit-areas ease-out-quart shown'

		return this

	hideSecondMenu = (paragraphTitle, backButton, editable) ->
		paragraphTitle.style.width = '97%'
		backButton.style.display = 'none'

		editable.className = 'edit-areas ease-out-quart'

		return this
	
	showWarningText = (warningText) ->
		warningText.style.display = 'block'

		return this
	
	hideWarningText = (warningText) ->
		warningText.style.display = 'none'

		return this
		

	animateInSecondMenu = (editRegion, hiddenWords, options) ->
		optionsH3  = options.children[0].style
		optionsNav = options.children[1].style
		option1    = options.children[2].style
		option2    = options.children[3].style

		editRegion.width = '450px'       # Shrink the paragraph region.
		options.style.display = 'block'  # Display the options region.

		hiddenWords.right   = 0          # Fade in the hidden words box.
		hiddenWords.opacity = 1

		option1.display = 'block'

		setTimeout ->
			optionsH3.margin  = "0 0 5px 0"
			optionsH3.opacity = 1
		, 25

		setTimeout ->
			optionsNav.margin  = "0"
			optionsNav.opacity = 1
		, 50

		setTimeout ->
			option1.right   = 0
			option1.opacity = 1
			option2.right   = 0

		, 75

		return this

	animateOutSecondMenu = (editRegion, hiddenWords, options) ->
		optionsH3  = options.children[0].style
		optionsNav = options.children[1].style
		option1    = options.children[2].style
		option2    = options.children[3].style

		editRegion.width = '900px'

		hiddenWords.opacity = 0
		hiddenWords.right = '-200px'

		setTimeout ->
			optionsH3.margin = "0 -300px 5px 0"
			optionsH3.opacity = 0
		, 25

		setTimeout ->
			optionsNav.margin = "0 -300px 0 0"
			optionsNav.opacity = 0
		, 50

		setTimeout ->
			option1.right = '-300px'
			option2.right = '-300px'
			option1.opacity = 0
			option2.opacity = 0

		, 75

		setTimeout ->
			options.style.display = "none"
		, 400

		return this

	showHiddenWords = (hiddenWordsBox) ->
		hiddenWords = Wordguess.CreatorLogic.getHiddenWords()
		str = ''

		if not hiddenWords.length
			hiddenWordsBox.innerHTML = 'No words are hidden yet.'
		else
			for i in [0..hiddenWords.length - 1]
				if hiddenWords[i] != '' then str += "<p>"+hiddenWords[i]+"</p>"

		hiddenWordsBox.innerHTML = str

		return this

	highlightWords = (numWordsToSkip, paragraph, editable) ->
		wordsToSkip = Number(numWordsToSkip.innerHTML)

		paragraph = Wordguess.CreatorLogic.replaceTags(paragraph.replace(regexTwoOrMoreSpaces, ' '))
		paragraph = paragraph.split(regexWhitespace)

		for i in [wordsToSkip..paragraph.length - 1] by (wordsToSkip + 1)
			paragraph[i] = "<span class='highlight'>"+paragraph[i]+"</span>"

		editable.innerHTML = paragraph.join ' '

	# Public methods.
	setInputValues       : setInputValues
	showInfoBox          : showInfoBox
	hideInfoBox          : hideInfoBox
	hideBigInfoBox       : hideBigInfoBox
	alertNoParagraph     : alertNoParagraph
	showFirstMenu        : showFirstMenu
	hideFirstMenu        : hideFirstMenu
	showSecondMenu       : showSecondMenu
	hideSecondMenu       : hideSecondMenu
	animateInSecondMenu  : animateInSecondMenu
	animateOutSecondMenu : animateOutSecondMenu
	showHiddenWords      : showHiddenWords
	highlightWords       : highlightWords
	hideWarningText	     : hideWarningText
	showWarningText	     : showWarningText