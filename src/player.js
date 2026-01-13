/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
Namespace('Wordguess').Engine = (function() {
	const regexLT  = /</g;
	const regexGT  = />/g;
	const escapeLT = '&lt;';
	const escapeGT = '&gt;';
	let _qset    = null;

	// Initializes the starting game state.
	const start = function(instance, qset, version) {
		if (version == null) { version = 1; }
		_qset = qset;
		Wordguess.Events
			.setEventListeners();
		return Wordguess.UI
			.setStartAnimation(document.getElementById('guess'))
			.showNewParagraph(_qset);
	};

	// Returns user input to Materia to be graded.
	const saveAnswers = function() {
		const inputs = document.getElementsByTagName('input');

		return __range__(0, inputs.length-1, true).map((i) =>
			Materia.Score
				.submitQuestionForScoring(
					_qset.questions_answers[i].id,
					inputs[i].value.replace(regexLT, escapeLT).replace(regexGT, escapeGT)));
	};

	// Tell's Materia to redirect to the score screen.
	const endGame = function() {
		if (saveAnswers()) {
			return setTimeout(() => Materia.Engine.end()
			, 800);
		}
	};

	// Public methods.
	return {
		start,
		saveAnswers,
		endGame
	};
})();

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}