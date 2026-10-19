import re

def fix_print():
    with open("Index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Base CSS for .exercise-header
    old_base_header = """    .exercise-header {
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
    }"""

    new_base_header = """    .exercise-header {
      display: block !important;
      font-size: 1.02rem;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.4rem;
      line-height: 1.6;
      word-break: break-word;
    }

    .exercise-header .katex {
      font-size: 1.14em;
      padding: 0 2px;
      line-height: normal;
    }"""

    assert old_base_header in html, "old_base_header not found"
    html = html.replace(old_base_header, new_base_header, 1)

    # 2. Print CSS for .exercise-header
    old_print_header = """      .exercise-header {
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
      }"""

    new_print_header = """      .exercise-header {
        display: block !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
        font-size: 10.5pt !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        line-height: 1.55 !important;
        margin-bottom: 0.35rem !important;
        word-break: break-word !important;
      }

      .exercise-header .katex {
        font-size: 1.14em !important;
        padding: 0 2px !important;
        line-height: normal !important;
      }"""

    assert old_print_header in html, "old_print_header not found"
    html = html.replace(old_print_header, new_print_header, 1)

    with open("Index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Fixed .exercise-header display: block and removed loose span rules.")

if __name__ == "__main__":
    fix_print()
