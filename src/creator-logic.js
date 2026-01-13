/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').CreatorLogic = (function() {

	const regexWhitespace        = /\n|\s/;
	const regexTwoOrMoreSpaces   = /\s{2,}/g;
	const regexNewlineMultiSpace = /\s{2,}|\n/g;

	// Regex to match non-letter characters (non-Unicode letters)
	const regexNotAlpha = /[^\p{L}]/u;

	let wordsToSkip = 3;
	let hiddenWords = [];
	let hiddenWordsIndices = new Set();
	let manualSkippingIndices = [];
	let manuallyHide = false;

	const setWordsToSkip = num => wordsToSkip = num;

	const resetHiddenWords = () => hiddenWords = [];

	const resetHiddenWordsIndices = () => hiddenWordsIndices = new Set();

	const getHiddenWords = () => hiddenWords;

	const pushHiddenWord = function(word, index) {
		hiddenWords.push(word);
		return hiddenWordsIndices.add(index);
	};

	// Return array of hidden words minus the clicked word.
	const removeHiddenWord = function(word, index) {

		hiddenWordsIndices.delete(index);

		const text = word.innerHTML;
		for (let i = 0; i < hiddenWords.length; i++) {
			var hidden = hiddenWords[i];
			if (hidden === text) {
				hiddenWords.splice(i, 1);
				return;
			}
		}
	};

	// Tell the user they must enter a paragraph to continue.
	const noParagraph = function(paragraph) {
		if (paragraph.value.split(regexWhitespace).length < 2) {
			return true;
		}
	};

	const wordsToSkipUp = function(paragraph, numWordsToSkip) {
		paragraph = cleanParagraph(paragraph);
		if (wordsToSkip < (paragraph.length - 1)) {
			wordsToSkip++;
			numWordsToSkip.innerHTML = wordsToSkip;
		}

		return this;
	};

	const wordsToSkipDown = function(numWordsToSkip) {
		if (wordsToSkip > 1) {
			wordsToSkip--;
			numWordsToSkip.innerHTML = wordsToSkip;
		}

		return this;
	};

	const resetWordsToSkip = function(paragraph, numWordsToSkip) {
		if ((paragraph.value.split(regexWhitespace).length - 1) < wordsToSkip) {
			wordsToSkip = 1;
			numWordsToSkip.innerHTML = 1;
		}

		return this;
	};

	// Replace tags with their escape characters to prevent XSS attack.
	const replaceTags = text => text = Materia.CreatorCore.escapeScriptTags(text);

	var cleanParagraph = function(paragraph) {
		let cleansedParagraph = replaceTags(paragraph).trim();
		cleansedParagraph = cleansedParagraph.replace(regexTwoOrMoreSpaces, ' ').split(regexWhitespace);
		return cleansedParagraph;
	};

	const setUpManualHiding = function(paragraph, editable, previousHiddenWords) {
		manuallyHide = true;
		resetHiddenWords();


		// show previous hidden words chosen by the user
		hiddenWords = previousHiddenWords.slice();

		paragraph = cleanParagraph(paragraph);

		for (let i = 0, end = paragraph.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {

			// make span yellow by default if it was previously chosen
			if (hiddenWordsIndices.has(i)) {
				paragraph[i] = `<span data-index='${i}' class='manually-selected'>${paragraph[i]}</span>`;
			} else {
				paragraph[i] = `<span data-index='${i}'>${paragraph[i]}</span>`;
			}
		}

		editable.innerHTML = paragraph.join(' ');

		return Wordguess.CreatorEvents.setManualChoiceEventListeners();
	};

	const turnOffManualHiding = () => manuallyHide = false;

	const removePunc = function(string) {
		// null check
		if (string === undefined) {
			return '';
		}

		for (let i = 0, end = string.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
			var first = string.charAt(0);
			var last = string.charAt(string.length - 1);

			if (last.match(regexNotAlpha) !== null) {
				string = string.substr(0, string.length - 1);
			} else if (first.match(regexNotAlpha) !== null) {
				string = string.substr(1);
			}
		}

		return string;
	};

	const buildQuestionsAnswers = function(paragraph) {
		let i;
		const questionsAnswers = [];
		let j = 1;

		if (manuallyHide === true) {
			let asc, end;
			for (i = 0, end = manualSkippingIndices.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
				questionsAnswers.push({
					'id'        : 0,
					'type'      : 'QA',
					'questions' :[{'text': ('word #' + j)}],
					'answers'   :[{'text': removePunc(paragraph[manualSkippingIndices[i]])}]});
				j++;
			}

		} else {
			let asc1, end1, step;
			for (i = wordsToSkip, end1 = paragraph.length - 1, step = i + 1, asc1 = step > 0; asc1 ? i <= end1 : i >= end1; i += step) {
				questionsAnswers.push({
					'id'        : 0,
					'type'      : 'QA',
					'questions' :[{'text': 'word #' + j}],
					'answers'   :[{'text': removePunc(paragraph[i])}]});
				j++;
			}
		}


		return questionsAnswers;
	};

	const buildSaveData = function(titleValue) {

		let qset;
		if ((manuallyHide === true) && (hiddenWordsIndices.size === 0)) {
			const saveWarningText = document.getElementById('save-warning-text');
			Wordguess.CreatorUI.showWarningText(saveWarningText);
			return null;
		}
		

		manualSkippingIndices = Array.from(hiddenWordsIndices);

		const previousWordsToSkip = wordsToSkip;

		if (manuallyHide === true) {
			wordsToSkip = -1;
		}


		const paragraph = cleanParagraph(document.getElementById('paragraph').value);
		const questionsAnswers = buildQuestionsAnswers(paragraph);


		return qset = {
			'questions_answers'     : questionsAnswers,
			'title'                 : replaceTags(document.getElementById('title').value),
			'paragraph'             : replaceTags(paragraph.join(' ')),
			'wordsToSkip'           : wordsToSkip,
			'manualSkippingIndices' : manualSkippingIndices,
			'previousWordsToSkip'   : previousWordsToSkip
		};
	};

	const analyzeParagraph = function(paragraph) {
		resetHiddenWords();

		paragraph = cleanParagraph(paragraph);

		// prepares hidden words for automatic hiding
		return (() => {
			const result = [];
			for (let i = wordsToSkip, end = paragraph.length - 1, step = wordsToSkip + 1, asc = step > 0; asc ? i <= end : i >= end; i += step) {
				result.push(hiddenWords.push(paragraph[i]));
			}
			return result;
		})();
	};
	
	const updateHiddenWords = function(paragraph, previousHiddenWords) {
		paragraph = cleanParagraph(paragraph);

		// update hidden words at the same indices and remove indices out of bounds
		const sortedHiddenWordsIndices = Array.from(hiddenWordsIndices).sort();

		const newHiddenWords = [];
		sortedHiddenWordsIndices.forEach(function(index) {
			if (index < paragraph.length) {
				return newHiddenWords.push(paragraph[index]);
			} else {
				return hiddenWordsIndices.delete(index);
			}
		});
		
		return previousHiddenWords = newHiddenWords;
	};
	
	const initializeHiddenWords = function(manualSkippingIndices, paragraph) {
		hiddenWordsIndices = new Set(manualSkippingIndices);

		// get the hidden words from the paragraph
		const previousHiddenWords = [];
		const spanChunks = cleanParagraph(paragraph);
		hiddenWordsIndices.forEach(index => previousHiddenWords.push(spanChunks[index]));

		// save hidden words
		Wordguess.CreatorEvents.previousHiddenWords = previousHiddenWords.slice();
		hiddenWords = previousHiddenWords.slice();

		return this;
	};

	// Public methods.
	return {
		resetHiddenWords,
		getHiddenWords,
		pushHiddenWord,
		removeHiddenWord,
		cleanParagraph,
		replaceTags,
		noParagraph,
		wordsToSkipUp,
		wordsToSkipDown,
		resetWordsToSkip,
		buildQuestionsAnswers,
		buildSaveData,
		analyzeParagraph,
		setUpManualHiding,
		turnOffManualHiding,
		resetHiddenWordsIndices,
		initializeHiddenWords,
		updateHiddenWords,
		setWordsToSkip
	};
})();