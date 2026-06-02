// TODO: Add QSET V1 support
const ALLOWED_QSET_VERSIONS = [2];

const SNAP_DISTANCE = 120;

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

  el = {
    wordBank: document.getElementById("word-bank"),
    passage: document.getElementById("passage"),
    passageCont: document.querySelector(".passage"),
    title: document.getElementById("title"),
    submit: document.getElementById("submit-button"),
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
    return this.el.passageSlots.map((el) => [
      el.id,
      el.childNodes[0]?.innerText,
    ]);
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
    span.addEventListener("click", (e) => this.pillSelectListener(e))
    span.addEventListener("keydown", (e) => {
      if(e.key === "Enter") {
        this.pillSelectListener(e)
        this.destinationSlot = this.el.passageSlots[this.destinationIndex]
        if(this.destinationSlot)
          this.destinationSlot.classList.add("focus")
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

  makeWordPillContainer(id, count) {
    const span = document.createElement("span");
    span.classList.add("word-pill-container");
    span.dataset.count = count;
    span.id = id;
    span.addEventListener("click", (e) => this.pillSelectListener(e))
    return span;
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
    if (!ALLOWED_QSET_VERSIONS.includes(version)) {
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

    this.bind();
  }

  setPlaceOrigin(el) {
    this.draggedItem = el
    this.originSlot = el.parentElement

    this.el.passageCont.classList.add("highlight")
    this.draggedItem.classList.add("focus")
  }

  placeInto(el) {
    let closest = el;
    if(el.getAttribute("draggable"))
      closest = closest.parentElement

    if(this.destinationSlot) {
      closest = this.destinationSlot
      this.destinationSlot = null
    }

    if (closest) {
      if (closest.children.length) {
        const existing = closest.childNodes[0];
        if (existing && existing !== this.draggedItem)
          this.originSlot.appendChild(existing);
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
    else 
      this.draggedItem.ariaLabel = `Word in passage slot ${this.draggedItem.parentElement.dataset.count}: ${this.draggedItem.innerHTML}`

    if(closest.dataset.count)
        this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into slot number ${closest.dataset.count}.`)
    else
      this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into the bank.`)

    this.el.passageCont.classList.remove("highlight")

    this.draggedItem = null;
    this.originSlot = null;
    this.clearHighlights();
    this.sortWordBank();
  }

  bind() {
    if (this.bound) return;

    this.bound = true;

    this.el.greeting.showModal();

    document.addEventListener("keydown", (e) => {
      if(this.draggedItem) {
        if(e.key === "ArrowLeft" || e.key === "ArrowRight") {
          const slotLength = this.el.passageSlots.length

          if(e.key === "ArrowLeft")
            this.destinationIndex = this.destinationIndex - 1 < 0 ? slotLength - 1 : this.destinationIndex - 1
          else if(e.key === "ArrowRight")
            this.destinationIndex = this.destinationIndex + 1 >= slotLength ? 0 : this.destinationIndex + 1

          if(this.destinationSlot)
            this.destinationSlot.classList.remove("focus")

          this.destinationSlot = this.el.passageSlots[this.destinationIndex]
          this.destinationSlot.classList.add("focus")
          const child = this.destinationSlot.childNodes ? this.destinationSlot.childNodes[0] : null
          
          this.assistiveAlert(`Over passage slot ${this.destinationSlot.dataset.count} of ${slotLength}: ${child ? child.innerHTML : `empty slot`}.`)
        }
      }

      if(e.key.toLowerCase() === 'h')
        this.el.greeting.showModal();

      if(this.currentlyFocused) {
        if(e.key.toLowerCase() === "r") {
          const text = this.currentlyFocused.innerHTML
          this.setPlaceOrigin(this.currentlyFocused)
          this.placeInto(this.currentlyFocused)

          this.assistiveAlert(`Returned word ${text} to the word bank.`)
        }
      }

      if(e.ctrlKey) {
        if(e.key.toLowerCase() === "r") {
          this.el.passageSlots.forEach((v) => {
            if(v.childNodes && v.childNodes[0]) {
              this.setPlaceOrigin(v.childNodes[0])
              this.placeInto(v.childNodes[0])
            }
          })

          this.assistiveAlert("Returned all words to the word bank.")
        }
      }
    })

    // this.el.howToPlayButton.addEventListener("click", () => {
    //   this.el.welcomeMessage.style.display = "none";
    //   this.el.instructions.style.display = "flex";
    // });



    this.el.playGameButton.addEventListener("click", () => {
      this.el.greeting.close();
    });

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

    const paragraphWords = this.paragraph.split(" ");

    let containerCount = 1
    for (let i = 0; i < paragraphWords.length; i++) {
      if (this.words[i]) {
        this.el.passage.appendChild(this.makeWordPillContainer(this.words[i].id, containerCount++))
        const space = document.createElement("span")
        space.innerHTML = " "
        this.el.passage.appendChild(space)
      } else {
        const span = document.createElement("span")
        span.innerHTML = paragraphWords[i] + " ";
        this.el.passage.appendChild(span)
      }
    }

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
      if (closest) {
        if (closest.children.length) {
          const existing = closest.childNodes[0];
          if (existing && existing !== this.draggedItem)
            this.originSlot.appendChild(existing);
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
      else
        this.draggedItem.ariaLabel = `Word in passage: ${this.draggedItem.innerHTML}`

      if(closest.dataset.count)
        this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into slot number ${closest.dataset.count}.`)
      else
        this.assistiveAlert(`Placed ${this.draggedItem.innerHTML} into the bank.`)

      this.sortWordBank();
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
