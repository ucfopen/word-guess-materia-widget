Namespace('WordGuess').ScoreCore = (function() {
	
	let _qset = null;
	let _questions = null
	
    let _passageEl = null
    let _slider = null
    let _sliderText = null

	const _getRenderedHeight = () => {
		return Math.ceil(parseFloat(window.getComputedStyle(document.querySelector('html')).height)) - 21;
	}

	const _distance = (x1, y1, x2, y2) => {
		return Math.sqrt(((x1-x2)**2) + ((y1-y2)**2))
	}

	const start = (instance, qset, scoreTable, isPreview, qsetVersion) => {
		update(qset, scoreTable)
	}

	const update = (qset, scoreTable) => {

		_qset = qset
		_questions = _qset.items;
        _passageEl = document.getElementById("passage")
        _slider = document.getElementById("slide-knob")
        _sliderText = document.getElementById("slider-text")

        console.log(_qset)
        console.log(_questions)
        console.log(scoreTable)

        const paragraph = _qset.options.paragraph
        const pWords = paragraph.split(" ")
        const answers = Object.fromEntries(
            scoreTable.map((v,i) => [
              _questions[i].options.index,
              { text: v.data[2], response: v.data[1], score: v.score },
            ]),
        )
        console.log(answers)

        let correct = 0

        pWords.forEach((v, i)=>{
            const span = document.createElement("span")
            span.id = i
            
            if(answers[i]) {
                span.classList.add("pill")
                span.innerHTML = answers[i].response != "" ? answers[i].response+" " : ""
                span.dataset.text = answers[i].text
                
                if(answers[i].score == 100) {
                    correct++
                    span.classList.add("correct")
                } else {
                    span.classList.add("wrong")
                }
            } else {
                span.innerHTML = v+" "
            }

            _passageEl.appendChild(span)
        })

        document.getElementById("correct-amt").innerHTML = `${correct} / ${_questions.length} correct`

        window.addEventListener("resize", ()=>Materia.ScoreCore.setHeight(_getRenderedHeight()))
        document.getElementById("mouse-click").addEventListener("click", (e)=>{
            _slider.classList.add("slid")
            _passageEl.classList.add("show-correct")
            _sliderText.innerHTML =  "Correct Answers"
        })
        document.getElementById("pencil-edit").addEventListener("click", (e)=>{
            _slider.classList.remove("slid")
            _passageEl.classList.remove("show-correct")
            _sliderText.innerHTML =  "Your Answers"
        })

		Materia.ScoreCore.setHeight(_getRenderedHeight());
	}

	return {
		start, update
	}
})();
