<?php

namespace Materia;

class Score_Modules_Wordguess extends Score_Module
{
	public function check_answer($log)
	{
		if (isset($this->questions[$log->item_id])) return 100;
		return 0;
	}
}