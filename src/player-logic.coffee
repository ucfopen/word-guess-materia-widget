Namespace('Wordguess').Logic = do ->
	regexNotAlpha = /[^A-z]/

	# Sends back an input with leading/trailing punctuation.
	replaceText = (text) ->
		console.log('wadditdo',text)
		first = text.charAt(0)
		last = text.charAt(text.length - 1)

		# Leading and trailing punctuation exist.
		if first.match(regexNotAlpha) != null && last.match(regexNotAlpha) != null
			return text = first+'<input autocomplete="off" class="quick-anim" type="text" value="" />'+last
		# Only leading punctuation.
		else if first.match(regexNotAlpha) != null
			return text = first+'<input autocomplete="off" class="quick-anim" type="text" value="" />'
		# Only trailing punctuation.
		else if last.match(regexNotAlpha) != null
			return text = '<input autocomplete="off" class="quick-anim" type="text" value="" />'+last
		else
			return text = '<input autocomplete="off" class="quick-anim" type="text" value="" />'

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
