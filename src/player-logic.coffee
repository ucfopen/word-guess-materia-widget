Namespace('Wordguess').Logic = do ->
	regexNotAlpha = /[^A-z]/

	# Sends back an input with leading/trailing punctuation.
	replaceText = (text) ->
		inputTemplate = '<input data-sentence="replace" autocomplete="off" class="quick-anim" type="text" value="" />'
		readableTemplate = '<strong>BLANK</strong>'

		altered = false

		first = text.charAt(0)
		last = text.charAt(text.length - 1)

		readable = ''

		# Leading and trailing punctuation exist.
		if first.match(regexNotAlpha) != null && last.match(regexNotAlpha) != null
			text = first+inputTemplate+last
			readable = first+readableTemplate+last
			altered = true
		# Only leading punctuation.
		else if first.match(regexNotAlpha) != null
			text = first+inputTemplate
			readable = first+readableTemplate
			altered = true
		# Only trailing punctuation.
		else if last.match(regexNotAlpha) != null
			text = inputTemplate+last
			readable = readableTemplate+last
			altered = true
		else
			text = inputTemplate
			readable = readableTemplate
			altered = true
		return
			text: text
			readable: readable
			altered: altered

	# Searches through every input and returns whether or not blanks exist.
	checkForEmptyInput = ->
		blanks = 0
		inputs = document.getElementById('game-paragraph').getElementsByTagName('input')

		# Search for empty input boxes.
		for i in [0..inputs.length-1]
			if !inputs[i].value then blanks = 1

		if blanks > 0 then return true else return false

	# Public methods.
	replaceText        : replaceText
	checkForEmptyInput : checkForEmptyInput
