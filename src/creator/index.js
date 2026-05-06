class Utils {
  static conjunctions = new Set([
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

  // Its important to have these separate so that the logic can be changed imo
  static getMaxSelected(count) {
    return Infinity;
  }
  static getUpperLimitSelected(count) {
    return Infinity;
  }
}

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
    textarea: document.getElementById("textarea"),
    pickarea: document.getElementById("pickarea"),
    wordBank: document.getElementById("word-bank"),
    wordBankInfo: document.getElementById("word-bank-info"),

    slider: document.getElementById("slider"),
    sliderMask: document.getElementById("slider-mask"),

    manualBtn: document.getElementById("manual-button"),
    autoBtn: document.getElementById("auto-button"),
    modeToggle: document.getElementById("mode-slide-knob"),

    manualInfo: document.getElementById("manual-info-container"),
    autoInfo: document.getElementById("auto-info-container"),

    refreshBtn: document.getElementById("refresh-btn"),
    trashBtn: document.getElementById("trash-btn"),

    wordCount: document.getElementById("word-count"),

    manualProgressBar: document.getElementById("manual-bar"),
    manualProgressInfo: document.getElementById("rec-message-man"),

    sliderMsg: document.getElementById("rec-message-auto"),

    mouseClick: document.getElementById("mouse-click"),
    pencilEdit: document.getElementById("pencil-edit"),
    slideToggle: document.getElementById("slide-knob"),

    helpDialog: document.getElementById("help-dialog"),
    helpDialogCloseButton: document.getElementById("close-button"),

    titleInput: document.getElementById("title"),

    errorDialog: document.getElementById("error-dialog"),
    errorMsg: document.getElementById("error-message"),
    errorDialogCloseButton: document.getElementById(
      "error-dialog-close-button",
    ),
  };

  activeMode = null;
  sliderUsed = false;
  bound = false;

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

      if (version != 2)
        this.openWarningDialog(`QSet version ${version} is not supported yet.`);

      this.setTitle(title);
      this.setParagraph(qset.options.paragraph);

      this.highlighted = new Set(qset.items.map((x) => x.options.index));
      this.generateWords();

      this.sliderUsed = true;
      this.updateSlider(qset.options.slider);

      if (qset.options.mode == "manual") this.switchToManual();
      else this.switchToAuto();

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

    this.el.textarea.addEventListener("input", () => {
      this.generateWords();
      this.updateWordCount();

      // This makes the slider respoooonsive when you add words
      this.updateSliderMin();
      this.updateSliderMax();
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

    this.el.pickarea.addEventListener("click", (e) => {
      if (this.activeMode == "automatic") this.switchToManual();

      const span = e.target;
      if (!span.classList.contains("word-span-pill")) return;

      const id = Number(span.dataset.id);

      if (this.highlighted.has(id)) {
        this.highlighted.delete(id);
        span.classList.remove("highlighted");
      } else if (
        this.highlighted.size < Utils.getMaxSelected(this.words.length)
      ) {
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

    const words = text.split(/\s+/);
    const newWords = [];

    let oldIndex = 0;

    for (const word of words) {
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
    for (const id of this.highlighted) {
      if (!valid.has(id)) this.highlighted.delete(id);
    }
  }

  renderWords() {
    this.el.pickarea.innerHTML = "";

    for (const word of this.words) {
      const pill = document.createElement("button");
      pill.className = "word-span-pill";
      pill.textContent = word.text;
      pill.dataset.id = word.id;

      if (this.highlighted.has(word.id)) {
        pill.classList.add("highlighted");
      }

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

    if (this.highlighted.size === 0) {
      if (this.activeMode == "manual" && this.words.length)
        this.wordBankInfo(
          "Select some words to get started!",
          WARNING_LEVEL.INFO,
        );

      this.hideTrashButton();
      return;
    }

    this.wordBankInfo();

    if (this.activeMode == "manual") {
      if (this.highlighted.size === Utils.getMaxSelected(this.words.length))
        this.wordBankInfo("Thats enough!", WARNING_LEVEL.ERROR);
      else if (
        this.highlighted.size > Utils.getUpperLimitSelected(this.words.length)
      )
        this.wordBankInfo(
          "You've picked a lot of words!",
          WARNING_LEVEL.WARNING,
        );
      else {
        this.wordBankInfo(
          `${this.highlighted.size} word${this.highlighted.size == 1 ? "" : "s"}`,
          WARNING_LEVEL.INFO,
        );
      }
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

    if (this.activeMode == "automatic") this.showRefreshButton();
    else this.hideRefreshButton();

    this.showTrashButton();
  }

  updateSliderMax(value = undefined) {
    value = value ?? Math.floor((24 / 100) * this.words.length);
    this.el.slider.max = Math.max(value, 3);
  }
  updateSliderMin(value = 3) {
    this.el.slider.min = Math.max(value, 3);
  }

  updateSlider(value) {
    this.updateSliderMax();
    this.updateSliderMin();

    // Plus one so it looks a bit better. Will need to be changed when the
    // slider is Re:Styled.
    this.el.sliderMask.style.width =
      ((value - this.el.slider.min + 1) /
        (this.el.slider.max - this.el.slider.min + 1)) *
        100 +
      "%";

    this.el.slider.value = value;
    this.el.sliderMask.dataset.percentage = "1:" + this.el.slider.value;
    this.el.sliderMsg.textContent = `${this.el.slider.value} words between`;
  }

  refreshAutoWords() {
    const shuffle = Number(this.el.slider.value) + 1;
    const offset = Math.floor(Math.random() * shuffle);

    const oldHighlighted = [...this.highlighted];
    this.highlighted.clear();

    for (const [i, w] of this.words.entries()) {
      if (
        (i + offset) % shuffle === 0 &&
        !Utils.conjunctions.has(w.text.toLowerCase())
      )
        this.highlighted.add(w.id);
    }

    // On the off chance that 0 words are selected or they are the same
    // we reroll
    if (
      (this.highlighted.size == 0 && this.words.length) ||
      (oldHighlighted.length &&
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

    // case where its not been updated yet
    if (!this.sliderUsed) {
      this.sliderUsed = true;
      this.updateSlider(3);

      this.refreshAutoWords();
    }

    this.el.modeToggle.classList.remove("slid");

    this.el.refreshBtn.style.display = "block";

    this.el.manualInfo.style.display = "none";
    this.el.autoInfo.style.display = "flex";

    this.renderWordBank();
  }

  switchToPickMode() {
    // TODO
    // document.getElementById("bank-region").style.display = "flex";

    this.el.textarea.style.display = "none";
    this.el.pickarea.style.display = "flex";
    this.el.slideToggle.classList.add("slid");
  }

  switchToWriteMode() {
    // TODO
    // document.getElementById("bank-region").style.display = "none";

    this.el.textarea.style.display = "block";
    this.el.pickarea.style.display = "none";
    this.el.slideToggle.classList.remove("slid");
  }

  updateWordCount() {
    const count = this.el.textarea.value.trim().split(/\s+/).length;
    this.el.wordCount.textContent = `${count} / 250 words`;
  }

  renderManualProgress() {
    // TODO
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
      },
    };
  }
}

window.addEventListener("load", () => {
  let app = null;
  Materia.CreatorCore.start({
    initExistingWidget: (title, _widgetInstance, qset, version) =>
      (app = new App({ title, qset, version })),
    initNewWidget: () => (app = new App()),
    onSaveComplete: () => true,
    onSaveClicked: (mode = "save") => {
      mode = "publish";
      if (mode == "publish") {
        if (!app.getParagraph()) {
          app.openWarningDialog(
            "No passage Entered for this fill-in-the-blank activity. Please enter more text.",
          );
          return;
        }
      }

      Materia.CreatorCore.save(
        app.getTitle() || "New WordGuess Widget",
        app.buildSaveData(),
        2,
      );
    },
    manualResize: false,
  });
});
