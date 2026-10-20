# -*- coding: utf-8 -*-
"""
Complex Numbers (จำนวนเชิงซ้อน ม.5) - Part 3
Chapters 5 & 6: คาบที่ 17 ถึง 24
"""

import re

def clean_latex(s):
    if not s:
        return ""
    s = s.strip()
    if s.startswith("$$") and s.endswith("$$"):
        s = s[2:-2].strip()
    return re.sub(r"\\\\([a-zA-Z]+)", lambda m: "\\" + m.group(1), s)

def clean_text(s):
    if not s:
        return ""
    return re.sub(r"\\\\([a-zA-Z]+)", lambda m: "\\" + m.group(1), s)

def register_complex_part3(lessons_dict):
    def add(lid, chap_num, p_num, title, desc, f_title, formulas, tip, ex1, q1, q2, ex2, q3, q4, ex3, q5, q6):
        f_clean = clean_latex(formulas)
        if not (f_clean.startswith("$$") or f_clean.startswith("\\[")):
            f_clean = f"$${f_clean}$$"

        concept_html = f"""<div class="sheet-formula-box">
  <div style="font-weight: 600; color: #1e3a8a; margin-bottom: 0.35rem;">📌 {clean_text(f_title)}</div>
  <div class="equation-stage">
    {f_clean}
  </div>
  <div style="font-size: 0.88rem; color: #475569; margin-top: 0.25rem;">
    💡 <strong>เทคนิคคิดเร็ว:</strong> {clean_text(tip)}
  </div>
</div>"""

        ex_list = [
            {"title": f"ตัวอย่างที่ 1. (ครูสาธิตวิธีทำ) {clean_text(ex1[0])}", "points": "", "latex": clean_latex(ex1[1]), "placeholder": f"(วิธีทำตามเฉลยด้านบน: {clean_text(ex1[2])})"},
            {"title": f"ข้อที่ 1. {clean_text(q1[0])}", "answer": clean_text(q1[1]), "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 2. {clean_text(q2[0])}", "answer": clean_text(q2[1]), "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ตัวอย่างที่ 2. (ครูสาธิตวิธีทำ) {clean_text(ex2[0])}", "points": "", "latex": clean_latex(ex2[1]), "placeholder": f"(วิธีทำตามเฉลยด้านบน: {clean_text(ex2[2])})"},
            {"title": f"ข้อที่ 3. {clean_text(q3[0])}", "answer": clean_text(q3[1]), "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 4. {clean_text(q4[0])}", "answer": clean_text(q4[1]), "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ตัวอย่างที่ 3. (ครูสาธิตวิธีทำ) {clean_text(ex3[0])}", "points": "", "latex": clean_latex(ex3[1]), "placeholder": f"(วิธีทำตามเฉลยด้านบน: {clean_text(ex3[2])})"},
            {"title": f"ข้อที่ 5. {clean_text(q5[0])}", "answer": clean_text(q5[1]), "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 6. {clean_text(q6[0])}", "answer": clean_text(q6[1]), "points": "", "latex": "", "answerType": "handwriting-large", "placeholder": ""}
        ]

        lessons_dict[lid] = {
            "id": lid,
            "chapter": f"บทที่ {chap_num}",
            "week": f"บทที่ {chap_num}",
            "period": f"คาบที่ {p_num}",
            "grade": "มัธยมศึกษาปีที่ 5",
            "gradeShort": "ม.5",
            "semester": "ภาคเรียนที่ 2",
            "subjectCode": "คณิตศาสตร์เพิ่มเติม 4 (ค32202)",
            "title": f"คาบที่ {p_num}: {title}",
            "standard": "มาตรฐาน ค 1.2 ม.5/1 เข้าใจจำนวนเชิงซ้อนและใช้สมบัติของจำนวนเชิงซ้อนในการแก้ปัญหา",
            "desc": desc,
            "worksheet": {
                "sheetName": f"ใบงานคาบที่ {p_num}: {title}",
                "conceptHtml": concept_html,
                "exercises": ex_list
            },
            "summary": {
                "sheetName": f"ใบสรุปสูตร & เทคนิคคิดเร็ว คาบที่ {p_num}: {title}",
                "conceptHtml": concept_html,
                "exercises": [ex_list[0], ex_list[3], ex_list[6]]
            },
            "quiz": {
                "sheetName": f"แบบทดสอบย่อย Exit Ticket คาบที่ {p_num}: {title}",
                "conceptHtml": concept_html,
                "exercises": [ex_list[1], ex_list[2], ex_list[4], ex_list[5], ex_list[7], ex_list[8]]
            }
        }

    # =============================================================
    # บทที่ 5: ทฤษฎีบทของเดอมัวร์และรากที่ n (คาบ 17 - 20)
    # =============================================================

    # คาบที่ 17: ทฤษฎีบทของเดอมัวร์ (De Moivre's Theorem) เลขยกกำลังสูง
    add(
        "complex-l17", 5, 17,
        "ทฤษฎีบทของเดอมัวร์ (De Moivre's Theorem) เลขยกกำลังสูง",
        "ทฤษฎีบทของเดอมัวร์ [r(cos theta + i sin theta)]^n = r^n (cos n*theta + i sin n*theta) สำหรับคำนวณเลขยกกำลังสูง",
        "ทฤษฎีบทของเดอมัวร์ (De Moivre's Theorem)",
        r"""\begin{aligned}
\text{ถ้า } z &= r(\cos\theta + i\sin\theta) \\[4pt]
z^n &= r^n (\cos n\theta + i\sin n\theta) = r^n\,\text{cis}(n\theta) \quad (\forall n \in \mathbb{Z})
\end{aligned}""",
        "ถ้าโจทย์ให้ยกกำลังสูง ๆ เช่น $(\\sqrt{3}+i)^{12}$ ให้แปลงเป็นรูปเชิงขั้วก่อนเสมอ แล้วคูณ $n$ เข้าไปที่มุม",
        # Ex1 -> Q1, Q2
        ("จงหาค่าของ $(1 + i)^{10}$ โดยใช้ทฤษฎีบทของเดอมัวร์",
         r"""\begin{aligned}
1 + i &= \sqrt{2}\left(\cos\frac{\pi}{4} + i\sin\frac{\pi}{4}\right) \\\\[4pt]
(1 + i)^{10} &= (\sqrt{2})^{10}\left(\cos\frac{10\pi}{4} + i\sin\frac{10\pi}{4}\right) \\\\[4pt]
&= 2^5\left(\cos\frac{5\pi}{2} + i\sin\frac{5\pi}{2}\right) \\\\[4pt]
&= 32(0 + i) = 32i
\end{aligned}""",
         "แปลงเป็นเชิงขั้ว ยกกำลัง r ด้วย 10 และคูณมุมด้วย 10"),
        ("จงหาค่าของ $(\\sqrt{3} + i)^6$", "$-64$"),
        ("จงหาค่าของ $(1 - i)^{12}$", "$-64$"),
        # Ex2 -> Q3, Q4
        ("จงหาค่าของ $\\left(-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right)^{2025}$",
         r"""\begin{aligned}
z &= -\frac{1}{2} + \frac{\sqrt{3}}{2}i = 1\,\text{cis}\left(\frac{2\pi}{3}\right) = 1\,\text{cis}(120^\circ) \\\\[4pt]
z^3 &= \text{cis}(3 \times 120^\circ) = \text{cis}(360^\circ) = 1 \\\\[4pt]
z^{2025} &= (z^3)^{675} = 1^{675} = 1
\end{aligned}""",
         "สังเกตว่า z^3 = 1 ดังนั้นเลขชี้กำลังหารด้วย 3 ลงตัวจะได้ 1 เสมอ"),
        ("จงหาค่าของ $\\left(\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i\\right)^{12}$", "$1$"),
        ("จงหาค่าของ $\\left(-\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i\\right)^{100}$", "$-\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i$"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $(\\sqrt{3}-i)^{10} + (\\sqrt{3}+i)^{10}$",
         r"""\begin{aligned}
\sqrt{3}-i &= 2\,\text{cis}(-30^\circ) \implies (\sqrt{3}-i)^{10} = 2^{10}\,\text{cis}(-300^\circ) = 1024\,\text{cis}(60^\circ) \\[4pt]
\sqrt{3}+i &= 2\,\text{cis}(30^\circ) \implies (\sqrt{3}+i)^{10} = 2^{10}\,\text{cis}(300^\circ) = 1024\,\text{cis}(-60^\circ) \\[4pt]
\text{ผลรวม} &= 1024[\text{cis}(60^\circ) + \text{cis}(-60^\circ)] = 1024(2\cos 60^\circ) \\[4pt]
&= 1024(2 \times 0.5) = 1024
\end{aligned}""",
         "ใช้เอกลักษณ์ z^n + (z-bar)^n = 2 r^n cos(n theta)"),
        ("จงหาค่าของ $(1+i)^8 - (1-i)^8$", "$0$"),
        ("จงหาค่าของ $\\left(\\frac{1+\\sqrt{3}i}{1-\\sqrt{3}i}\\right)^{15}$", "$1$")
    )

    # คาบที่ 18: เดอมัวร์กับเลขชี้กำลังเป็นจำนวนเต็มลบและเศษส่วน
    add(
        "complex-l18", 5, 18,
        "เดอมัวร์กับเลขชี้กำลังเป็นจำนวนเต็มลบและเศษส่วน",
        "การประยุกต์ทฤษฎีบทของเดอมัวร์กับ z^-n และการคำนวณสมการเลขยกกำลัง",
        "เดอมัวร์กับเลขชี้กำลังจำนวนเต็มลบ",
        r"""\begin{aligned}
z^{-n} &= [r(\cos\theta + i\sin\theta)]^{-n} \\[4pt]
&= r^{-n} [\cos(-n\theta) + i\sin(-n\theta)] = \frac{1}{r^n} [\cos(n\theta) - i\sin(n\theta)]
\end{aligned}""",
        "$z^{-n}$ คือการกลับค่ารัศมีเป็น $1/r^n$ และมุมกลับเครื่องหมายเป็น $-n\\theta$",
        # Ex1 -> Q1, Q2
        ("จงหาค่าของ $(1 - \\sqrt{3}i)^{-6}$",
         r"""\begin{aligned}
1 - \sqrt{3}i &= 2\left(\cos\left(-\frac{\pi}{3}\right) + i\sin\left(-\frac{\pi}{3}\right)\right) \\\\[4pt]
(1 - \sqrt{3}i)^{-6} &= 2^{-6} \left(\cos\left(-6 \times -\frac{\pi}{3}\right) + i\sin\left(-6 \times -\frac{\pi}{3}\right)\right) \\\\[4pt]
&= \frac{1}{64}(\cos 2\pi + i\sin 2\pi) = \frac{1}{64}(1 + 0) = \frac{1}{64}
\end{aligned}""",
         "ใช้เดอมัวร์คูณ -6 เข้าไปที่มุม ได้ 2pi"),
        ("จงหาค่าของ $(1 + i)^{-8}$", "$\\frac{1}{16}$"),
        ("จงหาค่าของ $(\\sqrt{3} + i)^{-4}$", "$-\\frac{1}{32} - \\frac{\\sqrt{3}}{32}i$"),
        # Ex2 -> Q3, Q4
        ("จงหาค่าของ $\\frac{1}{(1+i)^{10}}$",
         r"""\begin{aligned}
(1+i)^{10} &= 32i \\\\[4pt]
\frac{1}{(1+i)^{10}} &= \frac{1}{32i} = \frac{-i}{32(-i^2)} = -\frac{1}{32}i
\end{aligned}""",
         "หาค่าส่วนก่อน แล้วนำ 1 หาร"),
        ("จงหาค่าของ $\\frac{1}{(\\sqrt{3}-i)^6}$", "$-\\frac{1}{64}$"),
        ("ถ้า $z = \\text{cis}\\theta$ จงแสดงว่า $z^n + z^{-n} = 2\\cos(n\\theta)$", "$2\\cos(n\\theta)$"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $z^4$ เมื่อ $z = \\frac{1}{2}(\\cos 15^\\circ + i\\sin 15^\\circ)^{-1}$",
         r"""\begin{aligned}
z &= \frac{1}{2}\,\text{cis}(-15^\circ) \\\\[4pt]
z^4 &= \left(\frac{1}{2}\right)^4\,\text{cis}(4 \times -15^\circ) = \frac{1}{16}\,\text{cis}(-60^\circ) \\\\[4pt]
&= \frac{1}{16}\left(\frac{1}{2} - \frac{\sqrt{3}}{2}i\right) = \frac{1}{32} - \frac{\sqrt{3}}{32}i
\end{aligned}""",
         "กลับมุมเป็นลบแล้วยกกำลัง 4"),
        ("จงหาค่าของ $[2\\text{cis}(45^\\circ)]^{-2}$", "$-\\frac{1}{4}i$"),
        ("จงหาค่าของ $\\text{Im}((1-i)^{-4})$", "$0$ (เพราะคำตอบคือ $-1/4$)")
    )

    # คาบที่ 19: การหารากที่ n ของจำนวนเชิงซ้อน
    add(
        "complex-l19", 5, 19,
        "การหารากที่ n ของจำนวนเชิงซ้อน (ทฤษฎีบทการหาราก)",
        "ทฤษฎีบทการหารากที่ n ของจำนวนเชิงซ้อน z = r cis theta จะมีทั้งหมด n รากที่แตกต่างกันเสมอ",
        "ทฤษฎีบทรากที่ $n$ ของจำนวนเชิงซ้อน",
        r"""\begin{aligned}
z &= r(\cos\theta + i\sin\theta) \implies \text{รากที่ } n \text{ มีทั้งหมด } n \text{ ค่า:} \\[4pt]
w_k &= \sqrt[n]{r}\left[\cos\left(\frac{\theta + 2k\pi}{n}\right) + i\sin\left(\frac{\theta + 2k\pi}{n}\right)\right] \\[4pt]
\text{เมื่อ } k &= 0, 1, 2, \dots, n-1
\end{aligned}""",
        "รากทุกตัวมีขนาดเท่ากันคือ $\\sqrt[n]{r}$ และมีมุมห่างเท่าๆ กันตัวละ $\\frac{2\\pi}{n}$ หรือ $\\frac{360^\\circ}{n}$",
        # Ex1 -> Q1, Q2
        ("จงหารากที่ 3 ทั้งหมดของ $8i$",
         r"""\begin{aligned}
8i &= 8\,\text{cis}(90^\circ), \quad n = 3, \quad \sqrt[3]{r} = \sqrt[3]{8} = 2 \\[4pt]
\text{มุมเริ่มต้น: } & \frac{90^\circ}{3} = 30^\circ, \quad \text{ระยะห่างมุม: } \frac{360^\circ}{3} = 120^\circ \\[4pt]
k = 0: & w_0 = 2\,\text{cis}(30^\circ) = 2\left(\frac{\sqrt{3}}{2} + \frac{1}{2}i\right) = \sqrt{3} + i \\[3pt]
k = 1: & w_1 = 2\,\text{cis}(150^\circ) = 2\left(-\frac{\sqrt{3}}{2} + \frac{1}{2}i\right) = -\sqrt{3} + i \\[3pt]
k = 2: & w_2 = 2\,\text{cis}(270^\circ) = 2(0 - i) = -2i
\end{aligned}""",
         "หามุมแรก theta/3 แล้วบวกเพิ่มทีละ 120 องศา จะได้ครบ 3 ราก"),
        ("จงหารากที่ 2 ทั้งหมดของ $3 + 4i$", "$\pm(2 + i)$"),
        ("จงหารากที่ 4 ทั้งหมดของ $-16$", "$\\sqrt{2} \pm \\sqrt{2}i, \\; -\\sqrt{2} \pm \\sqrt{2}i$"),
        # Ex2 -> Q3, Q4
        ("จงหารากที่ 3 ทั้งหมดของ $-27$",
         r"""\begin{aligned}
-27 &= 27\,\text{cis}(180^\circ), \quad \sqrt[3]{27} = 3, \quad \text{มุมเพิ่มทีละ } 120^\circ \\[4pt]
w_0 &= 3\,\text{cis}(60^\circ) = 3\left(\frac{1}{2} + \frac{\sqrt{3}}{2}i\right) = \frac{3}{2} + \frac{3\sqrt{3}}{2}i \\[3pt]
w_1 &= 3\,\text{cis}(180^\circ) = -3 \\[3pt]
w_2 &= 3\,\text{cis}(300^\circ) = \frac{3}{2} - \frac{3\sqrt{3}}{2}i
\end{aligned}""",
         "สังเกตว่า -3 เป็นหนึ่งในคำตอบ และอีกสองตัวเป็นคู่สังยุค"),
        ("จงหารากที่ 2 ของ $-8i$", "$2 - 2i$ และ $-2 + 2i$"),
        ("จงหาผลคูณของรากที่ 3 ทั้งหมดของ $8i$", "$8i$"),
        # Ex3 -> Q5, Q6
        ("จงหาผลบวกของรากที่ $n$ ทั้งหมดของจำนวนเชิงซ้อน $z$",
         r"""\begin{aligned}
w_0 + w_1 + \dots + w_{n-1} = 0 \quad (\text{เมื่อ } n \ge 2)
\end{aligned}""",
         "ผลบวกของรากที่ n ทั้งหมดของจำนวนใดๆ มีค่าเท่ากับศูนย์เสมอ"),
        ("จงหาผลบวกของรากที่ 4 ทั้งหมดของ $16$", "$0$"),
        ("จงหาค่า $k$ เมื่อรากตัวหนึ่งของ $z^3 = k$ คือ $1 - \sqrt{3}i$", "$z^3 = (1-\\sqrt{3}i)^3 = -8$")
    )

    # คาบที่ 20: รากของเอกลักษณ์ (Roots of Unity) และรูป n เหลี่ยมด้านเท่า
    add(
        "complex-l20", 5, 20,
        "รากของเอกลักษณ์ (Roots of Unity) และรูป n เหลี่ยมด้านเท่า",
        "การศึกษารากที่ n ของ 1 (Roots of Unity: z^n = 1) และการกระจายจุดยอดของรูป n เหลี่ยมด้านเท่ามุมเท่า",
        "รากที่ $n$ ของเอกลักษณ์ ($z^n = 1$)",
        r"""\begin{aligned}
\omega_k &= \cos\left(\frac{2k\pi}{n}\right) + i\sin\left(\frac{2k\pi}{n}\right) \quad (k = 0, 1, \dots, n-1) \\[4pt]
1 + \omega + \omega^2 + \dots + \omega^{n-1} &= 0
\end{aligned}""",
        "จุดที่แทนรากที่ $n$ ของ 1 จะเป็นจุดยอดของรูป $n$ เหลี่ยมด้านเท่ามุมเท่า ที่แนบในวงกลมหนึ่งหน่วย $|z| = 1$",
        # Ex1 -> Q1, Q2
        ("จงหารากที่ 3 ทั้งหมดของ $1$ และแสดงสมบัติ $1 + \omega + \omega^2 = 0$",
         r"""\begin{aligned}
1 &= 1\,\text{cis}(0^\circ) \implies \text{มุมห่าง } \frac{360^\circ}{3} = 120^\circ \\[4pt]
\omega_0 &= \text{cis}(0^\circ) = 1 \\[3pt]
\omega_1 &= \text{cis}(120^\circ) = -\frac{1}{2} + \frac{\sqrt{3}}{2}i = \omega \\[3pt]
\omega_2 &= \text{cis}(240^\circ) = -\frac{1}{2} - \frac{\sqrt{3}}{2}i = \omega^2 \\[4pt]
\text{ผลบวก} &= 1 + \left(-\frac{1}{2} + \frac{\sqrt{3}}{2}i\right) + \left(-\frac{1}{2} - \frac{\sqrt{3}}{2}i\right) = 0
\end{aligned}""",
         "รากที่ 3 ของ 1 มี 1, omega, omega^2 ซึ่งรวมกันได้ 0"),
        ("ถ้า $\\omega$ เป็นรากที่ 3 ของ 1 ที่ไม่ใช่ 1 จงหาค่าของ $(1 - \\omega)(1 - \\omega^2)$", "$3$"),
        ("จงหารากที่ 4 ทั้งหมดของ $1$", "$1, -1, i, -i$"),
        # Ex2 -> Q3, Q4
        ("จงหาพื้นที่ของรูปหลายเหลี่ยมที่เกิดจากการเชื่อมจุดยอดของรากที่ 4 ของ 16 ในระนาบเชิงซ้อน",
         r"""\begin{aligned}
\text{รัศมี } r &= \sqrt[4]{16} = 2 \implies \text{แนบในวงกลมรัศมี } 2 \\[4pt]
\text{เป็นรูปสี่เหลี่ยมจัตุรัส เส้นทแยงมุมยาว } d &= 2r = 4 \\[4pt]
\text{พื้นที่} &= \frac{1}{2} \times d_1 \times d_2 = \frac{1}{2} \times 4 \times 4 = 8 \text{ ตารางหน่วย}
\end{aligned}""",
         "คิดพื้นที่รูปสี่เหลี่ยมจัตุรัสแนบในวงกลม"),
        ("จงหาพื้นที่รูป 6 เหลี่ยมที่เกิดจากจุดยอดของรากที่ 6 ของ 1", "$\\frac{3\\sqrt{3}}{2}$ ตารางหน่วย"),
        ("ถ้า $\\omega^3 = 1$ และ $\\omega \\neq 1$ จงหาค่าของ $\\frac{1}{1+\\omega} + \\frac{1}{1+\\omega^2}$", "$1$"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $\\omega^{2024} + \\omega^{2025} + \\omega^{2026}$ เมื่อ $\\omega$ เป็นรากที่ 3 ของ 1",
         r"""\begin{aligned}
\omega^{2024} + \omega^{2025} + \omega^{2026} &= \omega^{2024}(1 + \omega + \omega^2) \\[4pt]
&= \omega^{2024}(0) = 0
\end{aligned}""",
         "ดึงตัวร่วมจะได้ (1 + omega + omega^2) ซึ่งเท่ากับ 0"),
        ("จงหาค่าของ $(1 + \\omega)^3$ เมื่อ $\\omega$ เป็นรากที่ 3 ของ 1 ที่ไม่ใช่ 1", "$-1$ (เนื่องจาก $1+\\omega = -\\omega^2$)"),
        ("จงหารากที่ 6 ทั้งหมดของ $1$", "$\\pm 1, \\; \\pm \\frac{1}{2} \\pm \\frac{\\sqrt{3}}{2}i$")
    )

    # =============================================================
    # บทที่ 6: สมการพหุนามและทฤษฎีบทมูลฐานของพีชคณิต (คาบ 21 - 24)
    # =============================================================

    # คาบที่ 21: การแก้สมการกำลังสองที่มีคำตอบเป็นจำนวนเชิงซ้อน
    add(
        "complex-l21", 6, 21,
        "การแก้สมการกำลังสองที่มีคำตอบเป็นจำนวนเชิงซ้อน",
        "การแก้สมการกำลังสอง ax^2 + bx + c = 0 เมื่อ b^2 - 4ac < 0 โดยใช้สูตรกำลังสองและจำนวนจินตภาพ",
        "สูตรคำตอบสมการกำลังสอง",
        r"""\begin{aligned}
ax^2 + bx + c &= 0 \\[4pt]
x &= \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} = \frac{-b \pm i\sqrt{4ac - b^2}}{2a} \quad (\text{เมื่อ } b^2 - 4ac < 0)
\end{aligned}""",
        "เมื่อตัวแปรใต้รูทติดลบ ให้ดึงเครื่องหมายลบออกมาเป็น $i$ ด้านนอก เช่น $\\sqrt{-16} = 4i$",
        # Ex1 -> Q1, Q2
        ("จงแก้สมการ $x^2 + 2x + 5 = 0$",
         r"""\begin{aligned}
a &= 1, \quad b = 2, \quad c = 5 \\[4pt]
b^2 - 4ac &= 2^2 - 4(1)(5) = 4 - 20 = -16 < 0 \\[4pt]
x &= \frac{-2 \pm \sqrt{-16}}{2(1)} = \frac{-2 \pm 4i}{2} = -1 \pm 2i \\[4pt]
\text{คำตอบคือ: } & x = -1 + 2i \text{ หรือ } -1 - 2i
\end{aligned}""",
         "แทนค่าในสูตรกำลังสองแล้วถอดรูทติดลบเป็น i"),
        ("จงแก้สมการ $x^2 - 4x + 13 = 0$", "$x = 2 \pm 3i$"),
        ("จงแก้สมการ $2x^2 + 2x + 5 = 0$", "$x = -\\frac{1}{2} \pm \\frac{3}{2}i$"),
        # Ex2 -> Q3, Q4
        ("จงสร้างสมการกำลังสองที่มีคำตอบเป็น $3 + 2i$ และ $3 - 2i$",
         r"""\begin{aligned}
\text{ผลบวกคำตอบ: } & (3+2i) + (3-2i) = 6 \\[4pt]
\text{ผลคูณคำตอบ: } & (3+2i)(3-2i) = 3^2 + 2^2 = 9 + 4 = 13 \\[4pt]
\text{สมการคือ: } & x^2 - (\text{ผลบวก})x + (\text{ผลคูณ}) = 0 \\[4pt]
& x^2 - 6x + 13 = 0
\end{aligned}""",
         "ใช้รูปแบบ x^2 - (ผลบวก)x + (ผลคูณ) = 0"),
        ("จงหาสมการกำลังสองที่มีรากหนึ่งเป็น $1 - 4i$", "$x^2 - 2x + 17 = 0$"),
        ("จงหาค่า $k$ ที่ทำให้สมการ $x^2 - 6x + k = 0$ มีคำตอบเป็น $3 + i$", "$k = 10$"),
        # Ex3 -> Q5, Q6
        ("จงแก้สมการ $x^2 + 9 = 0$",
         r"""\begin{aligned}
x^2 &= -9 \implies x = \pm\sqrt{-9} = \pm 3i
\end{aligned}""",
         "ย้ายข้างแล้วถอดรูทติดลบ"),
        ("จงแก้สมการ $x^2 + 25 = 0$", "$x = \pm 5i$"),
        ("จงหาผลบวกและผลคูณของคำตอบของสมการ $3x^2 - 4x + 5 = 0$", "ผลบวก $= \\frac{4}{3}$, ผลคูณ $= \\frac{5}{3}$")
    )

    # คาบที่ 22: ทฤษฎีบทมูลฐานของพีชคณิตและทฤษฎีบทรากสังยุค
    add(
        "complex-l22", 6, 22,
        "ทฤษฎีบทมูลฐานของพีชคณิตและทฤษฎีบทรากสังยุค",
        "พหุนามดีกรี n มีรากเชิงซ้อน n ตัว และทฤษฎีบทรากคู่สังยุค (ถ้า a+bi เป็นคำตอบ แล้ว a-bi ต้องเป็นคำตอบด้วย)",
        "ทฤษฎีบทรากคู่สังยุค (Conjugate Root Theorem)",
        r"""\begin{aligned}
\text{ถ้า } P(x) \text{ มีสัมประสิทธิ์เป็นจำนวนจริง และ } & z = a + bi \text{ เป็นรากของ } P(x) = 0 \\[4pt]
\implies & \bar{z} = a - bi \text{ ต้องเป็นรากของ } P(x) = 0 \text{ ด้วย}
\end{aligned}""",
        "คำตอบที่เป็นจำนวนจินตภาพจะมาเป็นคู่สังยุคเสมอ พหุนามดีกรีคี่จึงต้องมีคำตอบเป็นจำนวนจริงอย่างน้อย 1 ตัวแน่นอน",
        # Ex1 -> Q1, Q2
        ("กำหนดพหุนาม $P(x)$ ดีกรี 3 มีสัมประสิทธิ์เป็นจำนวนจริง มีรากสองตัวคือ $2$ และ $1 + 3i$ จงหาพหุนาม $P(x)$",
         r"""\begin{aligned}
\text{เนื่องจากสัมประสิทธิ์เป็นจริง: } & 1 - 3i \text{ ต้องเป็นรากด้วย} \\\\[4pt]
\text{ตัวประกอบจากคู่สังยุค: } & [x - (1+3i)][x - (1-3i)] = (x-1)^2 - (3i)^2 \\\\[3pt]
&= x^2 - 2x + 1 + 9 = x^2 - 2x + 10 \\\\[4pt]
P(x) &= (x - 2)(x^2 - 2x + 10) = x^3 - 2x^2 + 10x - 2x^2 + 4x - 20 \\\\[4pt]
&= x^3 - 4x^2 + 14x - 20
\end{aligned}""",
         "สร้างตัวประกอบจากคู่สังยุคก่อน แล้วคูณกับ (x - 2)"),
        ("ถ้า $2 - i$ เป็นคำตอบหนึ่งของ $x^3 - 5x^2 + 9x - 5 = 0$ จงหาคำตอบที่เหลือ", "$2 + i$ และ $1$"),
        ("จงหาพหุนามดีกรีต่ำสุดที่มีสัมประสิทธิ์เป็นจริงและมีรากคือ $i$ และ $3$", "$x^3 - 3x^2 + x - 3$"),
        # Ex2 -> Q3, Q4
        ("ถ้า $x = 1+i$ เป็นรากของ $x^4 - 2x^3 + 3x^2 - 2x + 2 = 0$ จงหารากทั้งหมด",
         r"""\begin{aligned}
\text{รากคู่สังยุค: } & 1 - i \\\\[3pt]
\text{ตัวประกอบคู่แรก: } & [x-(1+i)][x-(1-i)] = x^2 - 2x + 2 \\\\[4pt]
\text{หารพหุนาม: } & \frac{x^4 - 2x^3 + 3x^2 - 2x + 2}{x^2 - 2x + 2} = x^2 + 1 \\\\[4pt]
x^2 + 1 = 0 &\implies x = \pm i \\\\[4pt]
\therefore \text{รากทั้ง 4 ตัวคือ: } & 1+i, \; 1-i, \; i, \; -i
\end{aligned}""",
         "นำผลคูณคู่สังยุคไปหารพหุนามเดิม เพื่อหารากที่เหลือ"),
        ("จงหารากทั้งหมดของสมการ $x^3 - x^2 + x - 1 = 0$", "$1, i, -i$"),
        ("ถ้า $P(x)$ มีดีกรี 4 และมีรากคือ $2i, 3i$ จงหาพหุนาม $P(x)$", "$x^4 + 13x^2 + 36$"),
        # Ex3 -> Q5, Q6
        ("พหุนามดีกรี 5 ที่มีสัมประสิทธิ์จริง สามารถมีคำตอบเป็นจำนวนจริง 2 ตัวได้หรือไม่",
         r"""\begin{aligned}
\text{ไม่ได้ เพราะคำตอบเชิงซ้อนต้องมาเป็นคู่ (จำนวนคู่ตัว)} \\[4pt]
\text{จำนวนคำตอบจริงที่เป็นไปได้ของดีกรี 5 คือ } 1, 3, \text{ หรือ } 5 \text{ ตัวเท่านั้น}
\end{aligned}""",
         "จำนวนรากที่ไม่ใช่จำนวนจริงต้องเป็นเลขคู่เสมอ"),
        ("พหุนามดีกรี 3 ที่มีสัมประสิทธิ์จริง มีรากจริงได้กี่ตัว", "$1$ หรือ $3$ ตัว"),
        ("ถ้า $a+bi$ เป็นรากของ $x^3 + 1 = 0$ โดย $b > 0$ จงหา $a$ และ $b$", "$a = \\frac{1}{2}, b = \\frac{\\sqrt{3}}{2}$")
    )

    # คาบที่ 23: การแก้สมการพหุนามดีกรีสามและสี่
    add(
        "complex-l23", 6, 23,
        "การแก้สมการพหุนามดีกรีสามและสี่",
        "เทคนิคการหารสังเคราะห์ การแยกตัวประกอบ และการหารากเชิงซ้อนของสมการพหุนามดีกรี 3 และ 4",
        "ขั้นตอนการแก้สมการพหุนาม",
        r"""\begin{aligned}
1. &\text{ หาตัวประกอบตรรกยะ } c = \pm \frac{\text{ตัวประกอบของ } a_0}{\text{ตัวประกอบของ } a_n} \\[4pt]
2. &\text{ ใช้การหารสังเคราะห์ลดทอนดีกรีจนเหลือสมการกำลังสอง} \\[4pt]
3. &\text{ ใช้สูตรกำลังสองหารากเชิงซ้อนที่เหลือ}
\end{aligned}""",
        "ถ้าสุ่มตัวประกอบตรรกยะเจอ 1 ตัว ดีกรี 3 จะยุบเหลือสมการกำลังสองทันที ซึ่งใช้สูตรแก้ได้เสมอ",
        # Ex1 -> Q1, Q2
        ("จงหาคำตอบทั้งหมดของสมการ $x^3 - 3x^2 + 7x - 5 = 0$",
         r"""\begin{aligned}
\text{สุ่มตัวประกอบของ } -5: & P(1) = 1^3 - 3(1)^2 + 7(1) - 5 = 0 \implies x = 1 \text{ เป็นคำตอบ} \\\\[4pt]
\text{หารสังเคราะห์ด้วย } 1: & 1 \mid 1 \quad -3 \quad 7 \quad -5 \\\\[2pt]
& \downarrow \quad 1 \quad -2 \quad 5 \\\\[2pt]
& 1 \quad -2 \quad 5 \quad 0 \implies x^2 - 2x + 5 = 0 \\\\[4pt]
x &= \frac{2 \pm \sqrt{(-2)^2 - 4(1)(5)}}{2} = \frac{2 \pm \sqrt{-16}}{2} = 1 \pm 2i \\\\[4pt]
\therefore \text{เซตคำตอบคือ: } & \{1, \; 1+2i, \; 1-2i\}
\end{aligned}""",
         "สุ่มเจอ x = 1 แล้วหารสังเคราะห์เหลือสมการกำลังสอง"),
        ("จงแก้สมการ $x^3 - 2x^2 + 4x - 8 = 0$", "$x = 2, \pm 2i$"),
        ("จงแก้สมการ $x^3 + x^2 + 4x + 4 = 0$", "$x = -1, \pm 2i$"),
        # Ex2 -> Q3, Q4
        ("จงหาคำตอบทั้งหมดของสมการ $x^4 - 16 = 0$",
         r"""\begin{aligned}
(x^2 - 4)(x^2 + 4) &= 0 \\\\[4pt]
x^2 - 4 = 0 &\implies x = \pm 2 \\\\[4pt]
x^2 + 4 = 0 &\implies x = \pm 2i \\\\[4pt]
\text{คำตอบคือ: } & x = 2, -2, 2i, -2i
\end{aligned}""",
         "แยกตัวประกอบด้วยผลต่างกำลังสองสองชั้น"),
        ("จงแก้สมการ $x^4 + 5x^2 - 36 = 0$", "$x = \pm 2, \pm 3i$"),
        ("จงแก้สมการ $x^4 - 1 = 0$", "$x = \pm 1, \pm i$"),
        # Ex3 -> Q5, Q6
        ("จงแก้สมการ $x^4 - 2x^3 - x^2 + 2x = 0$",
         r"""\begin{aligned}
x(x^3 - 2x^2 - x + 2) &= 0 \\[4pt]
x[x^2(x - 2) - 1(x - 2)] &= 0 \\[4pt]
x(x - 2)(x^2 - 1) &= 0 \implies x(x - 2)(x - 1)(x + 1) = 0 \\[4pt]
x &= 0, 1, -1, 2
\end{aligned}""",
         "ดึงตัวร่วม x แล้วจับคู่แยกตัวประกอบ"),
        ("จงหาผลบวกของรากทั้งหมดของสมการ $x^3 - 6x^2 + 11x - 6 = 0$", "$6$"),
        ("จงแก้สมการ $x^3 - 8 = 0$", "$x = 2, -1 \pm \sqrt{3}i$")
    )

    # คาบที่ 24: ตะลุยโจทย์ประยุกต์และแนวข้อสอบเข้ามหาวิทยาลัย (สสวท. / A-Level)
    add(
        "complex-l24", 6, 24,
        "ตะลุยโจทย์ประยุกต์และแนวข้อสอบเข้ามหาวิทยาลัย (สสวท. / A-Level)",
        "โจทย์ประยุกต์แบบบูรณาการข้อสอบ A-Level คณิตประยุกต์ 1 รวมสมบัติสังยุค ค่าสัมบูรณ์ เดอมัวร์ และสมการพหุนาม",
        "เทคนิคทำโจทย์ข้อสอบแข่งขัน A-Level",
        r"""\begin{aligned}
1. & \text{ ถ้าโจทย์ติด } z \text{ และ } \bar{z} \text{ ปนกัน ให้สมมุติ } z = a + bi \text{ แล้วเทียบสัมประสิทธิ์} \\[4pt]
2. & \text{ ถ้าโจทย์ถามขนาด } |z| \text{ ให้พยายามใช้สมบัติ } |z|^2 = z\bar{z} \text{ หรือแจกค่าสัมบูรณ์} \\[4pt]
3. & \text{ ข้อสอบที่ถามเลขยกกำลังสูง ให้รีบแปลงเป็นเชิงขั้ว } r\,\text{cis}\,\theta
\end{aligned}""",
        "ข้อสอบชอบออกโจทย์ที่มี $|z| = 1$ ซึ่งมีสมบัติพิเศษสุดเจ๋งคือ $\\bar{z} = \\frac{1}{z}$ นำไปแทนค่าได้ทันที",
        # Ex1 -> Q1, Q2
        ("กำหนด $z$ เป็นจำนวนเชิงซ้อนที่สอดคล้องกับ $2z + 3\\bar{z} = 5 + 2i$ จงหาค่าของ $|z|^2$",
         r"""\begin{aligned}
\text{ให้ } z = a + bi \implies \bar{z} = a - bi \\\\[4pt]
2(a + bi) + 3(a - bi) &= 5 + 2i \\\\[4pt]
(2a + 3a) + (2b - 3b)i &= 5 + 2i \implies 5a - bi = 5 + 2i \\\\[4pt]
\text{เทียบส่วนจริง: } 5a = 5 &\implies a = 1 \\\\[3pt]
\text{เทียบส่วนจินตภาพ: } -b = 2 &\implies b = -2 \\\\[4pt]
z = 1 - 2i \implies |z|^2 &= a^2 + b^2 = 1^2 + (-2)^2 = 1 + 4 = 5
\end{aligned}""",
         "สมมุติ z = a + bi แล้วแก้ระบบสมการหา a, b"),
        ("ถ้า $z + 2\\bar{z} = 9 - 3i$ จงหาจำนวนเชิงซ้อน $z$", "$z = 3 + 3i$"),
        ("กำหนด $z$ สอดคล้องกับ $|z| - z = 2 + i$ จงหาค่าของ $|z|^2$", "$\\frac{25}{16}$"),
        # Ex2 -> Q3, Q4
        ("กำหนดให้ $z$ เป็นจำนวนเชิงซ้อนซึ่ง $|z| = 1$ จงแสดงว่า $\\left|z + \\frac{1}{z}\\right| = |z + \\bar{z}| = 2|\\text{Re}(z)|$",
         r"""\begin{aligned}
|z| = 1 &\implies |z|^2 = z\\bar{z} = 1 \implies \\frac{1}{z} = \\bar{z} \\\\[4pt]
\\left|z + \\frac{1}{z}\\right| &= |z + \\bar{z}| = |2\\text{Re}(z)| = 2|\\text{Re}(z)|
\end{aligned}""",
         "ใช้สมบัติ 1/z = z-bar เมื่อ |z| = 1"),
        ("ถ้า $|z| = 1$ และ $z \\neq 1$ จงแสดงว่า $\\frac{z-1}{z+1}$ เป็นจำนวนจินตภาพแท้", "เป็นจำนวนจินตภาพแท้"),
        ("ถ้า $z_1, z_2$ สอดคล้องกับ $|z_1| = |z_2| = 1$ และ $z_1 + z_2 = 1$ จงหา $|z_1 - z_2|$", "$\\sqrt{3}$"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $\\left(\\frac{1+\\sqrt{3}i}{2}\\right)^{2024} + \\left(\\frac{1-\\sqrt{3}i}{2}\\right)^{2024}$",
         r"""\begin{aligned}
z_1 &= \\text{cis}(60^\\circ) \implies z_1^6 = \\text{cis}(360^\\circ) = 1 \\\\[4pt]
2024 \\div 6 &= 337 \\text{ เศษ } 2 \\\\[4pt]
z_1^{2024} &= z_1^2 = \\text{cis}(120^\\circ) = -\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i \\\\[4pt]
z_2^{2024} &= (\\bar{z_1})^{2024} = \\overline{z_1^{2024}} = -\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i \\\\[4pt]
\\text{ผลรวม} &= \\left(-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right) + \\left(-\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i\\right) = -1
\end{aligned}""",
         "ใช้สมบัติ z^6 = 1 คิดเฉพาะเศษ 2 พจน์"),
        ("ถ้า $z^2 + z + 1 = 0$ จงหาค่าของ $z^{99} + \\frac{1}{z^{99}}$", "$2$"),
        ("กำหนด $z = \\cos 36^\\circ + i\\sin 36^\\circ$ จงหาค่าของ $z^5 + \\frac{1}{z^5}$", "$-2$")
    )
