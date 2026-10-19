import json
import re

# 1. Load the 24 lessons JSON
with open('curriculum_24_lessons.json', 'r', encoding='utf-8') as f:
    curriculum_json_str = f.read()

# 2. Read existing Index.html
with open('Index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 3. Add badge CSS for Week 1 to Week 6
badge_css_old = """.badge-m4 {
      background: rgba(0, 245, 212, 0.12);
      color: var(--neon-cyan);
      border: 1px solid rgba(0, 245, 212, 0.3);
    }
    .badge-m5 {
      background: rgba(168, 85, 247, 0.12);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .badge-m6 {
      background: rgba(236, 72, 153, 0.12);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }"""

badge_css_new = """.badge-m4 {
      background: rgba(0, 245, 212, 0.12);
      color: var(--neon-cyan);
      border: 1px solid rgba(0, 245, 212, 0.3);
    }
    .badge-w1 { background: rgba(0, 245, 212, 0.15); color: #00f5d4; border: 1px solid rgba(0, 245, 212, 0.35); }
    .badge-w2 { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); }
    .badge-w3 { background: rgba(129, 140, 248, 0.15); color: #818cf8; border: 1px solid rgba(129, 140, 248, 0.35); }
    .badge-w4 { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.35); }
    .badge-w5 { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.35); }
    .badge-w6 { background: rgba(251, 146, 60, 0.15); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.35); }"""

if badge_css_old in html:
    html = html.replace(badge_css_old, badge_css_new)
    print("Updated badge CSS")
else:
    print("WARNING: badge_css_old not found!")

# 4. Update sidebar branding and search placeholder
html = html.replace(
    '<p class="brand-sub">หลักสูตรคณิตศาสตร์ ม.ปลาย</p>',
    '<p class="brand-sub">ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม ม.4</p>'
)
html = html.replace(
    'placeholder="ค้นหาบทเรียน เช่น เซต, แคลคูลัส..."',
    'placeholder="ค้นหาคาบเรียน เช่น เลขยกกำลัง, กราฟ, log, ครึ่งชีวิต..."'
)
html = html.replace(
    '<span>16 บทเรียนหลัก</span>',
    '<span>24 คาบเรียน (สัปดาห์ที่ 1 - 6)</span>'
)
html = html.replace(
    '<span>เซต (Sets) และการแก้โจทย์ปัญหา</span>',
    '<span>คาบที่ 1: เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนเต็ม</span>'
)
html = html.replace(
    '<span>มัธยมศึกษาปีที่ 4 (เทอม 1)</span>',
    '<span>มัธยมศึกษาปีที่ 4 (ภาคเรียนที่ 2)</span>'
)
html = html.replace(
    '<span style="color: var(--neon-cyan);">หลักสูตร สสวท. (ค31201)</span>',
    '<span style="color: var(--neon-cyan);">คณิตศาสตร์เพิ่มเติม 2 (ค31202)</span>'
)

# 5. Replace CURRICULUM_DATABASE
db_start = html.find('const CURRICULUM_DATABASE = {')
db_end = html.find('const ORIGINAL_CURRICULUM_DATA = JSON.parse(JSON.stringify(CURRICULUM_DATABASE));')

if db_start != -1 and db_end != -1:
    new_db_decl = f"const CURRICULUM_DATABASE = {curriculum_json_str};\n\n    "
    html = html[:db_start] + new_db_decl + html[db_end:]
    print("Replaced CURRICULUM_DATABASE successfully!")
else:
    print("ERROR: CURRICULUM_DATABASE boundaries not found!")

# 6. Update currentTopicId
html = html.replace('let currentTopicId = "m4-set";', 'let currentTopicId = "expo-l01";')

# 7. Replace renderSidebarTree
sidebar_start = html.find('function renderSidebarTree() {')
sidebar_end = html.find('function selectTopic(topicId) {')

new_sidebar_code = """function renderSidebarTree() {
      const container = document.getElementById('sidebarTopicsContainer');
      const groups = [
        {
          id: "week-1",
          weekTitle: "สัปดาห์ที่ 1: เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง",
          badgeClass: "badge-w1",
          badgeText: "W1",
          periodRange: "คาบที่ 1 - 4",
          topics: [
            { id: "expo-l01", title: "คาบที่ 1: เลขยกกำลังชี้กำลังเต็ม", desc: "5 สมบัติหลัก นิยาม $a^0=1$ และ $a^{-n}=\\\\frac{1}{a^n}$" },
            { id: "expo-l02", title: "คาบที่ 2: รากที่ n และกรณฑ์", desc: "ค่าหลักของรากที่ n และเงื่อนไข $|a|$ เมื่อ n คู่" },
            { id: "expo-l03", title: "คาบที่ 3: การดำเนินการของกรณฑ์ & สังยุค", desc: "บวก ลบ คูณ หารกรณฑ์ และจัดรูปตัวส่วนด้วยสังยุค" },
            { id: "expo-l04", title: "คาบที่ 4: เลขยกกำลังชี้กำลังตรรกยะ", desc: "$a^{\\\\frac{m}{n}} = (\\\\sqrt[n]{a})^m$ และการแปลงรูป" }
          ]
        },
        {
          id: "week-2",
          weekTitle: "สัปดาห์ที่ 2: ฟังก์ชันเอกซ์โพเนนเชียลและกราฟ",
          badgeClass: "badge-w2",
          badgeText: "W2",
          periodRange: "คาบที่ 5 - 8",
          topics: [
            { id: "expo-l05", title: "คาบที่ 5: นิยามฟังก์ชันเอกซ์โพเนนเชียล", desc: "รูปแบบ $y = a^x$ เงื่อนไข $a > 0, a \\\\neq 1$" },
            { id: "expo-l06", title: "คาบที่ 6: กราฟเอกซ์โพเนนเชียล", desc: "ฟังก์ชันเพิ่ม/ลด จุดตัด $(0,1)$ เส้นกำกับ $y=0$" },
            { id: "expo-l07", title: "คาบที่ 7: การเลื่อนขนานกราฟ & โดเมนเรนจ์", desc: "$y = a^{x-h} + k$ การหาโดเมน เรนจ์ เส้นกำกับ" },
            { id: "expo-l08", title: "คาบที่ 8: การเปรียบเทียบค่าเลขยกกำลัง", desc: "เปรียบเทียบค่าเมื่อฐาน $a > 1$ และ $0 < a < 1$" }
          ]
        },
        {
          id: "week-3",
          weekTitle: "สัปดาห์ที่ 3: สมการและอสมการเอกซ์โพเนนเชียล",
          badgeClass: "badge-w3",
          badgeText: "W3",
          periodRange: "คาบที่ 9 - 12",
          topics: [
            { id: "expo-l09", title: "คาบที่ 9: สมการเอกซ์โพ: ฐานเท่ากัน", desc: "$a^{f(x)} = a^{g(x)} \\\\iff f(x) = g(x)$" },
            { id: "expo-l10", title: "คาบที่ 10: สมการเอกซ์โพ: แปลงตัวแปรพหุนาม", desc: "จัดรูป $A(a^x)^2 + B(a^x) + C = 0$ กำหนด $u = a^x$" },
            { id: "expo-l11", title: "คาบที่ 11: สมการเอกซ์โพ: ฐานไม่เท่า & สมมาตร", desc: "$a^u = b^u$ และสมการรูป $a^x + a^{-x} = k$" },
            { id: "expo-l12", title: "คาบที่ 12: อสมการเอกซ์โพเนนเชียล", desc: "การกลับเครื่องหมายอสมการเมื่อฐาน $0 < a < 1$" }
          ]
        },
        {
          id: "week-4",
          weekTitle: "สัปดาห์ที่ 4: ฟังก์ชันลอการิทึมและสมบัติพื้นฐาน",
          badgeClass: "badge-w4",
          badgeText: "W4",
          periodRange: "คาบที่ 13 - 16",
          topics: [
            { id: "expo-l13", title: "คาบที่ 13: นิยามลอการิทึม (อินเวอร์ส Expo)", desc: "$y = \\\\log_a x \\\\iff x = a^y$ เงื่อนไข $x > 0$" },
            { id: "expo-l14", title: "คาบที่ 14: กราฟของฟังก์ชันลอการิทึม", desc: "ฟังก์ชันเพิ่ม/ลด จุดตัด $(1,0)$ เส้นกำกับ $x=0$" },
            { id: "expo-l15", title: "คาบที่ 15: สมบัติพื้นฐานลอการิทึม 5 ข้อแรก", desc: "$\\\\log_a 1, \\\\log_a a, \\\\log_a(MN), \\\\log_a(\\\\frac{M}{N}), \\\\log_a(M^p)$" },
            { id: "expo-l16", title: "คาบที่ 16: การเปลี่ยนฐาน & ยกกำลังที่ฐาน", desc: "$\\\\log_b a = \\\\frac{\\\\log_c a}{\\\\log_c b}$ และ $\\\\log_{b^q} a^p = \\\\frac{p}{q}\\\\log_b a$" }
          ]
        },
        {
          id: "week-5",
          weekTitle: "สัปดาห์ที่ 5: ลอการิทึมขั้นสูงและสมการลอการิทึม",
          badgeClass: "badge-w5",
          badgeText: "W5",
          periodRange: "คาบที่ 17 - 20",
          topics: [
            { id: "expo-l17", title: "คาบที่ 17: ลอการิทึมสามัญ ธรรมชาติ & แมนทิสซา", desc: "$\\\\log x, \\\\ln x$, แคแรกเทอริสติกและแมนทิสซา" },
            { id: "expo-l18", title: "คาบที่ 18: การเปิดตาราง & Antilogarithm", desc: "การประมาณค่าลอการิทึมและการหาค่าแอนติลอการิทึม" },
            { id: "expo-l19", title: "คาบที่ 19: สมการลอการิทึม: ฐานเท่า & ยุบ log", desc: "$\\\\log_a u = \\\\log_a v$ และการตรวจเงื่อนไข $u, v > 0$" },
            { id: "expo-l20", title: "คาบที่ 20: สมการลอการิทึม: เปลี่ยนตัวแปร & Take log", desc: "สมการกำลังสองของ log และการ take log 2 ข้าง" }
          ]
        },
        {
          id: "week-6",
          weekTitle: "สัปดาห์ที่ 6: อสมการลอการิทึมและการประยุกต์โจทย์จริง",
          badgeClass: "badge-w6",
          badgeText: "W6",
          periodRange: "คาบที่ 21 - 24",
          topics: [
            { id: "expo-l21", title: "คาบที่ 21: อสมการลอการิทึม & โดเมน", desc: "ระวังโดเมน $u > 0$ และกลับเครื่องหมายเมื่อ $0 < a < 1$" },
            { id: "expo-l22", title: "คาบที่ 22: ประยุกต์: กัมมันตรังสี & ครึ่งชีวิต", desc: "$N(t) = N_0 (\\\\frac{1}{2})^{\\\\frac{t}{T}}$ และ $N(t) = N_0 e^{-\\\\lambda t}$" },
            { id: "expo-l23", title: "คาบที่ 23: ประยุกต์: ประชากร & ดอกเบี้ยทบต้น", desc: "$P(t) = P_0 e^{kt}$ และ $A = P(1+\\\\frac{r}{n})^{nt}$" },
            { id: "expo-l24", title: "คาบที่ 24: ประยุกต์: pH กรดด่าง & เดซิเบลเสียง", desc: "$pH = -\\\\log[H^+]$ และ $\\\\beta = 10\\\\log(\\\\frac{I}{I_0})$" }
          ]
        }
      ];

      let html = '';
      groups.forEach(g => {
        html += `
          <div class="curriculum-category" id="${g.id}">
            <button class="category-header" onclick="toggleCategory('${g.id}')">
              <div class="category-left">
                <span class="grade-badge ${g.badgeClass}">${g.badgeText}</span>
                <span style="font-size: 0.85rem; font-weight: 600;">${g.weekTitle}</span>
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
    print("Replaced renderSidebarTree successfully!")
else:
    print("ERROR: renderSidebarTree boundaries not found!")

# 8. Update renderPaperSheet for worked example vs blank exercise
exercise_render_old = """            <div class="exercise-header">
              <span>${ex.title}</span>
              <span class="score-badge">${ex.points || ''}</span>
            </div>
            ${ex.latex ? `<div style="margin: 0.5rem 0; font-size: 1.05rem; padding-left: 0.75rem;">$$${ex.latex}$$</div>` : ''}
            ${answerAreaHtml}"""

exercise_render_new = """            <div class="exercise-header">
              <span>${ex.title}</span>
              <span class="score-badge">${ex.points || ''}</span>
            </div>
            ${ex.latex ? `
              <div class="sheet-solution-box" style="margin: 0.4rem 0 0.2rem 0; padding: 0.55rem 0.85rem; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;">
                <div style="font-size: 0.88rem; font-weight: 600; color: #1d4ed8; margin-bottom: 0.25rem;">📘 แสดงวิธีทำ:</div>
                <div class="equation-stage" style="overflow-x: auto; font-size: 1rem; color: #0f172a;">$$${ex.latex}$$</div>
                ${ex.placeholder ? `<div style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-top: 0.25rem;">${ex.placeholder}</div>` : ''}
              </div>
            ` : answerAreaHtml}"""

if exercise_render_old in html:
    html = html.replace(exercise_render_old, exercise_render_new)
    print("Updated exercise rendering in renderPaperSheet successfully!")
else:
    print("WARNING: exercise_render_old not found!")

# 9. Update resetExercisesToDefault for safety
reset_old = """      const origMode = origData[currentSheetMode] || origData.worksheet;
      
      CURRICULUM_DATABASE[currentTopicId][currentSheetMode].exercises = JSON.parse(JSON.stringify(origMode.exercises));"""

reset_new = """      const origMode = origData[currentSheetMode] || origData.worksheet;
      const targetMode = CURRICULUM_DATABASE[currentTopicId][currentSheetMode] || CURRICULUM_DATABASE[currentTopicId].worksheet;
      targetMode.exercises = JSON.parse(JSON.stringify(origMode.exercises));"""

if reset_old in html:
    html = html.replace(reset_old, reset_new)
    print("Updated resetExercisesToDefault successfully!")
else:
    print("WARNING: reset_old not found!")

# 10. Update DOMContentLoaded initial topic
html = html.replace("selectTopic('m4-set');", "selectTopic('expo-l01');")
print("Updated initial DOMContentLoaded topic to expo-l01")

# 11. Write back to Index.html
with open('Index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Index.html updated successfully!")
