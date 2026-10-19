import re
import json

# 1. Update build_24_lessons.py
with open("build_24_lessons.py", "r", encoding="utf-8") as f:
    code = f.read()

# Patterns to strip
patterns = [
    r"\(ข้อสอบเข้ามหาวิทยาลัย\)\s*",
    r"\(ข้อสอบแข่งขัน สมาคมคณิตฯ\)\s*",
    r"\(ข้อสอบทุน/สมาคมคณิตฯ\)\s*",
    r"\(ข้อสอบโอลิมปิกวิชาการ\)\s*",
    r"\(ข้อสอบแข่งขัน\)\s*",
    r"\(ข้อสอบ สสวท\.\)\s*",
    r"\(ข้อสอบ A-Level\)\s*",
    r"\(แนว A-Level\)\s*",
    r"\(ข้อสอบระดับแข่งขัน\)\s*",
    r"\(ข้อสอบคัดเลือกเข้ามหาวิทยาลัย\)\s*"
]

for pat in patterns:
    code = re.sub(pat, "", code)

# Update summary title in make_lesson
code = code.replace(
    '"title": f"โจทย์ประยุกต์เข้มข้น: {exercises[-1][0]}",',
    '"title": f"โจทย์ฝึกฝนเพิ่มเติม: {exercises[-1][0]}",'
)

with open("build_24_lessons.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated build_24_lessons.py: all exam prefixes removed!")

# 2. Re-run build_24_lessons.py to produce curriculum_24_lessons.json
import subprocess
result = subprocess.run(["python3", "build_24_lessons.py"], capture_output=True, text=True)
print("build_24_lessons.py output:", result.stdout.strip())
if result.returncode != 0:
    print("Error:", result.stderr)
    exit(1)

# 3. Read regenerated curriculum_24_lessons.json
with open("curriculum_24_lessons.json", "r", encoding="utf-8") as f:
    curriculum_json_str = f.read()

# 4. Sync into Index.html
with open("Index.html", "r", encoding="utf-8") as f:
    html = f.read()

db_start_tag = 'const CURRICULUM_DATABASE = {'
db_end_tag = 'const ORIGINAL_CURRICULUM_DATA = JSON.parse(JSON.stringify(CURRICULUM_DATABASE));'

idx_start = html.find(db_start_tag)
idx_end = html.find(db_end_tag)

if idx_start == -1 or idx_end == -1:
    raise ValueError(f"Could not find CURRICULUM_DATABASE in Index.html: {idx_start}, {idx_end}")

new_db_chunk = f"const CURRICULUM_DATABASE = {curriculum_json_str};\n\n    "
html = html[:idx_start] + new_db_chunk + html[idx_end:]

# Update labelPart2 for summary mode
html = html.replace(
    "document.getElementById('labelPart2').textContent = '🎯 ตอนที่ 2: ตัวอย่างข้อสอบคัดเลือก (A-Level / TPAT)';",
    "document.getElementById('labelPart2').textContent = '🎯 ตอนที่ 2: โจทย์ตัวอย่างและแบบฝึกหัดทบทวน';"
)

with open("Index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved updated Index.html successfully!")
