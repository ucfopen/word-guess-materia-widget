/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').UI = (function() {

	// Starting animation.
	const _fadeInLetters = function(guess) {
		setTimeout(() => guess.children[0].style.opacity = 1
		, 100);
		setTimeout(() => guess.children[1].style.opacity = 1
		, 300);
		setTimeout(() => guess.children[2].style.opacity = 1
		, 500);
		setTimeout(() => guess.children[3].style.opacity = 1
		, 700);
		return setTimeout(() => guess.children[4].style.opacity = 1
		, 900);
	};

	const setStartAnimation = function(guess) {
		setTimeout(() => _fadeInLetters(guess)
		, 400);

		return this;
	};

	const fadeIn = function(element) {
		element.style.display = "block";
		setTimeout(() => element.style.opacity = 1
		, 1);

		return this;
	};

	const fadeOut = function(element, time) {
		element.style.opacity = 0;
		setTimeout(() => element.style.display = "none"
		, time);

		return this;
	};

	// Replaces words with input boxes and inserts a paragraph into the DOM.
	const showNewParagraph = function(qset) {
		let i;
		const text = qset.paragraph.split(' ');

		// Case 1: The creator chose to automatically hide words.
		if (qset.wordsToSkip !== -1) {
			let asc, end, step;
			for (i = qset.wordsToSkip, end = text.length - 1, step = i + 1, asc = step > 0; asc ? i <= end : i >= end; i += step) {
				text[i] = Wordguess.Logic.replaceText(text[i]);
			}

		// Case 2: Manual hiding.
		} else {
			let asc1, end1;
			for (i = 0, end1 = qset.manualSkippingIndices.length - 1, asc1 = 0 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
				var index = qset.manualSkippingIndices[i];
				text[index] = Wordguess.Logic.replaceText(text[index]);
			}
		}

		// Injects the title.
		if (qset.title !== "Enter a title here.") {
			document.getElementById('game-title').innerHTML = qset.title;
		}

		// Injects the paragraph.
		return document.getElementById('game-paragraph').innerHTML = text.join(' ');
	};

	// Highlights input boxes that haven't been filled.
	const showEmptyInput = function() {
		const inputs = document.getElementsByTagName('input');

		return (() => {
			const result = [];
			for (let i = 0, end = inputs.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
				if (inputs[i].value === "") { inputs[i].className = "highlighted quick-anim"; }

				result.push(inputs[i].addEventListener('blur', function() {
					if (this.value !== "") { return this.className = "quick-anim"; }
				}));
			}
			return result;
		})();
	};

	// Gives each page a neat CSS3 exit transition.
	const setExitAnimation = function(element, i) {
		document.getElementsByTagName('body')[0].style.background = 'rgba(0,0,0,0)';
		const _this = element;
		const _i     = i;
		return setTimeout(() => _this.className = "paper rotated"
		, (_i*100)+50);
	};

	// Triggers the exit transition.
	const animateExit = paper => [0, 1, 2, 3].map((i) =>
        setExitAnimation(paper[i], i));

	// Public methods.
	return {
		setStartAnimation,
		fadeIn,
		fadeOut,
		showNewParagraph,
		showEmptyInput,
		setExitAnimation,
		animateExit
	};
})();