/**
 * @typedef {Object} QSetV1
 * @property {string} name
 * @property {{
 *   version: 1,
 *   data: {
 *     title: string,
 *     paragraph: string,
 *     questions_answers: {
 *       id: (number|null),
 *       type: "QA",
 *       questions: { text: string }[],
 *       answers: { text: string }[]
 *     }[],
 *     wordsToSkip: number,
 *     manualSkippingIndices: number[]
 *   }
 * }} qset
 */

/**
 * @typedef {Object} QSetV2
 * @property {string} name
 * @property {{
 *   version: 2,
 *   data: {
 *     title: string,
 *     paragraph: string,
 *     items: {
 *       id: null,
 *       type: "QA",
 *       questions: { text: string }[],
 *       answers: { text: string, score: number }[],
 *       index: number
 *     }[]
 *   }
 * }} qset
 */

/**
 * @typedef {QSetV1 | QSetV2} QSet
 */

export class QSetUtil {
  /**
   * Only builds V2 right now.
   * @param {string} title
   * @param {string} paragraph
   * @param {{ text: string, index: number }[]} highlighted
   * @returns {QSet}
   */
  static DataToQSet(title, paragraph, highlighted) {
    /**
     * @type {QSetV2}
     */
    const res = {
      name: "Word Guess!",
      qset: {
        version: 2,
        data: {
          title,
          paragraph,
          items: [],
        },
      },
    };
    let cnt = 0;
    for (const { text, index } of highlighted)
      res.qset.data.items.push({
        id: null,
        index,
        type: "QA",
        answers: [{ text, score: 100 }],
        questions: [{ text: `Word ${++cnt}` }],
      });
    return res;
  }
  /**
   * @returns {{ title: string, paragraph: string, highlighted: { text: string; id: number }[] }}
   * @param {QSet} qset
   */
  static QSetToInfo(qset) {
    switch (qset.qset.version) {
      case 1: {
        throw new Error("not implemented");
        break;
      }
      case 2: {
        return {
          title: qset.qset.data.title,
          paragraph: qset.qset.data.paragraph,
          highlighted: qset.qset.data.items.map((x) => ({
            text: x.answers[0].text,
            id: x.index,
          })),
        };
      }
      default: {
        throw new Error("unknown qset version");
      }
    }
  }
}
