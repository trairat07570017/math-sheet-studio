import re

def apply_typography_balance():
    with open("Index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update .exercise-header in base CSS
    old_exercise_header = """    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.35rem;
    }"""

    new_exercise_header = """    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 1.05rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.45rem;
      line-height: 1.6;
    }

    .exercise-header span {
      flex: 1;
      text-wrap: pretty;
    }

    /* Equations inside questions: prominent, clear & balanced with Thai text */
    .exercise-header .katex {
      font-size: 1.22em;
      padding: 0 2px;
      vertical-align: -0.08em;
    }

    .sheet-exercise .katex {
      font-size: 1.16em;
    }"""

    assert old_exercise_header in html, "old_exercise_header not found"
    html = html.replace(old_exercise_header, new_exercise_header, 1)
    print("Updated base .exercise-header and question equation scaling.")

    # 2. Update .equation-stage, .katex-display, and .sheet-solution-box in base CSS
    old_stage_block = """    .equation-stage {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      padding: 6px 10px !important;
      font-size: calc(1.18rem * var(--math-scale, 1.15)) !important;
      line-height: 1.65 !important;
      border-radius: 6px !important;
    }

    .katex-display {
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      margin: 0.45rem 0 !important;
      font-size: calc(1.18em * var(--math-scale, 1.15)) !important;
      line-height: 1.65 !important;
    }

    .katex {
      font-size: calc(1.08em * (var(--math-scale, 1.15) / 1.1));
      text-rendering: geometricPrecision;
    }

    .sheet-solution-box .equation-stage {
      font-size: calc(1.12rem * var(--math-scale, 1.15)) !important;
      line-height: 1.6 !important;
      padding: 0.5rem 0.75rem !important;
      margin: 0.35rem 0 !important;
      background: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
    }"""

    new_stage_block = """    .equation-stage {
      overflow-x: auto !important;
      overflow-y: hidden !important;
      padding: 5px 8px !important;
      font-size: calc(1.06rem * var(--math-scale, 1.15)) !important;
      line-height: 1.55 !important;
      border-radius: 6px !important;
    }

    .katex-display {
      max-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: hidden !important;
      margin: 0.35rem 0 !important;
      font-size: calc(1.08em * var(--math-scale, 1.15)) !important;
      line-height: 1.55 !important;
    }

    .katex {
      font-size: 1.06em;
      text-rendering: geometricPrecision;
    }

    /* Worked example solution box: compact, neat and not oversized */
    .sheet-solution-box {
      margin: 0.3rem 0 0.2rem 0;
      padding: 0.4rem 0.75rem;
      background: #f8fafc;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
    }

    .sheet-solution-box .equation-stage {
      font-size: 0.94rem !important;
      line-height: 1.4 !important;
      padding: 0.35rem 0.6rem !important;
      margin: 0.2rem 0 !important;
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 4px !important;
    }

    .sheet-solution-box .katex-display {
      font-size: 0.95em !important;
      line-height: 1.4 !important;
      margin: 0.15rem 0 !important;
    }

    .sheet-solution-box .katex {
      font-size: 0.95em !important;
    }"""

    assert old_stage_block in html, "old_stage_block not found"
    html = html.replace(old_stage_block, new_stage_block, 1)
    print("Updated base .equation-stage and compact .sheet-solution-box.")

    # 3. Update print CSS for .sheet-solution-box
    old_print_sol_box = """      .sheet-solution-box {
        background: #f8fafc !important;
        border-left: 3.5px solid #2563eb !important;
        padding: 0.55rem 0.85rem !important;
        margin: 0.45rem 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }"""

    new_print_sol_box = """      .sheet-solution-box {
        background: #f8fafc !important;
        border-left: 3px solid #2563eb !important;
        padding: 0.35rem 0.65rem !important;
        margin: 0.25rem 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .sheet-solution-box .equation-stage {
        overflow: visible !important;
        max-width: 100% !important;
        font-size: 9.5pt !important;
        line-height: 1.35 !important;
        padding: 0.25rem 0.45rem !important;
        margin: 0.15rem 0 !important;
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }

      .sheet-solution-box .katex-display {
        overflow: visible !important;
        max-width: 100% !important;
        margin: 0.1rem 0 !important;
        font-size: 0.94em !important;
        line-height: 1.35 !important;
      }

      .sheet-solution-box .katex {
        font-size: 0.94em !important;
      }"""

    assert old_print_sol_box in html, "old_print_sol_box not found"
    html = html.replace(old_print_sol_box, new_print_sol_box, 1)
    print("Updated print .sheet-solution-box CSS.")

    # 4. Update print CSS for .exercise-header
    old_print_ex_header = """      .exercise-header {
        break-after: avoid !important;
        page-break-after: avoid !important;
        font-weight: 600 !important;
        margin-bottom: 0.35rem !important;
      }"""

    new_print_ex_header = """      .exercise-header {
        break-after: avoid !important;
        page-break-after: avoid !important;
        font-size: 10.5pt !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        line-height: 1.55 !important;
        margin-bottom: 0.35rem !important;
      }

      .exercise-header span {
        text-wrap: pretty;
      }

      /* Prominent math equations in question statement during print */
      .exercise-header .katex {
        font-size: 1.20em !important;
        padding: 0 2px !important;
      }

      .sheet-exercise .katex {
        font-size: 1.15em !important;
      }"""

    assert old_print_ex_header in html, "old_print_ex_header not found"
    html = html.replace(old_print_ex_header, new_print_ex_header, 1)
    print("Updated print .exercise-header CSS.")

    # 5. Update print KaTeX scaling block (Section 12)
    old_print_katex = """      /* 12. KaTeX Print Scaling & Overflow Avoidance */
      .equation-stage {
        overflow: visible !important;
        max-width: 100% !important;
        font-size: 1.14rem !important;
        line-height: 1.6 !important;
      }
      .katex-display {
        overflow: visible !important;
        max-width: 100% !important;
        margin: 0.3rem 0 !important;
        font-size: 1.14em !important;
        line-height: 1.6 !important;
      }
      .katex {
        font-size: 1.06em !important;
      }"""

    new_print_katex = """      /* 12. KaTeX Print Scaling & Overflow Avoidance */
      .equation-stage {
        overflow: visible !important;
        max-width: 100% !important;
        font-size: 10.2pt !important;
        line-height: 1.45 !important;
      }
      .katex-display {
        overflow: visible !important;
        max-width: 100% !important;
        margin: 0.2rem 0 !important;
        font-size: 1.04em !important;
        line-height: 1.45 !important;
      }
      .katex {
        font-size: 1.04em !important;
      }"""

    assert old_print_katex in html, "old_print_katex not found"
    html = html.replace(old_print_katex, new_print_katex, 1)
    print("Updated print Section 12 KaTeX scaling.")

    with open("Index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Index.html successfully updated with balanced typography!")

if __name__ == "__main__":
    apply_typography_balance()
