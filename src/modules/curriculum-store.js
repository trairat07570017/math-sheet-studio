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

  // Random Variables & Probability Distributions Chapters Data (Tier 2: 50 Periods, 10 Chapters)
  const STAT_CHAPTERS_DATA = [
    {
      id: "stat-chap-1",
      number: 1,
      title: "แนวคิดตัวแปรสุ่มและฟังก์ชันความน่าจะเป็น",
      chapterTitle: "บทที่ 1: แนวคิดตัวแปรสุ่มและฟังก์ชันความน่าจะเป็น",
      badgeClass: "badge-w1",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 1 - 5",
      desc: "นิยามตัวแปรสุ่ม ตัวแปรสุ่มไม่ต่อเนื่อง/ต่อเนื่อง ตารางแจกแจง ฟังก์ชัน PMF และฟังก์ชันสะสม CDF",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l01", title: "คาบที่ 1: จากปริภูมิตัวอย่างสู่ตัวแปรสุ่ม", desc: "นิยามตัวแปรสุ่ม $X: S \\to \\mathbb{R}$ และเซตของค่าที่เป็นไปได้ $R_X$" },
        { id: "stat-l02", title: "คาบที่ 2: จำแนกตัวแปรสุ่มไม่ต่อเนื่อง vs ต่อเนื่อง", desc: "เกณฑ์การจำแนกประเภทตัวแปรสุ่มจากเซตค่าที่เป็นไปได้" },
        { id: "stat-l03", title: "คาบที่ 3: การแจกแจงในรูปตารางและกราฟแท่ง", desc: "ตารางแจกแจงความน่าจะเป็น และสมบัติ $\\sum P(X=x) = 1$" },
        { id: "stat-l04", title: "คาบที่ 4: การแจกแจงในรูปสมการฟังก์ชัน PMF", desc: "ฟังก์ชันความน่าจะเป็น $P(X=x) = f(x)$ และการแก้หาค่าคงที่ $k$" },
        { id: "stat-l05", title: "คาบที่ 5: ฟังก์ชันการแจกแจงสะสม (CDF)", desc: "ฟังก์ชันสะสม $F(x) = P(X \\le x)$ และกราฟขั้นบันได" }
      ]
    },
    {
      id: "stat-chap-2",
      number: 2,
      title: "ค่าคาดหมายและความแปรปรวนของตัวแปรสุ่มไม่ต่อเนื่อง",
      chapterTitle: "บทที่ 2: ค่าคาดหมายและความแปรปรวนของตัวแปรสุ่มไม่ต่อเนื่อง",
      badgeClass: "badge-w2",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 6 - 10",
      desc: "ค่าคาดหมาย E(X), ความแปรปรวน Var(X), ส่วนเบี่ยงเบนมาตรฐาน, สูตรลดรูป, สมบัติเชิงเส้น และการตัดสินใจ",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l06", title: "คาบที่ 6: มโนทัศน์ค่าคาดหมาย E(X)", desc: "ค่าคาดหมาย $\\mu_X = \\sum x P(X=x)$ ในฐานะค่าเฉลี่ยระยะยาว" },
        { id: "stat-l07", title: "คาบที่ 7: ความแปรปรวนและส่วนเบี่ยงเบนมาตรฐาน", desc: "นิยาม $\\sigma^2 = \\sum (x-\\mu)^2 P(X=x)$ ตัววัดการกระจายรอบค่าเฉลี่ย" },
        { id: "stat-l08", title: "คาบที่ 8: สูตรลดรูปความแปรปรวน", desc: "$Var(X) = E(X^2) - [E(X)]^2$ และเทคนิคการคิดเลขเร็ว" },
        { id: "stat-l09", title: "คาบที่ 9: สมบัติเชิงเส้นของค่าคาดหมายและความแปรปรวน", desc: "$E(aX+b) = aE(X)+b$ และ $Var(aX+b) = a^2Var(X)$" },
        { id: "stat-l10", title: "คาบที่ 10: การประยุกต์ค่าคาดหมายและเกมที่ยุติธรรม", desc: "เกมที่ยุติธรรม ($E(X)=0$) เบี้ยประกันภัย และการตัดสินใจเชิงธุรกิจ" }
      ]
    },
    {
      id: "stat-chap-3",
      number: 3,
      title: "การแจกแจงเอกรูปไม่ต่อเนื่องและการทดลองแบร์นุลลี",
      chapterTitle: "บทที่ 3: การแจกแจงเอกรูปไม่ต่อเนื่องและการทดลองแบร์นุลลี",
      badgeClass: "badge-w3",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 11 - 15",
      desc: "การแจกแจงเอกรูปไม่ต่อเนื่อง P(X=x) = 1/k, การทดลองแบร์นุลลี, ตัวแปรสุ่มแบร์นุลลี และการขยายสู่ทวินาม",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l11", title: "คาบที่ 11: การแจกแจงเอกรูปไม่ต่อเนื่อง", desc: "นิยาม $P(X=x) = \\frac{1}{k}$ และตารางแจกแจงความน่าจะเป็นเท่ากันทุกค่า" },
        { id: "stat-l12", title: "คาบที่ 12: ค่าคาดหมายและความแปรปรวนเอกรูป", desc: "สูตรเฉพาะ $\\mu = \\frac{n+1}{2}$ และ $\\sigma^2 = \\frac{n^2-1}{12}$ สำหรับ $x \\in \\{1, \\dots, n\\}$" },
        { id: "stat-l13", title: "คาบที่ 13: มโนทัศน์การทดลองแบร์นุลลี", desc: "การทดลองสุ่มที่มีผลลัพธ์ 2 แบบ (สำเร็จ $p$ / ล้มเหลว $1-p$)" },
        { id: "stat-l14", title: "คาบที่ 14: ตัวแปรสุ่มแบร์นุลลี", desc: "$X \\sim \\text{Bernoulli}(p)$ โดย $E(X)=p, Var(X)=p(1-p)$" },
        { id: "stat-l15", title: "คาบที่ 15: จากแบร์นุลลี n ครั้งสู่นิยามทวินาม", desc: "แผนภาพต้นไม้และการนับวิธีจัดเรียงด้วยสัมประสิทธิ์ทวินาม $\\binom{n}{x}$" }
      ]
    },
    {
      id: "stat-chap-4",
      number: 4,
      title: "การแจกแจงทวินาม: ทฤษฎีและการคำนวณ",
      chapterTitle: "บทที่ 4: การแจกแจงทวินาม: ทฤษฎีและการคำนวณ",
      badgeClass: "badge-w4",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 16 - 20",
      desc: "เงื่อนไข 4 ประการ (BINS), ฟังก์ชันความน่าจะเป็นทวินาม, เงื่อนไขอย่างน้อย, อย่างมาก และความน่าจะเป็นในช่วง",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l16", title: "คาบที่ 16: เงื่อนไข 4 ประการของการแจกแจงทวินาม", desc: "การตรวจสอบเกณฑ์ B-I-N-S และการสุ่มแบบคืนที่ vs ไม่คืนที่" },
        { id: "stat-l17", title: "คาบที่ 17: ฟังก์ชันความน่าจะเป็นทวินาม (ค่าเดี่ยว)", desc: "สูตร $P(X=x) = \\binom{n}{x} p^x (1-p)^{n-x}$ และการคิดเลขยกกำลัง" },
        { id: "stat-l18", title: "คาบที่ 18: ความน่าจะเป็นแบบอย่างน้อย P(X >= k)", desc: "สูตรลัดเหตุการณ์ตรงข้าม $P(X \\ge 1) = 1 - P(X=0)$" },
        { id: "stat-l19", title: "คาบที่ 19: ความน่าจะเป็นแบบอย่างมาก P(X <= k)", desc: "การคำนวณ $P(X \\le k)$ และการแยกแยะคำศัพท์ในภาษาโจทย์" },
        { id: "stat-l20", title: "คาบที่ 20: ความน่าจะเป็นในช่วง P(a <= X <= b)", desc: "การคำนวณความน่าจะเป็นในช่วงปิด/เปิด และโจทย์ระคนทวินาม" }
      ]
    },
    {
      id: "stat-chap-5",
      number: 5,
      title: "ค่าคาดหมายทวินามและการประยุกต์ในโลกจริง",
      chapterTitle: "บทที่ 5: ค่าคาดหมายทวินามและการประยุกต์ในโลกจริง",
      badgeClass: "badge-w5",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 21 - 25",
      desc: "สูตรลัด mu = np, ความแปรปรวน np(1-p), ประยุกต์การแพทย์, อุตสาหกรรม (Acceptance Sampling) และคลินิกกลลวง",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l21", title: "คาบที่ 21: สูตรลัดค่าคาดหมายทวินาม mu = np", desc: "พิสูจน์และใช้สูตร $\\mu = np$ คำนวณค่าเฉลี่ยในโจทย์จริง" },
        { id: "stat-l22", title: "คาบที่ 22: ความแปรปรวนและส่วนเบี่ยงเบนทวินาม", desc: "สูตร $\\sigma^2 = np(1-p)$ และการแก้ระบบสมการย้อนหา $n$ และ $p$" },
        { id: "stat-l23", title: "คาบที่ 23: ประยุกต์ทวินาม 1: การแพทย์ & พันธุศาสตร์", desc: "ประสิทธิผลยา อัตราการรอดชีวิต และการถ่ายทอดลักษณะตามกฎเมนเดล" },
        { id: "stat-l24", title: "คาบที่ 24: ประยุกต์ทวินาม 2: การควบคุมคุณภาพ (QC)", desc: "แผนการสุ่มตรวจยอมรับล็อต $(n, c)$ และการวิเคราะห์สินค้าชำรุด" },
        { id: "stat-l25", title: "คาบที่ 25: คลินิกวิเคราะห์ข้อผิดพลาดทวินาม", desc: "เจาะจุดผิดบ่อย: กำหนด $p$ สลับ, ลืมสัมประสิทธิ์, และการสุ่มไม่คืนที่" }
      ]
    },
    {
      id: "stat-chap-6",
      number: 6,
      title: "ตัวแปรสุ่มต่อเนื่องและเส้นโค้งความหนาแน่น",
      chapterTitle: "บทที่ 6: ตัวแปรสุ่มต่อเนื่องและเส้นโค้งความหนาแน่น",
      badgeClass: "badge-w6",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 26 - 30",
      desc: "ธรรมชาติของตัวแปรสุ่มต่อเนื่อง, PDF, พื้นที่ใต้โค้งแทนความน่าจะเป็น, P(X=c)=0, เรขาคณิต และความเบ้ของเส้นโค้ง",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l26", title: "คาบที่ 26: ธรรมชาติของตัวแปรสุ่มต่อเนื่อง", desc: "การวัดเชิงปริมาณและข้อแตกต่างจากตัวแปรสุ่มไม่ต่อเนื่อง" },
        { id: "stat-l27", title: "คาบที่ 27: แนวคิดฟังก์ชันความหนาแน่น (PDF)", desc: "สมบัติ $f(x) \\ge 0$ และพื้นที่ใต้เส้นโค้งทั้งหมดเท่ากับ 1" },
        { id: "stat-l28", title: "คาบที่ 28: พื้นที่ใต้โค้งและความน่าจะเป็นที่จุดเดี่ยว", desc: "เหตุผลที่ $P(X=c)=0$ และทำไม $P(a \\le X \\le b) = P(a < X < b)$" },
        { id: "stat-l29", title: "คาบที่ 29: การหาความน่าจะเป็นจากรูปทรงเรขาคณิต", desc: "คำนวณพื้นที่รูปสี่เหลี่ยมผืนผ้า สามเหลี่ยม และสี่เหลี่ยมคางหมูใต้กราฟ" },
        { id: "stat-l30", title: "คาบที่ 30: รูปร่างเส้นโค้งความหนาแน่นและค่ากลาง", desc: "เส้นโค้งสมมาตร, เบ้ขวา, เบ้ซ้าย และตำแหน่ง Mean, Median, Mode" }
      ]
    },
    {
      id: "stat-chap-7",
      number: 7,
      title: "การแจกแจงปกติและคะแนนมาตรฐาน Z",
      chapterTitle: "บทที่ 7: การแจกแจงปกติและคะแนนมาตรฐาน Z",
      badgeClass: "badge-w7",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 31 - 35",
      desc: "เส้นโค้งปกติรูประฆังคว่ำ, ผลของ mu และ sigma, กฎเชิงประจักษ์ 68-95-99.7, คะแนนมาตรฐาน Z และ N(0, 1)",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l31", title: "คาบที่ 31: เส้นโค้งการแจกแจงปกติและสมบัติสำคัญ", desc: "รูประฆังคว่ำ ความสมมาตรรอบ $\\mu$ และ $\\text{Mean}=\\text{Med}=\\text{Mode}$" },
        { id: "stat-l32", title: "คาบที่ 32: ผลของ mu และ sigma ต่อเส้นโค้งปกติ", desc: "แกนสมมาตรและความโด่ง/กว้างของเส้นโค้งตามพารามิเตอร์" },
        { id: "stat-l33", title: "คาบที่ 33: กฎเชิงประจักษ์ 68–95–99.7 Rule", desc: "การประมาณสัดส่วนข้อมูลในช่วง $[\mu \\pm k\\sigma]$ ด้วยการคิดเลขเร็ว" },
        { id: "stat-l34", title: "คาบที่ 34: คะแนนมาตรฐาน Z = (X - mu) / sigma", desc: "การทำให้เป็นมาตรฐาน (Standardization) และการเปรียบเทียบข้อมูลต่างชุด" },
        { id: "stat-l35", title: "คาบที่ 35: การแจกแจงปกติมาตรฐาน Z ~ N(0, 1)", desc: "เส้นโค้งปกติมาตรฐานที่มี $\\mu=0, \\sigma=1$ ในฐานะตารางอ้างอิงสากล" }
      ]
    },
    {
      id: "stat-chap-8",
      number: 8,
      title: "การเปิดตารางพื้นที่สะสม สสวท. และการคำนวณ",
      chapterTitle: "บทที่ 8: การเปิดตารางพื้นที่สะสม สสวท. และการคำนวณ",
      badgeClass: "badge-w8",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 36 - 40",
      desc: "ตารางพื้นที่สะสมหางซ้าย P(Z <= z), พื้นที่ทางขวา 1-P, พื้นที่ระหว่างค่า Z สองค่า, ตัวแปรปกติทั่วไป และความถี่คาดหวัง",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l36", title: "คาบที่ 36: โครงสร้างตารางพื้นที่สะสม สสวท.", desc: "การอ่านแถวและหลักตารางพื้นที่สะสมหางซ้าย $P(Z \\le z)$" },
        { id: "stat-l37", title: "คาบที่ 37: ความน่าจะเป็นทางซ้ายและขวา P(Z >= z)", desc: "สูตร $1 - P(Z \\le z)$ สำหรับพื้นที่ทางขวา และสมบัติความสมมาตร" },
        { id: "stat-l38", title: "คาบที่ 38: ความน่าจะเป็นระหว่างค่า Z สองค่า", desc: "$P(z_1 \\le Z \\le z_2) = P(Z \\le z_2) - P(Z \\le z_1)$ และช่วงสมมาตร" },
        { id: "stat-l39", title: "คาบที่ 39: การคำนวณความน่าจะเป็นปกติทั่วไป X", desc: "โฟลว์ 4 ขั้นตอน: กำหนด $X \\to$ แปลงเป็น $Z \\to$ วาดรูป $\\to$ เปิดตาราง" },
        { id: "stat-l40", title: "คาบที่ 40: จำนวนข้อมูล ร้อยละ และความถี่คาดหวัง", desc: "การคำนวณจำนวนคน/ชิ้นงานจริงจากความถี่คาดหวัง $N \\times P$" }
      ]
    },
    {
      id: "stat-chap-9",
      number: 9,
      title: "ปัญหาย้อนกลับ (Inverse Normal) และตำแหน่งเปอร์เซ็นไทล์",
      chapterTitle: "บทที่ 9: ปัญหาย้อนกลับ (Inverse Normal) และตำแหน่งเปอร์เซ็นไทล์",
      badgeClass: "badge-w9",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 41 - 45",
      desc: "ส่องหาค่า z จากเนื้อในตาราง, แปลงกลับ x = mu + z sigma, เปอร์เซ็นไทล์ Pr, หาพารามิเตอร์ 1 ตัว และระบบสมการ 2 ตัวแปร",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l41", title: "คาบที่ 41: ปัญหาย้อนกลับ: จากพื้นที่สู่ค่า z", desc: "การส่องหาตัวเลขในเนื้อตาราง สสวท. เพื่อถอดค่า $z$" },
        { id: "stat-l42", title: "คาบที่ 42: แปลงกลับสู่ค่าจริง x = mu + z sigma", desc: "การคำนวณค่าจริงของข้อมูลและจุดตัดเกณฑ์ในบริบทโจทย์จริง" },
        { id: "stat-l43", title: "คาบที่ 43: ตำแหน่งเปอร์เซ็นไทล์ Pr กับพื้นที่ปกติ", desc: "ความสัมพันธ์ $P(X \\le P_r) = \\frac{r}{100}$ และการหาค่า $Q_1, Q_3, IQR$" },
        { id: "stat-l44", title: "คาบที่ 44: แก้สมการหาพารามิเตอร์ mu หรือ sigma", desc: "การหาค่าเฉลี่ยหรือส่วนเบี่ยงเบนมาตรฐานจากเงื่อนไขความน่าจะเป็น 1 จุด" },
        { id: "stat-l45", title: "คาบที่ 45: แก้ระบบสมการ 2 ตัวแปรหาทั้ง mu และ sigma", desc: "โจทย์ยอดฮิต A-Level: สร้าง 2 สมการจาก 2 จุดบนเส้นโค้งปกติ" }
      ]
    },
    {
      id: "stat-chap-10",
      number: 10,
      title: "โจทย์ประยุกต์สถานการณ์จริงและข้อสอบแข่งขัน A-Level",
      chapterTitle: "บทที่ 10: โจทย์ประยุกต์สถานการณ์จริงและข้อสอบแข่งขัน A-Level",
      badgeClass: "badge-w10",
      periodRange: "5 คาบเรียน",
      periodRangeText: "คาบที่ 46 - 50",
      desc: "การตัดเกรดอิงกลุ่ม (Curved Grading), การรับประกันสินค้า (Warranty), ตะลุยโจทย์ A-Level Clinic ไม่ต่อเนื่อง/ทวินาม/ปกติ และสรุปภาพรวม",
      subjectCode: "ค33202",
      subjectName: "คณิตศาสตร์เพิ่มเติม 6",
      grade: "มัธยมศึกษาปีที่ 6",
      semester: "1 ภาคเรียน",
      topics: [
        { id: "stat-l46", title: "คาบที่ 46: ประยุกต์ 1: การตัดเกรดอิงกลุ่ม (Curved Grading)", desc: "คำนวณช่วงคะแนนตัดเกรด A, B, C, D, F ตามสัดส่วนพื้นที่ใต้เส้นโค้ง" },
        { id: "stat-l47", title: "คาบที่ 47: ประยุกต์ 2: รับประกันสินค้า & พิกัดความเผื่อ", desc: "กำหนดอายุรับประกัน $W$ เพื่อคุมอัตราเคลม และพิกัดความเผื่อในโรงงาน" },
        { id: "stat-l48", title: "คาบที่ 48: A-Level Clinic 1: ไม่ต่อเนื่องและทวินาม", desc: "เจาะลึกข้อสอบคณิตประยุกต์ 1 A-Level เรื่องตัวแปรสุ่มและทวินาม" },
        { id: "stat-l49", title: "คาบที่ 49: A-Level Clinic 2: ปกติและปัญหาย้อนกลับ", desc: "พิชิตโจทย์ A-Level การแจกแจงปกติ ระบบสมการ $\\mu, \\sigma$ และเปอร์เซ็นไทล์" },
        { id: "stat-l50", title: "คาบที่ 50: สรุปภาพรวมมโนทัศน์ทั้งภาคเรียน & Final Challenge", desc: "Mind Map สังเคราะห์ความเชื่อมโยงทั้ง 10 บท และโจทย์ทดสอบระดับปรมาจารย์" }
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
      id: "unit-stat-prob",
      title: "ตัวแปรสุ่มและการแจกแจงความน่าจะเป็น",
      shortTitle: "ตัวแปรสุ่ม & การแจกแจง",
      grade: "มัธยมศึกษาปีที่ 6",
      gradeShort: "ม.6 (1 ภาคเรียน)",
      subjectCode: "คณิตศาสตร์เพิ่มเติม 6 (ค33202)",
      totalPeriods: "50 คาบเรียน (10 บท)",
      status: "ready",
      statusBadge: "พร้อมสอน • 50 คาบ",
      icon: "🎲",
      desc: "ตัวแปรสุ่มไม่ต่อเนื่อง/ต่อเนื่อง, PMF, CDF, ค่าคาดหมาย, ความแปรปรวน, ทวินาม, การแจกแจงปกติ, คะแนน Z, ตาราง สสวท., ปัญหาย้อนกลับ และ A-Level",
      chapters: STAT_CHAPTERS_DATA
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
      if (unitId === 'unit-stat-prob') return STAT_CHAPTERS_DATA;
      return CHAPTERS_DATA.concat(COMPLEX_CHAPTERS_DATA, STAT_CHAPTERS_DATA);
    },

    getChapter: function(chapId) {
      const all = CHAPTERS_DATA.concat(COMPLEX_CHAPTERS_DATA, STAT_CHAPTERS_DATA);
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
