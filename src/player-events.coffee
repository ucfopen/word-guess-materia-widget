Namespace('Wordguess').Events = do ->
	welcomePage    = null
	gamePage       = null
	gameBox        = null
	gameParagraph  = null
	submit         = null
	submitCheck    = null
	goBack         = null
	reset          = null
	submissionPage = null
	paper          = null

	_cacheElements = ->
		welcomePage    = document.getElementById('welcome-page')
		gamePage       = document.getElementById('game-page')
		gameBox        = document.getElementById('game-box')
		gameParagraph  = document.getElementById('game-paragraph')
		submit         = document.getElementById('submit')
		submitCheck    = document.getElementById('submit-check')
		goBack         = document.getElementById('go-back')
		reset          = document.getElementById('reset')
		submissionPage = document.getElementById('submission-page')
		paper          = document.getElementsByClassName('paper')

		return this

	setEventListeners = (phrase, sentences) ->
		_cacheElements()

		document.oncontextmenu = -> false                  # Disables right click.
		document.addEventListener 'mousedown', (e) ->
			if e.button is 2 then false else true          # Disables right click.

		_focusFirstEmptyBlank = ->
			inputs = gameParagraph.getElementsByTagName('input')
			for i in inputs
				unless i.value
					i.focus()
					return

		_hideWelcomePage = ->
			Wordguess.UI.fadeOut(welcomePage, 300)         # Fade out the welcome screen.
			gamePage.removeAttribute('inert')
			gamePage.className = "quick-anim"              # 'Un-blur' the game page.

		welcomePage.addEventListener 'click', _hideWelcomePage
		welcomePage.addEventListener 'keypress', _hideWelcomePage

		gameBox.addEventListener 'submit', (e) ->
			e.preventDefault()
			submit.blur()
			if Wordguess.Logic.checkForEmptyInput()
				gamePage.setAttribute('inert', 'true')
				submissionPage.removeAttribute('inert')
				Wordguess.UI.fadeIn(submissionPage)        # Fades in alert screen.
				gamePage.className = 'blurred quick-anim'  # 'Re-blur' the game page.
				submitCheck.focus()
			else
				Wordguess.UI
					.fadeOut(submissionPage, 300)
					.animateExit(paper)
				gamePage.className = "quick-anim"
				Wordguess.Engine.endGame()

		gameParagraph.addEventListener 'keyup', (e) ->
			if e.ctrlKey and e.code == 'KeyW'
				e.preventDefault()
				document.getElementById('aria-live').innerHTML = 'Now reading entire phrase: ' + phrase
			if e.ctrlKey and e.code == 'KeyT'
				e.preventDefault
				sentence = sentences[e.target.getAttribute('data-sentence')]
				document.getElementById('aria-live').innerHTML = 'The sentence for this blank is: ' + sentence

		submit.addEventListener 'mousedown', ->
			submit.className = 'button quick-anim2 pushed' # Gives a button a 'pushed' animation.
		submit.addEventListener 'mouseup', ->
			submit.className = 'button quick-anim2'        # Removes the 'pushed' animation.
		submit.addEventListener 'mouseout', ->
			submit.className = "button quick-anim2"

		gameBox.addEventListener 'reset', (e) ->
			e.preventDefault()
			reset.blur()
			# Will store every input on page.
			inputs = gameParagraph.getElementsByTagName('input')
			for i in [0..inputs.length-1]
				inputs[i].value = ''                         # Removes inputs' value.
				inputs[i].className = "quick-anim"           # Removes highlight if highlighted.

		reset.addEventListener 'mousedown', ->
			reset.className = "button quick-anim2 pushed"
		reset.addEventListener 'mouseup', ->                 # Triggers removal of all entered words.
			reset.className = "button quick-anim2"
		reset.addEventListener 'mouseout', ->
			reset.className = "button quick-anim2"

		_endGame = ->
			Wordguess.UI
				.fadeOut(submissionPage, 300)
				.animateExit(paper)
			gamePage.className = "quick-anim"
			Wordguess.Engine.endGame()

		submitCheck.addEventListener 'mousedown', ->
			submitCheck.className = "button quick-anim2 pushed"
		submitCheck.addEventListener 'mouseup', ->
			submitCheck.className = "button quick-anim2"
			_endGame()
		submitCheck.addEventListener 'mouseout', ->
			submitCheck.className = "button quick-anim2"
		submitCheck.addEventListener 'keyup', (e) ->
			if e.code == 'Space' or e.code == 'Enter' then _endGame()

		_returnToGame = ->
			submissionPage.setAttribute('inert', 'true')
			gamePage.removeAttribute('inert')
			Wordguess.UI.fadeOut(submissionPage, 300)
			gamePage.className = "quick-anim"
			Wordguess.UI.showEmptyInput()
			_focusFirstEmptyBlank()

		goBack.addEventListener 'mousedown', ->
			goBack.className = "button quick-anim2 pushed"
		goBack.addEventListener 'mouseup', ->
			goBack.className = "button quick-anim2"
			_returnToGame()
		goBack.addEventListener 'mouseout', ->
			goBack.className = "button quick-anim2"
		goBack.addEventListener 'keyup', (e) ->
			if e.code == 'Space' or e.code == 'Enter' then _returnToGame()

		return this

	# Public methods.
	setEventListeners : setEventListeners
