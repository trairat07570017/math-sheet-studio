import re
import sys

def update_index_html():
    print("Reading Index.html...")
    with open("Index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Update CSS: Add System settings button styles, chapter tree actions, and enhanced KaTeX scaling
    css_target = """.btn-save-glow:hover {
      box-shadow: 0 0 24px rgba(0, 245, 212, 0.6);
      transform: translateY(-1px);
    }"""
    
    css_addition = """.btn-save-glow:hover {
      box-shadow: 0 0 24px rgba(0, 245, 212, 0.6);
      transform: translateY(-1px);
    }

    .btn-system-settings {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.4);
      color: #f3e8ff;
      font-weight: 600;
      box-shadow: 0 0 12px rgba(168, 85, 247, 0.2);
    }
    .btn-system-settings:hover {
      background: rgba(168, 85, 247, 0.28);
      border-color: rgba(168, 85, 247, 0.7);
      color: #ffffff;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.45);
      transform: translateY(-1px);
    }

    .btn-system-settings-icon {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }
    .btn-system-settings-icon:hover {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.5);
      color: #ffffff;
      transform: rotate(30deg);
    }

    .chapter-quick-action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.35rem 0.55rem;
      margin: 0.25rem 0.4rem 0.45rem 0.4rem;
      background: rgba(0, 0, 0, 0.28);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
    }

    .chapter-code-pill {
      font-size: 0.75rem;
      color: var(--neon-cyan);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 175px;
    }

    .btn-chapter-settings-chip {
      background: rgba(0, 245, 212, 0.12);
      border: 1px solid rgba(0, 245, 212, 0.3);
      color: #a7f3d0;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-chapter-settings-chip:hover {
      background: rgba(0, 245, 212, 0.25);
      border-color: rgba(0, 245, 212, 0.6);
      color: #ffffff;
      box-shadow: 0 0 10px rgba(0, 245, 212, 0.3);
    }

    .btn-chapter-tree-gear {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-left: auto;
      margin-right: 4px;
    }
    .btn-chapter-tree-gear:hover {
      color: var(--neon-cyan);
      background: rgba(0, 245, 212, 0.15);
      transform: rotate(45deg);
    }"""
    
    assert css_target in html, "CSS target not found"
    html = html.replace(css_target, css_addition, 1)
    print("Added UI buttons CSS.")

    # 2. KaTeX scaling CSS
    katex_css_target = """    .equation-stage {
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
    }"""

    katex_css_replacement = """    :root {
      --math-scale: 1.15;
    }

    .equation-stage {
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

    assert katex_css_target in html, "KaTeX CSS target not found"
    html = html.replace(katex_css_target, katex_css_replacement, 1)
    print("Replaced KaTeX base scaling CSS.")

    # 3. Print KaTeX scaling CSS
    print_katex_target = """      /* 12. KaTeX Print Scaling & Overflow Avoidance */
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

    print_katex_replacement = """      /* 12. KaTeX Print Scaling & Overflow Avoidance */
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

    assert print_katex_target in html, "Print KaTeX target not found"
    html = html.replace(print_katex_target, print_katex_replacement, 1)
    print("Replaced print KaTeX scaling CSS.")

    # 4. Sidebar Drawer Header: add gear icon
    sidebar_header_target = """        <button class="btn-close-drawer" onclick="toggleSidebarDrawer(false)" aria-label="ปิดเมนู">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>"""

    sidebar_header_replacement = """        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <button type="button" class="btn-system-settings-icon" onclick="openSystemSettingsModal()" title="ตั้งค่าระบบส่วนกลาง (ชื่อโรงเรียน, ครูผู้สอน, ขนาดสมการ)">
            ⚙️
          </button>
          <button class="btn-close-drawer" onclick="toggleSidebarDrawer(false)" aria-label="ปิดเมนู">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>"""

    assert sidebar_header_target in html, "Sidebar header target not found"
    html = html.replace(sidebar_header_target, sidebar_header_replacement, 1)
    print("Added gear button to sidebar header.")

    # 5. Topbar Right: add btn-system-settings
    topbar_target = """          <button class="btn-action btn-print" onclick="prepareAndPrint()">
            <span>🖨️</span>
            <span>พิมพ์ / PDF</span>
          </button>"""

    topbar_replacement = """          <button type="button" class="btn-action btn-system-settings" id="btnOpenSystemSettings" onclick="openSystemSettingsModal()" title="ตั้งค่าระบบส่วนกลาง (ชื่อโรงเรียน, ครูผู้สอน, ขนาดสมการ)">
            <span>⚙️</span>
            <span>ตั้งค่าระบบ</span>
          </button>

          <button class="btn-action btn-print" onclick="prepareAndPrint()">
            <span>🖨️</span>
            <span>พิมพ์ / PDF</span>
          </button>"""

    assert topbar_target in html, "Topbar target not found"
    html = html.replace(topbar_target, topbar_replacement, 1)
    print("Added system settings button to topbar.")

    # 6. A4 Paper Header: add teacher meta element
    paper_header_target = """            <!-- HEADER -->
            <header class="sheet-main-header">
              <h2 class="sheet-school-name" id="paperSchoolName">โรงเรียนมัธยมวิทยาคม (สสวท.)</h2>
              <p class="sheet-subject-title" id="paperSubjectMeta">คณิตศาสตร์เพิ่มเติม 1 • ใบงานการเรียนรู้</p>
              <p class="sheet-curriculum-standard" id="paperStandardMeta">สาระการเรียนรู้คณิตศาสตร์ มาตรฐาน สสวท.</p>"""

    paper_header_replacement = """            <!-- HEADER -->
            <header class="sheet-main-header">
              <h2 class="sheet-school-name" id="paperSchoolName">โรงเรียนมัธยมวิทยาคม (สสวท.)</h2>
              <p class="sheet-subject-title" id="paperSubjectMeta">คณิตศาสตร์เพิ่มเติม 1 • ใบงานการเรียนรู้</p>
              <p class="sheet-teacher-meta" id="paperTeacherMeta" style="font-size: 0.85rem; color: #475569; margin: 0.15rem 0 0.25rem 0; font-weight: 500;">ครูผู้สอน: กลุ่มสาระการเรียนรู้คณิตศาสตร์</p>
              <p class="sheet-curriculum-standard" id="paperStandardMeta">สาระการเรียนรู้คณิตศาสตร์ มาตรฐาน สสวท.</p>"""

    assert paper_header_target in html, "Paper header target not found"
    html = html.replace(paper_header_target, paper_header_replacement, 1)
    print("Added teacher meta element to paper header.")

    # 7. Add Modals HTML: System Settings Modal & Chapter Settings Modal
    modals_target = """  <!-- GOOGLE DRIVE SAVE SUCCESS MODAL -->"""
    
    new_modals_html = """  <!-- GLOBAL SYSTEM SETTINGS MODAL -->
  <div class="modal-backdrop no-print" id="systemSettingsModal" onclick="if(event.target.id==='systemSettingsModal') closeSystemSettingsModal()">
    <div class="modal-window" style="max-width: 580px;">
      <div class="modal-header">
        <div class="modal-title-group">
          <span style="font-size: 1.3rem;">⚙️</span>
          <div>
            <h3 style="color: #ffffff; margin: 0; font-size: 1.1rem;">ตั้งค่าระบบส่วนกลาง (System Settings)</h3>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0 0;">กำหนดชื่อโรงเรียน ครูผู้สอน และขนาดตัวสมการ โดยระบบจะจำค่าไว้ถาวร</p>
          </div>
        </div>
        <button class="modal-close-btn" onclick="closeSystemSettingsModal()">&times;</button>
      </div>

      <div class="modal-body" style="gap: 1.1rem; padding: 1.25rem;">
        <div class="field-wrap">
          <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
            🏫 ชื่อโรงเรียน / สถาบันการศึกษา
          </label>
          <input type="text" class="penpot-input" id="inputSystemSchool" placeholder="เช่น โรงเรียนมัธยมวิทยาคม (สสวท.)">
          <span style="font-size: 0.78rem; color: #64748b;">แสดงผลที่หัวกระดาษ A4 ทุกใบงาน และใช้ในการส่งออก Google Docs</span>
        </div>

        <div class="field-wrap">
          <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
            👨‍🏫 ชื่อครูผู้สอน / กลุ่มสาระการเรียนรู้
          </label>
          <input type="text" class="penpot-input" id="inputSystemTeacher" placeholder="เช่น นายสมเกียรติ ยิ่งเจริญ / กลุ่มสาระการเรียนรู้คณิตศาสตร์">
          <span style="font-size: 0.78rem; color: #64748b;">แสดงในส่วนข้อมูลผู้จัดทำ และบันทึกประวัติชีทการสอน</span>
        </div>

        <div class="field-wrap">
          <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
            📅 ปีการศึกษา / ภาคเรียนเริ่มต้น
          </label>
          <input type="text" class="penpot-input" id="inputSystemAcademicYear" placeholder="เช่น ภาคเรียนที่ 2 ปีการศึกษา 2567">
        </div>

        <div class="field-wrap">
          <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
            📐 ขนาดตัวสมการคณิตศาสตร์ (KaTeX Equation Scale)
          </label>
          <select class="penpot-input" id="selectMathScale" style="cursor: pointer;">
            <option value="1.0">มาตรฐาน (100% - เหมาะกับเอกสารเน้นข้อความ)</option>
            <option value="1.15" selected>ปานกลาง คมชัดสมดุล (115% - ค่าแนะนำ สสวท.)</option>
            <option value="1.25">ขนาดใหญ่พิเศษ (125% - เหมาะกับสูตรซับซ้อน/พิมพ์แจก)</option>
          </select>
          <span style="font-size: 0.78rem; color: #64748b;">ปรับขนาดเศษส่วน $\\frac{a}{b}$, กรณฑ์ $\\sqrt[n]{x}$, และเลขชี้กำลัง $a^x$ ให้อ่านง่าย ชัดเจน</span>
        </div>

        <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px; padding: 0.75rem 0.9rem; font-size: 0.82rem; color: #93c5fd; display: flex; align-items: center; gap: 0.5rem;">
          <span>💡</span>
          <span>ข้อมูลที่บันทึกจะถูกเก็บในเครื่องของท่านอัตโนมัติ (LocalStorage) ไม่ต้องกรอกซ้ำเมื่อเข้าสู่ระบบใหม่</span>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.25rem;">
        <button type="button" class="btn-action" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);" onclick="closeSystemSettingsModal()">
          ยกเลิก
        </button>
        <button type="button" class="btn-action btn-save-glow" onclick="saveSystemSettings()">
          <span>💾 บันทึกการตั้งค่าระบบ</span>
        </button>
      </div>
    </div>
  </div>

  <!-- CHAPTER-LEVEL SETTINGS MODAL (CASCADE TO 4 SUB-WORKSHEETS) -->
  <div class="modal-backdrop no-print" id="chapterSettingsModal" onclick="if(event.target.id==='chapterSettingsModal') closeChapterSettingsModal()">
    <div class="modal-window" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title-group">
          <span style="font-size: 1.3rem;">📚</span>
          <div>
            <h3 style="color: #ffffff; margin: 0; font-size: 1.1rem;" id="chapterModalTitle">ตั้งค่าข้อมูลหลักประจำบทเรียน</h3>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0 0;">กำหนดรหัสวิชาและข้อมูลหลักของบทนี้ ระบบจะส่งต่อ (Cascade) ไปยังทุกคาบย่อยในบททันที</p>
          </div>
        </div>
        <button class="modal-close-btn" onclick="closeChapterSettingsModal()">&times;</button>
      </div>

      <div class="modal-body" style="gap: 1.1rem; padding: 1.25rem;">
        <input type="hidden" id="inputTargetChapterId">

        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.75rem 1rem;">
          <div style="font-size: 0.82rem; color: #94a3b8;">บทเรียนที่กำลังแก้ไข:</div>
          <div id="chapterModalTargetText" style="font-weight: 600; color: var(--neon-cyan); font-size: 1rem; margin-top: 2px;">บทที่ 1: เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="field-wrap">
            <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
              🏷️ รหัสวิชา
            </label>
            <input type="text" class="penpot-input" id="inputChapterCode" placeholder="เช่น ค31202">
          </div>

          <div class="field-wrap">
            <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
              📖 ชื่อวิชา
            </label>
            <input type="text" class="penpot-input" id="inputChapterSubject" placeholder="เช่น คณิตศาสตร์เพิ่มเติม 2">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="field-wrap">
            <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
              🎓 ระดับชั้น
            </label>
            <input type="text" class="penpot-input" id="inputChapterGrade" placeholder="เช่น มัธยมศึกษาปีที่ 4">
          </div>

          <div class="field-wrap">
            <label class="field-label" style="font-size: 0.9rem; color: #e2e8f0; font-weight: 500;">
              🗓️ ภาคเรียน
            </label>
            <input type="text" class="penpot-input" id="inputChapterSemester" placeholder="เช่น ภาคเรียนที่ 2">
          </div>
        </div>

        <!-- CASCADING SUB-WORKSHEETS PREVIEW -->
        <div class="field-wrap">
          <label class="field-label" style="font-size: 0.85rem; color: #94a3b8;">
            📋 ใบงานย่อยที่จะได้รับผลกระทบ (Cascade 4 คาบเรียน):
          </label>
          <div id="chapterModalAffectedTopics" style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 140px; overflow-y: auto; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 0.6rem;">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.25rem;">
        <button type="button" class="btn-action" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15);" onclick="closeChapterSettingsModal()">
          ยกเลิก
        </button>
        <button type="button" class="btn-action btn-save-glow" onclick="saveChapterSettings()">
          <span>🚀 บันทึกและปรับใช้กับทุกคาบในบทนี้</span>
        </button>
      </div>
    </div>
  </div>

  <!-- GOOGLE DRIVE SAVE SUCCESS MODAL -->"""

    assert modals_target in html, "Modals target not found"
    html = html.replace(modals_target, new_modals_html, 1)
    print("Added System Settings and Chapter Settings modals.")

    # 8. Update renderSidebarTree() to include chapter gear and action bar
    render_tree_target = """            const isChapOpen = (expandedChapterId === chap.id);
            html += `
              <div class="chapter-tree-item ${isChapOpen ? 'open' : ''}" id="chapItem-${chap.id}">
                <button type="button" class="chapter-tree-header" onclick="toggleChapterTree('${chap.id}')">
                  <div class="chapter-tree-title-group">
                    <span class="chapter-tree-title">${chap.chapterTitle}</span>
                    <span class="chapter-tree-sub">${chap.periodRange} • ${chap.periodRangeText}</span>
                  </div>
                  <span class="chapter-tree-chevron">▼</span>
                </button>
                <ul class="chapter-lessons-list">
            `;"""

    render_tree_replacement = """            const isChapOpen = (expandedChapterId === chap.id);
            const currentCode = chap.combinedSubjectCode || chap.subjectCode || 'ค31202';
            html += `
              <div class="chapter-tree-item ${isChapOpen ? 'open' : ''}" id="chapItem-${chap.id}">
                <button type="button" class="chapter-tree-header" onclick="toggleChapterTree('${chap.id}')">
                  <div class="chapter-tree-title-group">
                    <span class="chapter-tree-title">${chap.chapterTitle}</span>
                    <span class="chapter-tree-sub">${chap.periodRange} • ${chap.periodRangeText}</span>
                  </div>
                  <button type="button" class="btn-chapter-tree-gear" onclick="event.stopPropagation(); openChapterSettingsModal('${chap.id}')" title="ตั้งค่ารหัสวิชาประจำบท (${chap.chapterTitle})">
                    ⚙️
                  </button>
                  <span class="chapter-tree-chevron">▼</span>
                </button>
                <div class="chapter-quick-action-bar">
                  <span class="chapter-code-pill" title="รหัสวิชาปัจจุบัน: ${currentCode}">🏷️ ${currentCode}</span>
                  <button type="button" class="btn-chapter-settings-chip" onclick="event.stopPropagation(); openChapterSettingsModal('${chap.id}')" title="ตั้งค่ารหัสวิชาและส่งต่อไปยัง 4 คาบย่อย">
                    <span>⚙️ ตั้งค่าบท</span>
                  </button>
                </div>
                <ul class="chapter-lessons-list">
            `;"""

    assert render_tree_target in html, "Render tree target not found"
    html = html.replace(render_tree_target, render_tree_replacement, 1)
    print("Updated renderSidebarTree with chapter gear and quick action bar.")

    # 9. Update renderCurriculum() inline font-size: 0.95rem
    inline_stage_target = """<div class="equation-stage" style="overflow-x: auto; font-size: 0.95rem; color: #0f172a;">$$${ex.latex}$$</div>"""
    inline_stage_replacement = """<div class="equation-stage" style="overflow-x: auto; color: #0f172a;">$$${ex.latex}$$</div>"""

    assert inline_stage_target in html, "Inline stage target not found"
    html = html.replace(inline_stage_target, inline_stage_replacement, 1)
    print("Removed inline font-size: 0.95rem from renderCurriculum.")

    # 10. Update renderPaperSheet() and syncToPaper()
    paper_render_target = """      // Update Header Text
      document.getElementById('paperSchoolName').textContent = school;
      document.getElementById('paperSubjectMeta').textContent = `${subject} • ${sheetName}`;
      document.getElementById('paperStandardMeta').textContent = data.standard;"""

    paper_render_replacement = """      // Update Header Text
      document.getElementById('paperSchoolName').textContent = school;
      document.getElementById('paperSubjectMeta').textContent = `${subject} • ${sheetName}`;
      document.getElementById('paperStandardMeta').textContent = data.standard;
      const teacherMetaEl = document.getElementById('paperTeacherMeta');
      const teacherName = document.getElementById('fieldTeacher').value || currentSystemSettings.teacher || 'กลุ่มสาระการเรียนรู้คณิตศาสตร์';
      if (teacherMetaEl) {
        teacherMetaEl.textContent = `ครูผู้สอน: ${teacherName}`;
      }"""

    assert paper_render_target in html, "Paper render target not found"
    html = html.replace(paper_render_target, paper_render_replacement, 1)
    print("Updated renderPaperSheet to sync teacher meta.")

    # 11. Update syncToPaper()
    sync_paper_target = """    // Sync input fields to paper live
    function syncToPaper() {
      const school = document.getElementById('fieldSchool').value || 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
      const subject = document.getElementById('fieldSubject').value || 'คณิตศาสตร์ ม.ปลาย';
      const sheet = document.getElementById('fieldSheet').value || 'เอกสารการสอน';

      document.getElementById('paperSchoolName').textContent = school;
      document.getElementById('paperSubjectMeta').textContent = `${subject} • ${sheet}`;
    }"""

    sync_paper_replacement = """    // Sync input fields to paper live
    function syncToPaper() {
      const school = document.getElementById('fieldSchool').value || currentSystemSettings.school || 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
      const subject = document.getElementById('fieldSubject').value || 'คณิตศาสตร์ ม.ปลาย';
      const sheet = document.getElementById('fieldSheet').value || 'เอกสารการสอน';
      const teacher = document.getElementById('fieldTeacher').value || currentSystemSettings.teacher || 'กลุ่มสาระการเรียนรู้คณิตศาสตร์';

      document.getElementById('paperSchoolName').textContent = school;
      document.getElementById('paperSubjectMeta').textContent = `${subject} • ${sheet}`;
      const teacherMetaEl = document.getElementById('paperTeacherMeta');
      if (teacherMetaEl) {
        teacherMetaEl.textContent = `ครูผู้สอน: ${teacher}`;
      }
    }"""

    assert sync_paper_target in html, "syncToPaper target not found"
    html = html.replace(sync_paper_target, sync_paper_replacement, 1)
    print("Updated syncToPaper with teacher meta sync.")

    # 12. Add JavaScript logic for System Settings and Chapter Cascade before DOMContentLoaded
    dom_loaded_target = """    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {"""

    js_logic_addition = """    // -------------------------------------------------------------
    // SYSTEM SETTINGS & CHAPTER CASCADE LOGIC
    // -------------------------------------------------------------
    let currentSystemSettings = {
      school: 'โรงเรียนมัธยมวิทยาคม (สสวท.)',
      teacher: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
      academicYear: 'ภาคเรียนที่ 2 ปีการศึกษา 2567',
      mathScale: '1.15'
    };

    function openSystemSettingsModal() {
      document.getElementById('inputSystemSchool').value = currentSystemSettings.school || '';
      document.getElementById('inputSystemTeacher').value = currentSystemSettings.teacher || '';
      document.getElementById('inputSystemAcademicYear').value = currentSystemSettings.academicYear || '';
      document.getElementById('selectMathScale').value = currentSystemSettings.mathScale || '1.15';
      document.getElementById('systemSettingsModal').classList.add('open');
    }

    function closeSystemSettingsModal() {
      document.getElementById('systemSettingsModal').classList.remove('open');
    }

    function saveSystemSettings() {
      const school = document.getElementById('inputSystemSchool').value.trim() || 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
      const teacher = document.getElementById('inputSystemTeacher').value.trim() || 'กลุ่มสาระการเรียนรู้คณิตศาสตร์';
      const academicYear = document.getElementById('inputSystemAcademicYear').value.trim() || 'ภาคเรียนที่ 2 ปีการศึกษา 2567';
      const mathScale = document.getElementById('selectMathScale').value || '1.15';

      currentSystemSettings = { school, teacher, academicYear, mathScale };
      try {
        localStorage.setItem('mathSheet_systemSettings', JSON.stringify(currentSystemSettings));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      // Update Studio inputs
      if (document.getElementById('fieldSchool')) document.getElementById('fieldSchool').value = school;
      if (document.getElementById('fieldTeacher')) document.getElementById('fieldTeacher').value = teacher;

      // Apply math scale CSS variable
      applyMathScale(mathScale);

      // Re-render paper sheet live
      syncToPaper();
      renderPaperSheet();

      closeSystemSettingsModal();
      showSystemToast('✅ บันทึกการตั้งค่าระบบส่วนกลางเรียบร้อยแล้ว');
    }

    function applyMathScale(scale) {
      document.documentElement.style.setProperty('--math-scale', scale);
      const container = document.getElementById('a4Paper');
      if (container && window.renderMathInElement) {
        renderAllMath(container);
      }
    }

    // -------------------------------------------------------------
    // CHAPTER-LEVEL SETTINGS & CASCADE CONTROLLER
    // -------------------------------------------------------------
    let activeEditingChapterId = null;

    function openChapterSettingsModal(chapId) {
      const chap = CHAPTERS_DATA.find(c => c.id === chapId);
      if (!chap) return;
      activeEditingChapterId = chapId;

      document.getElementById('inputTargetChapterId').value = chapId;
      document.getElementById('chapterModalTargetText').textContent = chap.chapterTitle;

      const firstTopicId = chap.topics && chap.topics[0] ? chap.topics[0].id : null;
      const firstTopicData = firstTopicId ? CURRICULUM_DATABASE[firstTopicId] : null;

      let defaultCode = chap.subjectCode || (firstTopicData ? firstTopicData.subjectCode : 'ค31202');
      let defaultSubject = chap.subjectName || 'คณิตศาสตร์เพิ่มเติม 2';
      let defaultGrade = chap.grade || (firstTopicData ? firstTopicData.grade : 'มัธยมศึกษาปีที่ 4');
      let defaultSemester = chap.semester || (firstTopicData ? firstTopicData.semester : 'ภาคเรียนที่ 2');

      if (defaultCode.includes('(') && defaultCode.includes(')')) {
        const parts = defaultCode.split('(');
        defaultSubject = parts[0].trim();
        defaultCode = parts[1].replace(')', '').trim();
      }

      document.getElementById('inputChapterCode').value = defaultCode;
      document.getElementById('inputChapterSubject').value = defaultSubject;
      document.getElementById('inputChapterGrade').value = defaultGrade;
      document.getElementById('inputChapterSemester').value = defaultSemester;

      const affectedContainer = document.getElementById('chapterModalAffectedTopics');
      let affectedHtml = '';
      chap.topics.forEach(t => {
        affectedHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #cbd5e1; padding: 0.25rem 0.35rem; border-bottom: 1px dashed rgba(255,255,255,0.08);">
            <span>📖 ${t.title}</span>
            <span style="color: var(--neon-cyan); font-size: 0.75rem;">คาบย่อยในบทนี้</span>
          </div>
        `;
      });
      affectedContainer.innerHTML = affectedHtml;

      document.getElementById('chapterSettingsModal').classList.add('open');
    }

    function closeChapterSettingsModal() {
      document.getElementById('chapterSettingsModal').classList.remove('open');
      activeEditingChapterId = null;
    }

    function saveChapterSettings() {
      const chapId = document.getElementById('inputTargetChapterId').value || activeEditingChapterId;
      const chap = CHAPTERS_DATA.find(c => c.id === chapId);
      if (!chap) return;

      const code = document.getElementById('inputChapterCode').value.trim() || 'ค31202';
      const subject = document.getElementById('inputChapterSubject').value.trim() || 'คณิตศาสตร์เพิ่มเติม 2';
      const grade = document.getElementById('inputChapterGrade').value.trim() || 'มัธยมศึกษาปีที่ 4';
      const semester = document.getElementById('inputChapterSemester').value.trim() || 'ภาคเรียนที่ 2';
      const combinedSubjectCode = `${subject} (${code})`;

      chap.subjectCode = code;
      chap.subjectName = subject;
      chap.combinedSubjectCode = combinedSubjectCode;
      chap.grade = grade;
      chap.semester = semester;

      // CASCADE to all 4 sub-worksheets in this chapter
      chap.topics.forEach(t => {
        if (CURRICULUM_DATABASE[t.id]) {
          CURRICULUM_DATABASE[t.id].subjectCode = combinedSubjectCode;
          CURRICULUM_DATABASE[t.id].grade = grade;
          CURRICULUM_DATABASE[t.id].semester = semester;
          CURRICULUM_DATABASE[t.id].gradeShort = grade.includes('มัธยมศึกษาปีที่') 
            ? 'ม.' + grade.split('มัธยมศึกษาปีที่')[1].trim() 
            : grade;
        }
      });

      // Persist chapter settings in localStorage
      try {
        localStorage.setItem('mathSheet_chapterSettings_' + chapId, JSON.stringify({
          code, subject, combinedSubjectCode, grade, semester
        }));
      } catch (e) {
        console.warn('LocalStorage chapter save error:', e);
      }

      // Re-render sidebar tree to update code pills
      renderSidebarTree();

      // If active sheet is in this chapter, update live inputs & paper
      const isCurrentTopicInChap = chap.topics.some(t => t.id === currentTopicId);
      if (isCurrentTopicInChap) {
        const activeData = CURRICULUM_DATABASE[currentTopicId];
        document.getElementById('fieldSubject').value = combinedSubjectCode;
        document.getElementById('flowGradeSub').innerHTML = `
          <span>${activeData.grade} (${activeData.semester})</span>
          <span>•</span>
          <span style="color: var(--neon-cyan);">${activeData.subjectCode}</span>
        `;
        document.getElementById('heroBadgeTopic').textContent = `${activeData.gradeShort} • ${activeData.subjectCode}`;
        syncToPaper();
        renderPaperSheet();
      }

      closeChapterSettingsModal();
      showSystemToast(`🚀 ปรับใช้รหัสวิชา ${code} สู่ 4 คาบใน${chap.chapterTitle.split(':')[0]} เรียบร้อยแล้ว`);
    }

    // Load all saved settings from localStorage
    function loadAllSavedSettings() {
      try {
        // 1. System Settings
        const savedSys = localStorage.getItem('mathSheet_systemSettings');
        if (savedSys) {
          const parsed = JSON.parse(savedSys);
          currentSystemSettings = Object.assign(currentSystemSettings, parsed);
          if (document.getElementById('fieldSchool') && currentSystemSettings.school) {
            document.getElementById('fieldSchool').value = currentSystemSettings.school;
          }
          if (document.getElementById('fieldTeacher') && currentSystemSettings.teacher) {
            document.getElementById('fieldTeacher').value = currentSystemSettings.teacher;
          }
          if (currentSystemSettings.mathScale) {
            applyMathScale(currentSystemSettings.mathScale);
          }
        } else {
          applyMathScale('1.15');
        }

        // 2. Chapter Settings Cascade Overrides
        CHAPTERS_DATA.forEach(chap => {
          const savedChap = localStorage.getItem('mathSheet_chapterSettings_' + chap.id);
          if (savedChap) {
            const parsed = JSON.parse(savedChap);
            chap.subjectCode = parsed.code;
            chap.subjectName = parsed.subject;
            chap.combinedSubjectCode = parsed.combinedSubjectCode || `${parsed.subject} (${parsed.code})`;
            chap.grade = parsed.grade;
            chap.semester = parsed.semester;

            // Cascade to sub-topics in CURRICULUM_DATABASE
            chap.topics.forEach(t => {
              if (CURRICULUM_DATABASE[t.id]) {
                CURRICULUM_DATABASE[t.id].subjectCode = chap.combinedSubjectCode;
                if (chap.grade) CURRICULUM_DATABASE[t.id].grade = chap.grade;
                if (chap.semester) CURRICULUM_DATABASE[t.id].semester = chap.semester;
              }
            });
          }
        });
      } catch (e) {
        console.warn('Error loading saved settings:', e);
      }
    }

    // Lightweight UI Toast
    function showSystemToast(msg) {
      let toast = document.getElementById('systemToastNotification');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'systemToastNotification';
        toast.style.cssText = `
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid rgba(0, 245, 212, 0.45);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(0, 245, 212, 0.2);
          border-radius: 8px;
          padding: 0.75rem 1.25rem;
          font-size: 0.9rem;
          font-weight: 500;
          z-index: 100000;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0;
          transform: translateY(15px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        `;
        document.body.appendChild(toast);
      }
      toast.innerHTML = msg;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
      }, 3500);
    }

    // Initialize on page load
    window.addEventListener('DOMContentLoaded', () => {
      loadAllSavedSettings();"""

    assert dom_loaded_target in html, "DOMContentLoaded target not found"
    html = html.replace(dom_loaded_target, js_logic_addition, 1)
    print("Added System and Chapter Settings JS logic.")

    print("Writing updated Index.html...")
    with open("Index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Index.html updated successfully!")

def update_code_gs():
    print("Reading Code.gs...")
    with open("Code.gs", "r", encoding="utf-8") as f:
        gs = f.read()

    target_para = """    var subjectPara = body.appendParagraph(subject + ' • ' + sheetName);
    subjectPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subjectPara.setFontFamily(baseFont);
    subjectPara.setFontSize(12);
    subjectPara.setBold(true);
    subjectPara.setForegroundColor('#1d4ed8');
    subjectPara.setSpacingAfter(2);

    var stdPara = body.appendParagraph(data.standard || 'สาระการเรียนรู้คณิตศาสตร์ มาตรฐาน สสวท.');"""

    replacement_para = """    var subjectPara = body.appendParagraph(subject + ' • ' + sheetName);
    subjectPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subjectPara.setFontFamily(baseFont);
    subjectPara.setFontSize(12);
    subjectPara.setBold(true);
    subjectPara.setForegroundColor('#1d4ed8');
    subjectPara.setSpacingAfter(2);

    if (data.teacher) {
      var teacherPara = body.appendParagraph('ครูผู้สอน: ' + data.teacher);
      teacherPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      teacherPara.setFontFamily(baseFont);
      teacherPara.setFontSize(9.5);
      teacherPara.setForegroundColor('#475569');
      teacherPara.setSpacingAfter(2);
    }

    var stdPara = body.appendParagraph(data.standard || 'สาระการเรียนรู้คณิตศาสตร์ มาตรฐาน สสวท.');"""

    if target_para in gs:
        gs = gs.replace(target_para, replacement_para, 1)
        with open("Code.gs", "w", encoding="utf-8") as f:
            f.write(gs)
        print("Code.gs updated successfully with teacher paragraph.")
    else:
        print("Note: target_para not found in Code.gs, skipping.")

if __name__ == "__main__":
    update_index_html()
    update_code_gs()
