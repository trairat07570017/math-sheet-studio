# -*- coding: utf-8 -*-
"""
Master Builder Script for 24 Lessons Curriculum (v2)
Generates curriculum_24_lessons.json and updates index.html with:
- 3 Worked Demonstration Examples with KaTeX step-by-step solutions
- 6 Student Practice Exercises with handwriting ruled grids
- Perfectly sequenced: Ex1 -> Q1, Q2 -> Ex2 -> Q3, Q4 -> Ex3 -> Q5, Q6
"""

import os
import sys
import json
import re

# Add scripts directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lessons_data_part1 import register_part1
from lessons_data_part2 import register_part2
from lessons_data_part3 import register_part3

lessons = {}

def make_lesson(
    lid, week_num, period_num, title, standard, desc,
    formula_title, formulas, tip,
    ex1, q1, q2,
    ex2, q3, q4,
    ex3, q5, q6
):
    concept_html = f"""<div class="sheet-formula-box">
  <div style="font-weight: 600; color: #1e3a8a; margin-bottom: 0.35rem;">📌 {formula_title}</div>
  <div class="equation-stage">
    {formulas}
  </div>
  <div style="font-size: 0.88rem; color: #475569; margin-top: 0.25rem;">
    💡 <strong>เทคนิคคิดเร็ว:</strong> {tip}
  </div>
</div>"""

    ex_list = [
        # Part 1: Demo 1 -> Q1, Q2
        {
            "title": f"ตัวอย่างที่ 1. (ครูสาธิตวิธีทำ) {ex1[0]}",
            "points": "",
            "latex": ex1[1],
            "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex1[2]})"
        },
        {
            "title": f"ข้อที่ 1. {q1[0]}",
            "points": q1[1] if len(q1) > 1 and q1[1] else "",
            "latex": "",
            "answerType": q1[2] if len(q1) > 2 and q1[2] else "handwriting-normal",
            "placeholder": ""
        },
        {
            "title": f"ข้อที่ 2. {q2[0]}",
            "points": q2[1] if len(q2) > 1 and q2[1] else "",
            "latex": "",
            "answerType": q2[2] if len(q2) > 2 and q2[2] else "handwriting-normal",
            "placeholder": ""
        },

        # Part 2: Demo 2 -> Q3, Q4
        {
            "title": f"ตัวอย่างที่ 2. (ครูสาธิตวิธีทำ) {ex2[0]}",
            "points": "",
            "latex": ex2[1],
            "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex2[2]})"
        },
        {
            "title": f"ข้อที่ 3. {q3[0]}",
            "points": q3[1] if len(q3) > 1 and q3[1] else "",
            "latex": "",
            "answerType": q3[2] if len(q3) > 2 and q3[2] else "handwriting-normal",
            "placeholder": ""
        },
        {
            "title": f"ข้อที่ 4. {q4[0]}",
            "points": q4[1] if len(q4) > 1 and q4[1] else "",
            "latex": "",
            "answerType": q4[2] if len(q4) > 2 and q4[2] else "handwriting-normal",
            "placeholder": ""
        },

        # Part 3: Demo 3 -> Q5, Q6
        {
            "title": f"ตัวอย่างที่ 3. (ครูสาธิตวิธีทำ) {ex3[0]}",
            "points": "",
            "latex": ex3[1],
            "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex3[2]})"
        },
        {
            "title": f"ข้อที่ 5. {q5[0]}",
            "points": q5[1] if len(q5) > 1 and q5[1] else "",
            "latex": "",
            "answerType": q5[2] if len(q5) > 2 and q5[2] else "handwriting-normal",
            "placeholder": ""
        },
        {
            "title": f"ข้อที่ 6. {q6[0]}",
            "points": q6[1] if len(q6) > 1 and q6[1] else "",
            "latex": "",
            "answerType": q6[2] if len(q6) > 2 and q6[2] else "handwriting-large",
            "placeholder": ""
        }
    ]

    lessons[lid] = {
        "id": lid,
        "chapter": f"บทที่ {week_num}",
        "week": f"บทที่ {week_num}",
        "period": f"คาบที่ {period_num}",
        "grade": "มัธยมศึกษาปีที่ 4",
        "gradeShort": "ม.4",
        "semester": "ภาคเรียนที่ 2",
        "subjectCode": "คณิตศาสตร์เพิ่มเติม 2 (ค31202)",
        "title": f"คาบที่ {period_num}: {title}",
        "standard": standard,
        "desc": desc,
        "worksheet": {
            "sheetName": f"ใบงานคาบที่ {period_num}: {title}",
            "conceptHtml": concept_html,
            "exercises": ex_list
        },
        "summary": {
            "sheetName": f"ใบสรุปสูตร & เทคนิคคิดเร็ว คาบที่ {period_num}: {title}",
            "conceptHtml": concept_html,
            "exercises": [
                ex_list[0], # Demo 1
                ex_list[3], # Demo 2
                ex_list[6], # Demo 3
            ]
        },
        "quiz": {
            "sheetName": f"แบบทดสอบย่อยท้ายคาบ (Exit Ticket): คาบที่ {period_num}",
            "conceptHtml": "<p style=\"font-size: 0.88rem; color: #475569;\">⏱️ เวลาทำ 15 นาที • ให้นักเรียนแสดงวิธีทำอย่างละเอียด</p>",
            "exercises": [
                {
                    "title": f"ข้อสอบย่อย 1. " + q1[0],
                    "points": "",
                    "latex": "",
                    "answerType": "handwriting-normal",
                    "placeholder": ""
                },
                {
                    "title": f"ข้อสอบย่อย 2. " + q3[0],
                    "points": "",
                    "latex": "",
                    "answerType": "handwriting-normal",
                    "placeholder": ""
                },
                {
                    "title": f"ข้อสอบย่อย 3. " + q5[0],
                    "points": "",
                    "latex": "",
                    "answerType": "handwriting-normal",
                    "placeholder": ""
                }
            ]
        }
    }

