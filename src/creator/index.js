// TODO: Add QSET V1 support
const ALLOWED_QSET_VERSIONS = [2];
const QSET_VERSION = 2;

const SLIDER_MIN = 1;
const SLIDER_DEFAULT = 1;
const SLIDER_MAX_PERCENT = 0.75;
const MAX_PERC_SPACE_BETWEEN = 0.25;

// These are in percents
const PROGRESS_BAR_GOOD_THRESHOLD = 75;
const PROGRESS_BAR_BAD_THRESHOLD = 100;

const MAX_HIDDEN = 30;
const MAX_WORD_COUNT = 250;

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
  "into",
]);

const PUNCTUATION = new Set([
  ",", ".", ":", `"`, "?", "!"
])

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

  el = {
    outer: document.getElementById("outer"),
    
    textarea: document.getElementById("textarea"),
    pickarea: document.getElementById("pickarea"),
    wordBank: document.getElementById("word-bank"),
    wordBankInfo: document.getElementById("word-bank-info"),

    settingsBtn: document.getElementById("settings-btn"),
    settingsScreen: document.getElementById("settings-screen"),

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

    helpDialog: document.getElementById("help-dialog"),
    helpDialogCloseButton: document.getElementById("close-button"),

    titleInput: document.getElementById("title"),

    settingsScoredCheck: document.getElementById("scoring-check"),
    settingsBankCheck: document.getElementById("type-bank"),
    settingsFreeCheck: document.getElementById("type-free"),

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

      if (!ALLOWED_QSET_VERSIONS.includes(version))
        this.openWarningDialog(`QSet version ${version} is not supported yet.`);

      this.setTitle(title);
      this.setParagraph(qset.options.paragraph);

      this.highlighted = new Set(qset.items.map((x) => x.options.index));
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

    this.el.textarea.addEventListener("beforeinput", (e) => {
      const newString = this.el.textarea.value
      const addedCount = (newString + e.data).trim().split(/\s+|([,.!?:"])/).length
      
      if (addedCount > MAX_WORD_COUNT && e.data) {
        e.preventDefault();
      }
    })

    this.el.textarea.addEventListener("input", (e) => {
      this.generateWords();
      this.updateWordCount();

      // This makes the slider respoooonsive when you add words
      this.updateSlider(this.el.slider.value);

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

    this.el.settingsBtn.addEventListener("click", ()=>{
      if (this.el.settingsScreen.className.includes("hidden")) {
        this.el.settingsBtn.classList.add("rotate")
        this.el.settingsScreen.classList.remove("hidden")
      }
      else {
        this.el.settingsBtn.classList.remove("rotate")
        this.el.settingsScreen.classList.add("hidden")
      }
    })

    this.el.pickarea.addEventListener("click", (e) => {
      if (this.activeMode === "automatic") this.switchToManual();

      const span = e.target;
      if (!span.classList.contains("word-span-pill")) return;

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

  getHighlighted() {
    return this.words
      .map((word, index) => ({
        id: word.id,
        text: word.text,
        index,
      }))
      .filter((word) => this.highlighted.has(word.id));
  }

  generateWords() {
    const text = this.el.textarea.value.trim();
    if (!text) {
      this.words = [];
      this.highlighted.clear();
      return;
    }

    const words = text.split(/\s+|([,.!?:"])/);
    const newWords = [];

    let oldIndex = 0;

    for (const word of words) {
      if(!word) continue;

      if (oldIndex < this.words.length && this.words[oldIndex].text === word) {
        newWords.push(this.words[oldIndex]);
        oldIndex++;
      } else {
        newWords.push({
          id: this.wordIdCounter++,
          text: word,
        });
      }
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
    this.el.wordBank.innerHTML = "";
    
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
    percentage = value / this.maxWordsBetween() * 100

    const normalized = (value - this.minWordsBetween() + 1) / (this.maxWordsBetween() - this.minWordsBetween() + 1)

    this.el.sliderMask.style.width = `${normalized * 100}%`;
    this.el.slider.value = value;

    this.el.slider.dataset.mappedValue = value;
    this.el.sliderMask.dataset.percentage = `${value}`;

    this.el.sliderMsg.textContent = `${value} words hidden`;
  }

  minWordsBetween() {
    return Math.max(Math.floor(this.words.length/this.maxHiddenWords()) - 1, SLIDER_MIN)
  }

  maxWordsBetween() {
    return Math.floor(this.words.length * MAX_PERC_SPACE_BETWEEN);
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
    const target = Math.min(Math.floor(this.words.length/(autoCount)), this.words.length);

    const oldHighlighted = [...this.highlighted];
    this.highlighted.clear();

    // const candidates = this.words.filter(
    //   (w) => !CONJUNCTIONS.has(w.text.toLowerCase()),
    // );

    const candidates = this.words;

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
    this.el.textarea.style.display = "none";
    this.el.pickarea.style.display = "flex";
    this.el.slideToggle.classList.add("slid");
    this.el.outer.classList.remove("new")
  }

  switchToWriteMode() {
    this.el.textarea.style.display = "block";
    this.el.pickarea.style.display = "none";
    this.el.slideToggle.classList.remove("slid");
  }

  getWordCount() {
    return this.el.textarea.value.trim().split(/\s+|([,.!?:"])/).length;
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
    return {
      items: this.getHighlighted().map(({ text, index }) => ({
        id: null,
        type: "wordguess",
        materiaType: "question",
        questions: [{ text: `Word #${++cnt}` }],
        answers: [{ text }],
        options: { index },
      })),
      options: {
        paragraph: this.getParagraph(),
        mode: this.activeMode ?? "manual",
        slider: this.el.slider.value,
        responseType: this.responseType,
        scored: this.scored
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

        if (app.words.length > MAX_WORD_COUNT) {
          app.openWarningDialog(
            `Max passage length is ${MAX_WORD_COUNT} words. Please update the passage.`,
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
