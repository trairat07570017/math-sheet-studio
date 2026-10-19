# MathSheet AI Studio — เครื่องมือสร้างชีทการสอนคณิตศาสตร์ ม.ปลาย (สสวท.)

> **เว็บแอปพลิเคชันสำหรับสร้าง จัดรูปแบบ ออกแบบโจทย์คณิตศาสตร์ และพิมพ์ใบงาน A4 สวยงามตามมาตรฐานหลักสูตร สสวท. รองรับ KaTeX สมการคมชัด 100% พร้อมโหมด GitHub Pages ที่เปิดใช้งานได้ทันทีทั่วโลก**

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://pages.github.com/)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX-00f5d4?style=for-the-badge&logo=latex)](https://katex.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 ทำไมการรันบน GitHub Pages จึงดีกว่า?
1. **KaTeX รันสมบูรณ์ 100% ไม่มีปัญหา Sandbox:** รันโดยตรงบนเบราว์เซอร์ของผู้ใช้ ไม่ถูกจำกัดโดย iframe sandbox ของ Google Apps Script โหลดสมการคณิตศาสตร์และฟอนต์ Sarabun / Prompt ได้รวดเร็วและไม่มี Race Condition
2. **พิมพ์ใบงาน A4 คมชัด ไม่เพี้ยน:** คำสั่งพิมพ์ (`Ctrl+P` / `⌘P`) ทำงานบนระดับหน้าต่างหลัก (Top-level Window) ได้โดยตรง ไม่ติดขอบ iframe สามารถบันทึกเป็น PDF หรือพิมพ์ลงกระดาษจริงได้คมชัดตามสัดส่วน A4 มาตรฐาน
3. **จัดเก็บการตั้งค่าแบบ Native LocalStorage:** ระบบจำชื่อโรงเรียน ครูผู้สอน และรหัสวิชาประจำบทได้อย่างเสถียร ไม่ถูกบล็อกคุกกี้บุคคลที่สาม (Third-party Storage)
4. **โหลดเร็วระดับ Global CDN:** ให้บริการผ่านเซิร์ฟเวอร์ความเร็วสูงของ GitHub พร้อม HTTPS ฟรีตลอดชีพ

---

## 🚀 วิธีนำขึ้น GitHub และเปิดใช้งาน GitHub Pages ใน 3 ขั้นตอน

