/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

Namespace('Wordguess').CreatorEvents = (function() {

	// Divs:
	let textArea 			= null;
	let textWhiteBackground = null;
	let wordBank			= null;
	let wordPills 			= null;
	let hideCount			= null; 
	let highlightedWords	= new Set(); // empty set of selected words 

	//Inputs 
	let words 				= [];
	let value				= null;

	// buttons and button details 
	let mannualBtn 			= null;
	let automaticBtn 		= null;
	let manualInfo			= null;
	let autoInfo			= null;
	let sliderOutput 		= null;
	let slider 				= null;
	let pencilEditButton	= null;
	let mouseClickButton 	= null;
	let slideButton			= null;
	let sliderMessage 		= null;
	let progressBar 		= null;
	let progressBarMsg		= null;
	let refreshBtn 			= null;
	let trashBtn			= null;
	let activebtn 			= "manual";
	let sliderUsed          = false;

	let wordIdCounter = 0; // a word has an id rather than a fixed index


	// conjunctions to hide 
	const conjunctions = [
		"and", "or", "the", "then", "because", "is", "but",
		 "it","of", "with", "in", "for","to", "has", "a", "an", "into"
	];

	
	// funcion to seperate words by white space
	function generateWords() {
		textArea = document.getElementById("textarea");
		const wordContent = textArea.value.trim();
		
		//if the user deletes all words clear everything   
		if(!wordContent) {
			words=[];
			resetAllUI();
			return;
		}
	  
		const newWordsText = wordContent.split(/\s+/); 
		const newWords = [];
		
		let prevIndex = 0; // keeping track of the old index of the word 
	
		newWordsText.forEach(word =>{

			// case 1: if the same word is in the same positon -> reuse the id
			if (words[prevIndex] && words[prevIndex].text === word){
				newWords.push(words[prevIndex]);
				prevIndex++;
			}
			// case 2: if the a word is matching another word/ is moved  also if a word is delete/insert
			else {

				const matchIndex= words.findIndex((w,i) => i >= prevIndex && w.text === word); // returning the index of the 

					if (matchIndex !== -1){
						newWords.push(words[matchIndex]);
						prevIndex = matchIndex +1;
					}
					// case 3: adding a new word and a new id 
					else{
						 newWords.push({
							id: wordIdCounter++,
							text: word

						 });
					}
			}

		});
		
		// reassign words
		words = newWords;

		// remove deleted highlighted words 
		const validIds = new Set(words.map(w => w.id));

		//check to make sure that all  words exist
		highlightedWords.forEach(id=>{

			if (!validIds.has(id)){
				highlightedWords.delete(id);
			}
		});
		
		//remake the spand and update the words bank 
		makeWordsSpans();
		updateWordBank();

		lmcProgressBar();
		return words;
	}


	// popoulate the wordbank 
	function updateWordBank() {

		// get the main container + refresh button
		wordBank = document.getElementById("word-bank-pills");
		refreshBtn = document.getElementById("refresh-button");
		trashBtn = document.getElementById("trash-button");


		if (!wordBank) return;
	
		wordBank.innerHTML = "";
	
		// create word pills
		highlightedWords.forEach(id => {
	
			// find the word object using the id
			const word = words.find(w => w.id === id);
			if (!word) return;
	
			const pill = document.createElement("div");
			pill.classList.add("word-bank-pill");
			const text = document.createElement("span");
			text.textContent = word.text;
	
			// create delete (X) button
			const deleteBtn = document.createElement("span");
			deleteBtn.classList.add("delete-btn");
			deleteBtn.innerHTML = `<svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M8.24609 0.5C8.33074 0.5 8.40225 0.530212 8.44629 0.569336C8.4884 0.606777 8.49902 0.644418 8.49902 0.668945C8.49899 0.693408 8.48807 0.73029 8.44629 0.767578L5.22461 3.625L4.80273 3.99902L5.22461 4.37305L8.44629 7.23145L8.44727 7.23242C8.46839 7.25105 8.4816 7.26982 8.48926 7.28613C8.4968 7.30223 8.5 7.31693 8.5 7.33008L8.48926 7.37402C8.4816 7.39032 8.46835 7.40914 8.44727 7.42773L8.44434 7.43066C8.42352 7.44928 8.39578 7.46666 8.36133 7.47949C8.3265 7.49239 8.28669 7.5 8.24609 7.5C8.2056 7.49997 8.16658 7.49236 8.13184 7.47949C8.09712 7.46661 8.06876 7.4494 8.04785 7.43066L8.04688 7.42969L4.83301 4.56543L4.5 4.26855L4.16699 4.56543L0.953125 7.42969L0.952148 7.43066C0.931245 7.4494 0.902885 7.46661 0.868164 7.47949C0.833418 7.49236 0.794404 7.49997 0.753906 7.5C0.713306 7.5 0.6735 7.49239 0.638672 7.47949C0.604216 7.46666 0.576476 7.44928 0.555664 7.43066L0.552734 7.42773L0.510742 7.37402C0.503208 7.35795 0.500008 7.34321 0.5 7.33008C0.5 7.31693 0.503197 7.30223 0.510742 7.28613C0.518399 7.26981 0.531613 7.25105 0.552734 7.23242L0.553711 7.23145L3.77539 4.37305L4.19727 3.99902L3.77539 3.625L0.552734 0.767578C0.51141 0.730453 0.501005 0.693303 0.500977 0.668945C0.500977 0.644418 0.511596 0.606776 0.553711 0.569336C0.597745 0.530212 0.669263 0.5 0.753906 0.5C0.817074 0.500051 0.872624 0.517097 0.915039 0.541992L0.953125 0.569336L4.16699 3.43359L4.5 3.72949L4.83301 3.43359L8.04688 0.569336C8.09088 0.530353 8.16172 0.500068 8.24609 0.5Z" fill="#2C006E" stroke="#A89011"/>
			</svg>
			`;
	
			// clicking delete removes the word
			deleteBtn.addEventListener("click", (event) => {
				event.stopPropagation();
				removeHighlightedWord(id);
			});
	
			// clicking the pill also removes the word
			pill.addEventListener("click", (event) => {
				event.stopPropagation();
				removeHighlightedWord(id);
			});
	
			pill.appendChild(text);
			pill.appendChild(deleteBtn);
			wordBank.appendChild(pill);
		});


		if (refreshBtn) {
			if (activebtn === "automatic" && sliderUsed && highlightedWords.size > 0) {
				refreshBtn.style.display = "block";
				
			} else {
				refreshBtn.style.display = "none";
			}
		}
	
		if (trashBtn) {
			if (highlightedWords.size > 0) {
				trashBtn.style.display = "block";
			} else {
				trashBtn.style.display = "none";
			}
		}

	}
	
	// delete button in pill logic
	function removeHighlightedWord(id) {

		highlightedWords.delete(id);
	
		const spans = document.querySelectorAll(".word-span-pill");
	
		spans.forEach(span => {
			// comparing stored index instead of the word content
			if (span.dataset.id === id) {
				span.classList.remove("highlighted");
			}
		});

			
			updateWordBank();
			updateAutoMessage();
			lmcProgressBar();
	  }
	
	// trash button logic/functionality 
	function clearAllWords (){

		highlightedWords.clear();

		const spans = document.querySelectorAll(".word-span-pill");
		spans.forEach( span => span.classList.remove("highlighted"));

		updateWordBank();
		updateAutoMessage();
		lmcProgressBar();
	};

	// refresh logic for button
	function refreshAutoWords(){

		// take in slider value to maintain the spacing 
		if (!slider || !words.length) return;

		const hideCount = parseInt(slider.value, 10);
		if (!hideCount || hideCount <= 2) return;

		const spans = document.querySelectorAll(".word-span-pill");
		
		highlightedWords.clear();
		spans.forEach(span => span.classList.remove("highlighted"));

		// making sure the same spacing selected in automaic is maintained but shifting it randomly to refresh 
		const shuffle = hideCount +1;
		const refresh = Math.floor(Math.random() * shuffle);

		spans.forEach((span, index) => {
			const wordContent= span.textContent.toLowerCase();

			// keep the same spacing and check if conjunctions
			if (((index + refresh +1) % shuffle) == 0 && !conjunctions.includes(wordContent)){
				span.classList.add("highlighted");
				highlightedWords.add(span.dataset.id); // adding new id
			}

		});

		makeWordsSpans();
		updateWordBank();
		lmcProgressBar(); 
	}

	function refreshWordsButton(){

		refreshBtn = document.getElementById("refresh-button");

		if (!refreshBtn) return;

		if(activebtn == "automatic" && words.length > 0 && highlightedWords.size > 0 ){		
				refreshBtn.style.display ="block";
	
			} else {
				
				refreshBtn.style.display ="none";
					
			}			
		
	}

	//  fucntion for let me choose mode button above text area 
	 function mouseClickLogic(){

		mouseClickButton = document.getElementById("mouse-click");
		slideButton 	 = document.getElementById("slide-toggle");

		slideButton.classList.add("slid");

			if (textArea.style.display === "block"){
				textArea.style.display = "none";
				wordPills.style.display = "block";	
			}
	 }

	 function pencilEditLogic(){

		pencilEditButton = document.getElementById("pencil-edit");
		slideButton = document.getElementById("slide-toggle");
			
			slideButton.classList.remove("slid");

			if (textArea.style.display === "none"){
				textArea.style.display = "block";
				wordPills.style.display = "none";
				
			} 
	 }


	// if a word is choosen take user into let me choose mode 
	 function switchToLetMeChoose (){

		lmcProgressBar(); 

		mannualBtn 	 = document.getElementById("mannual-button");
		automaticBtn = document.getElementById("auto-button");
		manualInfo	 = document.getElementById("manInfo");
	    autoInfo     = document.getElementById("autoInfo");

		mannualBtn.classList.add("selected");
		automaticBtn.classList.remove("selected"); 
		manualInfo.style.display = "block";
		autoInfo.style.display = "none";
	
	 }

	 //Message under slider
	 function updateAutoMessage() {
		value = Number(slider.value);
		sliderMessage = document.getElementById("rec-message-auto");


		slider.max= Math.floor((24/100)* words.length);/*limits based on the passage word count */
		slider.min = 3;

		const maxMsgVal = Number(slider.max);
		const minMsgVal = Number(slider.min);
		
		if (value === minMsgVal) {
		  sliderMessage.textContent = "Min words between";
		} 
		else if (value === maxMsgVal) {
		  sliderMessage.textContent = "Max words between";
		} 
		else {
		  sliderMessage.textContent = `${value} words between`;
		}
	  };

	   //turn words from textbox into spans  
	  function makeWordsSpans(){

		wordPills = document.getElementById("pickarea");
		wordPills.innerHTML = ""; 

		words.forEach((word, index )=> {
					
			//create span and add class style
			const span = document.createElement('span');
			span.textContent = word.text;
			span.dataset.id = word.id;
			span.classList.add('word-span-pill');
			
			if(highlightedWords.has(word.id)){
				span.classList.add('highlighted');
			}

			// Append the span to the container + space inbetween
			wordPills.appendChild(span);
			wordPills.appendChild(document.createTextNode(''));
		  });

	  }
	  
	//   automatic word count when typing and pasting 
	  function updateWordCount() {
		const textArea = document.getElementById("textarea");
		const output = document.getElementById("word-count");
	  
		const text = textArea.value.trim();
	  
		if (!text) {
		  output.innerHTML = " 0 / 250 words" ;
		  return;
		}
	  
		const words = text.split(/\s+/);
		const count = words.length;
		output.innerHTML = `${count} / 250 words`;
	  }
	  

	  function highlightSpans(event){

		mouseClickLogic(); // sends user into the click button
		switchToLetMeChoose(); // switch to let me choose 
	
		const wordPills = event.target;

		if (!wordPills.classList.contains("word-span-pill")) return;

		const id = wordPills.dataset.id;

		wordPills.classList.toggle("highlighted");

		if (wordPills.classList.contains("highlighted")){
			highlightedWords.add(id);
		} else {
			highlightedWords.delete(id);
		}
			updateWordBank();
			lmcProgressBar();
		
	  }

	   //LOGIC FOR LET ME CHOOSE PROGRESS BAR DETAILS   
	  function lmcProgressBar(){

		const maxRecWords =  Math.floor((15/100)* words.length); // recommended hidden words based on word count 
		const minRecWords = (maxRecWords) - 5;
		const numOfChosenWords = highlightedWords.size;
		
		progressBarMsg = document.getElementById("rec-message-man");
		progressBar = document.getElementById("mannualBar");
		
		if (!progressBar || !progressBarMsg) return;

		// if there is nothing to calculate dont calulate
		if (words.length === 0 || maxRecWords === 0) {
			progressBar.style.width = "0%";
			progressBar.className = "";
			progressBarMsg.textContent = "Recommended 0 - 0 hidden words";
			progressBarMsg.className = "recMessageMan";
			return;
		}

		progressBar.style.width = (numOfChosenWords/maxRecWords)*100 + '%'; //dynamic progress bar
		

		if (numOfChosenWords==0){
				//Rec message for let me choose
				progressBarMsg.textContent = `Recommended ${minRecWords} - ${maxRecWords} hidden words`;
				progressBarMsg.className = "recMessageMan";					

		}else if (numOfChosenWords < minRecWords/2) {

			progressBarMsg.textContent = "Too few hidden words";
			progressBarMsg.className = "tooFewWords1";
			progressBar.className="tooFewWords1";
			

		  } else if(numOfChosenWords < minRecWords){

			progressBarMsg.textContent = "Too few hidden words";
			progressBarMsg.className = 'tooFewWords1';
			progressBar.className = 'tooFewWords1';
		  }

		  else if (numOfChosenWords >= minRecWords  && numOfChosenWords <= (maxRecWords-2)) {
			progressBarMsg.textContent = "Good choice for this passage";
			progressBarMsg.className = "goodChoice";
			progressBar.className = "goodChoice";
			
		  } 

		  else {
			progressBarMsg.textContent = "Recommended amount reached";
			progressBarMsg.className = "recAmount";
			progressBar.className ="recAmount";
		  }
		
		//   - change the recommended amount instant when changed
		//   |_ when the user goes into let me choose from automatic the words choosen in 
		// 	  automatic will be reflected in let me choose 

		// based on the words in the word bank -> scan/ determine if the recommended words have been reached 
		// and assign it without click
	  
	}

	//  to reset everything once something is deleted 
	function resetAllUI() {
		highlightedWords.clear();
		words = [];
	
		// clear word bank
		wordBank = document.getElementById("word-bank-pills");
		if (wordBank) {
			wordBank.innerHTML = "";
		}
	
		// unhighlight all spans in pick area
		const wordPillSpans = document.querySelectorAll(".word-span-pill");
		wordPillSpans.forEach(span => span.classList.remove("highlighted"));
	
		// clear pick area
		const pillsInPickArea = document.getElementById("pickarea");
		if (pillsInPickArea) {
			pillsInPickArea.innerHTML = "";
		}
	
		// reset manual progress bar
		progressBar = document.getElementById("mannualBar");
		progressBarMsg = document.getElementById("rec-message-man");
	
		if (progressBar) {
			progressBar.style.width = "0%";
			progressBar.className = "";
		}
		if (progressBarMsg) {
			progressBarMsg.textContent = "Recommended 0 - 0 hidden words";
			progressBarMsg.className = "recMessageMan";
		}
	
		// reset automatic slider message
		slider = document.getElementById("myRange");
		sliderMessage = document.getElementById("rec-message-auto");
	
		if (slider) {
			slider.value = 3;
		}
		if (sliderMessage) {
			sliderMessage.textContent = "Min words between";
		}
	
		// reset slider mask
		const mask = document.getElementById("sliderMask");
		if (mask) {
			mask.style.width = "0%";
			mask.dataset.percentage = 0;
		}
	
		refreshWordsButton();
		updateWordBank();
	}
	

	const selectedWordsLogic = () => {

	 textArea 				= document.getElementById("textarea");
	 wordPills 				= document.getElementById("pickarea");
	 wordBank 				= document.getElementById("word-bank");
	 textWhiteBackground	= document.getElementById("textInput");
	 pencilEditButton 		= document.getElementById("pencil-edit");
	 trashBtn				= document.getElementById("trash-button");
	 mouseClickButton 		= document.getElementById("mouse-click");

	 if(trashBtn){
		trashBtn.addEventListener("click", clearAllWords);
	 }

	 	textArea.addEventListener("input", updateWordCount);

		// slide toggle for edit/pick mode 
		pencilEditButton.addEventListener('click', pencilEditLogic);
		mouseClickButton.addEventListener("click", mouseClickLogic);

		// null check
		if (!textArea || !wordPills|| !wordBank ) return;

		 	wordPills.style.display = "none";

			textArea.addEventListener("blur", (event)=> {
					
	
				words = generateWords();
				if (!words) return;

				if (words.length <= 500){

				wordPills.innerHTML = ""; 

				makeWordsSpans();
				// swap pills with textarea 
				textArea.style.display = "none";
				wordPills.style.display = "block";
				mouseClickLogic();
				  
			} 	
});
				//to highlight pills + track which one is highlighted
				wordPills.addEventListener('click', highlightSpans);

			
	};

	
	
	// HIDE OPTIONS LOGIC
	const addBtnListeners = () => {

		console.log("addBtnListeners fired");

		mannualBtn 			= document.getElementById("mannual-button");
		automaticBtn 		= document.getElementById("auto-button");
		manualInfo			= document.getElementById("manInfo");
		autoInfo			= document.getElementById("autoInfo");
		sliderOutput 		= document.getElementById("sliderValue");
		slider 				= document.getElementById("myRange");
		refreshBtn			= document.getElementById("refresh-button");

			if (refreshBtn) {
				refreshBtn.addEventListener("click", () => {
					if (activebtn === "automatic") {
						refreshAutoWords();
					}
				});
			}
				
			// AUTOMATIC BUTTON LOGIC (AHHHHHHHHH!)
			slider.addEventListener("input", (event) => {

				sliderUsed= true;

				hideCount 		   	= parseInt(event.target.value);
				const spans    	   	= document.querySelectorAll(".word-span-pill");
				const mask 		   	= document.getElementById("sliderMask");			
				
				/*limits based on the passage word count */
				slider.max= Math.floor((24/100)* words.length);
				
				if (!hideCount || hideCount <= 2) {
					return;
				}

				// dynamic slider value range 
				highlightedWords.clear(); 

				spans.forEach( span => {
					span.classList.remove("highlighted");
				});

				spans.forEach((span, index) => {
					if ((index + 1) % (hideCount + 1) === 0) {

						// take out conjunctions
						if(!conjunctions.includes(span.textContent.toLowerCase())){
						span.classList.add("highlighted");
						highlightedWords.add(span.dataset.id);
					}
				}
				updateAutoMessage(); // just added
			});
			
				// for the dynamic response of slider 
				mask.style.width = ((slider.value/ slider.max) *100 )+"%";
				mask.dataset.percentage = slider.value;

				updateWordBank();
				updateAutoMessage();
				refreshWordsButton();

			});
	

				mannualBtn.addEventListener("click", (event) => {
					console.log("Manual clicked");
					
					activebtn="manual";
					switchToLetMeChoose();	
					refreshWordsButton();	

				})

				automaticBtn.addEventListener("click", (event) => {
					sliderUsed = true;

					console.log("auto clicked");

					mouseClickLogic();
					activebtn = "automatic";

					automaticBtn.classList.add("selected");
					mannualBtn.classList.remove("selected");

					manualInfo.style.display = "none";
					autoInfo.style.display = "block";
			
						refreshWordsButton();

				});}
			

	const getWords = ()=>{
		return words;
	}
	
	const getHighlightedWords = ()=>{
		return highlightedWords;
	}

					return {
						addBtnListeners,
						selectedWordsLogic,
						getWords,
						getHighlightedWords
					}




	})();


	window.onload = function() {
		const dialog = document.getElementById('instructionalDialog');
		const closeButton = document.getElementById('closeButton');
	  
		// Shows the dialog as a modal on load
		dialog.showModal(); 
	  
		// Close functionality
		closeButton.onclick = () => dialog.close();
	  };
	  



