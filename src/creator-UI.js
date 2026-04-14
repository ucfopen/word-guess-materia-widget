


















// /*
//  * decaffeinate suggestions:
//  * DS102: Remove unnecessary code created because of implicit returns
//  * DS202: Simplify dynamic range loops
//  * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
//  */
// Namespace('Wordguess').CreatorUI = (function() {

// 	const regexWhitespace        = /\n|\s/;
// 	const regexTwoOrMoreSpaces   = /\s{2,}/g;
// 	const regexNewlineMultiSpace = /\s{2,}|\n/g;

// 	// Regex to match non-letter characters (non-Unicode letters)
// 	const regexNotAlpha = /[^\p{L}]/u;

// 	const setInputValues = function(widgetTitle, paragraph, wordsToSkip) {
// 		document.getElementById('title').value = widgetTitle;
// 		document.getElementById('paragraph').value       = paragraph;
// 		if (wordsToSkip !== null) {
// 			document.getElementById('num-words-to-skip').innerHTML = wordsToSkip;
// 		}

// 		return this;
// 	};

// 	const showInfoBox = function(element) {
// 		element.style.opacity = 1;                        // Highlight the question bubble.
// 		const nodeStyle = element.parentNode.children[0].style; // Cache the style of our info box.
// 		nodeStyle.display = 'block';                      // Show the info box paired with this bubble's node.
// 		return setTimeout(function() {
// 			nodeStyle.margin  = '-55px 0 0 -13px';        // Adding an small delay triggers CSS transition.
// 			return nodeStyle.opacity = 0.85;
// 		}                     // Fade in the info box.
// 		, 1);
// 	};

// 	const hideInfoBox = function(element) {
// 		element.style.opacity = 0.6;                      // Remove the bubble's highlight.
// 		const nodeStyle = element.parentNode.children[0].style; // Cache the info box.
// 		nodeStyle.margin  = '-65px 0 0 -13px';            // Slightly changing the margin "bounces-in" the box.
// 		nodeStyle.opacity = 0;                            // Fade out the info box.
// 		return setTimeout(() => nodeStyle.display = 'none'                   // Remove after animation has concluded.
// 		, 301);
// 	};

// 	const hideBigInfoBox = function(elementStyle) {                  // Hide info boxes on mouseover.
// 		elementStyle.opacity = 0;
// 		return setTimeout(() => elementStyle.display = 'none'
// 		, 300);
// 	};

// 	const alertNoParagraph = function(noParagraph) {
// 		noParagraph.display = 'block';                    // Set display.
// 		return setTimeout(function() {
// 			noParagraph.margin = '62px 0 0 10px';         // Other properties must be set slightly later to trigger animation.
// 			return noParagraph.opacity = 0.6;
// 		}
// 		, 10);
// 	};

// 	const showFirstMenu = function(paragraphTextarea, resetButton) {
// 		paragraphTextarea.style.display = 'block';
// 		resetButton.style.display = 'block';
// 		resetButton.style.opacity = 1;

// 		return this;
// 	};

// 	const hideFirstMenu = function(paragraphTextarea, resetButton) {
// 		paragraphTextarea.style.display = 'none';
// 		resetButton.style.opacity = 0;
// 		setTimeout(() => resetButton.style.display = 'none'
// 		, 300);

// 		return this;
// 	};

// 	const showSecondMenu = function(paragraphTitle,  editable) {
// 		paragraphTitle.style.width = '93%';
// 	// 	backButton.style.display = 'inline';

// 		editable.className = 'edit-areas ease-out-quart shown';

// 		return this;
// 	};

// 	const hideSecondMenu = function(paragraphTitle, backButton, editable) {
// 		paragraphTitle.style.width = '97%';
// 		backButton.style.display = 'none';

// 		editable.className = 'edit-areas ease-out-quart';

// 		return this;
// 	};
	
// 	const showWarningText = function(warningText) {
// 		warningText.style.display = 'block';

// 		return this;
// 	};
	
// 	const hideWarningText = function(warningText) {
// 		warningText.style.display = 'none';

