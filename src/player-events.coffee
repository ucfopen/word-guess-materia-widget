Namespace('Wordguess').Events = do ->
	welcomePage    = null
	gamePage       = null
	submit         = null
	submitCheck    = null
	goBack         = null
	reset          = null
	submissionPage = null
	paper          = null

	_cacheElements = ->
		welcomePage    = document.getElementById('welcome-page')
		gamePage       = document.getElementById('game-page')
		submit         = document.getElementById('submit')
		submitCheck    = document.getElementById('submit-check')
		goBack         = document.getElementById('go-back')
		reset          = document.getElementById('reset')
		submissionPage = document.getElementById('submission-page')
		paper          = document.getElementsByClassName('paper')

		return this

	setEventListeners = ->
		_cacheElements()

		document.oncontextmenu = -> false                  # Disables right click.
		document.addEventListener 'mousedown', (e) ->
			if e.button is 2 then false else true          # Disables right click.

		welcomePage.addEventListener 'click', ->
			Wordguess.UI.fadeOut(welcomePage, 300)         # Fade out the welcome screen.
			gamePage.className = "quick-anim"              # 'Un-blur' the game page.

		submit.addEventListener 'mousedown', ->
			submit.className = 'button quick-anim2 pushed' # Gives a button a 'pushed' animation.
		submit.addEventListener 'mouseup', ->
			submit.className = 'button quick-anim2'        # Removes the 'pushed' animation.
			if Wordguess.Logic.checkForEmptyInput()
				Wordguess.UI.fadeIn(submissionPage)        # Fades in alert screen.
				gamePage.className = 'blurred quick-anim'  # 'Re-blur' the game page.
			else
				Wordguess.UI
					.fadeOut(submissionPage, 300)
					.animateExit(paper)
				gamePage.className = "quick-anim"
				Wordguess.Engine.endGame()
		submit.addEventListener 'mouseout', ->
			submit.className = "button quick-anim2"

		reset.addEventListener 'mousedown', ->
			reset.className = "button quick-anim2 pushed"
		reset.addEventListener 'mouseup', ->                 # Triggers removal of all entered words.
			reset.className = "button quick-anim2"
			inputs = document.getElementsByTagName('input')  # Will store every input on page.
			for i in [0..inputs.length-1]
				inputs[i].value = ''                         # Removes inputs' value.
				inputs[i].className = "quick-anim"           # Removes highlight if highlighted.
		reset.addEventListener 'mouseout', ->
			reset.className = "button quick-anim2"

		submitCheck.addEventListener 'mousedown', ->
			submitCheck.className = "button quick-anim2 pushed"
		submitCheck.addEventListener 'mouseup', ->
			Wordguess.UI
				.fadeOut(submissionPage, 300)
				.animateExit(paper)
			gamePage.className = "quick-anim"
			Wordguess.Engine.endGame()
			submitCheck.className = "button quick-anim2"
		submitCheck.addEventListener 'mouseout', ->
			submitCheck.className = "button quick-anim2"

		goBack.addEventListener 'mousedown', ->
			goBack.className = "button quick-anim2 pushed"
		goBack.addEventListener 'mouseup', ->
			Wordguess.UI.fadeOut(submissionPage, 300)
			goBack.className = "button quick-anim2"
			gamePage.className = "quick-anim"
			Wordguess.UI.showEmptyInput()
		goBack.addEventListener 'mouseout', ->
			goBack.className = "button quick-anim2"

		return this

	# Public methods.
	setEventListeners : setEventListeners