/* 
TO DO : 11/03/2026 (x - what i got done )

X work on the the reverse state of lmc for when word is deselected

X change the recommended amount instant when changed
	|_ when the user goes into let me choose from automatic the words choosen in 
		automatic will be reflected in let me choose 

X word count change 
	- make the word count appear on pastin
	 
- title asigned

X update the css for the let me choose bar - make larger and cnetered 

FUTURE TASKS FOR AFTER

- q-set update //

-accesibilty for the interface 
	\_ add tabindex and focus for button and key select to mak eth ebuttons workable 
	|_ labelling logic for tabbing 

- word bank features :
	|_let me choose :- delete button ( from word bank and the passage )
	|_ automatic :- refresh (automtic logic) and delete button 


*/













































// /*
//  * decaffeinate suggestions:
//  * DS101: Remove unnecessary use of Array.from
//  * DS102: Remove unnecessary code created because of implicit returns
//  * DS205: Consider reworking code to avoid use of IIFEs
//  * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
//  */

// Namespace('Wordguess').CreatorEvents = (function() {
// 	// Divs:
// 	let editRegion        = null;
// 	let paragraphTextarea = null;
// 	let editable          = null;
// 	let hiddenWords       = null;
// 	let hiddenWordsBox    = null;
// 	const option2           = null;
// 	const option1           = null;