// 		return this;
// 	};
		

// 	const animateInSecondMenu = function(editRegion, hiddenWords, options) {
// 		const optionsH3  = options.children[0].style;
// 		// const optionsNav = options.children[1].style;
// 		// const option1    = options.children[2].style;
// 		// const option2    = options.children[3].style;

// 		editRegion.width = '450px';       // Shrink the paragraph region.
// 		options.style.display = 'block';  // Display the options region.

// 		hiddenWords.right   = 0;          // Fade in the hidden words box.
// 		hiddenWords.opacity = 1;

// 		option1.display = 'block';

// 		setTimeout(function() {
// 			optionsH3.margin  = "0 0 5px 0";
// 			return optionsH3.opacity = 1;
// 		}
// 		, 25);

// 		setTimeout(function() {
// 			optionsNav.margin  = "0";
// 			return optionsNav.opacity = 1;
// 		}
// 		, 50);

// 		setTimeout(function() {
// 			option1.right   = 0;
// 			option1.opacity = 1;
// 			return option2.right   = 0;
// 		}

// 		, 75);

// 		return this;
// 	};

// 	const animateOutSecondMenu = function(editRegion, hiddenWords, options) {
// 		const optionsH3  = options.children[0].style;
// 		const optionsNav = options.children[1].style;
// 		const option1    = options.children[2].style;
// 		const option2    = options.children[3].style;

// 		editRegion.width = '900px';

// 		hiddenWords.opacity = 0;
// 		hiddenWords.right = '-200px';

// 		setTimeout(function() {
// 			optionsH3.margin = "0 -300px 5px 0";
// 			return optionsH3.opacity = 0;
// 		}
// 		, 25);

// 		setTimeout(function() {
// 			optionsNav.margin = "0 -300px 0 0";
// 			return optionsNav.opacity = 0;
// 		}
// 		, 50);

// 		setTimeout(function() {
// 			option1.right = '-300px';
// 			option2.right = '-300px';
// 			option1.opacity = 0;
// 			return option2.opacity = 0;
// 		}

// 		, 75);

// 		setTimeout(() => options.style.display = "none"
// 		, 400);

// 		return this;
// 	};

// 	const showHiddenWords = function(hiddenWordsBox) {
// 		const hiddenWords = Wordguess.CreatorLogic.getHiddenWords();
// 		let str = '';

// 		if (!hiddenWords.length) {
// 			hiddenWordsBox.innerHTML = 'No words are hidden yet.';
// 		} else {
// 			for (let i = 0, end = hiddenWords.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
// 				if (hiddenWords[i] !== '') { str += "<p>"+hiddenWords[i]+"</p>"; }
// 			}
// 		}

// 		hiddenWordsBox.innerHTML = str;

// 		return this;
// 	};

// 	const highlightWords = function(numWordsToSkip, paragraph, editable) {
// 		const wordsToSkip = Number(numWordsToSkip.innerHTML);

// 		paragraph = Wordguess.CreatorLogic.replaceTags(paragraph.replace(regexTwoOrMoreSpaces, ' '));
// 		paragraph = paragraph.split(regexWhitespace);

// 		for (let i = wordsToSkip, end = paragraph.length - 1, step = wordsToSkip + 1, asc = step > 0; asc ? i <= end : i >= end; i += step) {
// 			paragraph[i] = "<span class='highlight'>"+paragraph[i]+"</span>";
// 		}

// 		return editable.innerHTML = paragraph.join(' ');
// 	};

// 	// Public methods.
// 	return {
// 		setInputValues,
// 		showInfoBox,
// 		hideInfoBox,
// 		hideBigInfoBox,
// 		alertNoParagraph,
// 		showFirstMenu,
// 		hideFirstMenu,
// 		showSecondMenu,
// 		hideSecondMenu,
// 		animateInSecondMenu,
// 		animateOutSecondMenu,
// 		showHiddenWords,
// 		highlightWords,
// 		hideWarningText,
// 		showWarningText
// 	};
// })();