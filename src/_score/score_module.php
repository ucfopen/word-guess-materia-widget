<?php

namespace Materia;

class Score_Modules_Wordguess extends Score_Module
{
	public function check_answer($log)
	{
		// if (isset($this->questions[$log->item_id])) return 100;
		if (isset($this->inst->qset->data['options']) &&
				isset($this->inst->qset->data['options']['enableScoring']) )
		{
			// trace("A LOG IS: " . print_r($log, true));
			$questionID = $log->item_id;
			$playerAnswer = trim($log->text);

			if (isset($this->questions[$questionID]))
			{
				$correctAnswers = $this->questions[$questionID]->answers;
				foreach ($correctAnswers as $answer)
				{
					// check if the answer and user input match
					// should work regardless of capitalization or spaces
					if (strcasecmp($playerAnswer, trim($answer['text'])) === 0)
					{
						// trace("Correct answer for question $questionID: $playerAnswer");
						return 100; // return full score
					}
				}
				trace("Incorrect answer for question $questionID: $playerAnswer");
				return 0;
			}

			trace("Question ID $questionID not found.");
			return 0;
		}
		// else the option for scoring is not enabled, give them a 100
		return 100;
	}

	// use the question feedback area to display all guesses for the given word by all students
	// hide the option when qset.data.options.showAllOtherAnswersBoolean is false(default)
	protected function get_feedback($log, $answers)
	{
		$all_words = [];
		$final_words = [];
		if (strlen($log->text)) $all_words[$log->text] = 1;

		$where = [
			['item_id', '=', $log->item_id],
			['type', '=', Session_Log::TYPE_QUESTION_ANSWERED],
			['play_id', '!=', $log->play_id]
		];
		$other_words = $this->query_logs($where);

		//initial loop - build array with all words and the counts for each
		foreach ($other_words as $other_word)
		{
			$word = mb_strtolower(trim($other_word['text']));

			if (strlen($word))
			{
				if ( ! isset($all_words[$word]) ) $all_words[$word] = 1;
				else $all_words[$word]++;
			}
		}

		//If options boolean is false it will show no feedback for other recorded responses
		if ( isset($this->inst->qset->data['options']) &&
				isset($this->inst->qset->data['options']['showAllOtherAnswersBoolean']) &&
				$this->inst->qset->data['options']['showAllOtherAnswersBoolean'] === false)
		{
			return;
		}
		if ( ! empty($all_words))
		{
			//second loop - condense words and their counts into single strings
			foreach ($all_words as $word => $count)
			{
				if ($count < 1) continue;
				if ($count > 1) $final_words[] = $word.' ('.$count.')';
				else $final_words[] = $word;
			}
			sort($final_words);
		}

		if ( ! empty($final_words))
		{
			return 'All recorded responses for this word: '.implode(', ', $final_words);
		}
		else
		{
			return 'No other responses have been recorded for this word.';
		}
	}
}