// 	// Buttons:
// 	let numUp          = null;
// 	let numDown        = null;
// 	let numWordsToSkip = null;
// 	let nextButton     = null;
// 	let backButton     = null;
// 	let resetButton    = null;
// 	let autoHide       = null;
// 	let manHide        = null;

// 	// Inputs:
// 	let title          = null;
// 	const paragraphTitle = null;
// 	let wordsToSkipBox = null;

// 	// Information divs:
// 	let noParagraph         = null;
// 	let goBack              = null;
// 	let manuallySelectInfo  = null;

// 	let warningText = null;
// 	let saveWarningText = null;

// 	let infoBubbles = null;
// 	let bigInfo    = null;

// 	let manuallyHide = false;
// 	let animating    = false;
// 	let menu         = 1;
// 	let mode 	     = 'automatic';

// 	// Previous state of manual hidden words
// 	let previousHiddenWords = [];

// 	const cacheElements = function() {
// 		// Divs:
// 		editRegion        = document.getElementById('edit-region');
// 		paragraphTextarea = document.getElementById('paragraph'); // this is the input box to type the paragraph
// 		editable          = document.getElementById('editable'); // these have the buttons for the word bank
// 		hiddenWords       = document.getElementById('hidden-words');
// 		hiddenWordsBox    = document.getElementById('hidden-words-box');
// 		const options           = document.getElementById('options');

