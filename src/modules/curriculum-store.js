/**
 * Curriculum Store Module
 * 
 * Deep module that serves as the single source of truth for the curriculum hierarchy,
 * 24-period lessons, worked examples, student exercises, and teacher answer keys.
 * 
 * Features:
 * - Read-only baseline loaded from src/data/curriculum.json
 * - Overlay layer in localStorage for user edits (no data corruption, safe resets)
 * - Complete encapsulation of chapter settings cascading and exercise reordering
 */

(function(window) {
  'use strict';

  // Master Chapters Data (Tier 2: Chapters Overview)
  const CHAPTERS_DATA = [
    {
      id: "chapter-1",
      number: 1,
      title: "เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง",
      chapterTitle: "บทที่ 1: เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง",
      badgeClass: "badge-w1",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 1 - 4",
      desc: "ทบทวนสมบัติเลขยกกำลัง กรณฑ์ที่ n และเลขชี้กำลังตรรกยะ",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l01", title: "คาบที่ 1: เลขยกกำลังชี้กำลังเต็ม", desc: "5 สมบัติหลัก นิยาม $a^0=1$ และ $a^{-n}=\\frac{1}{a^n}$" },
        { id: "expo-l02", title: "คาบที่ 2: รากที่ n และกรณฑ์", desc: "ค่าหลักของรากที่ n และเงื่อนไข $|a|$ เมื่อ n คู่" },
        { id: "expo-l03", title: "คาบที่ 3: การดำเนินการของกรณฑ์ & สังยุค", desc: "บวก ลบ คูณ หารกรณฑ์ และจัดรูปตัวส่วนด้วยสังยุค" },
        { id: "expo-l04", title: "คาบที่ 4: เลขยกกำลังชี้กำลังตรรกยะ", desc: "$a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m$ และการแปลงรูป" }
      ]
    },
    {
      id: "chapter-2",
      number: 2,
      title: "ฟังก์ชันเอกซ์โพเนนเชียลและกราฟ",
      chapterTitle: "บทที่ 2: ฟังก์ชันเอกซ์โพเนนเชียลและกราฟ",
      badgeClass: "badge-w2",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 5 - 8",
      desc: "นิยาม กราฟฟังก์ชันเพิ่ม/ลด การเลื่อนกราฟ และเปรียบเทียบค่า",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l05", title: "คาบที่ 5: นิยามฟังก์ชันเอกซ์โพเนนเชียล", desc: "รูปแบบ $y = a^x$ เงื่อนไข $a > 0, a \\neq 1$" },
        { id: "expo-l06", title: "คาบที่ 6: กราฟเอกซ์โพเนนเชียล", desc: "ฟังก์ชันเพิ่ม ($a>1$) vs ลด ($0<a<1$)" },
        { id: "expo-l07", title: "คาบที่ 7: การเลื่อนขนานกราฟ & เรนจ์", desc: "$y = a^{x-h} + k$ เส้นกำกับแนวนอน $y=k$" },
        { id: "expo-l08", title: "คาบที่ 8: การเปรียบเทียบค่าเลขยกกำลัง", desc: "การเปรียบเทียบค่า $a^{x_1}$ กับ $a^{x_2}$" }
      ]
    },
    {
      id: "chapter-3",
      number: 3,
      title: "สมการและอสมการเอกซ์โพเนนเชียล",
      chapterTitle: "บทที่ 3: สมการและอสมการเอกซ์โพเนนเชียล",
      badgeClass: "badge-w3",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 9 - 12",
      desc: "สมการฐานเท่ากัน เปลี่ยนตัวแปรพหุนาม และอสมการกลับเครื่องหมาย",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l09", title: "คาบที่ 9: สมการเอกซ์โพ รูปแบบฐานเท่ากัน", desc: "$a^u = a^v \\iff u = v$" },
        { id: "expo-l10", title: "คาบที่ 10: สมการเอกซ์โพ เปลี่ยนตัวแปร", desc: "$A(a^x)^2 + B(a^x) + C = 0$, $u = a^x > 0$" },
        { id: "expo-l11", title: "คาบที่ 11: สมการฐานไม่เท่ากัน & สมมาตร", desc: "$a^u = b^u \\implies u = 0$ และ $a^x + a^{-x} = k$" },
        { id: "expo-l12", title: "คาบที่ 12: อสมการเอกซ์โพเนนเชียล", desc: "ระวังกลับเครื่องหมายเมื่อ $0 < a < 1$" }
      ]
    },
    {
      id: "chapter-4",
      number: 4,
      title: "ฟังก์ชันลอการิทึมและสมบัติพื้นฐาน",
      chapterTitle: "บทที่ 4: ฟังก์ชันลอการิทึมและสมบัติพื้นฐาน",
      badgeClass: "badge-w4",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 13 - 16",
      desc: "อินเวอร์สของเอกซ์โพ กราฟ และสมบัติการคูณ หาร ปลดกำลัง เปลี่ยนฐาน",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l13", title: "คาบที่ 13: ฟังก์ชันลอการิทึม & อินเวอร์ส", desc: "$y = \\log_a x \\iff x = a^y$ โดเมน $x > 0$" },
        { id: "expo-l14", title: "คาบที่ 14: กราฟของฟังก์ชันลอการิทึม", desc: "จุดตัด $(1,0)$ เส้นกำกับ $x = 0$" },
        { id: "expo-l15", title: "คาบที่ 15: สมบัติพื้นฐานลอการิทึม", desc: "$\\log_a 1 = 0, \\log_a a = 1$ ผลคูณและผลหาร" },
        { id: "expo-l16", title: "คาบที่ 16: การเปลี่ยนฐานลอการิทึม", desc: "$\\log_b a = \\frac{\\log_c a}{\\log_c b}$" }
      ]
    },
    {
      id: "chapter-5",
      number: 5,
      title: "ลอการิทึมขั้นสูงและสมการลอการิทึม",
      chapterTitle: "บทที่ 5: ลอการิทึมขั้นสูงและสมการลอการิทึม",
      badgeClass: "badge-w5",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 17 - 20",
      desc: "ลอการิทึมสามัญ ธรรมชาติ แมนทิสซา แคแรกเทอริสติก และสมการลอการิทึม",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l17", title: "คาบที่ 17: ลอการิทึมสามัญ & ธรรมชาติ", desc: "$\\log x$ (ฐาน 10), $\\ln x$ (ฐาน e)" },
        { id: "expo-l18", title: "คาบที่ 18: แมนทิสซา แคแรกเทอริสติก & Antilog", desc: "รูปสัญกรณ์ $N = M \\times 10^c$" },
        { id: "expo-l19", title: "คาบที่ 19: สมการลอการิทึม ฐานเท่ากัน", desc: "ตรวจคำตอบเงื่อนไขหลัง $\\log > 0$ เสมอ" },
        { id: "expo-l20", title: "คาบที่ 20: สมการเปลี่ยนตัวแปร & Take Log", desc: "สมการรูป $x^{\\log x} = k$ และพหุนาม $\\log$" }
      ]
    },
    {
      id: "chapter-6",
      number: 6,
      title: "อสมการลอการิทึมและการประยุกต์โจทย์จริง",
      chapterTitle: "บทที่ 6: อสมการลอการิทึมและการประยุกต์โจทย์จริง",
      badgeClass: "badge-w6",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 21 - 24",
      desc: "อสมการลอการิทึม ครึ่งชีวิต ดอกเบี้ยทบต้น ค่า pH และระดับเสียงเดซิเบล",
      subjectCode: "ค31202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 2",
      grade: "มัธยมศึกษาปีที่ 4",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "expo-l21", title: "คาบที่ 21: อสมการลอการิทึม", desc: "กลับเครื่องหมายเมื่อ $0 < a < 1$ และตรวจ $x > 0$" },
        { id: "expo-l22", title: "คาบที่ 22: การสลายตัว & ครึ่งชีวิต", desc: "$N(t) = N_0(1/2)^{t/T}$, $N_0 e^{-\\lambda t}$" },
        { id: "expo-l23", title: "คาบที่ 23: ประชากร & ดอกเบี้ยทบต้น", desc: "$P(t) = P_0 e^{kt}$, $A = P(1+r/n)^{nt}$" },
        { id: "expo-l24", title: "คาบที่ 24: ความเป็นกรด-ด่าง & เสียงเดซิเบล", desc: "$\\text{pH} = -\\log[H^+]$, $\\beta = 10\\log(I/I_0)$" }
      ]
    }
  ];

  // Complex Numbers Chapters Data (Tier 2: 24 Periods, 6 Chapters)
  const COMPLEX_CHAPTERS_DATA = [
    {
      id: "complex-chap-1",
      number: 1,
      title: "นิยามและพีชคณิตพื้นฐานของจำนวนเชิงซ้อน",
      chapterTitle: "บทที่ 1: นิยามและพีชคณิตพื้นฐานของจำนวนเชิงซ้อน",
      badgeClass: "badge-w1",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 1 - 4",
      desc: "หน่วยจินตภาพ i, วัฏจักร i^n, รูปมาตรฐาน a+bi, การเท่ากัน และการบวกลบ",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l01", title: "คาบที่ 1: กำเนิดจำนวนเชิงซ้อน & หน่วยจินตภาพ (i)", desc: "นิยามหน่วยจินตภาพ $i = \\sqrt{-1}, i^2 = -1$ และวัฏจักรเลขยกกำลัง $i^n$" },
        { id: "complex-l02", title: "คาบที่ 2: นิยามคู่อันดับและรูปมาตรฐาน a + bi", desc: "คู่อันดับ $(a, b)$, รูปมาตรฐาน $a + bi$, ส่วนจริง $\\text{Re}(z)$ และส่วนจินตภาพ $\\text{Im}(z)$" },
        { id: "complex-l03", title: "คาบที่ 3: การเท่ากันของจำนวนเชิงซ้อน", desc: "การเท่ากัน $a+bi = c+di \\iff a=c \\land b=d$ และการแก้ระบบสมการหาค่าจริง" },
        { id: "complex-l04", title: "คาบที่ 4: การบวกและการลบจำนวนเชิงซ้อน", desc: "การบวกและลบ $(a+bi) \\pm (c+di)$, เอกลักษณ์การบวก และตัวผกผันการบวก" }
      ]
    },
    {
      id: "complex-chap-2",
      number: 2,
      title: "การคูณ สังยุค และอินเวอร์สการคูณ",
      chapterTitle: "บทที่ 2: การคูณ สังยุค และอินเวอร์สการคูณ",
      badgeClass: "badge-w2",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 5 - 8",
      desc: "การคูณพหุนาม, สังยุค, การหารจำนวนเชิงซ้อน และตัวผกผันการคูณ z^(-1)",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l05", title: "คาบที่ 5: การคูณจำนวนเชิงซ้อน", desc: "ผลคูณ $(ac - bd) + (ad + bc)i$, สมบัติปิด การสลับที่ การเปลี่ยนหมู่ และการแจกแจง" },
        { id: "complex-l06", title: "คาบที่ 6: สังยุคของจำนวนเชิงซ้อน (Conjugate)", desc: "นิยามสังยุค $\\bar{z} = a - bi$, สมบัติ 8 ข้อ และผลคูณ $z\\bar{z} = a^2 + b^2$" },
        { id: "complex-l07", title: "คาบที่ 7: การหารจำนวนเชิงซ้อน", desc: "การหาร $\\frac{z_1}{z_2}$ โดยคูณตัวเศษและส่วนด้วยสังยุคของตัวส่วน" },
        { id: "complex-l08", title: "คาบที่ 8: ตัวผกผันการคูณ (Multiplicative Inverse)", desc: "การหา $z^{-1} = \\frac{\\bar{z}}{|z|^2} = \\frac{a - bi}{a^2 + b^2}$ และสมการผลคูณ" }
      ]
    },
    {
      id: "complex-chap-3",
      number: 3,
      title: "กราฟ ระนาบเชิงซ้อน เวกเตอร์ และค่าสัมบูรณ์",
      chapterTitle: "บทที่ 3: กราฟ ระนาบเชิงซ้อน เวกเตอร์ และค่าสัมบูรณ์",
      badgeClass: "badge-w3",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 9 - 12",
      desc: "ระนาบอาร์กองด์, เวกเตอร์แทน z, ค่าสัมบูรณ์ |z|, สมบัติ 10 ข้อ และทางเดินของจุด",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l09", title: "คาบที่ 9: กราฟของจำนวนเชิงซ้อน & ระนาบอาร์กองด์", desc: "แกนจริง แกนจินตภาพ การลงจุด และเวกเตอร์บอกตำแหน่งในระนาบเชิงซ้อน" },
        { id: "complex-l10", title: "คาบที่ 10: ค่าสัมบูรณ์ของจำนวนเชิงซ้อน |z|", desc: "นิยามระยะทาง $|z| = \\sqrt{a^2 + b^2}$, ความสัมพันธ์ $|z|^2 = z\\bar{z}$ และเวกเตอร์ลัพธ์" },
        { id: "complex-l11", title: "คาบที่ 11: สมบัติขั้นสูงของค่าสัมบูรณ์", desc: "สมบัติผลคูณ ผลหาร เลขยกกำลัง และอสมการสามเหลี่ยม $|z_1 + z_2| \\le |z_1| + |z_2|$" },
        { id: "complex-l12", title: "คาบที่ 12: ทางเดินของจุดและเรขาคณิตเชิงซ้อน", desc: "สมการวงกลม $|z - z_0| = r$, เส้นแบ่งครึ่งตั้งฉาก $|z - z_1| = |z - z_2|$" }
      ]
    },
    {
      id: "complex-chap-4",
      number: 4,
      title: "รูปเชิงขั้วของจำนวนเชิงซ้อน (Polar Form)",
      chapterTitle: "บทที่ 4: รูปเชิงขั้วของจำนวนเชิงซ้อน (Polar Form)",
      badgeClass: "badge-w4",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 13 - 16",
      desc: "การแปลงเป็น r(cos theta + i sin theta), การคูณ-หารเชิงขั้ว, สังยุคและอินเวอร์ส",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l13", title: "คาบที่ 13: รูปเชิงขั้วของจำนวนเชิงซ้อน", desc: "นิยาม $z = r(\\cos\\theta + i\\sin\\theta) = r\\,\\text{cis}\\,\\theta$, มอดุลัส $r$ และอาร์กิวเมนต์หลัก $\\text{Arg}(z)$" },
        { id: "complex-l14", title: "คาบที่ 14: การคูณจำนวนเชิงซ้อนในรูปเชิงขั้ว", desc: "ทฤษฎีบทการคูณ $z_1 z_2 = r_1 r_2 \\operatorname{cis}(\\theta_1 + \\theta_2)$ และการหมุนเวกเตอร์" },
        { id: "complex-l15", title: "คาบที่ 15: การหารจำนวนเชิงซ้อนในรูปเชิงขั้ว", desc: "ทฤษฎีบทการหาร $\\frac{z_1}{z_2} = \\frac{r_1}{r_2}\\operatorname{cis}(\\theta_1 - \\theta_2)$" },
        { id: "complex-l16", title: "คาบที่ 16: สังยุคและตัวผกผันในรูปเชิงขั้ว", desc: "$\\bar{z} = r\\operatorname{cis}(-\\theta)$ และ $z^{-1} = \\frac{1}{r}\\operatorname{cis}(-\\theta)$" }
      ]
    },
    {
      id: "complex-chap-5",
      number: 5,
      title: "ทฤษฎีบทเดอมัวฟร์และรากที่ n ของจำนวนเชิงซ้อน",
      chapterTitle: "บทที่ 5: ทฤษฎีบทเดอมัวฟร์และรากที่ n ของจำนวนเชิงซ้อน",
      badgeClass: "badge-w5",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 17 - 20",
      desc: "ทฤษฎีบทเดอมัวฟร์ z^n, รากที่ n ในรูปเชิงขั้ว, รากของ 1 (Roots of Unity) และรูปหลายเหลี่ยม",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l17", title: "คาบที่ 17: ทฤษฎีบทเดอมัวฟร์ (De Moivre's Theorem)", desc: "$z^n = r^n(\\cos n\\theta + i\\sin n\\theta)$ สำหรับจำนวนเต็มบวก $n$" },
        { id: "complex-l18", title: "คาบที่ 18: ทฤษฎีบทเดอมัวฟร์ กำลังจำนวนเต็มลบ", desc: "$z^{-n} = r^{-n}\\operatorname{cis}(-n\\theta)$ และการคำนวณนิพจน์ยกกำลังสูง" },
        { id: "complex-l19", title: "คาบที่ 19: การหารากที่ n ของจำนวนเชิงซ้อน", desc: "$z_k = \\sqrt[n]{r}\\operatorname{cis}\\left(\\frac{\\theta + 2k\\pi}{n}\\right)$ สำหรับ $k = 0, 1, \\dots, n-1$" },
        { id: "complex-l20", title: "คาบที่ 20: รากของเอกลักษณ์และรูปหลายเหลี่ยมด้านเท่า", desc: "รากที่ $n$ ของ 1 ($z^n = 1$), การกระจายบนวงกลมหนึ่งหน่วย และรูปหลายเหลี่ยมด้านเท่า" }
      ]
    },
    {
      id: "complex-chap-6",
      number: 6,
      title: "สมการพหุนามและทฤษฎีบทหลักมูลของพีชคณิต",
      chapterTitle: "บทที่ 6: สมการพหุนามและทฤษฎีบทหลักมูลของพีชคณิต",
      badgeClass: "badge-w6",
      periodRange: "4 คาบเรียน",
      periodRangeText: "คาบที่ 21 - 24",
      desc: "สมการกำลังสอง, ทฤษฎีบทหลักมูล, ทฤษฎีบทคู่สังยุค, พหุนามกำลังสูง และแนวข้อสอบ A-Level",
      subjectCode: "ค32202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 4",
      grade: "มัธยมศึกษาปีที่ 5",
      semester: "ภาคเรียนที่ 2",
      topics: [
        { id: "complex-l21", title: "คาบที่ 21: สมการกำลังสองที่มีคำตอบเชิงซ้อน", desc: "สูตร $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ เมื่อ $b^2 - 4ac < 0$ และความสัมพันธ์ราก" },
        { id: "complex-l22", title: "คาบที่ 22: ทฤษฎีบทหลักมูลและทฤษฎีบทคู่สังยุค", desc: "Fundamental Theorem of Algebra และถ้ารากเป็น $a+bi$ แล้ว $a-bi$ ต้องเป็นรากด้วย" },
        { id: "complex-l23", title: "คาบที่ 23: การแก้สมการพหุนามกำลังสามและสี่", desc: "การหารสังเคราะห์ ทฤษฎีตัวประกอบตรรกยะ และการแยกตัวประกอบในระบบเชิงซ้อน" },
        { id: "complex-l24", title: "คาบที่ 24: การประยุกต์และโจทย์บูรณาการขั้นสูง", desc: "ข้อสอบอัตนัย/ปรนัย A-Level, ข้อสอบ สสวท. บูรณาการตรีโกณมิติ เรขาคณิต และพีชคณิต" }
      ]
    }
  ];

  // Master Units Database (Tier 1: Multi-Unit Hierarchy)
  const UNITS_DATABASE = [
    {
      id: "unit-expo-log",
      title: "ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม",
      shortTitle: "เอกซ์โพเนนเชียล & ลอการิทึม",
      grade: "มัธยมศึกษาปีที่ 4",
      gradeShort: "ม.4 (เทอม 2)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 2 (ค31202)",
      totalPeriods: "24 คาบเรียน (6 บท)",
      status: "ready",
      statusBadge: "พร้อมสอน • 24 คาบ",
      icon: "📘",
      desc: "เลขยกกำลัง กรณฑ์ กราฟเอกซ์โพเนนเชียล ฟังก์ชันลอการิทึม สมการ และการประยุกต์",
      chapters: CHAPTERS_DATA
    },
    {
      id: "unit-complex",
      title: "จำนวนเชิงซ้อน (Complex Numbers)",
      shortTitle: "จำนวนเชิงซ้อน",
      grade: "มัธยมศึกษาปีที่ 5",
      gradeShort: "ม.5 (เทอม 2)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 4 (ค32202)",
      totalPeriods: "24 คาบเรียน (6 บท)",
      status: "ready",
      statusBadge: "พร้อมสอน • 24 คาบ",
      icon: "⚡",
      desc: "หน่วยจินตภาพ รูปมาตรฐาน พีชคณิต สังยุค ระนาบเชิงซ้อน รูปเชิงขั้ว เดอมัวฟร์ รากที่ n และสมการพหุนาม",
      chapters: COMPLEX_CHAPTERS_DATA
    },
    {
      id: "unit-conic",
      title: "เรขาคณิตวิเคราะห์และภาคตัดกรวย",
      shortTitle: "เรขาคณิตวิเคราะห์",
      grade: "มัธยมศึกษาปีที่ 4",
      gradeShort: "ม.4 (เทอม 2)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 2 (ค31202)",
      totalPeriods: "18 คาบเรียน",
      status: "upcoming",
      statusBadge: "เร็วๆ นี้",
      icon: "📐",
      desc: "ระยะทาง จุดกึ่งกลาง เส้นตรง วงกลม พาราโบลา วงรี ไฮเพอร์โบลา และการประยุกต์"
    },
    {
      id: "unit-real-numbers",
      title: "ระบบจำนวนจริงและพหุนาม",
      shortTitle: "จำนวนจริง & พหุนาม",
      grade: "มัธยมศึกษาปีที่ 4",
      gradeShort: "ม.4 (เทอม 1)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 1 (ค31201)",
      totalPeriods: "20 คาบเรียน",
      status: "upcoming",
      statusBadge: "เร็วๆ นี้",
      icon: "🔢",
      desc: "สมบัติจำนวนจริง ทฤษฎีเศษเหลือ การแยกตัวประกอบ อสมการพหุนาม และค่าสัมบูรณ์"
    },
    {
      id: "unit-trig",
      title: "ฟังก์ชันตรีโกณมิติและการประยุกต์",
      shortTitle: "ฟังก์ชันตรีโกณมิติ",
      grade: "มัธยมศึกษาปีที่ 5",
      gradeShort: "ม.5 (เทอม 1)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 3 (ค32201)",
      totalPeriods: "24 คาบเรียน",
      status: "upcoming",
      statusBadge: "เร็วๆ นี้",
      icon: "📈",
      desc: "วงกลมหนึ่งหน่วย ค่าตรีโกณมิติ กราฟ เอกลักษณ์ สมการตรีโกณมิติ และกฎไซน์/โคไซน์"
    },
    {
      id: "unit-vectors",
      title: "เวกเตอร์ในสามมิติ",
      shortTitle: "เวกเตอร์ในสามมิติ",
      grade: "มัธยมศึกษาปีที่ 5",
      gradeShort: "ม.5 (เทอม 1)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 3 (ค32201)",
      totalPeriods: "16 คาบเรียน",
      status: "upcoming",
      statusBadge: "เร็วๆ นี้",
      icon: "↗️",
      desc: "พิกัดฉาก 3 มิติ การบวก/ลบเวกเตอร์ ดอทโพรดักต์ ครอสโพรดักต์ และพื้นที่/ปริมาตร"
    },
    {
      id: "unit-calculus",
      title: "แคลคูลัสเบื้องต้น",
      shortTitle: "แคลคูลัสเบื้องต้น",
      grade: "มัธยมศึกษาปีที่ 6",
      gradeShort: "ม.6 (เทอม 1)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 5 (ค33201)",
      totalPeriods: "28 คาบเรียน",
      status: "upcoming",
      statusBadge: "เร็วๆ นี้",
      icon: "∫",
      desc: "ลิมิตและความต่อเนื่อง อนุพันธ์ของฟังก์ชัน เส้นสัมผัสโค้ง การอินทิเกรต และพื้นที่ใต้กราฟ"
    }
  ];

  // Storage key for user overlays
  const OVERLAY_STORAGE_KEY = 'mathSheet_curriculum_overlay';

  // Internal state
  let _baselineData = {};
  let _userOverlays = {};
  let _currentTopicId = 'expo-l01';
  let _currentSheetMode = 'worksheet'; // 'worksheet' | 'summary' | 'quiz'
  let _isTeacherKeyMode = false;
  let _listeners = [];

  function loadOverlays() {
    try {
      const raw = localStorage.getItem(OVERLAY_STORAGE_KEY);
      if (raw) {
        _userOverlays = JSON.parse(raw) || {};
      }
    } catch (e) {
      console.warn('Failed to load curriculum overlays from localStorage:', e);
      _userOverlays = {};
    }
  }

  function saveOverlays() {
    try {
      localStorage.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(_userOverlays));
    } catch (e) {
      console.warn('Failed to save curriculum overlays to localStorage:', e);
    }
  }

  function notifyListeners() {
    for (let i = 0; i < _listeners.length; i++) {
      try {
        _listeners[i]({
          topicId: _currentTopicId,
          mode: _currentSheetMode,
          isTeacherKeyMode: _isTeacherKeyMode
        });
      } catch (err) {
        console.error('Error in CurriculumStore listener:', err);
      }
    }
  }

  const CurriculumStore = {
    /**
     * Initialize store with baseline verified curriculum data
     */
    init: function(baselineData) {
      if (baselineData && typeof baselineData === 'object') {
        _baselineData = baselineData;
      }
      loadOverlays();
      // Ensure current topic exists
      if (!_baselineData[_currentTopicId]) {
        const keys = Object.keys(_baselineData);
        if (keys.length > 0) {
          _currentTopicId = keys[0];
        }
      }
      return this;
    },

    getUnits: function() {
      return UNITS_DATABASE;
    },

    getChapters: function(unitId) {
      if (unitId === 'unit-expo-log') return CHAPTERS_DATA;
      if (unitId === 'unit-complex') return COMPLEX_CHAPTERS_DATA;
      return CHAPTERS_DATA.concat(COMPLEX_CHAPTERS_DATA);
    },

    getChapter: function(chapId) {
      const all = CHAPTERS_DATA.concat(COMPLEX_CHAPTERS_DATA);
      return all.find(function(c) { return c.id === chapId; }) || null;
    },

    getCurrentTopicId: function() {
      return _currentTopicId;
    },

    setCurrentTopicId: function(topicId) {
      if (_baselineData[topicId]) {
        _currentTopicId = topicId;
        notifyListeners();
      }
    },

    getCurrentSheetMode: function() {
      return _currentSheetMode;
    },

    setCurrentSheetMode: function(mode) {
      if (['worksheet', 'summary', 'quiz'].indexOf(mode) !== -1) {
        _currentSheetMode = mode;
        notifyListeners();
      }
    },

    isTeacherKeyMode: function() {
      return _isTeacherKeyMode;
    },

    setTeacherKeyMode: function(enabled) {
      _isTeacherKeyMode = !!enabled;
      notifyListeners();
    },

    /**
     * Get consolidated topic data (Baseline + User Overlay)
     */
    getTopic: function(topicId) {
      const id = topicId || _currentTopicId;
      const base = _baselineData[id];
      if (!base) return null;

      const overlay = _userOverlays[id];
      if (!overlay) {
        return JSON.parse(JSON.stringify(base));
      }

      // Merge base with overlay
      const merged = JSON.parse(JSON.stringify(base));
      if (overlay.subjectCode) merged.subjectCode = overlay.subjectCode;
      if (overlay.grade) merged.grade = overlay.grade;
      if (overlay.semester) merged.semester = overlay.semester;
      if (overlay.gradeShort) merged.gradeShort = overlay.gradeShort;

      // Mode-specific exercise overrides
      ['worksheet', 'summary', 'quiz'].forEach(function(m) {
        if (overlay[m] && overlay[m].exercises) {
          if (!merged[m]) merged[m] = {};
          merged[m].exercises = JSON.parse(JSON.stringify(overlay[m].exercises));
        }
      });

      return merged;
    },

    /**
     * Get active sheet mode data for a topic
     */
    getActiveSheetData: function(topicId, mode) {
      const topic = this.getTopic(topicId);
      if (!topic) return null;
      const targetMode = mode || _currentSheetMode;
      return topic[targetMode] || topic.worksheet || null;
    },

    /**
     * Get exercises list for specified topic and mode
     */
    getExercises: function(topicId, mode) {
      const sheet = this.getActiveSheetData(topicId, mode);
      return sheet && sheet.exercises ? sheet.exercises : [];
    },

    /**
     * Update or add an exercise via safe overlay
     */
    saveExercise: function(topicId, mode, index, exerciseData) {
      const id = topicId || _currentTopicId;
      const targetMode = mode || _currentSheetMode;
      const topic = this.getTopic(id);
      if (!topic) return false;

      const exercises = this.getExercises(id, targetMode).slice();

      if (index >= 0 && index < exercises.length) {
        // Edit existing
        exercises[index] = Object.assign({}, exercises[index], exerciseData);
      } else {
        // Add new
        exercises.push(Object.assign({}, exerciseData));
      }

      if (!_userOverlays[id]) _userOverlays[id] = {};
      if (!_userOverlays[id][targetMode]) _userOverlays[id][targetMode] = {};
      _userOverlays[id][targetMode].exercises = exercises;

      saveOverlays();
      notifyListeners();
      return true;
    },

    deleteExercise: function(topicId, mode, index) {
      const id = topicId || _currentTopicId;
      const targetMode = mode || _currentSheetMode;
      const exercises = this.getExercises(id, targetMode).slice();

      if (index >= 0 && index < exercises.length) {
        exercises.splice(index, 1);
        if (!_userOverlays[id]) _userOverlays[id] = {};
        if (!_userOverlays[id][targetMode]) _userOverlays[id][targetMode] = {};
        _userOverlays[id][targetMode].exercises = exercises;

        saveOverlays();
        notifyListeners();
        return true;
      }
      return false;
    },

    moveExercise: function(topicId, mode, index, direction) {
      const id = topicId || _currentTopicId;
      const targetMode = mode || _currentSheetMode;
      const exercises = this.getExercises(id, targetMode).slice();
      const targetIndex = index + direction;

      if (index >= 0 && index < exercises.length && targetIndex >= 0 && targetIndex < exercises.length) {
        const item = exercises.splice(index, 1)[0];
        exercises.splice(targetIndex, 0, item);

        if (!_userOverlays[id]) _userOverlays[id] = {};
        if (!_userOverlays[id][targetMode]) _userOverlays[id][targetMode] = {};
        _userOverlays[id][targetMode].exercises = exercises;

        saveOverlays();
        notifyListeners();
        return true;
      }
      return false;
    },

    /**
     * Reset a lesson mode back to IPST baseline
     */
    resetToDefault: function(topicId, mode) {
      const id = topicId || _currentTopicId;
      const targetMode = mode || _currentSheetMode;

      if (_userOverlays[id] && _userOverlays[id][targetMode]) {
        delete _userOverlays[id][targetMode];
        if (Object.keys(_userOverlays[id]).length === 0) {
          delete _userOverlays[id];
        }
        saveOverlays();
        notifyListeners();
        return true;
      }
      return false;
    },

    /**
     * Cascade chapter settings to all topics within that chapter
     */
    applyChapterSettings: function(chapId, settings) {
      const chapter = this.getChapter(chapId);
      if (!chapter || !chapter.topics) return false;

      chapter.topics.forEach(function(t) {
        if (!_userOverlays[t.id]) _userOverlays[t.id] = {};
        if (settings.combinedSubjectCode) _userOverlays[t.id].subjectCode = settings.combinedSubjectCode;
        if (settings.grade) _userOverlays[t.id].grade = settings.grade;
        if (settings.semester) _userOverlays[t.id].semester = settings.semester;
        if (settings.gradeShort) _userOverlays[t.id].gradeShort = settings.gradeShort;
      });

      saveOverlays();
      notifyListeners();
      return true;
    },

    subscribe: function(fn) {
      if (typeof fn === 'function') {
        _listeners.push(fn);
      }
      return function unsubscribe() {
        _listeners = _listeners.filter(function(l) { return l !== fn; });
      };
    },

    /**
     * Backwards compatibility accessor
     */
    getRawDatabase: function() {
      // Returns master dictionary for any legacy call
      const dict = {};
      const self = this;
      Object.keys(_baselineData).forEach(function(k) {
        dict[k] = self.getTopic(k);
      });
      return dict;
    }
  };

  // Expose to window
  window.CurriculumStore = CurriculumStore;

})(window);
