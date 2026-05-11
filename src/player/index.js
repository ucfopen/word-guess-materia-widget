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

  el = {
    wordBank: document.getElementById("word-bank"),
    passage: document.getElementById("passage"),
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

  makeWordPill(index, text) {
    const span = document.createElement("span");
    span.classList.add("word-pill");
    span.draggable = "true";
    span.innerText = text;
    span.id = `word-${index}`;
    return span;
  }

  makeWordPillHome() {
    const span = document.createElement("span");
    span.classList.add("word-pill-home");
    return span;
  }

  makeWordPillContainer(id) {
    const span = document.createElement("span");
    span.classList.add("word-pill-container");
    span.id = id;
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

  bind() {
    if (this.bound) return;

    this.bound = true;

    this.el.greeting.showModal();

    this.el.howToPlayButton.addEventListener("click", () => {
      this.el.welcomeMessage.style.display = "none";
      this.el.instructions.style.display = "flex";
    });

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

    document
      .getElementsByClassName("page-selector")[0]
      .addEventListener("click", (e) => {
        console.log(e.target);
      });

    this.el.controlsKeyboardButton.addEventListener("click", () => {
      this.el.controlsKeyboardButton.classList.add("selected");
      this.el.controlsPointerButton.classList.remove("selected");

      this.el.controlsKeyboard.style.display = "flex";
      this.el.controlsPointer.style.display = "none";
    });

    this.el.controlsPointerButton.addEventListener("click", () => {
      this.el.controlsPointerButton.classList.add("selected");
      this.el.controlsKeyboardButton.classList.remove("selected");

      this.el.controlsPointer.style.display = "flex";
      this.el.controlsKeyboard.style.display = "none";
    });

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
    let innerHTML = "";
    for (let i = 0; i < paragraphWords.length; i++) {
      if (this.words[i])
        innerHTML += this.makeWordPillContainer(this.words[i].id).outerHTML;
      else innerHTML += paragraphWords[i];

      innerHTML += " ";
    }
    this.el.passage.innerHTML = innerHTML;

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
      } else if (this.originSlot?.classList.contains("word-pill-home")) {
        this.originSlot.appendChild(this.draggedItem);
      } else {
        const emptyBankSlot = Array.from(this.el.wordBankSlots()).find(
          (slot) => slot.children.length === 0,
        );
        if (emptyBankSlot) emptyBankSlot.appendChild(this.draggedItem);
      }

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