// 		// Buttons:
// 		numUp          = document.getElementById('num-up');
// 		numDown        = document.getElementById('num-down');
// 		numWordsToSkip = document.getElementById('num-words-to-skip');
// 		nextButton     = document.getElementById('next');
// 		// backButton     = document.getElementById('back');
// 		resetButton    = document.getElementById('reset');
// 		autoHide       = document.getElementById('auto-hide');
// 		manHide        = document.getElementById('man-hide');

// 		// Inputs:
// 		title          = document.getElementById('title');
// 		wordsToSkipBox = document.getElementById('words-to-skip');

// 		// Information divs:
// 		noParagraph        = document.getElementById('no-paragraph');
// 		goBack             = document.getElementById('go-back');
// 		manuallySelectInfo = document.getElementById('manually-select-info');

// 		infoBubbles = document.getElementsByClassName('info-bubble');
// 		bigInfo    = document.getElementsByClassName('big-info');

// 		warningText = document.getElementById('warning-text');

// 		saveWarningText = document.getElementById('save-warning-text');

// 		return this;
// 	};

// 	const storeHiddenWords = function() {
// 		// store the hidden words
// 		previousHiddenWords = Wordguess.CreatorLogic.getHiddenWords().slice();

// 		return this;
// 	};

// 	const initializeWordsToSkip = function(wordsToSkip) {
// 		numWordsToSkip.innerHTML = wordsToSkip;
// 		Wordguess.CreatorLogic
// 			.setWordsToSkip(wordsToSkip);

