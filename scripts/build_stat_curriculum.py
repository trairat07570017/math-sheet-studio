#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Integrator Script: Merges the 50-lesson Random Variables & Probability Distributions Curriculum (IPST M.6)
into src/data/curriculum.json alongside Expo-Log (24) and Complex Numbers (24).
Total lessons after merge: 98 lessons.
"""

import os
import sys
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

from stat_data_part1 import register_stat_part1
from stat_data_part2 import register_stat_part2
from stat_data_part3 import register_stat_part3
from stat_data_part4 import register_stat_part4
from stat_data_part5 import register_stat_part5

def main():
    root_dir = os.path.dirname(SCRIPT_DIR)
    curriculum_json_path = os.path.join(root_dir, 'src', 'data', 'curriculum.json')

    print(f"Reading existing curriculum from: {curriculum_json_path}")
    with open(curriculum_json_path, 'r', encoding='utf-8') as f:
        curriculum = json.load(f)

    existing_count = len(curriculum)
    print(f"Existing lessons count: {existing_count}")

    # Register M.6 Statistics lessons
    stat_lessons = {}
    register_stat_part1(stat_lessons)
    register_stat_part2(stat_lessons)
    register_stat_part3(stat_lessons)
    register_stat_part4(stat_lessons)
    register_stat_part5(stat_lessons)

    print(f"Loaded {len(stat_lessons)} statistics lessons.")

    # Validation
    for i in range(1, 51):
        lid = f"stat-l{i:02d}"
        if lid not in stat_lessons:
            raise ValueError(f"Missing lesson {lid}")
        lesson = stat_lessons[lid]
        assert "id" in lesson and lesson["id"] == lid, f"Invalid ID in {lid}"
        assert "worksheet" in lesson and len(lesson["worksheet"]["exercises"]) == 9, f"Worksheet exercises count != 9 in {lid}"
        assert "summary" in lesson and len(lesson["summary"]["exercises"]) == 3, f"Summary exercises count != 3 in {lid}"
        assert "quiz" in lesson and len(lesson["quiz"]["exercises"]) == 6, f"Quiz exercises count != 6 in {lid}"

    # Merge into curriculum
    for lid, ldata in stat_lessons.items():
        curriculum[lid] = ldata

    total_count = len(curriculum)
    print(f"Merged curriculum total lessons: {total_count}")

    with open(curriculum_json_path, 'w', encoding='utf-8') as f:
        json.dump(curriculum, f, ensure_ascii=False, indent=2)

    print(f"Successfully updated {curriculum_json_path} with {total_count} lessons!")

if __name__ == '__main__':
    main()
