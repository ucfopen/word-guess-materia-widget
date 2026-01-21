/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

Namespace('Wordguess').CreatorEvents = (function() {
	// Divs:
	let editRegion        = null;
	let paragraphTextarea = null;
	let editable          = null;
	let hiddenWords       = null;
	let hiddenWordsBox    = null;
	const option2           = null;
	const option1           = null;

	// Buttons:
	let numUp          = null;
	let numDown        = null;
	let numWordsToSkip = null;
	let nextButton     = null;
	let backButton     = null;
	let resetButton    = null;
	let autoHide       = null;
	let manHide        = null;

	// Inputs:
	let title          = null;
	const paragraphTitle = null;
	let wordsToSkipBox = null;

	// Information divs:
	let noParagraph         = null;
	let goBack              = null;
	let manuallySelectInfo  = null;

	let warningText = null;
	let saveWarningText = null;

	let infoBubbles = null;
	let bigInfo    = null;

	let manuallyHide = false;
	let animating    = false;
	let menu         = 1;
	let mode 	     = 'automatic';

	// Previous state of manual hidden words
	let previousHiddenWords = [];

	const cacheElements = function() {
		// Divs:
		editRegion        = document.getElementById('edit-region');
		paragraphTextarea = document.getElementById('paragraph');
		editable          = document.getElementById('editable');
		hiddenWords       = document.getElementById('hidden-words');
		hiddenWordsBox    = document.getElementById('hidden-words-box');
		const options           = document.getElementById('options');

		// Buttons:
		numUp          = document.getElementById('num-up');
		numDown        = document.getElementById('num-down');
		numWordsToSkip = document.getElementById('num-words-to-skip');
		nextButton     = document.getElementById('next');
		// backButton     = document.getElementById('back');
		resetButton    = document.getElementById('reset');
		autoHide       = document.getElementById('auto-hide');
		manHide        = document.getElementById('man-hide');

		// Inputs:
		title          = document.getElementById('title');
		wordsToSkipBox = document.getElementById('words-to-skip');

		// Information divs:
		noParagraph        = document.getElementById('no-paragraph');
		goBack             = document.getElementById('go-back');
		manuallySelectInfo = document.getElementById('manually-select-info');

		infoBubbles = document.getElementsByClassName('info-bubble');
		bigInfo    = document.getElementsByClassName('big-info');

		warningText = document.getElementById('warning-text');

		saveWarningText = document.getElementById('save-warning-text');

		return this;
	};

	const storeHiddenWords = function() {
		// store the hidden words
		previousHiddenWords = Wordguess.CreatorLogic.getHiddenWords().slice();

		return this;
	};

	const initializeWordsToSkip = function(wordsToSkip) {
		numWordsToSkip.innerHTML = wordsToSkip;
		Wordguess.CreatorLogic
			.setWordsToSkip(wordsToSkip);

		return this;
	};
	
	const onNextClick = function(previousMode, skipValidation = false) {


		// if (!animating) {
		// 	animating = true;
		// 	setTimeout(() => animating = false
		// 	, 400);

		// 	autoHide.classList.add('selected');
		// 	manHide.classList.remove('selected');

			// if no paragraph then alert user to enter one 
			if (!skipValidation & Wordguess.CreatorLogic.noParagraph(paragraphTextarea)) {
				alert('please enter paragraph');
				return;
				// document.removeEventListener('click', removeNoParagraphBox);
				// Wordguess.CreatorUI
				// 	.alertNoParagraph(noParagraph.style);
				// return setTimeout(() => document.addEventListener('click', removeNoParagraphBox));

			} else { // A paragraph has been entered.
				menu = 2;

				Wordguess.CreatorLogic
					.resetWordsToSkip(paragraph, numWordsToSkip)
					.analyzeParagraph(paragraphTextarea.value);

				previousHiddenWords = Wordguess.CreatorLogic
					.updateHiddenWords(paragraphTextarea.value, previousHiddenWords);


				Wordguess.CreatorUI
					.hideFirstMenu(paragraphTextarea, resetButton)
					.showSecondMenu(title, editable)
					.hideWarningText(warningText)
					.animateInSecondMenu(editRegion.style, hiddenWords.style, options)
					.showHiddenWords(hiddenWordsBox)
					.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
			
				// set mode to previous mode
				if (previousMode === 'manual') {
					return Wordguess.CreatorEvents
						.onManHideClick();

				} else if (previousMode === 'automatic') {
					return Wordguess.CreatorEvents
						.onAutoHideClick();
				}
			}
		};
	

	


	const onManHideClick = function() {

		// if im already on manual mode, dont do anything
		if (mode === 'manual') {
			return;
		}


		manHide.classList.add('selected');
		autoHide.classList.remove('selected');

		mode = 'manual';
		manuallyHide = true;

		options.children[2].style.display = 'none';
		options.children[3].style.display = 'block';
		options.children[3].style.opacity = 1;

		resetButton.style.opacity = 1;

		hiddenWordsBox.innerHTML = '';

		Wordguess.CreatorLogic
			.setUpManualHiding(paragraphTextarea.value, editable, previousHiddenWords);
		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox);

		document.removeEventListener('click', removeManHideBox);
		manuallySelectInfo.style.display = 'block';
		setTimeout(function() {
			manuallySelectInfo.style.margin = '-397px 0 0 5px';
			return manuallySelectInfo.style.opacity = 0.8;
		}
		, 5);

		return setTimeout(() => document.addEventListener('click', removeManHideBox)
		, 1);
	};
	
	const onAutoHideClick = function() {
		// if im already on automatic mode, dont do anything
		if (mode === 'automatic') {
			return;
		}

		// save the previous hidden words
		storeHiddenWords();

		autoHide.classList.add('selected');
		manHide.classList.remove('selected');
	
		mode = 'automatic';
		manuallyHide = false;
		Wordguess.CreatorLogic
			.turnOffManualHiding();

		options.children[2].style.display = 'block';
		options.children[3].style.display = 'none';

		resetButton.style.opacity = 0;

		Wordguess.CreatorLogic
			.analyzeParagraph(paragraphTextarea.value);
		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox)
			.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);

		return unsetManualChoiceEventListeners();
	};


	const setEventListeners = function(isMobile) {
	// 	// Disable right click.
	// 	document.oncontextmenu = () => false;
	// 	document.addEventListener('mousedown', function(e) {
	// 		if (e.button === 2) { return false; } else { return true; }
	// 	});

		// Events for information bubbles.
		if (!isMobile) {
			for (var bubble of Array.from(infoBubbles)) {
				bubble.addEventListener('mouseenter', function() {
					if (!animating) {
						animating = true;
						setTimeout(() => animating = false
						, 300);
						return Wordguess.CreatorUI.showInfoBox(this);
					}
				});

				bubble.addEventListener('mouseleave', function() {
					return Wordguess.CreatorUI.hideInfoBox(this);
				});
			}

			for (var info of Array.from(bigInfo)) {
				info.addEventListener('mouseover', function() {
					return Wordguess.CreatorUI.hideBigInfoBox(this.style);
				});
			}
		}

		// Reset will either clear a paragraph on the first menu,
		// or clear the manually selected words on the second.
		resetButton.addEventListener('click', function() {
			if (menu === 1) {
				title.value              = '';
				paragraphTitle.value     = '';
				paragraphTextarea.value  = '';
				editable.innerHTML       = '';
				hiddenWordsBox.innerHTML = '';
				return Wordguess.CreatorLogic
					.resetHiddenWords();

			} else if (manuallyHide === true) {
				return Wordguess.CreatorLogic
					.setUpManualHiding(paragraph, editable)
					.showHiddenWords(hiddenWordsBox);
			}
		});

		// nextButton.addEventListener('click', function() {
		// 	const previousMode = mode;

		// 	// default mode is automatic
		// 	mode = 'automatic';
		// 	return onNextClick(previousMode);
		// });


		return this;
	};

	const setSecondMenuEventListeners = function() {
		numUp.addEventListener('click', function() {
			Wordguess.CreatorLogic
				.wordsToSkipUp(paragraphTextarea.value, numWordsToSkip)
				.analyzeParagraph(paragraphTextarea.value);
			return Wordguess.CreatorUI
				.showHiddenWords(hiddenWordsBox)
				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
		});

		numDown.addEventListener('click', function() {
			Wordguess.CreatorLogic
				.wordsToSkipDown(numWordsToSkip)
				.analyzeParagraph(paragraphTextarea.value);
			return Wordguess.CreatorUI
				.showHiddenWords(hiddenWordsBox)
				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
		});

		manHide.addEventListener('click', () => onManHideClick());

		autoHide.addEventListener('click', () => onAutoHideClick());

		
		// backButton.addEventListener('click', function() {
		// 	if (!animating) {
		// 		animating = true;
		// 		setTimeout(() => animating = false
		// 		, 400);

		// 		menu = 1;

		// 		Wordguess.CreatorUI
		// 			.showFirstMenu(paragraphTextarea, resetButton)
		// 			.hideSecondMenu(title, backButton, editable)
		// 			.showWarningText(warningText)
		// 			.animateOutSecondMenu(editRegion.style, hiddenWords.style, options);

		// 		if (manuallyHide === false) {
		// 			return resetButton.style.opacity = 1;
		// 		}
		// 	}
		// });

		editable.addEventListener('click', function() {
			document.removeEventListener('click', removeGoBackBox);

			if (menu === 2) {
				if (manuallyHide === false) {
					goBack.style.display = 'block';
					setTimeout(function() {
						goBack.style.margin = '-62px 0 0 -10px';
						return goBack.style.opacity = 0.8;
					}
					, 5);
				}
			}

			return setTimeout(() => document.addEventListener('click', () => removeGoBackBox)
			, 1);
		});

		return this;
	};

	var removeNoParagraphBox = function() {
		const elementStyle = noParagraph.style;
		elementStyle.margin = '72px 0 0 10px';
		elementStyle.opacity = 0;
		return setTimeout(() => elementStyle.display = 'none'
		, 300);
	};

	var removeGoBackBox = function() {
		const elementStyle = goBack.style;
		elementStyle.margin  = '-72px 0 0 -10px';
		elementStyle.opacity = 0;
		return setTimeout(() => goBack.display = 'none'
		, 300);
	};

	var removeManHideBox = function() {
		const elementStyle = manuallySelectInfo.style;
		elementStyle.margin = '-407px 0 0 5px';
		elementStyle.opacity = 0;
		return setTimeout(() => elementStyle.display = 'none'
		, 300);
	};


	const onEditableOver = function() {
		return this.classList.add('yellow');
	};

	const onEditableOut = function() {
		return this.classList.remove('yellow');
	};

	const onEditableClick = function() {
		let index;
		if (this.classList.contains('manually-selected')) {
			this.classList.remove('manually-selected');

			index = parseInt(this.getAttribute('data-index'));
			Wordguess.CreatorLogic.removeHiddenWord(this, index);

		// adding a word to the hidden words
		} else {
			Wordguess.CreatorUI
				.hideWarningText(saveWarningText);

			// store the index of the word in the paragraph
			index = parseInt(this.getAttribute('data-index'));

			this.classList.add('manually-selected');
			Wordguess.CreatorLogic
				.pushHiddenWord(this.innerHTML, index);
		}

		Wordguess.CreatorUI
			.showHiddenWords(hiddenWordsBox);

		manuallySelectInfo.style.margin = '-407px 0 0 5px';
		manuallySelectInfo.style.opacity = 0;
		return setTimeout(() => manuallySelectInfo.style.display = 'none'
		, 300);
	};

	const setManualChoiceEventListeners = function() {
		const editables = document.querySelectorAll('#editable span');
		return (() => {
			const result = [];
			for (var edit of Array.from(editables)) {
				edit.addEventListener('mouseover', onEditableOver);
				edit.addEventListener('mouseout', onEditableOut);
				result.push(edit.addEventListener('click', onEditableClick));
			}
			return result;
		})();
	};

	var unsetManualChoiceEventListeners = function() {
		const editables = document.querySelectorAll('#editable span');
		return (() => {
			const result = [];
			for (var edit of Array.from(editables)) {
				edit.removeEventListener('mouseover', onEditableOver);
				edit.removeEventListener('mouseout', onEditableOut);
				result.push(edit.removeEventListener('click', onEditableClick));
			}
			return result;
		})();
	};


	// Public methods.
	return {
		cacheElements,
		setEventListeners,
		setSecondMenuEventListeners,
		setManualChoiceEventListeners,
		onNextClick,
		onManHideClick,
		onAutoHideClick,
		storeHiddenWords,
		initializeWordsToSkip
	};
})();