// 		return this;
// 	};
	
// 	const onNextClick = function(previousMode, skipValidation = false) {

// 		// autoHide.classList.add();
// 		// manHide.classList.remove('selected');

// 			// default to second menu 
// 			if (!skipValidation & Wordguess.CreatorLogic.noParagraph(paragraphTextarea)) {
// 				alert('please enter paragraph');



				

// 			// } else { // A paragraph has been entered.
// 				// menu = 2;

// 				Wordguess.CreatorLogic
// 					.resetWordsToSkip(paragraph, numWordsToSkip)
// 					.analyzeParagraph(paragraphTextarea.value);

// 				previousHiddenWords = Wordguess.CreatorLogic
// 					.updateHiddenWords(paragraphTextarea.value, previousHiddenWords);


// 				// Wordguess.CreatorUI
// 				// 	.hideFirstMenu(paragraphTextarea, resetButton)
// 				// 	.showSecondMenu(title, editable)
// 				// 	.hideWarningText(warningText)
// 				// 	.animateInSecondMenu(editRegion.style, hiddenWords.style, options)
// 				// 	.showHiddenWords(hiddenWordsBox)
// 				// 	.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
			
// 				// set mode to previous mode
// 				if (previousMode === 'manual') {
// 					return Wordguess.CreatorEvents
// 						.onManHideClick();

