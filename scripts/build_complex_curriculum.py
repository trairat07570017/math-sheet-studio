#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Integrator Script: Merges the 24-lesson Complex Numbers Curriculum (IPST M.5)
into src/data/curriculum.json alongside the 24-lesson Expo-Log Curriculum (IPST M.4).
Total lessons after merge: 48 lessons.
"""

import os
import sys
import json

# Ensure scripts directory is on path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

from complex_data_part1 import register_complex_part1
from complex_data_part2 import register_complex_part2
from complex_data_part3 import register_complex_part3

def main():
    root_dir = os.path.dirname(SCRIPT_DIR)
    curriculum_json_path = os.path.join(root_dir, 'src', 'data', 'curriculum.json')

    print(f"Reading existing curriculum from: {curriculum_json_path}")
    with open(curriculum_json_path, 'r', encoding='utf-8') as f:
        curriculum = json.load(f)

    existing_count = len(curriculum)
    print(f"Existing lessons count: {existing_count}")

    # Register Complex Numbers lessons
    complex_lessons = {}
    register_complex_part1(complex_lessons)
    register_complex_part2(complex_lessons)
    register_complex_part3(complex_lessons)

    print(f"Loaded {len(complex_lessons)} complex number lessons.")

    # Validation
    for i in range(1, 25):
        lid = f"complex-l{i:02d}"
        if lid not in complex_lessons:
            raise ValueError(f"Missing lesson {lid}")
        lesson = complex_lessons[lid]
        assert "id" in lesson and lesson["id"] == lid
        assert "worksheet" in lesson and len(lesson["worksheet"]["exercises"]) == 9
        assert "summary" in lesson and len(lesson["summary"]["exercises"]) == 3
        assert "quiz" in lesson and len(lesson["quiz"]["exercises"]) == 6

    # Merge into curriculum
    for lid, ldata in complex_lessons.items():
        curriculum[lid] = ldata

    total_count = len(curriculum)
    print(f"Merged curriculum total lessons: {total_count}")

    with open(curriculum_json_path, 'w', encoding='utf-8') as f:
        json.dump(curriculum, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated {curriculum_json_path} with {total_count} lessons!")

if __name__ == '__main__':
    main()
