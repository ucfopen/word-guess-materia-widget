// TODO: Add QSET V1 support
const ALLOWED_QSET_VERSIONS = [1, 2];
const QSET_VERSION = 2;

const SLIDER_MIN = 1;
const SLIDER_DEFAULT = 1;
const SLIDER_MAX_PERCENT = 0.75;
const MAX_PERC_SPACE_BETWEEN = 0.25;

// These are in percents
const PROGRESS_BAR_GOOD_THRESHOLD = 75;
const PROGRESS_BAR_BAD_THRESHOLD = 100;

const MAX_HIDDEN = 30;
const MAX_WORD_COUNT = 300;

const CONJUNCTIONS = new Set([
  "and",
  "or",
  "the",
  "then",
  "because",
  "is",
  "but",
  "it",
  "of",
  "with",
  "in",
  "for",
  "to",
  "has",
  "a",
  "an",
  "into"
]);

const SPLIT_REGEX = /\s+|([,.!?:"—;()])/
const OLD_SPLIT_REGEX = /\s+|([,.!?:";()])/

const PUNCTUATION = new Set(([
  ",", ".", ":", `"`, "?", "!", "—", ";", " ", "(", ")"
]))
const OLD_PUNCTUATION = new Set(([
  ",", ".", ":", `"`, "?", "!", ";", " ", "(", ")"
]))

// See: enums in JavaScript
const WARNING_LEVEL = Object.freeze({
  INFO: Symbol("INFO"),
  WARNING: Symbol("WARNING"),
  ERROR: Symbol("ERROR"),
});

// Driver App handles logic, events, and rendering.
// In the future we should think about separating such that each unit only has
// one job.
class App {
  words = [];
  highlighted = new Set();
  wordIdCounter = 0;

  // true if next word generation should
  // convert a qset from v1 to v2.
  repair = false;
  oldOffset = 0;

  el = {
    outer: document.getElementById("outer"),
    
    textarea: document.getElementById("textarea"),
    pickarea: document.getElementById("pickarea"),
    wordBank: document.getElementById("word-bank"),
    wordBankInfo: document.getElementById("word-bank-info"),

    settingsBtn: document.getElementById("settings-btn"),
    settingsScreen: document.getElementById("settings-screen"),
    closeSettingsBtn: document.getElementById("close-settings"),

    slider: document.getElementById("slider"),
    sliderMask: document.getElementById("slider-mask"),
    sliderMsg: document.getElementById("automatic-message"),

    manualBtn: document.getElementById("manual-button"),
    autoBtn: document.getElementById("auto-button"),
    modeToggle: document.getElementById("mode-slide-knob"),

    manualInfo: document.getElementById("manual-info-container"),
    autoInfo: document.getElementById("auto-info-container"),

    refreshBtn: document.getElementById("refresh-btn"),
    trashBtn: document.getElementById("trash-btn"),

    wordCount: document.getElementById("word-count"),

    manualProgressCont: document.getElementById("manual-cont"),
    manualProgressBar: document.getElementById("manual-bar"),
    manualProgressInfo: document.getElementById("manual-message"),

    mouseClick: document.getElementById("mouse-click"),
    pencilEdit: document.getElementById("pencil-edit"),
    slideToggle: document.getElementById("slide-knob"),
    introBtn: document.getElementById("intro-pick-btn"),

    helpDialog: document.getElementById("help-dialog"),
    helpDialogCloseButton: document.getElementById("close-button"),

    titleInput: document.getElementById("title"),

    settingsScoredCheck: document.getElementById("scoring-check"),
    settingsBankCheck: document.getElementById("type-bank"),
    settingsFreeCheck: document.getElementById("type-free"),

    passageCont: document.querySelector(".passage.container"),

    returnToTitleBtn: document.getElementById("return-to-title"),
    jumpEnd: document.getElementById("jump-end"),
    jumpStart: document.getElementById("jump-start"),

    addDistraction: document.getElementById("add-distraction"),
    distractionText: document.getElementById("distraction-text"),
    submitDistraction: document.getElementById("submit-distraction"),
    distractionPopup: document.getElementById("distraction-popup"),
    wordBankBlur: document.getElementById("word-bank-blur"),

    errorDialog: document.getElementById("error-dialog"),
    errorMsg: document.getElementById("error-message"),
    errorDialogCloseButton: document.getElementById(
      "error-dialog-close-button",
    ),
  };

  activeMode = null;
  sliderUsed = false;
  bound = false;

  responseType = "bank";
  scored = true;

  distractions = []

  /**
   * @param {{
   *  title: string;
   *  version: number;
   *  qset: any;
   * }?} options
   */
  constructor(options = undefined) {
    this.bind();

    if (options) {
      const { title, qset, version } = options;

      if (!ALLOWED_QSET_VERSIONS.includes(parseInt(version)))
        this.openWarningDialog(`QSet version ${version} is not supported yet.`);

      if(parseInt(version) === 1) {
        this.repair = true

        qset.items = qset.questions_answers
        qset.items.forEach((_v, i) => {
          qset.items[i].options = { "index": qset.manualSkippingIndices[i] }
        })

        qset.options = {
          "paragraph": qset.paragraph,
          "mode": "manual",
          "slider": "0",
          "responseType": "free",
          "scored": false,
          "distractions": []
        }

        this.openWarningDialog(`You are opening an activity that was made in an older version of Word Guess. Review your words and settings to ensure they are correct before saving.`)
      }

      this.items = qset.items

      this.setTitle(title);
      this.setParagraph(qset.options.paragraph);

      this.highlighted = new Set(qset.items.map((x) => x.options.index));

      if(this.repair)
        this.repairWords()
      else
        this.generateWords();

      this.updateWordCount();

      this.sliderUsed = true;
      this.updateSlider(qset.options.slider);

      if (qset.options.mode === "manual") this.switchToManual();
      else this.switchToAuto();

      this.scored = qset.options.scored;

      this.responseType = qset.options.responseType;
      this.updateResponseType()

      this.el.settingsScoredCheck.checked = this.scored;

      if (this.responseType === "bank") {
        this.el.settingsBankCheck.checked = true;
        this.el.settingsFreeCheck.checked = false;
      } else {
        this.el.settingsBankCheck.checked = false;
        this.el.settingsFreeCheck.checked = true;
      }

      this.switchToPickMode();
    } else {
      this.switchToManual();
      this.switchToWriteMode();
    }

    this.renderWordBank();
    this.renderWords();

    if (!options) this.openHelpDialog();
  }

  openHelpDialog() {
    this.el.helpDialog.showModal();
  }

  closeHelpDialog() {
    this.el.helpDialog.close();
  }

  openWarningDialog(message = "") {
    this.el.errorMsg.innerText = message;
    this.el.errorDialog.showModal();
  }

  closeWarningDialog() {
    this.el.errorDialog.close();
  }

  bind() {
    if (this.bound) return;

    this.bound = true;

    this.el.titleInput.addEventListener("beforeinput", (e) => {
      const newString = this.el.titleInput.value
      const addedCount = (newString + e.data).length
      
      if (addedCount > 100 && e.data) {
        e.preventDefault();
      }
    })

    this.el.outer.addEventListener("transitionend", ()=>this.updateSlider(this.el.slider.value))

    window.addEventListener("resize", ()=>this.updateSlider(this.el.slider.value))

    this.el.textarea.addEventListener("input", (e) => {
      this.generateWords();
      this.updateWordCount();

      // This makes the slider respoooonsive when you add words
      this.updateSlider(this.el.slider.value);
      
      if(this.words.length > 0) {
        this.el.introBtn.disabled = false
      } else {
        this.el.introBtn.disabled = true
      }

      this.renderWordBank();
    });

    // When the textarea is clicked off
    this.el.textarea.addEventListener("blur", () => {
      this.generateWords();
      this.renderWords();
      this.switchToPickMode();
    });

    this.el.slider.addEventListener("input", (e) => {
      this.sliderUsed = true;
      this.updateSlider(e.target.value);

      this.refreshAutoWords();
    });

    this.el.manualBtn.addEventListener("click", () => this.switchToManual());
    this.el.autoBtn.addEventListener("click", () => this.switchToAuto());

    this.el.refreshBtn.addEventListener("click", () => this.refreshAutoWords());
    this.el.trashBtn.addEventListener("click", () => this.clearHighlighted());

    this.el.settingsBtn.addEventListener("click", (e)=>{
      e.stopPropagation()
      this.toggleSettings()
    })

    this.el.pickarea.addEventListener("click", (e) => {
      const span = e.target;
      if (!span.classList.contains("word-span-pill")) return;
      if (span.classList.contains("punctuation")) return;

      if (this.activeMode === "automatic") this.switchToManual();

      const id = Number(span.dataset.id);

      if (this.highlighted.has(id)) {
        this.highlighted.delete(id);
        span.classList.remove("highlighted");
      } else if (this.highlighted.size < MAX_HIDDEN) {
        this.highlighted.add(id);
        span.classList.add("highlighted");
      }

      this.renderWordBank();
      this.renderManualProgress();
    });

    this.el.mouseClick.addEventListener("click", () => this.switchToPickMode());
    this.el.introBtn.addEventListener("click", () => this.switchToPickMode());
    this.el.pencilEdit.addEventListener("click", () =>
      this.switchToWriteMode(),
    );

    this.el.helpDialogCloseButton.addEventListener("click", () =>
      this.closeHelpDialog(),
    );
    this.el.errorDialogCloseButton.addEventListener("click", () =>
      this.closeWarningDialog(),
    );

    this.el.settingsScoredCheck.addEventListener("change", (e) => {
      this.scored = e.target.checked;
    })

    this.el.settingsBankCheck.addEventListener("change", (e) => {
      this.responseType = e.target.value === "bank" ? "bank" : "free";
      this.updateResponseType()
    })

    this.el.settingsFreeCheck.addEventListener("change", (e) => {
      this.responseType = e.target.value === "free" ? "free" : "bank";
      this.updateResponseType()
    })

    this.el.settingsScoredCheck.addEventListener("focus", (e) => {
      this.openSettings()
    })

    this.el.settingsBankCheck.addEventListener("focus", (e) => {
      this.openSettings()
    })

    this.el.settingsFreeCheck.addEventListener("focus", (e) => {
      this.openSettings()
    })

    this.el.closeSettingsBtn.addEventListener("click", ()=>this.closeSettings())

    this.el.passageCont.addEventListener("click", (e)=>{
      const span = e.target;
      if (span.classList.contains("word-span-pill")) return;

      this.switchToWriteMode()
    })

    this.el.settingsScreen.addEventListener("click", (e) => {
      e.stopPropagation()
    })

    document.addEventListener("click", () => {
      this.closeSettings()
    })

    this.el.returnToTitleBtn.addEventListener("click", ()=> {
      this.el.titleInput.focus()
    })

    this.el.jumpEnd.addEventListener("click", (e) => {
      e.stopPropagation()
      if(this.el.pickarea.childNodes && this.el.pickarea.childNodes[0])
        this.el.pickarea.childNodes[this.el.pickarea.childNodes.length - 1].focus()
    })

    this.el.jumpStart.addEventListener("click", (e) => {
      e.stopPropagation()
      if(this.el.pickarea.childNodes && this.el.pickarea.childNodes[0])
        this.el.pickarea.childNodes[0].focus()
    })

    this.el.addDistraction.addEventListener("click", () => this.toggleDistractionPopup())

    this.el.distractionText.addEventListener("keydown", (e)=>{
      if(e.key === "Enter") {
        this.createDistraction(this.el.distractionText.value)
        this.el.distractionText.value = ""
        this.el.distractionText.focus()
      }
    })

    this.el.submitDistraction.addEventListener("click", ()=>{
      this.createDistraction(this.el.distractionText.value)
      this.el.distractionText.value = ""
      this.el.distractionText.focus()
    })
  }

  toggleDistractionPopup() {
    if(this.el.distractionPopup.style.display === "none") {
      this.el.addDistraction.innerHTML = 'click to close'
      this.el.addDistraction.ariaLabel = 'Close Distractions Menu'
      this.el.distractionPopup.style.display = "block"
      this.el.wordBankBlur.classList.add("show")
      this.el.distractionText.focus()
    } else {
      this.el.addDistraction.ariaLabel = "Add Distraction Word"
      this.el.addDistraction.innerHTML = 'add distraction +'
      this.el.distractionPopup.style.display = "none"
      this.el.wordBankBlur.classList.remove("show")
      this.el.addDistraction.focus()
    }
  }

  toggleSettings() {
    if (this.el.settingsScreen.className.includes("hidden"))
      this.openSettings()
    else
      this.closeSettings()
  }

  openSettings() {
    this.el.settingsBtn.classList.add("rotate")
    this.el.settingsScreen.classList.remove("hidden")
  }

  closeSettings() {
    this.el.settingsBtn.classList.remove("rotate")
    this.el.settingsScreen.classList.add("hidden")
  }

  getParagraph() {
    return this.el.textarea.value.trim();
  }
  setParagraph(paragraph) {
    this.el.textarea.value = paragraph;
  }

  setTitle(title) {
    this.el.titleInput.value = title;
  }
  getTitle() {
    return this.el.titleInput.value;
  }

  createDistraction(input) {
    const text = input.trim()

    const distraction = document.createElement("button")
    distraction.className = "word-bank-pill distraction"

    distraction.dataset.id = this.distractions.length
    this.distractions.push(text)

    const inner = document.createElement("span")
    inner.innerHTML = text
    distraction.appendChild(inner)

    const xBtn = document.createElement("span")
    xBtn.className = "x-btn"
    distraction.appendChild(xBtn)

    distraction.addEventListener("click", ()=>this.deleteDistraction(distraction))
    this.el.addDistraction.insertAdjacentElement("afterend", distraction)
  }

  deleteDistraction(pill) {
    this.distractions.splice(pill.dataset.id, 1)
    pill.remove()
  }

  getHighlighted() {
    return this.words
      .map((word, index) => ({
        id: word.id,
        text: word.text,
        index: word.position,
      }))
      .filter((word) => this.highlighted.has(word.id));
  }

  repairWords() {
    const text = this.el.textarea.value.trim();
    if (!text) {
      this.words = [];
      this.highlighted.clear();
      return;
    }

    let trackHighlight = 0
    let trackPosition = 0

    const words = text.split(SPLIT_REGEX);
    const newWords = [];
    const highlightArray = [...this.highlighted]

    let index = 0;

    for (let word of words) {
      if(word === undefined) word = " "
      else if(!word) continue;

      let id = `s${this.wordIdCounter}`;
      if(word !== " ")
        id = this.wordIdCounter++;
      
      newWords.push({
        id: id,
        position: trackPosition,
        text: word
      })

      if(word !== " ") trackPosition++;

      if(this.items[trackHighlight] && this.items[trackHighlight].answers[0].text === word) {
        highlightArray[trackHighlight++] = index
      }

      if(word !== " ")
        index++
    }

    this.words = newWords;

    const valid = new Set(this.words.map((w) => w.id));
    for (const id of this.highlighted)
      if (!valid.has(id)) this.highlighted.delete(id);

    this.highlighted = new Set([...highlightArray])
    this.repair = false
  }

  generateWords() {
    const text = this.el.textarea.value.trim();
    if (!text) {
      this.words = [];
      this.highlighted.clear();
      return;
    }

    const words = text.split(SPLIT_REGEX);
    const newWords = [];

    let oldIndex = 0;
    let trackPosition = 0;

    for (let word of words) {
      if(word === undefined) word = " "
      else if(!word) continue;

      let id = `s${this.wordIdCounter}`;
      if(word !== " ")
        id = this.wordIdCounter++;
      
      if (oldIndex < this.words.length && this.words[oldIndex].text === word) {
        newWords.push(this.words[oldIndex]);
        oldIndex++;
      } else {
        newWords.push({
          id: id,
          position: trackPosition,
          text: word,
        });
      }

      if(word !== " ") trackPosition++;
    }

    this.words = newWords;

    const valid = new Set(this.words.map((w) => w.id));
    for (const id of this.highlighted)
      if (!valid.has(id)) this.highlighted.delete(id);
  }

  renderWords() {
    this.el.pickarea.innerHTML = "";

    for (const word of this.words) {
      const pill = document.createElement("button");
      pill.className = "word-span-pill";
      pill.textContent = word.text;
      pill.dataset.id = word.id;

      if(PUNCTUATION.has(word.text)) pill.classList.add("punctuation")

      if (this.highlighted.has(word.id)) pill.classList.add("highlighted");

      this.el.pickarea.appendChild(pill);
    }
  }

  wordBankInfo(info = undefined, level = WARNING_LEVEL.INFO) {
    if (!info) {
      this.el.wordBankInfo.style.visibility = "hidden";
      return;
    }

    this.el.wordBankInfo.style.visibility = "visible";
    this.el.wordBankInfo.innerText = info;
    this.el.wordBankInfo.classList = {
      [WARNING_LEVEL.INFO]: "info",
      [WARNING_LEVEL.ERROR]: "error",
      [WARNING_LEVEL.WARNING]: "warning",
    }[level];
  }

  hideRefreshButton() {
    this.el.refreshBtn.style.display = "none";
  }
  showRefreshButton() {
    this.el.refreshBtn.style.display = "block";
  }

  showTrashButton() {
    this.el.trashBtn.style.display = "block";
  }
  hideTrashButton() {
    this.el.trashBtn.style.display = "none";
  }

  renderWordBank() {
    this.el.wordBank.querySelectorAll("div.word-bank-pill").forEach((v)=>v.remove())
    
    this.wordBankInfo(
      `${this.highlighted.size} word${this.highlighted.size === 1 ? "" : "s"} hidden`,
      WARNING_LEVEL.INFO,
    );

    if (this.highlighted.size === 0) {
      this.hideTrashButton();
      return;
    }

    for (const id of this.highlighted) {
      const word = this.words.find((w) => w.id === id);
      if (!word) continue;

      const pill = document.createElement("div");
      pill.className = "word-bank-pill";

      const span = document.createElement("span");
      span.textContent = word.text;

      const button = document.createElement("button");
      button.className = "x-btn";
      button.dataset.id = id;

      pill.appendChild(span);
      pill.appendChild(button);

      pill.onclick = button.onclick = () => {
        this.highlighted.delete(id);
        this.renderWords();
        this.renderWordBank();
        this.renderManualProgress();
      };

      this.el.wordBank.appendChild(pill);
    }

    if (this.activeMode === "automatic") this.showRefreshButton();
    else this.hideRefreshButton();

    this.showTrashButton();
  }

  updateSlider(percentage) {
    const value = percentage;
    const sliderWidth = this.el.slider.clientWidth
    const normalized = (sliderWidth-24) * (value - this.minWordsBetween() ) / (this.maxWordsBetween() - this.minWordsBetween() )

    this.el.sliderMask.style.width = `${(normalized)+24}px`;
    this.el.slider.value = value;

    this.el.slider.dataset.mappedValue = value;
    this.el.sliderMask.dataset.percentage = `${value}`;

    this.el.sliderMsg.textContent = `${value} words hidden`;
  }

  minWordsBetween() {
    const ret = Math.max(Math.floor(this.getWordCount()/this.maxHiddenWords()) - 1, SLIDER_MIN)
    if(!isFinite(ret)) return 0
    return ret
  }

  maxWordsBetween() {
    return Math.floor(this.getWordCount() * MAX_PERC_SPACE_BETWEEN);
  }

  maxHiddenWords() {
    return Math.min(
      Math.floor(this.words.length * SLIDER_MAX_PERCENT),
      MAX_HIDDEN,
    );
  }

  autoHiddenCount(percentage = this.el.slider.value) {
    return Number(percentage)
    // const max = this.maxHiddenWords()

    // const normalized = (Number(percentage) - SLIDER_MIN) / (100 - SLIDER_MIN);

    // return Math.max(1, Math.round(normalized * (max - 1) + 1));
  }

  refreshAutoWords() {
    // const target = Math.min(this.autoHiddenCount(), this.words.length);
    const autoCount = this.autoHiddenCount() + 1

    const candidates = this.words.filter(
      (w) => !CONJUNCTIONS.has(w.text.toLowerCase()) && !PUNCTUATION.has(w.text.toLowerCase()),
    );

    const target = Math.min(Math.floor(candidates.length/(autoCount)), candidates.length);

    const oldHighlighted = [...this.highlighted];
    this.highlighted.clear();

    // const candidates = this.words;

    if (candidates.length <= target)
      this.highlighted = new Set(candidates.map((w) => w.id));
    else {
      // const shuffle = Math.max(1, Math.floor(candidates.length / target));
      const shuffle = autoCount;
      const offset = Math.floor(Math.random() * shuffle);

      for (const [i, w] of candidates.entries()) {
        if ((i + offset) % shuffle === 0) {
          this.highlighted.add(w.id);

          if (this.highlighted.size === target) break;
        }
      }

      if (this.highlighted.size < target) {
        for (const w of candidates) {
          if (!this.highlighted.has(w.id)) {
            this.highlighted.add(w.id);

            if (this.highlighted.size === target) break;
          }
        }
      }
    }

    // On the off chance that 0 words are selected or they are the same
    // we reroll
    if (
      (this.highlighted.size === 0 && this.words.length) ||
      (oldHighlighted.length &&
        oldHighlighted.length === this.highlighted.size &&
        oldHighlighted.every((x) => this.highlighted.has(x)) &&
        this.words.length > 1)
    ) {
      this.highlighted = new Set(oldHighlighted);
      return this.refreshAutoWords();
    }

    this.renderWords();
    this.renderWordBank();
  }

  switchToManual() {
    this.activeMode = "manual";

    this.el.manualInfo.style.display = "flex";
    this.el.autoInfo.style.display = "none";
    this.el.refreshBtn.style.display = "none";

    this.el.modeToggle.classList.add("slid");

    this.renderManualProgress();
    this.renderWordBank();
  }

  switchToAuto() {
    this.activeMode = "automatic";

    // Case where its not been updated yet
    if (!this.sliderUsed) {
      this.sliderUsed = true;
      this.updateSlider(Math.max(SLIDER_DEFAULT, this.minWordsBetween()));

      this.refreshAutoWords();
    }

    this.el.modeToggle.classList.remove("slid");

    this.el.refreshBtn.style.display = "block";

    this.el.manualInfo.style.display = "none";
    this.el.autoInfo.style.display = "flex";

    this.renderWordBank();
  }

  switchToPickMode() {
    if(this.words.length > 0) {
      this.el.textarea.style.display = "none";
      this.el.pickarea.style.display = "flex";
      this.el.jumpEnd.style.display = "inline";
      this.el.jumpStart.style.display = "inline";
      this.el.slideToggle.classList.add("slid");
      this.el.outer.classList.remove("new")
    }
  }

  switchToWriteMode() {
    this.el.textarea.style.display = "block";
    this.el.pickarea.style.display = "none";
    this.el.jumpEnd.style.display = "none";
    this.el.jumpStart.style.display = "none";
    this.el.slideToggle.classList.remove("slid");
  }

  getWordCount() {
    return this.el.textarea.value.trim().split(SPLIT_REGEX)
    .filter((v)=>!PUNCTUATION.has(v) && v !== undefined && v !== "").length;
  }

  updateWordCount() {
    const count = this.getWordCount()
    this.el.wordCount.textContent = `${count} / ${MAX_WORD_COUNT} words`;

    if (count >= MAX_WORD_COUNT) {
      this.el.wordCount.classList.add("full")
    } else {
      this.el.wordCount.classList.remove("full")
    }

    this.el.slider.setAttribute("min", this.minWordsBetween())
    this.el.slider.setAttribute("max", this.maxWordsBetween())
  }

  renderManualProgress() {
    const words = this.highlighted.size;
    const percent = Math.round((100 * words) / MAX_HIDDEN);
    const width = Math.round(percent / MAX_HIDDEN) * MAX_HIDDEN;

    if (percent >= PROGRESS_BAR_BAD_THRESHOLD) {
      this.el.manualProgressBar.style.width = `100%`;
      this.el.manualProgressBar.className = "progress-bar high";
      this.el.manualProgressInfo.className = "status high";
      this.el.manualProgressInfo.innerText = "Max hidden words reached";
    } else if (percent >= PROGRESS_BAR_GOOD_THRESHOLD) {
      this.el.manualProgressBar.style.width = `${percent}%`;
      this.el.manualProgressBar.className = "progress-bar medium";
      this.el.manualProgressInfo.className = "status medium";
      this.el.manualProgressInfo.innerText = "This may be too many words for this passage";
    } else {
      this.el.manualProgressBar.style.width = `${percent}%`;
      this.el.manualProgressBar.className = "progress-bar low";
      this.el.manualProgressInfo.className = "status low";
      this.el.manualProgressInfo.innerText = "Placeholder text";
    }
  }

  clearHighlighted() {
    this.highlighted.clear();

    this.renderWords();
    this.renderWordBank();
    this.renderManualProgress();
  }

  buildSaveData() {
    let cnt = 0;
    const highlighted = this.getHighlighted()
    return {
      items: highlighted.map(({ text, index }) => (
      {
        id: null,
        type: "wordguess",
        materiaType: "question",
        questions: [{ text: `Word #${++cnt}` }],
        answers: [{ text }],
        options: { index:index },
      })),
      options: {
        paragraph: this.getParagraph(),
        mode: this.activeMode ?? "manual",
        slider: this.el.slider.value,
        responseType: this.responseType,
        scored: this.scored,
        distractions: this.distractions
      },
    };
  }

  updateResponseType() {
    if (this.responseType === "free")
      this.el.outer.classList.add("free")
    else
      this.el.outer.classList.remove("free")
  }
}

window.addEventListener("load", () => {
  let app = null;
  Materia.CreatorCore.start({
    initExistingWidget: (title, _widgetInstance, qset, version) => {
      app = new App({ title, qset, version });
    },
    initNewWidget: () => {
      app = new App();
    },
    onSaveComplete: () => true,
    onSaveClicked: (mode = "save") => {
      if (mode === "publish") {
        if (!app.getParagraph()) {
          app.openWarningDialog(
            "No passage Entered for this fill-in-the-blank activity. Please enter more text.",
          );
          return;
        }

        if (app.getWordCount() > MAX_WORD_COUNT) {
          app.openWarningDialog(
            `Max passage length is ${MAX_WORD_COUNT} words. Please update the passage.`,
          );
          return;
        }

        if (app.el.titleInput.value.length > 100) {
          app.openWarningDialog(
            `Widget title cannot be longer than 100 characters. Please shorten the title.`,
          );
          return;
        }
      }

      Materia.CreatorCore.save(
        app.getTitle() || "New WordGuess Widget",
        app.buildSaveData(),
        QSET_VERSION,
      );
    },
    manualResize: false,
  });
});