// 				} else if (previousMode === 'automatic') {
// 					return Wordguess.CreatorEvents
// 						.onAutoHideClick();
// 				}
// 			}
// 		};
	

	


// 	const onManHideClick = function() {

// 		// if im already on manual mode, dont do anything
// 		if (mode === 'manual') {
// 			return;
// 		}


// 		manHide.classList.add('selected');
// 		autoHide.classList.remove('selected');

// 		mode = 'manual';
// 		manuallyHide = true;

// 		options.children[2].style.display = 'none';
// 		options.children[3].style.display = 'block';
// 		options.children[3].style.opacity = 1;

// 		resetButton.style.opacity = 1;

// 		hiddenWordsBox.innerHTML = '';

// 		Wordguess.CreatorLogic
// 			.setUpManualHiding(paragraphTextarea.value, editable, previousHiddenWords);
// 		Wordguess.CreatorUI
// 			.showHiddenWords(hiddenWordsBox);

// 		document.removeEventListener('click', removeManHideBox);
// 		manuallySelectInfo.style.display = 'block';
// 		setTimeout(function() {
// 			manuallySelectInfo.style.margin = '-397px 0 0 5px';
// 			return manuallySelectInfo.style.opacity = 0.8;
// 		}
// 		, 5);

// 		return setTimeout(() => document.addEventListener('click', removeManHideBox)
// 		, 1);
// 	};
	