def main():
    print("Registering all 24 lessons...")
    register_part1(make_lesson)
    register_part2(make_lesson)
    register_part3(make_lesson)

    print(f"Total registered lessons: {len(lessons)}")
    assert len(lessons) == 24, f"Expected 24 lessons, got {len(lessons)}"

    # Validate each lesson structure
    for lid, topic in lessons.items():
        exs = topic["worksheet"]["exercises"]
        assert len(exs) == 9, f"Lesson {lid} exercises count is {len(exs)}, expected 9"
        assert exs[0]["latex"], f"Lesson {lid} Ex 0 missing latex"
        assert exs[3]["latex"], f"Lesson {lid} Ex 3 missing latex"
        assert exs[6]["latex"], f"Lesson {lid} Ex 6 missing latex"
        assert not exs[1]["latex"], f"Lesson {lid} Q1 has unexpected latex"
        assert not exs[4]["latex"], f"Lesson {lid} Q3 has unexpected latex"
        assert not exs[7]["latex"], f"Lesson {lid} Q5 has unexpected latex"

    # Write curriculum_24_lessons.json
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "curriculum_24_lessons.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    print(f"Saved curriculum_24_lessons.json successfully! File size: {os.path.getsize(json_path)} bytes")

    # Update index.html
    html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update CURRICULUM_DATABASE in index.html
    db_start_tag = 'const CURRICULUM_DATABASE = {'
    db_end_tag = 'const ORIGINAL_CURRICULUM_DATA = JSON.parse(JSON.stringify(CURRICULUM_DATABASE));'

    idx_start = html.find(db_start_tag)
    idx_end = html.find(db_end_tag)

    if idx_start == -1 or idx_end == -1:
        raise ValueError(f"Could not find CURRICULUM_DATABASE boundaries: idx_start={idx_start}, idx_end={idx_end}")

    curriculum_json_str = json.dumps(lessons, ensure_ascii=False, indent=2)
    new_db_chunk = f"const CURRICULUM_DATABASE = {curriculum_json_str};\n\n    "

    html = html[:idx_start] + new_db_chunk + html[idx_end:]
    print("Replaced CURRICULUM_DATABASE in index.html successfully!")

    # 2. Update initial static HTML for contentExerciseBody to match expo-l01
    l01 = lessons["expo-l01"]["worksheet"]["exercises"]
    initial_exercises_html = ""
    for idx, ex in enumerate(l01):
        is_worked_example = bool(ex.get("latex"))
        answer_area = ""
        if is_worked_example:
            answer_area = f"""
        <div class="sheet-solution-box" style="margin: 0.3rem 0 0.15rem 0; padding: 0.45rem 0.75rem; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;">
          <div style="font-size: 0.88rem; font-weight: 600; color: #1d4ed8; margin-bottom: 0.2rem;">📘 แสดงวิธีทำ:</div>
          <div class="equation-stage" style="overflow-x: auto; color: #0f172a;">$${ex['latex']}$$</div>
          <div style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-top: 0.2rem;">{ex['placeholder']}</div>
        </div>"""
        else:
            grid_min_height = "165px" if ex.get("answerType") == "handwriting-large" else "145px"
            answer_area = f"""
      <div class="handwriting-grid" style="min-height: {grid_min_height};"></div>"""

        initial_exercises_html += f"""
    <div class="sheet-exercise interactive-block" data-index="{idx}">
      <div class="exercise-actions-bar no-print">
        <button type="button" class="action-btn" onclick="openEditExerciseModal({idx})" title="แก้ไขข้อสอบนี้">
          ✏️ แก้ไข
        </button>
        <button type="button" class="action-btn" onclick="moveExercise({idx}, -1)" title="เลื่อนข้อขึ้น">
          ⬆️
        </button>
        <button type="button" class="action-btn" onclick="moveExercise({idx}, 1)" title="เลื่อนข้อลง">
          ⬇️
        </button>
        <button type="button" class="action-btn delete-btn" onclick="deleteExercise({idx})" title="ลบข้อนี้">
          🗑️ ลบ
        </button>
      </div>

      <div class="exercise-header">
        <span>{ex['title']}</span>
      </div>
      {answer_area}
    </div>"""

    # Replace content between <div id="contentExerciseBody"> and <div class="add-exercise-container no-print">
    body_marker = '<div id="contentExerciseBody">'
    add_btn_marker = '<div class="add-exercise-container no-print">'

    b_idx = html.find(body_marker)
    a_idx = html.find(add_btn_marker, b_idx)

    if b_idx != -1 and a_idx != -1:
        new_content = html[:b_idx + len(body_marker)] + "\n" + initial_exercises_html + "\n\n        " + html[a_idx:]
        html = new_content
        print("Updated initial static HTML inside contentExerciseBody successfully!")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"Saved index.html successfully! File size: {os.path.getsize(html_path)} bytes")

if __name__ == "__main__":
    main()
