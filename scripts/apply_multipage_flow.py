import re

with open("Index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update @page margin
old_page = """    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }"""

new_page = """    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }"""

if old_page in html:
    html = html.replace(old_page, new_page)
    print("Updated @page margin to 12mm 14mm")
else:
    print("WARNING: old_page not found directly")

# 2. Update screen .handwriting-grid style
old_screen_grid = """.handwriting-grid {
      min-height: 85px;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      margin-top: 0.5rem;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 23px,
        #f1f5f9 24px
      );
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }"""

new_screen_grid = """.handwriting-grid {
      min-height: 145px;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      margin-top: 0.5rem;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 25px,
        #f1f5f9 26px
      );
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .handwriting-grid.grid-large {
      min-height: 195px;
    }"""

if old_screen_grid in html:
    html = html.replace(old_screen_grid, new_screen_grid)
    print("Updated screen .handwriting-grid to 145px/195px (5+ lines)")
else:
    print("WARNING: old_screen_grid not found")

# 3. Update @media print styling for natural multi-page flow
old_print_section = """      /* 6. Pure A4 Paper Sheet Styling (Ultra-Compact Continuous Spacing) */
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

new_print_section = """      /* 6. Pure A4 Paper Sheet Styling (Natural Multi-Page Flow) */
      #a4Paper {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        transform: none !important;
        overflow: visible !important;
      }

      /* 7. Sheet Blocks (Allows Clean Page Breaks Between Exercises) */
      .sheet-block {
        display: block !important;
        break-inside: auto !important;
        page-break-inside: auto !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 0.75rem 1rem !important;
        margin-bottom: 0.85rem !important;
        background: #ffffff !important;
      }

      .sheet-block-badge {
        color: #1e3a8a !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        margin-bottom: 0.4rem !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }

      .sheet-formula-box {
        background: #f8fafc !important;
        border-left: 3.5px solid #2563eb !important;
        padding: 0.55rem 0.85rem !important;
        margin-bottom: 0.45rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .sheet-solution-box {
        background: #f8fafc !important;
        border-left: 3.5px solid #2563eb !important;
        padding: 0.55rem 0.85rem !important;
        margin: 0.45rem 0 !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* 8. Interactive Block and Hover Resets */
      .interactive-block {
        outline: none !important;
        background: transparent !important;
        padding: 0 !important;
        margin: 0.65rem 0 !important;
        border: none !important;
      }
      .interactive-block:hover {
        outline: none !important;
        background: transparent !important;
      }

      /* 9. Individual Exercise Page Break Management:
         Keep question title and student handwriting grid together on same page */
      .sheet-exercise {
        display: block !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-top: 0.85rem !important;
        padding-top: 0.65rem !important;
        border-top: 1px dotted #cbd5e1 !important;
      }

      .exercise-header {
        break-after: avoid !important;
        page-break-after: avoid !important;
        font-weight: 600 !important;
        margin-bottom: 0.35rem !important;
      }

      /* 10. Student Handwriting Response Grids (5+ Lines of Ruled Workspace) */
      .handwriting-grid {
        display: block !important;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 25px,
          #e2e8f0 26px
        ) !important;
        border: 1px dashed #94a3b8 !important;
        border-radius: 4px !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        min-height: 145px !important; /* 5+ full lines of student writing space */
        margin-top: 0.45rem !important;
      }

      .handwriting-grid.grid-large {
        min-height: 195px !important; /* 7+ lines for large problems */
      }

      /* 11. Header and Footer (Clean Pagination) */
      .sheet-main-header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
        border-bottom: 2px solid #0f172a !important;
        padding-bottom: 0.5rem !important;
        margin-bottom: 0.65rem !important;
        text-align: center !important;
      }

      .sheet-school-name {
        color: #0f172a !important;
        font-size: 1.25rem !important;
        font-weight: 700 !important;
      }

      .sheet-subject-title {
        color: #1e293b !important;
        font-size: 0.92rem !important;
        font-weight: 600 !important;
      }

      .sheet-curriculum-standard {
        color: #64748b !important;
        font-size: 0.8rem !important;
      }

      .sheet-student-meta {
        border-top: 1px dashed #cbd5e1 !important;
        padding-top: 0.4rem !important;
        margin-top: 0.45rem !important;
        font-size: 0.85rem !important;
        color: #334155 !important;
      }

      .sheet-footer-line {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        border-top: 1px solid #cbd5e1 !important;
        color: #64748b !important;
        font-size: 8pt !important;
        margin-top: 0.85rem !important;
        padding-top: 0.4rem !important;
      }

      /* 12. KaTeX Print Scaling & Overflow Avoidance */
      .equation-stage {
        overflow: visible !important;
        max-width: 100% !important;
      }
      .katex-display {
        overflow: visible !important;
        max-width: 100% !important;
        margin: 0.25rem 0 !important;
        font-size: 0.95em !important;
      }
      .katex {
        font-size: 0.95em !important;
      }"""

if old_print_section in html:
    html = html.replace(old_print_section, new_print_section)
    print("Updated @media print section to multi-page flow and 145px handwriting grid")
else:
    print("WARNING: old_print_section not found")

# 4. Update JS renderCurriculum answerAreaHtml
old_js_grid = """        } else if (ex.answerType === 'blank') {
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: 100px; background: transparent; border: 1px dashed #cbd5e1;"></div>
          `;
        } else {
          const minH = ex.answerType === 'handwriting-large' ? '85px' : '55px';
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: ${minH};"></div>
          `;
        }"""

new_js_grid = """        } else if (ex.answerType === 'blank') {
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: 145px; background: transparent; border: 1px dashed #cbd5e1;"></div>
          `;
        } else {
          const minH = ex.answerType === 'handwriting-large' ? '195px' : '145px';
          const isLarge = ex.answerType === 'handwriting-large' ? 'grid-large' : '';
          answerAreaHtml = `
            <div class="handwriting-grid ${isLarge}" style="min-height: ${minH};"></div>
          `;
        }"""

if old_js_grid in html:
    html = html.replace(old_js_grid, new_js_grid)
    print("Updated JS renderCurriculum answerAreaHtml to 145px/195px")
else:
    print("WARNING: old_js_grid not found")

with open("Index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Saved Index.html")

# 5. Update Code.gs table height for Google Docs export
with open("Code.gs", "r", encoding="utf-8") as f:
    code_gs = f.read()

old_gs_height = "var height = (ex.answerType === 'handwriting-large') ? 110 : 70;"
new_gs_height = "var height = (ex.answerType === 'handwriting-large') ? 170 : 130;"

if old_gs_height in code_gs:
    code_gs = code_gs.replace(old_gs_height, new_gs_height)
    with open("Code.gs", "w", encoding="utf-8") as f:
        f.write(code_gs)
    print("Updated Code.gs handwriting table height to 130pt/170pt (~5-7 lines)")
else:
    print("WARNING: old_gs_height not found in Code.gs")