// 	const onAutoHideClick = function() {
// 		// if im already on automatic mode, dont do anything
// 		if (mode === 'automatic') {
// 			return;
// 		}

// 		// save the previous hidden words
// 		storeHiddenWords();

// 		autoHide.classList.add('selected');
// 		manHide.classList.remove('selected');
	
// 		mode = 'automatic';
// 		manuallyHide = false;
// 		Wordguess.CreatorLogic
// 			.turnOffManualHiding();

// 		options.children[2].style.display = 'block';
// 		options.children[3].style.display = 'none';

// 		resetButton.style.opacity = 0;

// 		Wordguess.CreatorLogic
// 			.analyzeParagraph(paragraphTextarea.value);
// 		Wordguess.CreatorUI
// 			.showHiddenWords(hiddenWordsBox)
// 			.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);

// 		return unsetManualChoiceEventListeners();
// 	};


// 	const setEventListeners = function(isMobile) {
// 	// 	// Disable right click.
// 	// 	document.oncontextmenu = () => false;
// 	// 	document.addEventListener('mousedown', function(e) {
// 	// 		if (e.button === 2) { return false; } else { return true; }
// 	// 	});

// 		// Events for information bubbles.
// 		if (!isMobile) {
// 			for (var bubble of Array.from(infoBubbles)) {
// 				bubble.addEventListener('mouseenter', function() {
// 					if (!animating) {
// 						animating = true;
// 						setTimeout(() => animating = false
// 						, 300);
// 						return Wordguess.CreatorUI.showInfoBox(this);
// 					}
// 				});

// 				bubble.addEventListener('mouseleave', function() {
// 					return Wordguess.CreatorUI.hideInfoBox(this);
// 				});
// 			}

// 			for (var info of Array.from(bigInfo)) {
// 				info.addEventListener('mouseover', function() {
// 					return Wordguess.CreatorUI.hideBigInfoBox(this.style);
// 				});
// 			}
// 		}

// 		// Reset will either clear a paragraph on the first menu,
// 		// or clear the manually selected words on the second.
// 		resetButton.addEventListener('click', function() {
// 			if (menu === 1) {
// 				title.value              = '';
// 				paragraphTitle.value     = '';
// 				paragraphTextarea.value  = '';
// 				editable.innerHTML       = '';
// 				hiddenWordsBox.innerHTML = '';
// 				return Wordguess.CreatorLogic
// 					.resetHiddenWords();

// 			} else if (manuallyHide === true) {
// 				return Wordguess.CreatorLogic
// 					.setUpManualHiding(paragraph, editable)
// 					.showHiddenWords(hiddenWordsBox);
// 			}
// 		});

// 		// nextButton.addEventListener('click', function() {
// 		// 	const previousMode = mode;

// 		// 	// default mode is automatic
// 		// 	mode = 'automatic';
// 		// 	return onNextClick(previousMode);
// 		// });


// 		return this;
// 	};

// 	const setSecondMenuEventListeners = function() {
// 		numUp.addEventListener('click', function() {
// 			Wordguess.CreatorLogic
// 				.wordsToSkipUp(paragraphTextarea.value, numWordsToSkip)
// 				.analyzeParagraph(paragraphTextarea.value);
// 			return Wordguess.CreatorUI
// 				.showHiddenWords(hiddenWordsBox)
// 				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
// 		});

// 		numDown.addEventListener('click', function() {
// 			Wordguess.CreatorLogic
// 				.wordsToSkipDown(numWordsToSkip)
// 				.analyzeParagraph(paragraphTextarea.value);
// 			return Wordguess.CreatorUI
// 				.showHiddenWords(hiddenWordsBox)
// 				.highlightWords(numWordsToSkip, paragraphTextarea.value, editable);
// 		});

// 		manHide.addEventListener('click', () => onManHideClick());

// 		autoHide.addEventListener('click', () => onAutoHideClick());

		
// 		// backButton.addEventListener('click', function() {
// 		// 	if (!animating) {
// 		// 		animating = true;
// 		// 		setTimeout(() => animating = false
// 		// 		, 400);

