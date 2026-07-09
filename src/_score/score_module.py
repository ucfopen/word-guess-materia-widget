from scoring.module import ScoreModule

class WordGuess(ScoreModule):

    def __init__(self, play=None):
        super().__init__(play)

    def check_answer(self, log):
        scored = self.qset.get("data", self.qset).get("options", {}).get("scored", False)

        q = self.get_question_by_item_id(log.item_id)
        
        sa = self.get_ss_answer(log, q)
        se = self.get_ss_expected_answers(log, q)

        if sa.lower() == se.lower() or scored is False:
            return 100
        return 0
