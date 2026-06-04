Namespace('WordGuess').ScoreCore = (function() {
	
	let _qset = null;
	let _questions = null
	
    let _passageEl = null
    let _slider = null
    let _sliderText = null

    const SPLIT_REGEX = /\s+|([,.!?:"—])/

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

        const paragraph = _qset.options.paragraph
        const pWords = paragraph.split(SPLIT_REGEX).filter((v)=>v!==undefined && v !== "");
        const answers = Object.fromEntries(
            scoreTable.map((v,i) => [
              _questions[i].options.index,
              { text: v.data[2], response: v.data[1], score: v.score },
            ]),
        )
        
        let correct = 0

        pWords.forEach((v, i)=>{
            const span = document.createElement("span")
            span.id = i
            
            if(answers[i]) {
                span.classList.add("pill")
                span.innerHTML = answers[i].response
                span.dataset.text = answers[i].text
                
                if(answers[i].response.toLowerCase() == answers[i].text.toLowerCase()) {
                    correct++
                    span.classList.add("correct")
                } else {
                    span.classList.add("wrong")
                }
                _passageEl.appendChild(span)

                const space = document.createElement("span")
                space.innerHTML = " "
                _passageEl.appendChild(space)
            } else {
                span.innerHTML = v+" "
                _passageEl.appendChild(span)
            }
        })

        document.getElementById("correct-amt").innerHTML = `${correct} of ${_questions.length} correct`

        window.addEventListener("resize", ()=>Materia.ScoreCore.setHeight(_getRenderedHeight()))
        document.getElementById("correct-answers").addEventListener("click", (e)=>{
            _slider.classList.add("slid")
            _passageEl.classList.add("show-correct")
            _sliderText.innerHTML =  "Correct Answers"
        })
        document.getElementById("user-answers").addEventListener("click", (e)=>{
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
