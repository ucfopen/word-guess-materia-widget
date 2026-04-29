/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').Logic = (function() {

	// Regex to match non-letter characters (non-Unicode letters)
	const regexNotAlpha = /[^\p{L}]/u;

	// Sends back an input with leading/trailing punctuation.
	const replaceText = function(text) {
		const first = text.charAt(0);
		const last = text.charAt(text.length - 1);

		// Leading and trailing punctuation exist.
		if ((first.match(regexNotAlpha) !== null) && (last.match(regexNotAlpha) !== null)) {
			return text = first+'<input class="quick-anim" type="text" value="" />'+last;
		// Only leading punctuation.
		} else if (first.match(regexNotAlpha) !== null) {
			return text = first+'<input class="quick-anim" type="text" value="" />';
		// Only trailing punctuation.
		} else if (last.match(regexNotAlpha) !== null) {
			return text = '<input class="quick-anim" type="text" value="" />'+last;
		} else {
			return text = '<input class="quick-anim" type="text" value="" />';
		}
	};

	// Searches through every input and returns whether or not blanks exist.
	const checkForEmptyInput = function() {
		let blanks = 0;
		const inputs = document.getElementsByTagName('input');

		// Search for empty input boxes.
		for (let i = 0, end = inputs.length-1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
			if (!inputs[i].value) { blanks = 1; }
		}

		if (blanks > 0) { return true; } else { return false; }
	};

	// Public methods.
	return {
		replaceText,
		checkForEmptyInput
	};
})();