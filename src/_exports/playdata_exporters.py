import io
from datetime import datetime
from zipfile import ZIP_DEFLATED, ZipFile


def all_guesses(instance, logs):
    """
    Export all guesses for the Word Guess widget.

    Args:
        instance: WidgetInstance object
        logs: QuerySet[LogPlay] containing play logs

    Returns:
        tuple: (zip_data as bytes, file_extension as str)
    """
    csvs = {}

    # Process each play log
    results = {}
    for play in logs:
        play_id = play.id
        if play_id not in results:
            results[play_id] = []

        # Get play events for this play
        play_events = play.get_logs()
        for play_event in play_events:
            r = {
                "qset_id": play.qset.id,
                "semester": f"{play.semester.semester}-{play.semester.year}",
                "type": play_event.log_type,
                "item_id": play_event.item_id,
                "text": play_event.text,
                "value": play_event.value,
                "created_at": play_event.created_at,
            }
            results[play_id].append(r)

    # If we didn't find any results, return False
    if not results:
        return False

    # Process results by play
    for play_id, playlog in results.items():
        if not playlog:
            continue

        qset_id = playlog[0]["qset_id"]

        # If we don't have the qset for this version,
        # get it and do all of the setup
        if qset_id not in csvs:
            cur_csv = {
                "questions": [],
                "rows": [],
                "timestamp": playlog[0]["created_at"],
            }

            # Get the qset with this qset_id
            qset = instance.get_qset_for_play(play_id)

            # Get the data from the qset and decode it,
            # then get questions from it
            if qset:
                questions = qset.get_questions()

                # Legacy QSets follow the [items][items] scheme
                # if questions and isinstance(questions, list) and len(questions) > 0:
                #     if isinstance(questions[0], dict) and "items" in questions[0]:
                #         questions = questions[0]["items"]

                # Question_text is the question headers in the form of a string
                question_text_parts = []
                for q in questions:
                    question_data = q.data.get("questions", [{}])[0]
                    answer_data = q.data.get("answers", [{}])[0]

                    clean_question = _clean_text(question_data.get("text", ""))
                    clean_answer = _clean_text(answer_data.get("text", ""))

                    question_text_parts.append(f"{clean_question}({clean_answer})")
                    cur_csv["questions"].append(q.data.get("id", ""))

                cur_csv["question_text"] = ", ".join(question_text_parts)
                cur_csv["num_questions"] = len(questions)

            csvs[qset_id] = cur_csv
        else:
            cur_csv = csvs[qset_id]

        # Array for the current row. Initialize with empty strings
        # so when it is concatenated later it takes into account
        # empty spots
        logs_row = [""] * cur_csv["num_questions"]

        for r in playlog:
            # Append each response to the row
            # If a response is logged for the same question TWICE,
            # use the last response
            if r["type"] == "SCORE_QUESTION_ANSWERED":
                # If the question id is in the question array
                # for the current csv
                if r["item_id"] in cur_csv["questions"]:
                    position = cur_csv["questions"].index(r["item_id"])
                    logs_row[position] = _clean_text(r["text"])

        cur_csv["rows"].append(", ".join(logs_row))
        csvs[qset_id] = cur_csv

    # Return the csv zip
    zip_buffer = io.BytesIO()
    with ZipFile(zip_buffer, "w", ZIP_DEFLATED) as zip_file:
        for qset_id, csv in csvs.items():
            if not csv["rows"]:
                continue

            # Format timestamp
            if isinstance(csv["timestamp"], datetime):
                timestamp_str = csv["timestamp"].strftime("%m-%d-%y %I_%M%p")
            else:
                timestamp_str = str(csv["timestamp"])

            csv_content = csv["question_text"] + "\r\n" + "\r\n".join(csv["rows"])
            filename = f"{instance.name} (created {timestamp_str}).csv"
            zip_file.writestr(filename, csv_content)

    return zip_buffer.getvalue(), "zip"


def _clean_text(text):
    """
    Clean text by removing newlines and commas.

    Args:
        text: The text to clean

    Returns:
        str: Cleaned text
    """
    if not isinstance(text, str):
        return ""

    return text.replace("\r", "").replace("\n", "").replace(",", "")


# Export the available playdata exporters
mappings = {
    "All Guesses": all_guesses,
}