### ขั้นตอนที่ 1: สร้าง Repository บน GitHub
1. ไปที่ [GitHub.com](https://github.com/new) แล้วกด **New repository**
2. ตั้งชื่อ Repository เช่น `math-sheet-studio`
3. เลือกเป็น **Public** แล้วกด **Create repository**

### ขั้นตอนที่ 2: Push โค้ดขึ้น GitHub
เปิด Terminal ในโฟลเดอร์นี้ แล้วรันคำสั่งต่อไปนี้ (แทนที่ `<YOUR_USERNAME>` ด้วยชื่อบัญชี GitHub ของคุณ):

```bash
# 1. เพิ่มไฟล์ทั้งหมด
git add .

# 2. ทำการ Commit
git commit -m "Initial commit: MathSheet AI Studio with KaTeX & 24 IPST Lessons"

# 3. ตั้งชื่อกิ่งเป็น main
git branch -M main

# 4. เชื่อมโยงกับ GitHub Repository ของคุณ
git remote add origin https://github.com/<YOUR_USERNAME>/math-sheet-studio.git

# 5. Push ขึ้น GitHub
git push -u origin main
```

### ขั้นตอนที่ 3: เปิดใช้งาน GitHub Pages (1 คลิก)
1. ในหน้า Repository บน GitHub เข้าไปที่แท็บ **Settings**
2. เมนูด้านซ้ายเลือก **Pages**
3. ภายใต้หัวข้อ **Build and deployment**:
   - Source: เลือก **Deploy from a branch**
   - Branch: เลือก **main** และโฟลเดอร์เป็น **/ (root)**
4. กดปุ่ม **Save**
5. รอประมาณ 1-2 นาที คุณจะได้ลิงก์เว็บไซต์พร้อมใช้งานทันที เช่น:
   `https://<YOUR_USERNAME>.github.io/math-sheet-studio/`

---

## 📁 โครงสร้างไฟล์ในโปรเจกต์
- `index.html`: หน้าเว็บหลัก (Single Page Application) รวมระบบ KaTeX Math Engine, UI สไตล์ Penpot AI Workflows (Dark Cyber Canvas), A4 Live Sheet, ระบบตั้งค่าส่วนกลาง และ Interactive Block Editor
- `curriculum_24_lessons.json`: ฐานข้อมูลหลักสูตรคณิตศาสตร์ สสวท. 24 คาบเรียน (192 ข้อสอบพร้อม LaTeX สมบูรณ์)
- `CONTEXT.md`: สารบัญสถาปัตยกรรมระบบ Domain Model และ Architecture Decision Records (ADRs 001 - 019)
- `Code.gs`: สคริปต์ Google Apps Script (สำหรับกรณีต้องการเชื่อมต่อ Google Docs / Google Drive Backend)
- `appsscript.json`: ค่าคอนฟิกสิทธิ์ Google Apps Script Manifest
- `scripts/`: สคริปต์ยูทิลิตี้สำหรับจัดรูปแบบและสร้างฐานข้อมูล

---

## ⚡ ไฮไลต์ฟีเจอร์เด่น
1. **คลังเนื้อหาครบ 24 คาบเรียน (ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม ม.4):**
   - รวม 6 บทเรียนหลัก 24 คาบเรียน รวมโจทย์ 192 ข้อ
   - ทุกคาบประกอบด้วย:
     - **ตอนที่ 1:** สรุปสาระสำคัญ นิยาม กฎ สูตร และเทคนิคคิดเร็ว
     - **ตอนที่ 2 (ตัวอย่าง 2 ข้อ):** ตัวอย่างที่ 1 มีวิธีทำละเอียดแบบกะทัดรัด + ตัวอย่างที่ 2 เว้นที่ว่างสำหรับฝึกทำสดในห้อง
     - **ตอนที่ 3 (แบบฝึกหัด 6 ข้อ):** เว้นพื้นที่ว่าง 5-6 บรรทัด (145px - 195px) ให้นักเรียนคิดคำนวณ ไม่มีเฉลยหรือคะแนนกวนใจ
2. **ระบบตั้งค่าส่วนกลางและส่งต่อรหัสวิชา (Settings Cascade):**
   - ปุ่ม `⚙️ ตั้งค่าระบบ`: กำหนดชื่อโรงเรียน, ครูผู้สอน, ปีการศึกษา และขนาดสมการ KaTeX ได้ทั่วทั้งระบบ
   - ปุ่ม `⚙️ ตั้งค่าบท`: กำหนดรหัสวิชาประจำบทเรียนหลัก แล้วระบบจะส่งต่อไปยัง 4 คาบย่อยในบทนั้นโดยอัตโนมัติ
3. **พิมพ์ A4 เป็นธรรมชาติ (Multi-Page Print Flow):**
   - พิมพ์ต่อเนื่อง 2-3 หน้าโดยไม่โดนบีบอัด ไม่ตกขอบ และข้อสอบไม่ขาดกลางระหว่างรอยต่อหน้ากระดาษ
4. **Interactive Block Editor:**
   - คุณครูสามารถกด `✏️ แก้ไข`, `⬆️ / ⬇️ สลับลำดับ`, `🗑️ ลบข้อ` หรือ `＋ เพิ่มข้อสอบใหม่` บนหน้ากระดาษได้ทันที พร้อม KaTeX Live Preview

---

## 💻 วิธีเปิดใช้งานในเครื่องทันที (Local Preview)
สามารถดับเบิลคลิกไฟล์ `index.html` เพื่อเปิดใช้งานบน Google Chrome, Safari, หรือ Edge ได้ทันที 100% โดยไม่ต้องเชื่อมต่ออินเทอร์เน็ตหรือรันเซิร์ฟเวอร์ใดๆ!
