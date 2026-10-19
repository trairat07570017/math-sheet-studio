import json
import re

with open("curriculum_24_lessons.json", "r", encoding="utf-8") as f:
    curriculum_json_str = f.read()

with open("Index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update CURRICULUM_DATABASE
db_start_tag = 'const CURRICULUM_DATABASE = {'
db_end_tag = 'const ORIGINAL_CURRICULUM_DATA = JSON.parse(JSON.stringify(CURRICULUM_DATABASE));'

idx_start = html.find(db_start_tag)
idx_end = html.find(db_end_tag)

if idx_start == -1 or idx_end == -1:
    raise ValueError(f"Could not find CURRICULUM_DATABASE boundaries: idx_start={idx_start}, idx_end={idx_end}")

new_db_chunk = f"const CURRICULUM_DATABASE = {curriculum_json_str};\n\n    "
html = html[:idx_start] + new_db_chunk + html[idx_end:]
print("Updated CURRICULUM_DATABASE successfully!")

# 2. Update print CSS & layout styles
old_page_and_print_start = """    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }

    @media print {"""

new_page_and_print_start = """    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }

    /* Equation & Box Overflow Containment */
    .sheet-block,
    .sheet-formula-box,
    .sheet-solution-box,
    .sheet-exercise,
    .equation-stage {
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow-wrap: break-word !important;
      word-break: break-word !important;
    }

    .equation-stage {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      padding: 2px 0;
    }

    .katex-display {
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      margin: 0.35rem 0 !important;
    }

    .katex {
      font-size: 0.95em;
    }

    @media print {"""

if old_page_and_print_start in html:
    html = html.replace(old_page_and_print_start, new_page_and_print_start)
    print("Updated @page and equation overflow CSS")
else:
    print("WARNING: old_page_and_print_start not found directly, checking variations...")

# Replace print rules inside @media print
old_print_block_css = """      /* 6. Pure A4 Paper Sheet Styling */
      #a4Paper {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transform: none !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 1.2rem !important;
      }

      /* 7. Sheet Blocks (Concepts & Exercises) */
      .sheet-block {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 0.85rem 1.1rem !important;
        background: #ffffff !important;
      }

      .sheet-block-badge {
        color: #1e3a8a !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        margin-bottom: 0.4rem !important;
      }

      .sheet-formula-box {
        background: #f8fafc !important;
        border-left: 3.5px solid #2563eb !important;
        padding: 0.75rem 0.95rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .sheet-solution-box {
        background: #f8fafc !important;
        border-left: 3.5px solid #2563eb !important;
        padding: 0.6rem 0.85rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* 8. Interactive Block and Hover Resets */
      .interactive-block {
        outline: none !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0.55rem 0 !important;
        border: none !important;
      }
      .interactive-block:hover {
        outline: none !important;
        background: transparent !important;
      }

      .sheet-exercise {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-top: 0.75rem !important;
        padding: 0 !important;
        border: none !important;
      }

      /* 9. Handwriting Response Grids */
      .handwriting-grid {
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 23px,
          #e2e8f0 24px
        ) !important;
        border: 1px dashed #94a3b8 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* 10. Header and Footer */
      .sheet-main-header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border-bottom: 2px solid #0f172a !important;
        padding-bottom: 0.65rem !important;
        margin-bottom: 0.65rem !important;
      }

      .sheet-school-name {
        color: #0f172a !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
      }

      .sheet-subject-title {
        color: #1e293b !important;
        font-size: 0.95rem !important;
        font-weight: 600 !important;
      }

      .sheet-curriculum-standard {
        color: #64748b !important;
        font-size: 0.8rem !important;
      }

      .sheet-student-meta {
        border-top: 1px dashed #cbd5e1 !important;
        padding-top: 0.45rem !important;
        margin-top: 0.55rem !important;
        font-size: 0.85rem !important;
        color: #334155 !important;
      }

      .sheet-footer-line {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border-top: 1px solid #cbd5e1 !important;
        color: #64748b !important;
        font-size: 8pt !important;
        margin-top: 1.25rem !important;
        padding-top: 0.45rem !important;
      }"""

new_print_block_css = """      /* 6. Pure A4 Paper Sheet Styling (Ultra-Compact Continuous Spacing) */
      #a4Paper {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transform: none !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 0.35rem !important;
      }

      /* 7. Sheet Blocks (Concepts & Exercises) */
      .sheet-block {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 0.45rem 0.75rem !important;
        margin-bottom: 0.25rem !important;
        background: #ffffff !important;
      }

      .sheet-block-badge {
        color: #1e3a8a !important;
        font-weight: 700 !important;
        font-size: 0.9rem !important;
        margin-bottom: 0.25rem !important;
      }

      .sheet-formula-box {
        background: #f8fafc !important;
        border-left: 3px solid #2563eb !important;
        padding: 0.35rem 0.65rem !important;
        margin-bottom: 0.2rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .sheet-solution-box {
        background: #f8fafc !important;
        border-left: 3px solid #2563eb !important;
        padding: 0.35rem 0.65rem !important;
        margin: 0.2rem 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* 8. Interactive Block and Hover Resets */
      .interactive-block {
        outline: none !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0.25rem 0 !important;
        border: none !important;
      }
      .interactive-block:hover {
        outline: none !important;
        background: transparent !important;
      }

      .sheet-exercise {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-top: 0.3rem !important;
        padding: 0 !important;
        border: none !important;
      }

      /* 9. Handwriting Response Grids (Compact for More Problems) */
      .handwriting-grid {
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 20px,
          #e2e8f0 21px
        ) !important;
        border: 1px dashed #94a3b8 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        min-height: 48px !important;
        max-height: 75px !important;
      }

      /* 10. Header and Footer (Compact) */
      .sheet-main-header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border-bottom: 1.5px solid #0f172a !important;
        padding-bottom: 0.35rem !important;
        margin-bottom: 0.35rem !important;
      }

      .sheet-school-name {
        color: #0f172a !important;
        font-size: 1.15rem !important;
        font-weight: 700 !important;
      }

      .sheet-subject-title {
        color: #1e293b !important;
        font-size: 0.88rem !important;
        font-weight: 600 !important;
      }

      .sheet-curriculum-standard {
        color: #64748b !important;
        font-size: 0.75rem !important;
      }

      .sheet-student-meta {
        border-top: 1px dashed #cbd5e1 !important;
        padding-top: 0.25rem !important;
        margin-top: 0.25rem !important;
        font-size: 0.8rem !important;
        color: #334155 !important;
      }

      .sheet-footer-line {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border-top: 1px solid #cbd5e1 !important;
        color: #64748b !important;
        font-size: 7.5pt !important;
        margin-top: 0.35rem !important;
        padding-top: 0.25rem !important;
      }

      /* 11. KaTeX Print Scaling & Overflow Avoidance */
      .equation-stage {
        overflow: visible !important;
        max-width: 100% !important;
      }
      .katex-display {
        overflow: visible !important;
        max-width: 100% !important;
        margin: 0.15rem 0 !important;
        font-size: 0.88em !important;
      }
      .katex {
        font-size: 0.9em !important;
      }"""

if old_print_block_css in html:
    html = html.replace(old_print_block_css, new_print_block_css)
    print("Updated print styling for compact spacing successfully!")
else:
    print("WARNING: old_print_block_css not found!")

# 3. Update screen paper styling for compact aesthetic
old_screen_paper = """    .a4-paper-sheet {
      width: 100%;
      max-width: 820px;
      min-height: 1100px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 4px;
      padding: 3rem 2.75rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1.4rem;
      transform-origin: top center;
      transition: transform 0.2s ease;
    }"""

new_screen_paper = """    .a4-paper-sheet {
      width: 100%;
      max-width: 820px;
      min-height: 1100px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 4px;
      padding: 1.85rem 2.15rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15);
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transform-origin: top center;
      transition: transform 0.2s ease;
    }"""

if old_screen_paper in html:
    html = html.replace(old_screen_paper, new_screen_paper)
    print("Updated screen paper styling successfully!")
else:
    print("WARNING: old_screen_paper not found!")

# 4. Update handwriting grid height in JS
old_min_h = "const minH = ex.answerType === 'handwriting-large' ? '135px' : '85px';"
new_min_h = "const minH = ex.answerType === 'handwriting-large' ? '85px' : '55px';"

if old_min_h in html:
    html = html.replace(old_min_h, new_min_h)
    print("Updated handwriting grid height successfully!")
else:
    print("WARNING: old_min_h not found!")

with open("Index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Saved updated Index.html successfully!")
