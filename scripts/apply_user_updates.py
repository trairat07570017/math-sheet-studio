import json

# 1. Read regenerated curriculum_24_lessons.json
with open('curriculum_24_lessons.json', 'r', encoding='utf-8') as f:
    curriculum_json_str = f.read()

# 2. Read Index.html
with open('Index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 3. Replace CURRICULUM_DATABASE in Index.html
db_start = html.find('const CURRICULUM_DATABASE = {')
db_end = html.find('const ORIGINAL_CURRICULUM_DATA = JSON.parse(JSON.stringify(CURRICULUM_DATABASE));')

if db_start != -1 and db_end != -1:
    new_db_decl = f"const CURRICULUM_DATABASE = {curriculum_json_str};\n\n    "
    html = html[:db_start] + new_db_decl + html[db_end:]
    print("Replaced CURRICULUM_DATABASE in Index.html!")
else:
    print("ERROR: CURRICULUM_DATABASE boundaries not found!")

# 4. Add CSS styles for Chapter cards and headers
css_target = ".curriculum-category {"
new_css = """.sidebar-unit-card {
      background: linear-gradient(135deg, rgba(0, 245, 212, 0.08), rgba(168, 85, 247, 0.08));
      border: 1px solid rgba(0, 245, 212, 0.25);
      border-radius: var(--radius-md);
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.85rem;
    }
    .unit-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--neon-cyan);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .unit-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0.2rem 0;
      line-height: 1.35;
    }
    .unit-desc {
      font-size: 0.74rem;
      color: var(--text-dim);
    }
    .category-title-group {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }
    .category-title-text {
      font-size: 0.83rem;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .category-period-count {
      font-size: 0.7rem;
      color: var(--neon-cyan);
      font-weight: 500;
    }
    .chapter-bullet-icon {
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .curriculum-category {
      margin-bottom: 0.65rem;
    }"""

if css_target in html:
    html = html.replace(".curriculum-category {\n      margin-bottom: 0.85rem;\n    }", new_css)
    print("Updated sidebar CSS!")
else:
    print("WARNING: css_target not found!")

# 5. Update renderSidebarTree in Index.html
sidebar_start = html.find('function renderSidebarTree() {')
sidebar_end = html.find('function selectTopic(topicId) {')

new_sidebar_code = """function renderSidebarTree() {
      const container = document.getElementById('sidebarTopicsContainer');
      const groups = [
        {
          id: "chapter-1",
          chapterTitle: "บทที่ 1: เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง",
          badgeClass: "badge-w1",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l01", title: "คาบที่ 1: เลขยกกำลังชี้กำลังเต็ม", desc: "5 สมบัติหลัก นิยาม $a^0=1$ และ $a^{-n}=\\\\frac{1}{a^n}$" },
            { id: "expo-l02", title: "คาบที่ 2: รากที่ n และกรณฑ์", desc: "ค่าหลักของรากที่ n และเงื่อนไข $|a|$ เมื่อ n คู่" },
            { id: "expo-l03", title: "คาบที่ 3: การดำเนินการของกรณฑ์ & สังยุค", desc: "บวก ลบ คูณ หารกรณฑ์ และจัดรูปตัวส่วนด้วยสังยุค" },
            { id: "expo-l04", title: "คาบที่ 4: เลขยกกำลังชี้กำลังตรรกยะ", desc: "$a^{\\\\frac{m}{n}} = (\\\\sqrt[n]{a})^m$ และการแปลงรูป" }
          ]
        },
        {
          id: "chapter-2",
          chapterTitle: "บทที่ 2: ฟังก์ชันเอกซ์โพเนนเชียลและกราฟ",
          badgeClass: "badge-w2",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l05", title: "คาบที่ 5: นิยามฟังก์ชันเอกซ์โพเนนเชียล", desc: "รูปแบบ $y = a^x$ เงื่อนไข $a > 0, a \\\\neq 1$" },
            { id: "expo-l06", title: "คาบที่ 6: กราฟเอกซ์โพเนนเชียล", desc: "ฟังก์ชันเพิ่ม/ลด จุดตัด $(0,1)$ เส้นกำกับ $y=0$" },
            { id: "expo-l07", title: "คาบที่ 7: การเลื่อนขนานกราฟ & โดเมนเรนจ์", desc: "$y = a^{x-h} + k$ การหาโดเมน เรนจ์ เส้นกำกับ" },
            { id: "expo-l08", title: "คาบที่ 8: การเปรียบเทียบค่าเลขยกกำลัง", desc: "เปรียบเทียบค่าเมื่อฐาน $a > 1$ และ $0 < a < 1$" }
          ]
        },
        {
          id: "chapter-3",
          chapterTitle: "บทที่ 3: สมการและอสมการเอกซ์โพเนนเชียล",
          badgeClass: "badge-w3",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l09", title: "คาบที่ 9: สมการเอกซ์โพ: ฐานเท่ากัน", desc: "$a^{f(x)} = a^{g(x)} \\\\iff f(x) = g(x)$" },
            { id: "expo-l10", title: "คาบที่ 10: สมการเอกซ์โพ: แปลงตัวแปรพหุนาม", desc: "จัดรูป $A(a^x)^2 + B(a^x) + C = 0$ กำหนด $u = a^x$" },
            { id: "expo-l11", title: "คาบที่ 11: สมการเอกซ์โพ: ฐานไม่เท่า & สมมาตร", desc: "$a^u = b^u$ และสมการรูป $a^x + a^{-x} = k$" },
            { id: "expo-l12", title: "คาบที่ 12: อสมการเอกซ์โพเนนเชียล", desc: "การกลับเครื่องหมายอสมการเมื่อฐาน $0 < a < 1$" }
          ]
        },
        {
          id: "chapter-4",
          chapterTitle: "บทที่ 4: ฟังก์ชันลอการิทึมและสมบัติพื้นฐาน",
          badgeClass: "badge-w4",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l13", title: "คาบที่ 13: นิยามลอการิทึม (อินเวอร์ส Expo)", desc: "$y = \\\\log_a x \\\\iff x = a^y$ เงื่อนไข $x > 0$" },
            { id: "expo-l14", title: "คาบที่ 14: กราฟของฟังก์ชันลอการิทึม", desc: "ฟังก์ชันเพิ่ม/ลด จุดตัด $(1,0)$ เส้นกำกับ $x=0$" },
            { id: "expo-l15", title: "คาบที่ 15: สมบัติพื้นฐานลอการิทึม 5 ข้อแรก", desc: "$\\\\log_a 1, \\\\log_a a, \\\\log_a(MN), \\\\log_a(\\\\frac{M}{N}), \\\\log_a(M^p)$" },
            { id: "expo-l16", title: "คาบที่ 16: การเปลี่ยนฐาน & ยกกำลังที่ฐาน", desc: "$\\\\log_b a = \\\\frac{\\\\log_c a}{\\\\log_c b}$ และ $\\\\log_{b^q} a^p = \\\\frac{p}{q}\\\\log_b a$" }
          ]
        },
        {
          id: "chapter-5",
          chapterTitle: "บทที่ 5: ลอการิทึมขั้นสูงและสมการลอการิทึม",
          badgeClass: "badge-w5",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l17", title: "คาบที่ 17: ลอการิทึมสามัญ ธรรมชาติ & แมนทิสซา", desc: "$\\\\log x, \\\\ln x$, แคแรกเทอริสติกและแมนทิสซา" },
            { id: "expo-l18", title: "คาบที่ 18: การเปิดตาราง & Antilogarithm", desc: "การประมาณค่าลอการิทึมและการหาค่าแอนติลอการิทึม" },
            { id: "expo-l19", title: "คาบที่ 19: สมการลอการิทึม: ฐานเท่า & ยุบ log", desc: "$\\\\log_a u = \\\\log_a v$ และการตรวจเงื่อนไข $u, v > 0$" },
            { id: "expo-l20", title: "คาบที่ 20: สมการลอการิทึม: เปลี่ยนตัวแปร & Take log", desc: "สมการกำลังสองของ log และการ take log 2 ข้าง" }
          ]
        },
        {
          id: "chapter-6",
          chapterTitle: "บทที่ 6: อสมการลอการิทึมและการประยุกต์โจทย์จริง",
          badgeClass: "badge-w6",
          periodRange: "4 คาบเรียน",
          topics: [
            { id: "expo-l21", title: "คาบที่ 21: อสมการลอการิทึม & โดเมน", desc: "ระวังโดเมน $u > 0$ และกลับเครื่องหมายเมื่อ $0 < a < 1$" },
            { id: "expo-l22", title: "คาบที่ 22: ประยุกต์: กัมมันตรังสี & ครึ่งชีวิต", desc: "$N(t) = N_0 (\\\\frac{1}{2})^{\\\\frac{t}{T}}$ และ $N(t) = N_0 e^{-\\\\lambda t}$" },
            { id: "expo-l23", title: "คาบที่ 23: ประยุกต์: ประชากร & ดอกเบี้ยทบต้น", desc: "$P(t) = P_0 e^{kt}$ และ $A = P(1+\\\\frac{r}{n})^{nt}$" },
            { id: "expo-l24", title: "คาบที่ 24: ประยุกต์: pH กรดด่าง & เดซิเบลเสียง", desc: "$pH = -\\\\log[H^+]$ และ $\\\\beta = 10\\\\log(\\\\frac{I}{I_0})$" }
          ]
        }
      ];

      let html = `
        <div class="sidebar-unit-card">
          <div class="unit-badge">หน่วยการเรียนรู้หลัก (ม.4 เทอม 2)</div>
          <div class="unit-title">📘 ฟังก์ชันเอกซ์โพเนนเชียลและฟังก์ชันลอการิทึม</div>
          <div class="unit-desc">กดเลือกบทด้านล่าง เพื่อเปิดดูคาบสอน (24 คาบ)</div>
        </div>
      `;

      groups.forEach((g) => {
        // By default, only the chapter containing currentTopicId is expanded
        const isCurrentGroup = g.topics.some(t => t.id === currentTopicId);
        const collapseClass = isCurrentGroup ? '' : 'collapsed';

        html += `
          <div class="curriculum-category ${collapseClass}" id="${g.id}">
            <button type="button" class="category-header" onclick="toggleCategory('${g.id}')">
              <div class="category-left">
                <span class="chapter-bullet-icon">📖</span>
                <div class="category-title-group">
                  <span class="category-title-text">${g.chapterTitle}</span>
                  <span class="category-period-count">${g.periodRange}</span>
                </div>
              </div>
              <span class="chevron-arrow">▼</span>
            </button>
            <ul class="topic-list">
        `;

        g.topics.forEach(t => {
          const isActive = t.id === currentTopicId ? 'active' : '';
          html += `
            <li>
              <a href="javascript:void(0)" class="topic-item ${isActive}" data-id="${t.id}" onclick="selectTopic('${t.id}')">
                <div class="topic-row-top">
                  <span class="topic-title-text">${t.title}</span>
                  <span class="topic-tag highlight">สสวท.</span>
                </div>
                <div class="topic-desc-snippet">${t.desc}</div>
              </a>
            </li>
          `;
        });

        html += `
            </ul>
          </div>
        `;
      });

      container.innerHTML = html;
      renderAllMath(container);
    }

    """

if sidebar_start != -1 and sidebar_end != -1:
    html = html[:sidebar_start] + new_sidebar_code + html[sidebar_end:]
    print("Replaced renderSidebarTree with Chapter-first menu!")
else:
    print("ERROR: renderSidebarTree boundaries not found!")

# 6. Update toggleCategory for accordion behavior
toggle_cat_old = """    function toggleCategory(catId) {
      const cat = document.getElementById(catId);
      if (cat) cat.classList.toggle('collapsed');
    }"""

toggle_cat_new = """    function toggleCategory(catId) {
      const allCats = document.querySelectorAll('.curriculum-category');
      allCats.forEach(cat => {
        if (cat.id === catId) {
          cat.classList.toggle('collapsed');
        } else {
          cat.classList.add('collapsed'); // Accordion: collapse others
        }
      });
    }"""

if toggle_cat_old in html:
    html = html.replace(toggle_cat_old, toggle_cat_new)
    print("Updated toggleCategory for accordion behavior!")
else:
    print("WARNING: toggle_cat_old not found!")

# 7. Update handleSearchTopics to auto-expand matching chapters
search_func_old = """    function handleSearchTopics() {
      const q = document.getElementById('topicSearchBox').value.toLowerCase().trim();
      document.querySelectorAll('.topic-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.parentElement.style.display = text.includes(q) ? 'block' : 'none';
      });
    }"""

search_func_new = """    function handleSearchTopics() {
      const q = document.getElementById('topicSearchBox').value.toLowerCase().trim();
      if (!q) {
        document.querySelectorAll('.topic-item').forEach(item => {
          item.parentElement.style.display = 'block';
        });
        document.querySelectorAll('.curriculum-category').forEach(cat => {
          cat.style.display = 'block';
          const hasActive = cat.querySelector('.topic-item.active');
          if (hasActive) {
            cat.classList.remove('collapsed');
          } else {
            cat.classList.add('collapsed');
          }
        });
        return;
      }

      document.querySelectorAll('.curriculum-category').forEach(cat => {
        let hasMatch = false;
        cat.querySelectorAll('.topic-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          const match = text.includes(q);
          item.parentElement.style.display = match ? 'block' : 'none';
          if (match) hasMatch = true;
        });
        cat.style.display = hasMatch ? 'block' : 'none';
        if (hasMatch) cat.classList.remove('collapsed');
      });
    }"""

if search_func_old in html:
    html = html.replace(search_func_old, search_func_new)
    print("Updated handleSearchTopics!")
else:
    print("WARNING: search_func_old not found!")

# 8. Remove score badge and remove "(พื้นที่แสดงวิธีทำของนักเรียน)" from renderPaperSheet
# Find the exercise loop in renderPaperSheet
old_paper_render_target = """        } else if (ex.answerType === 'blank') {
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: 100px; background: transparent; border: 1px dashed #cbd5e1;">
              <span style="font-size: 0.75rem; color: #94a3b8;">${ex.placeholder || '(พื้นที่สำหรับวาดรูป กราฟ หรือทดคำตอบ)'}</span>
            </div>
          `;
        } else {
          const minH = ex.answerType === 'handwriting-large' ? '135px' : '85px';
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: ${minH};">
              ${ex.placeholder || '(พื้นที่แสดงวิธีทำและคำตอบของนักเรียน)'}
            </div>
          `;
        }

        exHtml += `
          <div class="sheet-exercise interactive-block" data-index="${idx}" style="${idx === 0 ? 'border-top: none; padding-top: 0;' : ''}">
            <!-- Interactive Action Toolbar (hidden on print) -->
            <div class="exercise-actions-bar no-print">
              <button type="button" class="action-btn" onclick="openEditExerciseModal(${idx})" title="แก้ไขข้อสอบนี้">
                ✏️ แก้ไข
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="เลื่อนข้อขึ้น">
                ⬆️
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, 1)" ${idx === exercises.length - 1 ? 'disabled' : ''} title="เลื่อนข้อลง">
                ⬇️
              </button>
              <button type="button" class="action-btn delete-btn" onclick="deleteExercise(${idx})" title="ลบข้อนี้">
                🗑️ ลบ
              </button>
            </div>

            <div class="exercise-header">
              <span>${ex.title}</span>
              <span class="score-badge">${ex.points || ''}</span>
            </div>"""

new_paper_render_target = """        } else if (ex.answerType === 'blank') {
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: 100px; background: transparent; border: 1px dashed #cbd5e1;"></div>
          `;
        } else {
          const minH = ex.answerType === 'handwriting-large' ? '135px' : '85px';
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: ${minH};"></div>
          `;
        }

        exHtml += `
          <div class="sheet-exercise interactive-block" data-index="${idx}" style="${idx === 0 ? 'border-top: none; padding-top: 0;' : ''}">
            <!-- Interactive Action Toolbar (hidden on print) -->
            <div class="exercise-actions-bar no-print">
              <button type="button" class="action-btn" onclick="openEditExerciseModal(${idx})" title="แก้ไขข้อสอบนี้">
                ✏️ แก้ไข
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="เลื่อนข้อขึ้น">
                ⬆️
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, 1)" ${idx === exercises.length - 1 ? 'disabled' : ''} title="เลื่อนข้อลง">
                ⬇️
              </button>
              <button type="button" class="action-btn delete-btn" onclick="deleteExercise(${idx})" title="ลบข้อนี้">
                🗑️ ลบ
              </button>
            </div>

            <div class="exercise-header">
              <span>${ex.title}</span>
            </div>"""

if old_paper_render_target in html:
    html = html.replace(old_paper_render_target, new_paper_render_target)
    print("Updated paper rendering: removed points badge and removed handwriting placeholder text!")
else:
    print("WARNING: old_paper_render_target not found!")

# 9. Update modal preview rendering
modal_preview_old = """      } else if (answerType === 'blank') {
        answerHtml = `
          <div class="handwriting-grid" style="min-height: 80px; margin-top: 0.5rem; background: transparent;">
            ${placeholder || '(พื้นที่สำหรับวาดรูป กราฟ หรือทดคำตอบ)'}
          </div>
        `;
      } else {
        answerHtml = `
          <div class="handwriting-grid" style="min-height: ${answerType === 'handwriting-large' ? '90px' : '65px'}; margin-top: 0.5rem;">
            ${placeholder || '(พื้นที่แสดงวิธีทำ)'}
          </div>
        `;
      }

      const container = document.getElementById('modalPreviewContent');
      container.innerHTML = `
        <div class="exercise-header">
          <span>${title}</span>
          <span class="score-badge">${points}</span>
        </div>"""

modal_preview_new = """      } else if (answerType === 'blank') {
        answerHtml = `
          <div class="handwriting-grid" style="min-height: 80px; margin-top: 0.5rem; background: transparent;"></div>
        `;
      } else {
        answerHtml = `
          <div class="handwriting-grid" style="min-height: ${answerType === 'handwriting-large' ? '90px' : '65px'}; margin-top: 0.5rem;"></div>
        `;
      }

      const container = document.getElementById('modalPreviewContent');
      container.innerHTML = `
        <div class="exercise-header">
          <span>${title}</span>
          ${points ? `<span class="score-badge">${points}</span>` : ''}
        </div>"""

if modal_preview_old in html:
    html = html.replace(modal_preview_old, modal_preview_new)
    print("Updated modal preview: removed placeholder text from preview!")
else:
    print("WARNING: modal_preview_old not found!")

# 10. Also update selectTopic so it expands parent category
select_topic_old = """    function selectTopic(topicId) {
      if (!CURRICULUM_DATABASE[topicId]) return;
      currentTopicId = topicId;
      const data = CURRICULUM_DATABASE[topicId];

      // Update Sidebar Active Class
      document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-id') === topicId);
      });"""

select_topic_new = """    function selectTopic(topicId) {
      if (!CURRICULUM_DATABASE[topicId]) return;
      currentTopicId = topicId;
      const data = CURRICULUM_DATABASE[topicId];

      // Update Sidebar Active Class and expand active chapter
      document.querySelectorAll('.topic-item').forEach(item => {
        const isTarget = item.getAttribute('data-id') === topicId;
        item.classList.toggle('active', isTarget);
        if (isTarget) {
          const parentCat = item.closest('.curriculum-category');
          if (parentCat) {
            parentCat.classList.remove('collapsed');
          }
        }
      });"""

if select_topic_old in html:
    html = html.replace(select_topic_old, select_topic_new)
    print("Updated selectTopic to expand active chapter!")
else:
    print("WARNING: select_topic_old not found!")

# 11. Write back to Index.html
with open('Index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Index.html successfully updated with all user requirements!")
