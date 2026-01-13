/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').Events = (function() {
	let welcomePage    = null;
	let gamePage       = null;
	let submit         = null;
	let submitCheck    = null;
	let goBack         = null;
	let reset          = null;
	let submissionPage = null;
	let paper          = null;

	const _cacheElements = function() {
		welcomePage    = document.getElementById('welcome-page');
		gamePage       = document.getElementById('game-page');
		submit         = document.getElementById('submit');
		submitCheck    = document.getElementById('submit-check');
		goBack         = document.getElementById('go-back');
		reset          = document.getElementById('reset');
		submissionPage = document.getElementById('submission-page');
		paper          = document.getElementsByClassName('paper');

		return this;
	};

	const setEventListeners = function() {
		_cacheElements();

		document.oncontextmenu = () => false;                  // Disables right click.
		document.addEventListener('mousedown', function(e) {
			if (e.button === 2) { return false; } else { return true; }
		});          // Disables right click.

		welcomePage.addEventListener('click', function() {
			Wordguess.UI.fadeOut(welcomePage, 300);         // Fade out the welcome screen.
			return gamePage.className = "quick-anim";
		});              // 'Un-blur' the game page.

		submit.addEventListener('mousedown', () => submit.className = 'button quick-anim2 pushed'); // Gives a button a 'pushed' animation.
		submit.addEventListener('mouseup', function() {
			submit.className = 'button quick-anim2';        // Removes the 'pushed' animation.
			if (Wordguess.Logic.checkForEmptyInput()) {
				Wordguess.UI.fadeIn(submissionPage);        // Fades in alert screen.
				return gamePage.className = 'blurred quick-anim';  // 'Re-blur' the game page.
			} else {
				Wordguess.UI
					.fadeOut(submissionPage, 300)
					.animateExit(paper);
				gamePage.className = "quick-anim";
				return Wordguess.Engine.endGame();
			}
		});
		submit.addEventListener('mouseout', () => submit.className = "button quick-anim2");

		reset.addEventListener('mousedown', () => reset.className = "button quick-anim2 pushed");
		reset.addEventListener('mouseup', function() {                 // Triggers removal of all entered words.
			reset.className = "button quick-anim2";
			const inputs = document.getElementsByTagName('input');  // Will store every input on page.
			return (() => {
				const result = [];
				for (let i = 0, end = inputs.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
					inputs[i].value = '';                         // Removes inputs' value.
					result.push(inputs[i].className = "quick-anim");
				}
				return result;
			})();
		});           // Removes highlight if highlighted.
		reset.addEventListener('mouseout', () => reset.className = "button quick-anim2");

		submitCheck.addEventListener('mousedown', () => submitCheck.className = "button quick-anim2 pushed");
		submitCheck.addEventListener('mouseup', function() {
			Wordguess.UI
				.fadeOut(submissionPage, 300)
				.animateExit(paper);
			gamePage.className = "quick-anim";
			Wordguess.Engine.endGame();
			return submitCheck.className = "button quick-anim2";
		});
		submitCheck.addEventListener('mouseout', () => submitCheck.className = "button quick-anim2");

		goBack.addEventListener('mousedown', () => goBack.className = "button quick-anim2 pushed");
		goBack.addEventListener('mouseup', function() {
			Wordguess.UI.fadeOut(submissionPage, 300);
			goBack.className = "button quick-anim2";
			gamePage.className = "quick-anim";
			return Wordguess.UI.showEmptyInput();
		});
		goBack.addEventListener('mouseout', () => goBack.className = "button quick-anim2");

		return this;
	};

	// Public methods.
	return {setEventListeners};
})();