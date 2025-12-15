from scoring.module import ScoreModule

class WordGuess(ScoreModule):

    def __init__(self, play=None):
        super().__init__(play)

    def check_answer(self, log):
        q = self.get_question_by_item_id(log.item_id)
        if q is not None:
            return 100
        return 0
