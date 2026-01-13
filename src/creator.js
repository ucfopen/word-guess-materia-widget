/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').Creator = (function() {
	const isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);

	// Data that may be pre-established.
	let wordsToSkip           = null;
	let _qset                 = null;

	const initNewWidget = function(widget, baseUrl) {
		wordsToSkip           = 3;
		const manualSkippingIndices = [];

		return Wordguess.CreatorEvents
			.cacheElements()
			.setEventListeners(isMobile)
			.setSecondMenuEventListeners();
	};

	const initExistingWidget = function(title, widget, qset, version, baseUrl) {
		({
            wordsToSkip
        } = qset);
		const previousWordsToSkip = (qset.previousWordsToSkip != null) ? qset.previousWordsToSkip : -1;

		// figure out if what was the previously selected mode
		let previousMode = undefined;
		if (wordsToSkip === -1) {
			previousMode = 'manual';
		} else {
			previousMode = 'automatic';
		}

		// set default value
		if (wordsToSkip === -1) {

			if (previousWordsToSkip !== -1) {
				wordsToSkip = previousWordsToSkip;
			} else {
				wordsToSkip = 3;
			}
		}


		const {
            manualSkippingIndices
        } = qset;

		Wordguess.CreatorEvents
			.cacheElements()
			.setEventListeners(isMobile)
			.setSecondMenuEventListeners()
			.initializeWordsToSkip(wordsToSkip);
		Wordguess.CreatorUI
			.setInputValues(title, qset.paragraph, wordsToSkip);

		Wordguess.CreatorLogic
			.initializeHiddenWords(manualSkippingIndices, qset.paragraph);
		
		Wordguess.CreatorEvents
			.storeHiddenWords();

		// set screen to state after clicking next
		return Wordguess.CreatorEvents
			.onNextClick(previousMode);
	};

	const onSaveClicked = function(mode) {
		let widgetTitle;
		if (mode == null) { mode = 'save'; }
		const titleValue = document.getElementById('title').value;
		if (titleValue) { widgetTitle = Wordguess.CreatorLogic.replaceTags(titleValue);
		} else { widgetTitle = 'New Wordguess Widget'; }

		_qset = Wordguess.CreatorLogic.buildSaveData();

		if (_qset === null) { return false; }

		return Materia.CreatorCore.save(widgetTitle, _qset);
	};

	const onSaveComplete = (title, widget, qset, version) => true;

	// Public methods, called by Materia.
	return {
		initNewWidget,
		initExistingWidget,
		onSaveClicked,
		onSaveComplete
	};
})();