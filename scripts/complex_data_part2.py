# -*- coding: utf-8 -*-
"""
Complex Numbers (จำนวนเชิงซ้อน ม.5) - Part 2
Chapters 3 & 4: คาบที่ 9 ถึง 16
"""

def register_complex_part2(lessons_dict):
    def add(lid, chap_num, p_num, title, desc, f_title, formulas, tip, ex1, q1, q2, ex2, q3, q4, ex3, q5, q6):
        concept_html = f"""<div class="sheet-formula-box">
  <div style="font-weight: 600; color: #1e3a8a; margin-bottom: 0.35rem;">📌 {f_title}</div>
  <div class="equation-stage">
    {formulas}
  </div>
  <div style="font-size: 0.88rem; color: #475569; margin-top: 0.25rem;">
    💡 <strong>เทคนิคคิดเร็ว:</strong> {tip}
  </div>
</div>"""

        ex_list = [
            {"title": f"ตัวอย่างที่ 1. (ครูสาธิตวิธีทำ) {ex1[0]}", "points": "", "latex": ex1[1], "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex1[2]})"},
            {"title": f"ข้อที่ 1. {q1[0]}", "answer": q1[1], "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 2. {q2[0]}", "answer": q2[1], "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ตัวอย่างที่ 2. (ครูสาธิตวิธีทำ) {ex2[0]}", "points": "", "latex": ex2[1], "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex2[2]})"},
            {"title": f"ข้อที่ 3. {q3[0]}", "answer": q3[1], "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 4. {q4[0]}", "answer": q4[1], "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ตัวอย่างที่ 3. (ครูสาธิตวิธีทำ) {ex3[0]}", "points": "", "latex": ex3[1], "placeholder": f"(วิธีทำตามเฉลยด้านบน: {ex3[2]})"},
            {"title": f"ข้อที่ 5. {q5[0]}", "answer": q5[1], "points": "", "latex": "", "answerType": "handwriting-normal", "placeholder": ""},
            {"title": f"ข้อที่ 6. {q6[0]}", "answer": q6[1], "points": "", "latex": "", "answerType": "handwriting-large", "placeholder": ""}
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
    # บทที่ 3: กราฟ ระนาบเชิงซ้อน และค่าสัมบูรณ์ (คาบ 9 - 12)
    # =============================================================

    # คาบที่ 9: ระนาบเชิงซ้อน (Argand Plane) และเวกเตอร์
    add(
        "complex-l09", 3, 9,
        "ระนาบเชิงซ้อน (Argand Plane) และเวกเตอร์",
        "การแทนจำนวนเชิงซ้อนด้วยจุดและเวกเตอร์ในระนาบเชิงซ้อน (แกนจริงและแกนจินตภาพ)",
        "ระนาบเชิงซ้อน (Argand Plane)",
        r"""\begin{aligned}
z = a + bi &\longleftrightarrow \text{จุด } (a, b) \quad \text{หรือเวกเตอร์ที่มีจุดเริ่มต้นที่ } (0,0) \\[4pt]
\text{แกน X} &= \text{แกนจริง (Real Axis)}, \quad \text{แกน Y} = \text{แกนจินตภาพ (Imaginary Axis)}
\end{aligned}""",
        "การบวกและลบจำนวนเชิงซ้อนสอดคล้องกับการบวกและลบเวกเตอร์ (กฎรูปสี่เหลี่ยมด้านขนาน)",
        # Ex1 -> Q1, Q2
        ("จงเขียนจุดที่แทนจำนวนเชิงซ้อน $z_1 = 3 + 2i$, $z_2 = -4 + i$, $z_3 = -2 - 3i$, $z_4 = 4 - 2i$ และระบุจตุภาค",
         r"""\begin{aligned}
z_1 = 3 + 2i &\longleftrightarrow (3, 2) \quad (\text{จตุภาคที่ 1}) \\[3pt]
z_2 = -4 + i &\longleftrightarrow (-4, 1) \quad (\text{จตุภาคที่ 2}) \\[3pt]
z_3 = -2 - 3i &\longleftrightarrow (-2, -3) \quad (\text{จตุภาคที่ 3}) \\[3pt]
z_4 = 4 - 2i &\longleftrightarrow (4, -2) \quad (\text{จตุภาคที่ 4})
\end{aligned}""",
         "พล็อตจุดโดยให้ส่วนจริงอยู่บนแกน X และส่วนจินตภาพอยู่บนแกน Y"),
        ("จงหาคู่อันดับที่แทน $z = 5 - 8i$ และ $\\bar{z}$", "$(5, -8)$ และ $(5, 8)$"),
        ("จุดที่แทน $z$ และ $-z$ สมมาตรกันเทียบกับจุดใดในระนาบเชิงซ้อน", "จุดกำเนิด $(0, 0)$"),
        # Ex2 -> Q3, Q4
        ("กำหนดเวกเตอร์ $\\vec{u}$ แทน $3+i$ และ $\\vec{v}$ แทน $1+4i$ จงหาเวกเตอร์ผลบวก $\\vec{u} + \\vec{v}$ และ $\\vec{u} - \\vec{v}$",
         r"""\begin{aligned}
\vec{u} + \vec{v} &\longleftrightarrow (3+1) + (1+4)i = 4 + 5i \quad (\text{จุด } (4, 5)) \\[4pt]
\vec{u} - \vec{v} &\longleftrightarrow (3-1) + (1-4)i = 2 - 3i \quad (\text{จุด } (2, -3))
\end{aligned}""",
         "บวกและลบพิกัดตามหลักการเวกเตอร์"),
        ("กำหนด $z_1 = 2+3i$ และ $z_2 = 4-i$ จงหาจุดกึ่งกลางระหว่าง $z_1$ และ $z_2$", "$(3, 1)$ หรือ $3 + i$"),
        ("ถ้าเวกเตอร์แทน $z$ หมุนทวนเข็มนาฬิกาไป $90^\\circ$ จะได้จำนวนเชิงซ้อนใด", "$zi$"),
        # Ex3 -> Q5, Q6
        ("จงหาความชันของส่วนของเส้นตรงที่เชื่อมระหว่างจุดกำเนิดกับจุดที่แทน $z = 4 + 3i$",
         r"""\begin{aligned}
m = \frac{\Delta y}{\Delta x} = \frac{3 - 0}{4 - 0} = \frac{3}{4} = 0.75
\end{aligned}""",
         "ความชันคิดจาก ส่วนจินตภาพ หารด้วย ส่วนจริง"),
        ("จงหาความชันของเส้นตรงที่เชื่อมระหว่าง $z_1 = 1 + 2i$ และ $z_2 = 4 + 8i$", "$2$"),
        ("จุดยอดสามเหลี่ยมอยู่ที่ $0$, $4$ และ $3i$ จงหาพื้นที่ของรูปสามเหลี่ยมนี้", "$6$ ตารางหน่วย")
    )

    # คาบที่ 10: นิยามค่าสัมบูรณ์ของจำนวนเชิงซ้อน (Modulus)
    add(
        "complex-l10", 3, 10,
        "นิยามค่าสัมบูรณ์ของจำนวนเชิงซ้อน (Modulus)",
        "นิยามค่าสัมบูรณ์ |z| = sqrt(a^2 + b^2) แทนระยะทางจากจุดกำเนิดถึงจุด z ในระนาบเชิงซ้อน",
        "นิยามค่าสัมบูรณ์ $|z|$",
        r"""\begin{aligned}
\text{ถ้า } z &= a + bi \implies |z| = \sqrt{a^2 + b^2} \\[4pt]
|z|^2 &= z \cdot \bar{z} = a^2 + b^2
\end{aligned}""",
        "$|z|$ คือระยะทางจริงจาก $(0,0)$ ถึง $(a,b)$ เสมอ จึงมีค่าเป็นจำนวนจริงบวกหรือศูนย์ ($|z| \\ge 0$) ไม่มีทางติดลบหรือมี $i$",
        # Ex1 -> Q1, Q2
        ("จงหาค่าสัมบูรณ์ของ $z_1 = 3 + 4i$, $z_2 = 5 - 12i$, $z_3 = 1 - i$",
         r"""\begin{aligned}
|z_1| &= \sqrt{3^2 + 4^2} = \sqrt{9 + 16} = \sqrt{25} = 5 \\[4pt]
|z_2| &= \sqrt{5^2 + (-12)^2} = \sqrt{25 + 144} = \sqrt{169} = 13 \\[4pt]
|z_3| &= \sqrt{1^2 + (-1)^2} = \sqrt{1 + 1} = \sqrt{2}
\end{aligned}""",
         "ใช้ทฤษฎีบทพีทาโกรัส sqrt(a^2 + b^2)"),
        ("จงหาค่าสัมบูรณ์ของ $z = -8 + 15i$", "$17$"),
        ("จงหาค่าสัมบูรณ์ของ $z = \\sqrt{7} - 3i$", "$4$"),
        # Ex2 -> Q3, Q4
        ("จงหาระยะห่างระหว่างจำนวนเชิงซ้อน $z_1 = 2 + 5i$ และ $z_2 = 5 + i$",
         r"""\begin{aligned}
d &= |z_1 - z_2| = |(2 - 5) + (5 - 1)i| \\[4pt]
&= |-3 + 4i| = \sqrt{(-3)^2 + 4^2} = \sqrt{25} = 5
\end{aligned}""",
         "ระยะห่างระหว่างจุดสองจุดคิดจาก |z1 - z2|"),
        ("จงหาระยะห่างระหว่าง $z_1 = -1 + 3i$ และ $z_2 = 2 - i$", "$5$"),
        ("จงหาค่าสัมบูรณ์ของ $z = \\frac{1}{\\sqrt{2}} + \\frac{1}{\\sqrt{2}}i$", "$1$"),
        # Ex3 -> Q5, Q6
        ("กำหนดให้ $|z| = 10$ และ $\\text{Re}(z) = 6$ จงหา $\\text{Im}(z)$",
         r"""\begin{aligned}
|z|^2 &= a^2 + b^2 \implies 10^2 = 6^2 + b^2 \\[4pt]
100 &= 36 + b^2 \implies b^2 = 64 \implies b = \pm 8 \\[4pt]
\therefore \text{Im}(z) &= 8 \text{ หรือ } -8
\end{aligned}""",
         "แก้สมการ a^2 + b^2 = |z|^2"),
        ("กำหนด $|z| = 5$ และ $\\text{Im}(z) = -3$ โดย $\\text{Re}(z) > 0$ จงหา $z$", "$z = 4 - 3i$"),
        ("จงหาค่าสัมบูรณ์ของ $z = (2 + i)^2$", "$5$")
    )

    # คาบที่ 11: สมบัติสำคัญของค่าสัมบูรณ์และการคำนวณทางลัด
    add(
        "complex-l11", 3, 11,
        "สมบัติสำคัญของค่าสัมบูรณ์และการคำนวณทางลัด",
        "สมบัติการกระจายค่าสัมบูรณ์ในผลคูณ ผลหาร เลขยกกำลัง |z1*z2| = |z1|*|z2| และอสมการสามเหลี่ยม",
        "สมบัติเด่นของค่าสัมบูรณ์",
        r"""\begin{aligned}
|z| &= |\bar{z}| = |-z|, \quad |z|^2 = z\bar{z} \\[4pt]
|z_1 z_2| &= |z_1||z_2|, \quad \left|\frac{z_1}{z_2}\right| = \frac{|z_1|}{|z_2|}, \quad |z^n| = |z|^n \\[4pt]
|z_1 + z_2| &\le |z_1| + |z_2| \quad (\text{อสมการสามเหลี่ยม})
\end{aligned}""",
        "ข้อสอบชอบออกโจทย์ยกกำลังเยอะๆ ห้ามคูณตรงเด็ดขาด! ให้แจก $|\\cdot|$ เข้าไปในแต่ละตัว แล้วคิดตัวเลขยกกำลัง",
        # Ex1 -> Q1, Q2
        ("จงหาค่าของ $\\left|\\frac{(1 + i)^8 (3 - 4i)^3}{(2 - 2\\sqrt{3}i)^2}\\right|$",
         r"""\begin{aligned}
|1 + i| &= \sqrt{1^2+1^2} = \sqrt{2} \implies |1+i|^8 = (\\sqrt{2})^8 = 16 \\\\[3pt]
|3 - 4i| &= \sqrt{3^2+(-4)^2} = 5 \implies |3-4i|^3 = 5^3 = 125 \\\\[3pt]
|2 - 2\sqrt{3}i| &= \sqrt{2^2+(-2\sqrt{3})^2} = \sqrt{4+12} = 4 \implies 4^2 = 16 \\\\[4pt]
\text{ผลลัพธ์} &= \frac{16 \cdot 125}{16} = 125
\end{aligned}""",
         "แจกค่าสัมบูรณ์เข้าไปทีละก้อนแล้วคิดเลข"),
        ("จงหาค่าของ $|(2 + 2i)^4 (1 - \\sqrt{3}i)^3|$", "$512$"),
        ("จงหาค่าของ $\\left|\\frac{(3 + \\sqrt{7}i)^4}{(1 - i)^6}\\right|$", "$32$"),
        # Ex2 -> Q3, Q4
        ("ถ้า $z(2 - i) = 3 + 4i$ จงหาค่าของ $|z|$",
         r"""\begin{aligned}
|z(2 - i)| &= |3 + 4i| \implies |z| \cdot |2 - i| = |3 + 4i| \\[4pt]
|z| \cdot \sqrt{2^2+(-1)^2} &= \sqrt{3^2+4^2} \implies |z| \cdot \sqrt{5} = 5 \\[4pt]
|z| &= \frac{5}{\sqrt{5}} = \sqrt{5}
\end{aligned}""",
         "ใส่ค่าสัมบูรณ์ทั้งสองข้างของสมการ"),
        ("ถ้า $(1 + 2i)z = 4 - 3i$ จงหาค่าของ $|z|$", "$\\sqrt{5}$"),
        ("กำหนด $|z_1| = 3$ และ $|z_2| = 4$ จงหาค่าสูงสุดที่เป็นไปได้ของ $|z_1 + z_2|$", "$7$ (ตามอสมการสามเหลี่ยม)"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $|z|$ เมื่อ $z = \\frac{(2+i)^2}{(1-2i)^3}$",
         r"""\begin{aligned}
|2+i| &= \sqrt{2^2+1^2} = \sqrt{5} \implies |2+i|^2 = 5 \\[4pt]
|1-2i| &= \sqrt{1^2+(-2)^2} = \sqrt{5} \implies |1-2i|^3 = 5\sqrt{5} \\[4pt]
|z| &= \frac{5}{5\sqrt{5}} = \frac{1}{\sqrt{5}} = \frac{\sqrt{5}}{5}
\end{aligned}""",
         "คำนวณขนาดแยกเศษและส่วน"),
        ("จงหาค่าของ $|(1+i)^{20}|$", "$1024$"),
        ("ถ้า $z \\bar{z} = 36$ จงหาค่าของ $|z|$", "$6$")
    )

    # คาบที่ 12: กราฟและเซตของจุดในระนาบเชิงซ้อน (Locus)
    add(
        "complex-l12", 3, 12,
        "กราฟและเซตของจุดในระนาบเชิงซ้อน (Locus)",
        "สมการทางเรขาคณิตของเซตของจุดในระนาบเชิงซ้อน เช่น สมการวงกลม |z - z0| = r และเส้นตรงแบ่งครึ่งตั้งฉาก",
        "เซตของจุดในระนาบเชิงซ้อน",
        r"""\begin{aligned}
|z - z_0| &= r \longleftrightarrow \text{วงกลมที่มีจุดศูนย์กลางที่ } z_0 \text{ และรัศมี } r \\[4pt]
|z - z_1| &= |z - z_2| \longleftrightarrow \text{เส้นตรงแบ่งครึ่งและตั้งฉากกับส่วนของเส้นตรงเชื่อม } z_1, z_2
\end{aligned}""",
        "แทน $z = x + yi$ เพื่อแปลงสมการเชิงซ้อนกลับเป็นสมการพิกัดฉาก $x, y$ ทางเรขาคณิตวิเคราะห์",
        # Ex1 -> Q1, Q2
        ("จงหาสมการในพิกัดฉากและอธิบายลักษณะกราฟของ $|z - (2 + 3i)| = 4$",
         r"""\begin{aligned}
\text{ให้ } z = x + yi: & |(x + yi) - (2 + 3i)| = 4 \\[4pt]
& |(x - 2) + (y - 3)i| = 4 \\[4pt]
& \sqrt{(x - 2)^2 + (y - 3)^2} = 4 \\[4pt]
& (x - 2)^2 + (y - 3)^2 = 16
\end{aligned}""",
         "เป็นสมการวงกลม จุดศูนย์กลางอยู่ที่ (2, 3) รัศมียาว 4 หน่วย"),
        ("จงหาจุดศูนย์กลางและรัศมีของวงกลม $|z + 4 - i| = 5$", "ศูนย์กลาง $(-4, 1)$ รัศมี $5$"),
        ("จงเขียนสมการเชิงซ้อนของวงกลมที่มีจุดศูนย์กลางที่ $1 - 2i$ และรัศมี $3$", "$|z - (1 - 2i)| = 3$"),
        # Ex2 -> Q3, Q4
        ("จงหาสมการเส้นตรงที่เป็นเซตของจุดที่สอดคล้องกับ $|z - 2| = |z - 4i|$",
         r"""\begin{aligned}
\text{ให้ } z = x + yi: & |(x - 2) + yi| = |x + (y - 4)i| \\[4pt]
& (x - 2)^2 + y^2 = x^2 + (y - 4)^2 \\[4pt]
& x^2 - 4x + 4 + y^2 = x^2 + y^2 - 8y + 16 \\[4pt]
& -4x + 8y - 12 = 0 \implies x - 2y + 3 = 0
\end{aligned}""",
         "ยกกำลังสองทั้งสองข้าง ตัด x^2, y^2 แล้วจัดรูปเส้นตรง"),
        ("จงหาสมการเส้นตรงจากเงื่อนไข $|z - 1| = |z + 1|$", "$x = 0$ (แกน Y)"),
        ("จงอธิบายลักษณะกราฟของอสมการ $|z - 1| \\le 2$", "บริเวณภายในและบนเส้นรอบวงกลม ศูนย์กลาง $(1,0)$ รัศมี $2$"),
        # Ex3 -> Q5, Q6
        ("กำหนด $|z - 3i| = 2$ จงหาค่าสูงสุดและต่ำสุดของ $|z|$",
         r"""\begin{aligned}
z_0 &= 3i \implies |z_0| = 3, \quad r = 2 \\[4pt]
\text{ค่าสูงสุด} &= |z_0| + r = 3 + 2 = 5 \\[4pt]
\text{ค่าต่ำสุด} &= |z_0| - r = 3 - 2 = 1
\end{aligned}""",
         "ระยะจากจุดกำเนิดถึงวงกลม ค่าสูงสุด = d + r, ค่าต่ำสุด = d - r"),
        ("กำหนด $|z - (4 + 3i)| = 2$ จงหาค่าสูงสุดของ $|z|$", "$7$ (เนื่องจาก $|4+3i| = 5$ รวม $2$)"),
        ("กำหนด $|z - 2| = 1$ จงหาค่าต่ำสุดของ $|z|$", "$1$")
    )

    # =============================================================
    # บทที่ 4: รูปเชิงขั้วของจำนวนเชิงซ้อน (คาบ 13 - 16)
    # =============================================================

    # คาบที่ 13: รูปเชิงขั้วของจำนวนเชิงซ้อนและอาร์กิวเมนต์
    add(
        "complex-l13", 4, 13,
        "รูปเชิงขั้วของจำนวนเชิงซ้อน (Polar Form) และอาร์กิวเมนต์",
        "การแปลง z = a + bi ให้อยู่ในรูปเชิงขั้ว r(cos theta + i sin theta) หรือ r cis theta และการหามุมอาร์กิวเมนต์",
        "รูปเชิงขั้ว (Polar Form)",
        r"""\begin{aligned}
z &= r(\cos\theta + i\sin\theta) = r\,\text{cis}\,\theta \\[4pt]
r &= |z| = \sqrt{a^2 + b^2} \ge 0, \quad \tan\theta = \frac{b}{a}
\end{aligned}""",
        "ต้องระวังจตุภาคของ $(a, b)$ เสมอในการหามุม $\\theta$ (เช่น Q2: $\\pi - \\alpha$, Q3: $\\pi + \\alpha$, Q4: $2\\pi - \\alpha$)",
        # Ex1 -> Q1, Q2
        ("จงเขียน $z = 1 + \\sqrt{3}i$ ในรูปเชิงขั้ว",
         r"""\begin{aligned}
r &= \sqrt{1^2 + (\\sqrt{3})^2} = \sqrt{1 + 3} = 2 \\\\[4pt]
(a, b) &= (1, \\sqrt{3}) \\in Q1 \\implies \\tan\\theta = \\frac{\\sqrt{3}}{1} \\implies \\theta = \\frac{\\pi}{3} \\; (60^\\circ) \\\\[4pt]
z &= 2\\left(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}\\right)
\\end{aligned}""",
         "หา r จากขนาด และหามุมจาก tan โดยดูจตุภาคประกอบ"),
        ("จงเขียน $z = -1 + i$ ในรูปเชิงขั้ว", "$\\sqrt{2}\\left(\\cos\\frac{3\\pi}{4} + i\\sin\\frac{3\\pi}{4}\\right)$"),
        ("จงเขียน $z = -\\sqrt{3} - i$ ในรูปเชิงขั้ว", "$2\\left(\\cos\\frac{7\\pi}{6} + i\\sin\\frac{7\\pi}{6}\\right)$"),
        # Ex2 -> Q3, Q4
        ("จงแปลง $z = 4\\left(\\cos\\frac{5\\pi}{6} + i\\sin\\frac{5\\pi}{6}\\right)$ ให้อยู่ในรูป $a + bi$",
         r"""\begin{aligned}
\\cos\\frac{5\\pi}{6} &= -\\frac{\\sqrt{3}}{2}, \\quad \\sin\\frac{5\\pi}{6} = \\frac{1}{2} \\\\[4pt]
z &= 4\\left(-\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i\\right) = -2\\sqrt{3} + 2i
\\end{aligned}""",
         "แทนค่า cos และ sin ตามมุม แล้วคูณ r กระจายเข้าไป"),
        ("จงแปลง $z = 2\\left(\\cos\\frac{7\\pi}{4} + i\\sin\\frac{7\\pi}{4}\\right)$ ในรูป $a+bi$", "$\\sqrt{2} - \\sqrt{2}i$"),
        ("จงเขียน $z = -5$ ในรูปเชิงขั้ว", "$5(\\cos\\pi + i\\sin\\pi)$"),
        # Ex3 -> Q5, Q6
        ("จงหาอาร์กิวเมนต์หลัก $\\text{Arg}(z)$ เมื่อ $z = 2 - 2i$",
         r"""\begin{aligned}
r &= \\sqrt{2^2+(-2)^2} = 2\\sqrt{2} \\\\[4pt]
(2, -2) &\\in Q4 \\implies \\theta = 2\\pi - \\frac{\\pi}{4} = \\frac{7\\pi}{4} \\; (\\text{หรือ } -\\frac{\\pi}{4})
\\end{aligned}""",
         "จุดอยู่ในจตุภาคที่ 4 มุมเท่ากับ 7pi/4"),
        ("จงเขียน $z = 4i$ ในรูปเชิงขั้ว", "$4\\left(\\cos\\frac{\\pi}{2} + i\\sin\\frac{\\pi}{2}\\right)$"),
        ("จงหาอาร์กิวเมนต์ของ $z = -3i$", "$\\frac{3\\pi}{2}$ หรือ $-\\frac{\\pi}{2}$")
    )

    # คาบที่ 14: การคูณและการหารในรูปเชิงขั้ว
    add(
        "complex-l14", 4, 14,
        "การคูณและการหารในรูปเชิงขั้ว",
        "ทฤษฎีบทการคูณและการหารรูปเชิงขั้ว รัศมีคูณ/หารกัน แต่มุมนำมาบวก/ลบกัน",
        "สูตรคูณและหารรูปเชิงขั้ว",
        r"""\begin{aligned}
z_1 z_2 &= r_1 r_2 [\\cos(\\theta_1 + \\theta_2) + i\\sin(\\theta_1 + \\theta_2)] \\\\[4pt]
\\frac{z_1}{z_2} &= \\frac{r_1}{r_2} [\\cos(\\theta_1 - \\theta_2) + i\\sin(\\theta_1 - \\theta_2)]
\\end{aligned}""",
        "คูณกัน ➔ รัศมีคูณกัน มุมบวกกัน | หารกัน ➔ รัศมีหารกัน มุมลบกัน (คิดเลขไวกว่ารูปพีชคณิตมหาศาล)",
        # Ex1 -> Q1, Q2
        ("กำหนด $z_1 = 2(\\cos 40^\\circ + i\\sin 40^\\circ)$ และ $z_2 = 3(\\cos 20^\\circ + i\\sin 20^\\circ)$ จงหา $z_1 z_2$",
         r"""\begin{aligned}
z_1 z_2 &= (2 \\cdot 3)[\\cos(40^\\circ + 20^\\circ) + i\\sin(40^\\circ + 20^\\circ)] \\\\[4pt]
&= 6(\\cos 60^\\circ + i\\sin 60^\\circ) \\\\[4pt]
&= 6\\left(\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right) = 3 + 3\\sqrt{3}i
\\end{aligned}""",
         "นำ r คูณกัน แล้วนำมุมมาบวกกัน 40 + 20 = 60 องศา"),
        ("จงหาผลคูณ $4(\\cos 15^\\circ + i\\sin 15^\\circ) \\cdot 2(\\cos 30^\\circ + i\\sin 30^\\circ)$", "$4\\sqrt{2} + 4\\sqrt{2}i$"),
        ("จงหาค่าของ $\\frac{6(\\cos 75^\\circ + i\\sin 75^\\circ)}{2(\\cos 30^\\circ + i\\sin 30^\\circ)}$", "$\\frac{3\\sqrt{2}}{2} + \\frac{3\\sqrt{2}}{2}i$"),
        # Ex2 -> Q3, Q4
        ("จงหาค่าของ $\\frac{z_1}{z_2}$ เมื่อ $z_1 = 8(\\cos 130^\\circ + i\\sin 130^\\circ)$ และ $z_2 = 4(\\cos 40^\\circ + i\\sin 40^\\circ)$",
         r"""\begin{aligned}
\\frac{z_1}{z_2} &= \\frac{8}{4}[\\cos(130^\\circ - 40^\\circ) + i\\sin(130^\\circ - 40^\\circ)] \\\\[4pt]
&= 2(\\cos 90^\\circ + i\\sin 90^\\circ) \\\\[4pt]
&= 2(0 + 1i) = 2i
\\end{aligned}""",
         "นำ r หารกัน และนำมุมมาลบกัน"),
        ("จงหาผลคูณ $z_1 z_2$ เมื่อ $z_1 = \\sqrt{2}\\text{cis}(50^\\circ)$ และ $z_2 = \\sqrt{8}\\text{cis}(70^\\circ)$", "$-2 + 2\\sqrt{3}i$"),
        ("จงหาค่าของ $\\frac{12\\text{cis}(250^\\circ)}{3\\text{cis}(70^\\circ)}$", "$-4$"),
        # Ex3 -> Q5, Q6
        ("จงหาค่าของ $(1+i)(\\sqrt{3}+i)$ โดยใช้รูปเชิงขั้ว",
         r"""\begin{aligned}
1+i &= \\sqrt{2}\\text{cis}(45^\\circ), \\quad \\sqrt{3}+i = 2\\text{cis}(30^\\circ) \\\\[4pt]
(1+i)(\\sqrt{3}+i) &= 2\\sqrt{2}\\text{cis}(45^\\circ + 30^\\circ) = 2\\sqrt{2}\\text{cis}(75^\\circ)
\\end{aligned}""",
         "แปลงเป็นเชิงขั้วก่อนแล้วนำมุมมาบวกกัน"),
        ("จงหาอาร์กิวเมนต์ของ $z_1 z_2$ ถ้า $\\text{Arg}(z_1) = 80^\\circ$ และ $\\text{Arg}(z_2) = 55^\\circ$", "$135^\\circ$"),
        ("จงหาค่าของ $\\frac{\\text{cis}(100^\\circ) \\cdot \\text{cis}(50^\\circ)}{\\text{cis}(30^\\circ)}$", "$-\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i$")
    )

    # คาบที่ 15: สังยุคและตัวผกผันในรูปเชิงขั้ว
    add(
        "complex-l15", 4, 15,
        "สังยุคและตัวผกผันในรูปเชิงขั้ว",
        "การหาสังยุค z-bar และตัวผกผันการคูณ z^-1 ในรูปเชิงขั้วโดยการกลับเครื่องหมายของมุม theta เป็น -theta",
        "สังยุคและตัวผกผันในรูปเชิงขั้ว",
        r"""\begin{aligned}
\text{ถ้า } z &= r(\\cos\\theta + i\\sin\\theta) \\\\[4pt]
\\bar{z} &= r(\\cos(-\\theta) + i\\sin(-\\theta)) = r(\\cos\\theta - i\\sin\\theta) \\\\[4pt]
z^{-1} &= \\frac{1}{r}(\\cos(-\\theta) + i\\sin(-\\theta))
\\end{aligned}""",
        "สังยุค $\\bar{z}$ คือการสะท้อนข้ามแกนจริง ขนาด $r$ เท่าเดิมแต่มุมสลับเป็น $-\\theta$",
        # Ex1 -> Q1, Q2
        ("กำหนด $z = 4(\\cos 35^\\circ + i\\sin 35^\\circ)$ จงหา $\\bar{z}$ และ $z^{-1}$ ในรูปเชิงขั้ว",
         r"""\begin{aligned}
\\bar{z} &= 4[\\cos(-35^\\circ) + i\\sin(-35^\\circ)] = 4(\\cos 325^\\circ + i\\sin 325^\\circ) \\\\[4pt]
z^{-1} &= \\frac{1}{4}[\\cos(-35^\\circ) + i\\sin(-35^\\circ)] = \\frac{1}{4}(\\cos 325^\\circ + i\\sin 325^\\circ)
\\end{aligned}""",
         "เปลี่ยนมุม theta เป็น -theta หรือ 360 - theta"),
        ("ถ้า $z = 2\\text{cis}(50^\\circ)$ จงหา $\\bar{z}$", "$2\\text{cis}(310^\\circ)$ หรือ $2\\text{cis}(-50^\\circ)$"),
        ("ถ้า $z = 5\\text{cis}(120^\\circ)$ จงหา $z^{-1}$", "$\\frac{1}{5}\\text{cis}(240^\\circ)$"),
        # Ex2 -> Q3, Q4
        ("จงหาค่าของ $z \\cdot \\bar{z}$ เมื่อ $z = 3(\\cos 70^\\circ + i\\sin 70^\\circ)$",
         r"""\begin{aligned}
z \\cdot \\bar{z} &= (3 \\cdot 3)[\\cos(70^\\circ - 70^\\circ) + i\\sin(70^\\circ - 70^\\circ)] \\\\[4pt]
&= 9(\\cos 0^\\circ + i\\sin 0^\\circ) = 9(1 + 0) = 9 = r^2
\\end{aligned}""",
         "ผลคูณกับสังยุคได้ r^2 เสมอ"),
        ("จงหาค่าของ $\\frac{z}{\\bar{z}}$ เมื่อ $z = 2\\text{cis}(30^\\circ)$", "$\\text{cis}(60^\\circ) = \\frac{1}{2} + \\frac{\\sqrt{3}}{2}i$"),
        ("ถ้า $z = \\text{cis}(\\theta)$ จงแสดงว่า $z + \\frac{1}{z} = 2\\cos\\theta$", "$2\\cos\\theta$"),
        # Ex3 -> Q5, Q6
        ("จงหาตัวผกผันการคูณของ $z = 2(\\cos\\pi/3 + i\\sin\\pi/3)$ ในรูป $a+bi$",
         r"""\begin{aligned}
z^{-1} &= \\frac{1}{2}[\\cos(-\\pi/3) + i\\sin(-\\pi/3)] \\\\[4pt]
&= \\frac{1}{2}\\left(\\frac{1}{2} - \\frac{\\sqrt{3}}{2}i\\right) = \\frac{1}{4} - \\frac{\\sqrt{3}}{4}i
\\end{aligned}""",
         "กลับค่า r เป็น 1/r และมุมติดลบ"),
        ("จงหา $\\text{Re}(\\bar{z})$ เมื่อ $z = 6\\text{cis}(60^\\circ)$", "$3$"),
        ("จงหาค่าของ $|z^{-1}|$ เมื่อ $z = 4\\text{cis}(85^\\circ)$", "$\\frac{1}{4}$")
    )

    # คาบที่ 16: การประยุกต์รูปเชิงขั้วกับมุมพิเศษและจตุภาค
    add(
        "complex-l16", 4, 16,
        "การประยุกต์รูปเชิงขั้วกับมุมพิเศษและจตุภาค",
        "เทคนิคการคำนวณนิพจน์ตรีโกณมิติซับซ้อนและการคูณต่อเนื่องหลายพจน์ด้วยรูปเชิงขั้ว",
        "การคำนวณรูปเชิงขั้วหลายพจน์",
        r"""\begin{aligned}
z_1 z_2 \\dots z_k &= (r_1 r_2 \\dots r_k) \\, \\text{cis}(\\theta_1 + \\theta_2 + \\dots + \\theta_k) \\\\[4pt]
\\text{cis}(\\theta + 2k\\pi) &= \\text{cis}(\\theta)
\\end{aligned}""",
        "ถ้ามุมบวกกันแล้วเกิน $360^\\circ$ หรือ $2\\pi$ ให้นำ $360^\\circ$ ไปลบออกจนกว่าจะได้มุมในรอบแรก",
        # Ex1 -> Q1, Q2
        ("จงหาค่าของ $\\frac{(\\cos 25^\\circ + i\\sin 25^\\circ)^3 (\\cos 15^\\circ + i\\sin 15^\\circ)^5}{\\cos 30^\\circ + i\\sin 30^\\circ}$",
         r"""\begin{aligned}
\\text{มุมรวมเศษ} &= 3(25^\\circ) + 5(15^\\circ) = 75^\\circ + 75^\\circ = 150^\\circ \\\\[4pt]
\\text{ลบมุมส่วน} &= 150^\\circ - 30^\\circ = 120^\\circ \\\\[4pt]
\\text{ผลลัพธ์} &= \\cos 120^\\circ + i\\sin 120^\\circ = -\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i
\\end{aligned}""",
         "รวบมุมทั้งหมดโดยการคูณเป็นบวกและการหารเป็นลบ"),
        ("จงหาค่าของ $\\text{cis}(40^\\circ) \\cdot \\text{cis}(60^\\circ) \\cdot \\text{cis}(80^\\circ)$", "$-1$"),
        ("จงหาค่าของ $\\frac{\\text{cis}(200^\\circ)}{\\text{cis}(65^\\circ) \\cdot \\text{cis}(45^\\circ)}$", "$\\frac{\\sqrt{3}}{2} + \\frac{1}{2}i$"),
        # Ex2 -> Q3, Q4
        ("จงหาค่าของ $(1+\\sqrt{3}i)^3$",
         r"""\begin{aligned}
1+\\sqrt{3}i &= 2\\text{cis}(60^\\circ) \\\\[4pt]
(1+\\sqrt{3}i)^3 &= 2^3 \\text{cis}(3 \\times 60^\\circ) = 8\\text{cis}(180^\\circ) \\\\[4pt]
&= 8(-1 + 0i) = -8
\\end{aligned}""",
         "แปลงเป็นเชิงขั้ว ยกกำลัง r และคูณมุมด้วย 3"),
        ("จงหาค่าของ $(1-i)^4$", "$-4$"),
        ("จงหาค่าของ $(\\sqrt{3}+i)^6$", "$-64$"),
        # Ex3 -> Q5, Q6
        ("กำหนดให้ $z = 2\\text{cis}(75^\\circ)$ จงหา $\\text{Im}(z^2)$",
         r"""\begin{aligned}
z^2 &= 2^2 \\text{cis}(2 \\times 75^\\circ) = 4\\text{cis}(150^\\circ) \\\\[4pt]
\\text{Im}(z^2) &= 4\\sin 150^\\circ = 4\\left(\\frac{1}{2}\\right) = 2
\\end{aligned}""",
         "ยกกำลังสองมุมเป็น 150 องศา แล้วหา 4 sin 150"),
        ("จงหาค่าของ $\\text{Re}\\left(\\frac{1}{\\text{cis}(60^\\circ)}\\right)$", "$\\frac{1}{2}$"),
        ("จงหาค่าของ $(1+i)^6 + (1-i)^6$", "$0$")
    )
