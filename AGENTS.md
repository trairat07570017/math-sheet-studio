# MathSheet AI Studio — Project Guidelines & Workflow Memory

## 1. คำสั่งจำเฉพาะสำหรับโปรเจกต์นี้ (User Preferences & Deployment)
* **Auto Build & Deploy to GitHub Pages:**
  - ทุกครั้งที่พัฒนาหรือแก้ไขโค้ดเสร็จสมบูรณ์ ให้รันคำสั่งคอมไพล์ `node build.js` เสมอ (ห้ามแก้ `index.html` โดยตรง ให้แก้ในโฟลเดอร์ `src/`)
  - หลังจากตรวจสอบความถูกต้องแล้ว ให้ทำการ `git add .`, `git commit` และ `git push origin main` เพื่อ Deploy ขึ้น GitHub Pages โดยอัตโนมัติ เพื่อให้ผู้ใช้สามารถเปิดทดสอบบนเบราว์เซอร์จริงได้ทันทีที่:
    👉 `https://trairat07570017.github.io/math-sheet-studio/`

## 2. โครงสร้างสถาปัตยกรรม (Architecture Guidelines)
* **Modular Structure:**
  - `src/styles/main.css`: CSS Design System และ Print Rules
  - `src/markup/`: ส่วนโครงร่างหน้าเว็บ (`head.html`, `body.html`)
  - `src/modules/`: โมดูลเชิงลึก (`curriculum-store.js`, `storage-gateway.js`, `sheet-render-engine.js`, `app.js`)
  - `src/data/curriculum.json`: ฐานข้อมูลหลักสูตร สสวท. ม.ปลาย
* **KaTeX & Print Fidelity (กฎเหล็ก KaTeX Pre-render Guard):**
  - **ต้องรัน KaTeX เสมอ:** ห้ามปล่อยให้สมการ LaTeX ดิบหลุดรอดเด็ดขาด ทั้งในหน้าพรีวิวและตอนพิมพ์/ส่งออก PDF
  - ต้องผูก KaTeX Pre-render Guard ทุกจุด: เมื่อโหลดหน้าเว็บ, สลับหัวข้อ (`selectTopic`), สลับโหมดเฉลย, และก่อนคำสั่งพิมพ์ (`beforeprint`, `prepareAndPrint`, Clean Tab View) ต้องเรียก typesetMath ให้สมบูรณ์ก่อนเสมอ
  - Delimiters ต้องรองรับครบถ้วน: `$$...$$`, `$..$`, `\[...\]`, และ `\(...\)` พร้อมกลไกตรวจจับและห่อหุ้ม `\begin{aligned}` อัตโนมัติ
  - รักษาความคมชัดระดับเวกเตอร์ 100% สำหรับสมการ KaTeX ทั้งหมด ห้ามใช้ Raster Canvas / ภาพแตก
* **Continuous Natural Flow (การจัดพิมพ์ต่อเนื่อง ไร้ที่ว่างทิ้งขว้าง):**
  - ในชีทติวเข้มและคลังข้อสอบ ห้ามใส่ Hard Page Break แบบตายตัวที่ทำให้เกิดช่องว่างทิ้งขว้างด้านล่างของหน้ากระดาษ
  - ให้ใช้เลย์เอาต์ไหลยาวต่อเนื่อง (Natural Continuous Flow) พร้อมพื้นที่ทดเลขกะทัดรัดสมดุล เพื่อการใช้พื้นที่หน้ากระดาษ A4 คุ้มค่าที่สุด
* **ADR & Documentation:**
  - ทุกการตัดสินใจทางสถาปัตยกรรมที่สำคัญ ให้บันทึกลงใน `CONTEXT.md` (ADRs) เพื่อรักษา Paper Trail