// 		// 		menu = 1;

// 		// 		Wordguess.CreatorUI
// 		// 			.showFirstMenu(paragraphTextarea, resetButton)
// 		// 			.hideSecondMenu(title, backButton, editable)
// 		// 			.showWarningText(warningText)
// 		// 			.animateOutSecondMenu(editRegion.style, hiddenWords.style, options);

// 		// 		if (manuallyHide === false) {
// 		// 			return resetButton.style.opacity = 1;
// 		// 		}
// 		// 	}
// 		// });

// 		editable.addEventListener('click', function() {
// 			document.removeEventListener('click', removeGoBackBox);

// 			if (menu === 2) {
// 				if (manuallyHide === false) {
// 					goBack.style.display = 'block';
// 					setTimeout(function() {
// 						goBack.style.margin = '-62px 0 0 -10px';
// 						return goBack.style.opacity = 0.8;
// 					}
// 					, 5);
// 				}
// 			}

// 			return setTimeout(() => document.addEventListener('click', () => removeGoBackBox)
// 			, 1);
// 		});

// 		return this;
// 	};

// 	var removeNoParagraphBox = function() {
// 		const elementStyle = noParagraph.style;
// 		elementStyle.margin = '72px 0 0 10px';
// 		elementStyle.opacity = 0;
// 		return setTimeout(() => elementStyle.display = 'none'
// 		, 300);
// 	};

// 	var removeGoBackBox = function() {
// 		const elementStyle = goBack.style;
// 		elementStyle.margin  = '-72px 0 0 -10px';
// 		elementStyle.opacity = 0;
// 		return setTimeout(() => goBack.display = 'none'
// 		, 300);
// 	};

// 	var removeManHideBox = function() {
// 		const elementStyle = manuallySelectInfo.style;
// 		elementStyle.margin = '-407px 0 0 5px';
// 		elementStyle.opacity = 0;
// 		return setTimeout(() => elementStyle.display = 'none'
// 		, 300);
// 	};


// 	const onEditableOver = function() {
// 		return this.classList.add('yellow');
// 	};

// 	const onEditableOut = function() {
// 		return this.classList.remove('yellow');
// 	};

// 	const onEditableClick = function() {
// 		let index;
// 		if (this.classList.contains('manually-selected')) {
// 			this.classList.remove('manually-selected');

// 			index = parseInt(this.getAttribute('data-index'));
// 			Wordguess.CreatorLogic.removeHiddenWord(this, index);

// 		// adding a word to the hidden words
// 		} else {
// 			Wordguess.CreatorUI
// 				.hideWarningText(saveWarningText);

// 			// store the index of the word in the paragraph
// 			index = parseInt(this.getAttribute('data-index'));

// 			this.classList.add('manually-selected');
// 			Wordguess.CreatorLogic
// 				.pushHiddenWord(this.innerHTML, index);
// 		}

// 		Wordguess.CreatorUI
// 			.showHiddenWords(hiddenWordsBox);

// 		manuallySelectInfo.style.margin = '-407px 0 0 5px';
// 		manuallySelectInfo.style.opacity = 0;
// 		return setTimeout(() => manuallySelectInfo.style.display = 'none'
// 		, 300);
// 	};

// 	const setManualChoiceEventListeners = function() {
// 		const editables = document.querySelectorAll('#editable span');
// 		return (() => {
// 			const result = [];
// 			for (var edit of Array.from(editables)) {
// 				edit.addEventListener('mouseover', onEditableOver);
// 				edit.addEventListener('mouseout', onEditableOut);
// 				result.push(edit.addEventListener('click', onEditableClick));
// 			}
// 			return result;
// 		})();
// 	};

// 	var unsetManualChoiceEventListeners = function() {
// 		const editables = document.querySelectorAll('#editable span');
// 		return (() => {
// 			const result = [];
// 			for (var edit of Array.from(editables)) {
// 				edit.removeEventListener('mouseover', onEditableOver);
// 				edit.removeEventListener('mouseout', onEditableOut);
// 				result.push(edit.removeEventListener('click', onEditableClick));
// 			}
// 			return result;
// 		})();
// 	};


	// Public methods.
	// return {
	// 	// cacheElements,
	// 	setEventListeners,
	// 	// setSecondMenuEventListeners,
	// 	// setManualChoiceEventListeners,
	// 	// onNextClick,
	// 	// onManHideClick,
	// 	// onAutoHideClick,
	// 	// // storeHiddenWords,
	// 	// initializeWordsToSkip
	// };

