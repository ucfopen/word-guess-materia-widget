Namespace('Wordguess').Creator = do ->
	isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)

	# Data that may be pre-established.
	wordsToSkip           = null
	_qset                 = null

	initNewWidget = (widget, baseUrl) ->
		wordsToSkip           = 3
		manualSkippingIndices = []

		Wordguess.CreatorEvents
			.cacheElements()
			.setEventListeners(isMobile)
			.setSecondMenuEventListeners()

	initExistingWidget = (title, widget, qset, version, baseUrl) ->
		wordsToSkip = qset.wordsToSkip
		if wordsToSkip is -1 then wordsToSkip = 3

		Wordguess.CreatorEvents
			.cacheElements()
			.setEventListeners(isMobile)
			.setSecondMenuEventListeners()
		Wordguess.CreatorUI
			.setInputValues(title, qset.paragraph, wordsToSkip)

	onSaveClicked = (mode = 'save') ->
		titleValue = document.getElementById('title').value
		showAllOtherAnswersBoolean = document.getElementById('showAllResponsesInput').checked
		if titleValue then widgetTitle = Wordguess.CreatorLogic.replaceTags(titleValue)
		else widgetTitle = 'New Wordguess Widget'

		_qset = Wordguess.CreatorLogic.buildSaveData(showAllOtherAnswersBoolean)
		console.log _qset
		Materia.CreatorCore.save widgetTitle, _qset

	onSaveComplete = (title, widget, qset, version) -> true

	# Public methods, called by Materia.
	initNewWidget      : initNewWidget
	initExistingWidget : initExistingWidget
	onSaveClicked      : onSaveClicked
	onSaveComplete     : onSaveComplete
