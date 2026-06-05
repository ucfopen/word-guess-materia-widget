// TODO: Add QSET V1 support
const ALLOWED_QSET_VERSIONS = [2];

const SNAP_DISTANCE = 120;

const SPLIT_REGEX = /\s+|([,.!?:"—])/

class Utils {
  static scramble(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
  }
}

class App {
  title = "";
  paragraph = "";
  words = {};

  bound = false;

  draggedItem = null;
  originSlot = null;

  destinationIndex = 0;
  destinationSlot = null;

  currentlyFocused = null;

  welcomePageIndex = 0;

  // "bank" || "free"
  responseType = "bank";

  mut = new MutationObserver((mutations, ob) => {
    mutations.forEach((m) => {
      if(m.type === 'childList') {
        if(m.addedNodes.length > 0)
          m.target.ariaLabel = ""
        else
          m.target.ariaLabel = m.dataset.label
      }
    })
  })

  el = {
    wordBank: document.getElementById("word-bank"),
    passage: document.getElementById("passage"),
    passageCont: document.querySelector(".passage"),
    title: document.getElementById("title"),
    submit: document.getElementById("submit-button"),
    resetButton: document.getElementById("reset-button"),
    greeting: document.getElementById("greeting-dialog"),
    playGameButton: document.getElementById("play-game-btn"),
    howToPlayButton: document.getElementById("how-to-play-btn"),
    welcomeMessage: document.getElementById("welcome-message"),
    instructions: document.getElementById("instructions"),
    controlsPointerButton: document.getElementById("pointer-btn"),
    controlsKeyboardButton: document.getElementById("keyboard-btn"),
    controlsKeyboard: document.getElementById("keyboard-controls"),
    controlsPointer: document.getElementById("pointer-controls"),
    warningDialog: document.getElementById("warning-dialog"),
    warningCloseButton: document.getElementById("warning-dialog-close-button"),
    warningCancelButton: document.getElementById("warning-cancel-button"),
    warningSubmitButton: document.getElementById("warning-submit-button"),
    assistiveAlertElement: document.getElementById("assistive-alert"),
    modalPrev: document.getElementById("modal-prev"),
    modalNext: document.getElementById("modal-next"),
    pageCounter: document.getElementById("page-counter"),
    mainContent: document.querySelector(".main-content"),
    freeInstructions: document.getElementById("free-message"),
    controlRow: document.querySelector(".control-row"),
    returnBtn: document.getElementById("return-to-bank"),
    welcomePages: [
      document.getElementById("pointer-controls"),
      document.getElementById("keyboard-controls")
    ],
    get allSlots() {
      return [...this.passageSlots, ...this.wordBankSlots];
    },
    get passageSlots() {
      return [...document.querySelectorAll(".word-pill-container")];
    },
    get wordBankSlots() {
      return [...document.querySelectorAll(".word-pill-home")];
    },
  };

  get toSubmit() {
    if (this.responseType === "bank") {
      return this.el.passageSlots.map((el) => [
        el.id,
        el.childNodes[0]?.innerText,
      ]);
    } else {
      return this.el.passageSlots.map((el) => [
        el.id,
        el.value
      ]);
    }
  }

  get filteredParagraph() {
    const paragraphWords = this.paragraph.split(SPLIT_REGEX).filter((v)=>v!==undefined && v !== "");

    let res = ""

    for (let i = 0; i < paragraphWords.length; i++) {
      if(!paragraphWords[i]) continue;

      if (this.words[i]) {
        const container = document.getElementById(this.words[i].id)
        if(container && container.childNodes[0])
          res += `slot:${container.childNodes[0].innerHTML} `
        else
          res += "slot:EMPTY-SLOT "
      } else res += `${paragraphWords[i]} `;
      
    }

    return res
  }

  assistiveAlert(msg) {
    this.el.assistiveAlertElement.innerHTML = msg;
  } 

  openWarning() {
    if (!this.el.warningDialog.open) this.el.warningDialog.showModal();
  }
  closeWarning() {
    if (this.el.warningDialog.open) this.el.warningDialog.close();
  }

  submitAndEnd(allowed = false) {
    if (this.toSubmit.some(([, ans]) => !ans) && !allowed) {
      this.openWarning();
      return;
    }
    for (const [qId, uAns] of this.toSubmit)
      Materia.Score.submitQuestionForScoring(qId, uAns);
    Materia.Engine.end(true);
  }

  getClosestSlot(x, y) {
    let closest = null;
    let closestDistance = Infinity;

    for (const el of this.el.allSlots) {
      const rect = el.getBoundingClientRect();

      const closestX = Math.max(rect.left, Math.min(x, rect.right));
      const closestY = Math.max(rect.top, Math.min(y, rect.bottom));

      const dx = x - closestX;
      const dy = y - closestY;

      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDistance) {
        closestDistance = dist;
        closest = el;
      }
    }

    return closestDistance <= SNAP_DISTANCE ? closest : null;
  }
  clearHighlights() {
    for (const el of this.el.allSlots) el.classList.remove("highlight");

    document.querySelectorAll(".focus").forEach((e)=>e.classList.remove("focus"))
  }
  highlight(el) {
    this.clearHighlights();
    if (el) el.classList.add("highlight");
  }

  makeTextElement(text) {
    const p = document.createElement("p");
    p.innerText = text;
    return p;
  }

  pillSelectListener(e) {
    if(this.draggedItem)
      this.placeInto(e.target)
    else
      this.setPlaceOrigin(e.target)
  }

  makeWordPill(index, text) {
    const span = document.createElement("span");
    span.classList.add("word-pill");
    span.setAttribute("tabIndex", 0)
    span.draggable = "true";
    span.innerText = text;
    span.id = `word-${index}`;
    span.ariaLabel = `Word in word bank: ${text}`
    span.ariaHidden = false
    span.addEventListener("click", (e) => this.pillSelectListener(e))
    span.addEventListener("keydown", (e) => {
      if(e.key === "Enter") {
        this.pillSelectListener(e)
        if(this.el.passageSlots[0]) {
          if(this.el.passageSlots[0].childNodes[0])
            this.el.passageSlots[0].childNodes[0].focus()
          else
            this.el.passageSlots[0].focus()
        }
        // this.destinationSlot = this.el.passageSlots[this.destinationIndex]
        // if(this.destinationSlot)
        //   this.destinationSlot.classList.add("focus")
      }
    })
    span.addEventListener("focus", (e)=>{
      this.currentlyFocused = e.target
    })
    return span;
  }

  makeWordPillHome() {
    const span = document.createElement("span");
    span.classList.add("word-pill-home");
    return span;
  }

  makeWordPillContainer(id, count, length) {
    let span;
    if (this.responseType === "bank") {
      span = document.createElement("span");
      span.addEventListener("click", (e) => this.pillSelectListener(e))
      span.addEventListener("keydown", (e) => {if(e.key === "Enter" && this.draggedItem) this.pillSelectListener(e)})
    }
    else {
      span = document.createElement("input")
      span.addEventListener("focus", (e) => {
        this.currentlyFocused = e.target
      })
      span.addEventListener("blur", (e)=>{
        this.currentlyFocused = null
      })
    }

    span.classList.add("word-pill-container");
    span.dataset.count = count;
    span.dataset.length = length;
    span.id = id;

    this.mut.observe(span, {childList: true})
    
    return span;
  }

  addContainerLabel(s) {
    const index = s.dataset.length
    const spans = this.el.passage.childNodes
    let context = ""
    spans.forEach((v, i) => {
      if(Math.abs(i - index) <= 10) {
        if(v.classList.contains("word-pill-container")) {
          if(v.childNodes[0])
            context += v.childNodes[0].innerHTML
          else
            context += "EMPTY-SLOT"
        }
        else
          context += v.innerHTML
      }
    })

    s.dataset.label = `Empty slot in position ${s.dataset.count}. Context: ${context}`
    s.ariaLabel = `Empty slot in position ${s.dataset.count}. Context: ${context}`
  }

  sortWordBank() {
    const children = Array.from(this.el.wordBank.childNodes).sort((a, b) => {
      if (a.innerHTML === "") return 1;
      if (b.innerHTML === "") return -1;
      return 0;
    });

    for (const el of children) this.el.wordBank.appendChild(el);
  }

  constructor({ items, options, title, version }) {
    if (!ALLOWED_QSET_VERSIONS.includes(parseInt(version))) {
      Materia.Engine.alert(
        "Unsupported QSet Version",
        `QSet version ${version} isn't supported.`,
      );
      return;
    }

    this.title = title;
    this.paragraph = options.paragraph;
    this.words = Object.fromEntries(
      items.map((i) => [
        i.options.index,
        { text: i.answers[0].text, id: i.id },
      ]),
    );

    if (options.responseType)
      this.responseType = options.responseType
    this.updateResponseType()

    this.bind();
  }

  updateResponseType() {
    if (this.responseType === "free")
      this.el.mainContent.classList.add("free")
    else
      this.el.mainContent.classList.remove("free")
  }

  setPlaceOrigin(el) {
    this.draggedItem = el
    this.originSlot = el.parentElement

    this.el.passageCont.classList.add("highlight")
    this.draggedItem.classList.add("focus")

    this.el.passageSlots.forEach((v) => {if(!v.childNodes[0]) v.setAttribute("tabIndex", 0)})
  }

  cancelPlace() {
    if(this.draggedItem)
      this.draggedItem.classList.remove("focus")
    this.el.passageCont.classList.remove("highlight")

    this.draggedItem = null
    this.originSlot = null

    this.el.passageSlots.forEach((v) => v.setAttribute("tabIndex", -1))
  }

  placeInto(el) {
    let closest = el;
    if(el.getAttribute("draggable"))
      closest = closest.parentElement

    // if(this.destinationSlot) {
    //   closest = this.destinationSlot
    //   this.destinationSlot = null
    // }

    if (closest) {
      if (closest.children.length) {
        const existing = closest.childNodes[0];
        if (existing && existing !== this.draggedItem) {
          this.originSlot.appendChild(existing);
          if(this.originSlot.classList.contains("word-pill-home"))
            existing.ariaLabel = `Word in word bank: ${existing.innerHTML}`
          else {
            const index = this.originSlot.dataset.length
            const spans = this.el.passage.childNodes
            let context = ""
            spans.forEach((v, i) => {
              if(Math.abs(i - index) <= 10) {
                if(v.classList.contains("word-pill-container")) {
                  if(v.dataset.length === index)
                    context += existing.innerHTML
                  else if(v.childNodes[0])
                    context += v.childNodes[0].innerHTML
                  else
                    context += "EMPTY-SLOT"
                }
                else
                  context += v.innerHTML
              }
            })
            existing.ariaLabel = `Word in passage slot ${existing.parentElement.dataset.count}: ${existing.innerHTML}. Context: ${context}`
          }
        }
        else {
          const empty = document.querySelector(".word-pill-home:empty")
          if (empty) {
            this.placeInto(empty)
            return
          }
        }
      }

      closest.appendChild(this.draggedItem);
    } else if (this.originSlot?.classList.contains("word-pill-home")) 
      this.originSlot.appendChild(this.draggedItem);
      else {
      const emptyBankSlot = Array.from(this.el.wordBankSlots()).find(
        (slot) => slot.children.length === 0,
      );
      if (emptyBankSlot) emptyBankSlot.appendChild(this.draggedItem);
    }

    if(this.draggedItem.parentElement.classList.contains("word-pill-home"))
      this.draggedItem.ariaLabel = `Word in word bank: ${this.draggedItem.innerHTML}`
    else {
      const index = this.draggedItem.parentElement.dataset.length
      const spans = this.el.passage.childNodes
      let context = ""
      spans.forEach((v, i) => {
        if(Math.abs(i - index) <= 10) {
          if(v.classList.contains("word-pill-container")) {
            if(v.childNodes[0])
              context += v.childNodes[0].innerHTML
            else
              context += "EMPTY-SLOT"
          }
          else
            context += v.innerHTML
        }
      })
      this.draggedItem.ariaLabel = `Word in passage slot ${this.draggedItem.parentElement.dataset.count}: ${this.draggedItem.innerHTML}. Context: ${context}`
    }

    if(closest.dataset.count)
        this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into slot number ${closest.dataset.count}.`)
    else
      this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into the bank.`)

    this.el.passageCont.classList.remove("highlight")

    this.draggedItem = null;
    this.originSlot = null;
    this.clearHighlights();
    this.sortWordBank();
    this.el.passage.ariaLabel = `${this.title}. Passage content: ${this.filteredParagraph}`
    this.el.passageSlots.forEach((v) => v.setAttribute("tabIndex", -1))
    this.returnToTop()
  }

  returnToTop() {
    const slots = this.el.wordBankSlots
    if(slots[0] && slots[0].childNodes[0]) slots[0].childNodes[0].focus()
  }

  bind() {
    if (this.bound) return;

    this.bound = true;

    if(this.responseType === "free") {
      this.el.freeInstructions.style.display = "flex";
      this.el.welcomePages[0].style.display = "none";
      this.el.controlRow.style.display = "none"
    }
    
    this.el.greeting.showModal();

    document.addEventListener("keydown", (e) => {
      if(e.key.toLowerCase() === 'h' && (!this.currentlyFocused || this.responseType === "bank")) {
        if(this.el.greeting.getAttribute("open") === "")
          this.el.greeting.close();
        else
          this.el.greeting.showModal(); 
      }

      if(this.currentlyFocused && this.responseType === "bank") {
        if(e.key.toLowerCase() === "r") {
          const text = this.currentlyFocused.innerHTML
          this.setPlaceOrigin(this.currentlyFocused)
          this.placeInto(this.currentlyFocused)

          this.assistiveAlert(`Returned word ${text} to the word bank.`)
        }
      }

      if(e.ctrlKey) {
        if(e.key.toLowerCase() === "r") {

          if(this.responseType === "bank") {
            this.el.passageSlots.forEach((v) => {
              if(v.childNodes && v.childNodes[0]) {
                this.setPlaceOrigin(v.childNodes[0])
                this.placeInto(v.childNodes[0])
              }
            })
  
            this.assistiveAlert("Returned all words to the word bank.")
          } else {
            this.el.passageSlots.forEach((v) => {
              v.value = ""
            })

            this.assistiveAlert("Reset all words.")
          }
        }
      }

      if(e.key === "Escape") {
        this.cancelPlace()
        this.returnToTop()
      }
    })

    this.el.playGameButton.addEventListener("click", () => {
      this.el.greeting.close();

      this.returnToTop()
    });

    this.el.returnBtn.addEventListener("click", ()=>this.returnToTop())

    this.el.resetButton.addEventListener("click", () => {
      if(this.responseType === "free") {
        this.el.passageSlots.forEach((v) => {
          v.value = ""
        })

        this.assistiveAlert("Reset all words.")
      }
    })

    for (const btn of [
      this.el.warningCloseButton,
      this.el.warningCancelButton,
    ]) {
      btn.addEventListener("click", () => {
        this.closeWarning();
      });
    }

    this.el.warningSubmitButton.addEventListener("click", () => {
      this.submitAndEnd(true);
    });

    this.el.modalNext.addEventListener("click", () => {
      const length = this.el.welcomePages.length
      this.welcomePageIndex = this.welcomePageIndex + 1 >= length ? 0 : this.welcomePageIndex + 1

      this.el.welcomePages.forEach((v) => {
        v.style.display = "none"
      })

      this.el.welcomePages[this.welcomePageIndex].style.display = "flex"
      this.el.pageCounter.innerHTML = `${this.welcomePageIndex+1} / ${length}`
    })

    this.el.modalPrev.addEventListener("click", () => {
      const length = this.el.welcomePages.length
      this.welcomePageIndex = this.welcomePageIndex - 1 < 0 ? length - 1 : this.welcomePageIndex - 1
     
      this.el.welcomePages.forEach((v) => {
        v.style.display = "none"
      })

      this.el.welcomePages[this.welcomePageIndex].style.display = "flex"
      this.el.pageCounter.innerHTML = `${this.welcomePageIndex+1} / ${length}`
    })

    this.el.title.innerText = this.title;

    const homes = [];
    for (const [index, { text, id: _id }] of Object.entries(this.words)) {
      const h = this.makeWordPillHome();
      h.appendChild(this.makeWordPill(index, text));
      homes.push(h);
    }
    Utils.scramble(homes);
    for (const s of homes) this.el.wordBank.appendChild(s);

    const paragraphWords = this.paragraph.split(SPLIT_REGEX).filter((v)=>v !== "").map((v)=>{
      if(v === undefined) return " "
      else return v
    });

    let containerCount = 1
    for (let i = 0; i < paragraphWords.length; i++) {
      if(!paragraphWords[i]) continue;

      if (this.words[i]) {
        this.el.passage.appendChild(this.makeWordPillContainer(this.words[i].id, containerCount++,this.el.passage.childNodes.length))
      } else {
        const span = document.createElement("span")
        span.innerHTML = paragraphWords[i];
        this.el.passage.appendChild(span)
      }
    }

    this.el.passageSlots.forEach((s) => {
      this.addContainerLabel(s)
    })

    this.el.passage.ariaLabel = `${this.title}. Passage content: ${this.filteredParagraph}`

    this.el.submit.addEventListener("click", () => {
      this.submitAndEnd();
    });

    document.addEventListener("dragstart", (e) => {
      if (!e.target.classList.contains("word-pill")) return;

      this.draggedItem = e.target;
      this.originSlot = e.target.parentElement;

      setTimeout(() => {
        e.target.style.opacity = "0.5";
      }, 0);
    });

    document.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!this.draggedItem) return;

      const closest = this.getClosestSlot(e.clientX, e.clientY);
      this.highlight(closest);
    });

    document.addEventListener("dragend", (e) => {
      if (!e.target.classList.contains("word-pill")) return;

      e.target.style.opacity = "1";
      this.draggedItem = null;
      this.originSlot = null;
      this.clearHighlights();
    });

    document.addEventListener("drop", (e) => {
      if (!this.draggedItem) return;

      e.preventDefault();

      this.clearHighlights();

      const closest = this.getClosestSlot(e.clientX, e.clientY);
      this.placeInto(closest)
    });
  }
}

window.addEventListener("load", () => {
  let _app;
  Materia.Engine.start({
    start: (instance, qset, qsetVersion) => {
      _app = new App({ ...qset, title: instance.name, version: qsetVersion });
    },
    manualResize: false,
  });
});
