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
* **KaTeX & Print Fidelity:**
  - รักษาความคมชัดระดับเวกเตอร์ 100% สำหรับสมการ KaTeX ทั้งหมด
  - ห้ามใช้ Raster Canvas / ภาพแตก ในการส่งออก PDF ให้ใช้ Native Print Flow หรือ Standalone Tab View เสมอ
* **ADR & Documentation:**
  - ทุกการตัดสินใจทางสถาปัตยกรรมที่สำคัญ ให้บันทึกลงใน `CONTEXT.md` (ADRs) เพื่อรักษา Paper Trail
