<?php

namespace Materia;

class Score_Modules_Wordguess extends Score_Module
{
	public function check_answer($log)
	{
		if (isset($this->questions[$log->item_id])) return 100;
		return 0;
	}

	// use the question feedback area to display all guesses for the given word by all students
	protected function get_feedback($log, $answers)
	{
		$all_words = [$log->text => 1];
		$where = [
			['item_id', '=', $log->item_id],
			['type', '=', Session_Log::TYPE_QUESTION_ANSWERED],
			['play_id', '!=', $log->play_id]
		];
		$other_words = Session_Logger::query_logs($where);

		foreach ($other_words as $other_word)
		{
			$word = mb_strtolower(trim($other_word['text']));
			if ( ! isset($all_words[$word])) $all_words[$word] = 0;
			$all_words[$word]++;
		}

		$final_words = [];
		if ( ! empty($all_words))
		{
			foreach ($all_words as $word => $count)
			{
				if ($count < 1) continue;
				if ($count > 1) $final_words[] = $word.' ('.$count.')';
				else $final_words[] = $word;
			}
			sort($final_words);
		}
		if ( ! empty($final_words)) return 'All recorded responses for this word: '.implode(', ', $final_words);
	}
}
