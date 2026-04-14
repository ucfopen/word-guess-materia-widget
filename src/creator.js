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
	let activebtn             = null;



	const initNewWidget = function(widget, baseUrl) {
		wordsToSkip           = 3;
		const manualSkippingIndices = [];
		const mannualBtn = document.getElementById("mannual-button");
		const automaticBtn = document.getElementById("auto-button");
		const manualInfo= document.getElementById("manInfo");

		// const manualProgressBar = document.getElementById("manualProgressBar");

		

		//let me choose on landing 
		activebtn = "manual";
		console.log(mannualBtn.classList);
		mannualBtn.classList.add("selected");
		manualInfo.style.display = "block";

		
		
		console.log(Wordguess.CreatorEvents);
		
 
			Wordguess.CreatorEvents.addBtnListeners()
			Wordguess.CreatorEvents.selectedWordsLogic()
					
			// .cacheElements();
			// .setEventListeners(isMobile)
			// .setSecondMenuEventListeners()
			// .onNextClick('automatic', true);

			
	    
		
	};
	
	

	const initExistingWidget = function(title, widget, qset, version, baseUrl) {

		console.log(qset);

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
		.initializeHiddenWords(manualSkippingIndices, qset.paragraph) // qset 
		
		Wordguess.CreatorEvents
			.storeHiddenWords();

		// set screen to state after clicking next
		return Wordguess.CreatorEvents
			.onNextClick(previousMode);
	};

	const onSaveClicked = function(mode) { // are we saving as a draft 
		let widgetTitle;
		if (mode == null) { mode = 'save'; } // save draft save publish 
		const titleValue = document.getElementById('title').value;
		// if (titleValue) { widgetTitle = Wordguess.CreatorLogic.replaceTags(titleValue);
		// } else { widgetTitle = 'New Wordguess Widget'; }

		console.log(titleValue);
		_qset = buildSaveData();

		if (_qset === null) { return false; }
		console.log(_qset);

		return Materia.CreatorCore.save(titleValue, _qset);
		
	};

	

	const buildSaveData = () =>{

		let qset= { 
			"items" : [],
			"options": {},

		}

		const words    = Wordguess.CreatorEvents.getWords()
		const highlightedWords =Wordguess.CreatorEvents.getHighlightedWords();
		const hideMode = document.getElementById("auto-button").classList.contains("selected");

		qset.options.hideMode = hideMode === true ? "automatic" : "manual";
		qset.options.passage = words;

	for(const id of highlightedWords) {


		let hiddenWord = words.find((w) => w.id == id);

		let question = {
			"id" : null, 
			"type": "wordguess",
			"materiaType" : "question",
			"questions": [
				{
					"text": "",
				}
			], 
			"answers": [
				{
					"text": hiddenWord.text,
				}
			],
			"options": {
				"wordId" : hiddenWord.id,
			} 
		}
		qset.items.push(question); 

	};

	qset.items = qset.items.sort((a,b)=>{
		return a.options.wordId - b.options.wordId
	})
	
	return qset;

	}

 

	const onSaveComplete = (title, widget, qset, version) => true;

	// Public methods, called by Materia.
	return {
		initNewWidget,
		initExistingWidget,
		onSaveClicked,
		onSaveComplete
	};
})();

// old qset
		// const buildQuestionsAnswers = function(words) {
			// 		let i;
			// 		const questionsAnswers = [];
			// 		let j = 1;
			
			// 		if (hideMode) === true) {
			// 			let asc, end;
			// 			for (i = 0, end = manualSkippingIndices.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
			// 				questionsAnswers.push({
			// 					'id'        : 0,
			// 					'type'      : 'QA',  // wordguess
			// 					'questions' :[{'text': ('word #' + j)}],
			// 					'answers'   :[{'text': removePunc(paragraph[manualSkippingIndices[i]])}]});
			// 				j++;
			// 			} 
			
			// 		} else {
			// 			let asc1, end1, step;
			// 			for (i = wordsToSkip, end1 = paragraph.length - 1, step = i + 1, asc1 = step > 0; asc1 ? i <= end1 : i >= end1; i += step) {
			// 				questionsAnswers.push({
			// 					'id'        : 0,
			// 					'type'      : 'QA',
			// 					'questions' :[{'text': 'word #' + j}],
			// 					'answers'   :[{'text': removePunc(paragraph[i])}]});
			// 				j++;
			// 			}
			// 		}
			
			// 		return questionsAnswers;
			// 	};
			
			// return qset = {
			// 	// 			'questions_answers'     : questionsAnswers,
			// 	// 			'title'                 : replaceTags(document.getElementById('title').value),
			// 	// 			'paragraph'             : replaceTags(paragraph.join(' ')),
			// 	// 			'wordsToSkip'           : wordsToSkip,
			// 	// 			'manualSkippingIndices' : manualSkippingIndices,
			// 	// 			'previousWordsToSkip'   : previousWordsToSkip
			// 	// 		};