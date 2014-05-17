<?php

namespace Materia;

class Score_Modules_Wordguess extends Score_Module
{
	public function check_answer($log)
	{
		if (isset($this->questions[$log->item_id])) return 100;
		return 0;
	}

	// Returns an array containing unique alpha numeric values
	private function clean_str($str)
	{
		$str = preg_replace('/[^0-9a-z]/i', '', $str);
		$str = strtolower($str);
		$str = str_split($str);
		$str = array_unique($str);	// should not affect user submissions
		return $str;
	}
}
