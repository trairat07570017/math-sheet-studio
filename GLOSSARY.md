# MathSheet AI Studio — Domain Model

This glossary defines the ubiquitous language for MathSheet AI Studio, an automated math curriculum and worksheet generation platform for Thai Upper Secondary Education (สสวท. & สทศ. O-NET).

## Worksheet Structure & Content

**Exercise (ข้อสอบ/แบบฝึกหัด)**:
An assessment item intended for students to practice or take as a test, containing problem statement, answer choices/grid-in specs, point values, and an answer key with full reasoning hidden from the student sheet.
_Avoid_: Task, quiz item, assignment

**Example (ตัวอย่างสาธิต)**:
An instructional item containing a problem statement with fully exposed step-by-step LaTeX solution printed directly on the student worksheet for teacher modeling.
_Avoid_: Sample problem, demo question

**Trap Buster (จุดดักและหลุมพราง)**:
A high-visibility callout box highlighting frequent student misconceptions and tricky exam edge cases specific to the topic.
_Avoid_: Tips, notes, caution box

**Formula Box (กล่องสรุปสูตร)**:
A compact reference block at the beginning of a worksheet or unit displaying key mathematical identities and formulas.
_Avoid_: Cheatsheet card, rule summary

## O-NET Blueprint Context

**O-NET 69 Crash Course**:
A curriculum module matching the high-yield questions of the NIETS O-NET Math blueprint for Grade 12 (ปีการศึกษา 2569).
_Avoid_: Mock exam, short course, crash review

**Grid-In Question (ข้อสอบแบบระบายตัวเลขคำตอบ)**:
A non-multiple-choice exam item worth 5.00 points requiring numeric filling/bubbling.
_Avoid_: Free response, fill-in-the-blank, open-ended problem

## Rendering & Print Architecture

**KaTeX Pre-render Guard**:
An automated lifecycle hook ensuring all mathematical formulas are strictly parsed and converted to crisp vector DOM nodes before display, topic switching, and print execution, with fallback polling and error recovery.
_Avoid_: Lazy math load, unverified LaTeX

**Continuous Natural Flow (การจัดพิมพ์แบบต่อเนื่องธรรมชาติ)**:
A print layout standard that lets exercises flow seamlessly down pages according to physical content height without arbitrary manual page breaks, preventing wasted whitespace at the bottom of printed sheets.
_Avoid_: Rigid manual break, fragmented pagination

**Page-Budget Calibration (การจัดสรรงบประมาณหน้าพิมพ์)**:
The precision engineering of vertical padding, margins, formula block heights, and calculation canvas dimensions to guarantee a target page count (such as exactly 4 A4 pages / 2 double-sided sheets for a 20-item exam) without orphaned trailing pages or excessive bottom whitespace.
_Avoid_: Uncontrolled spillover, arbitrary page count

**Blueprint-Pure Item Bank (คลังข้อสอบตรงผัง สทศ. 100%)**:
An exam bank strictly aligned with the official NIETS O-NET Upper Secondary Basic Mathematics Test Blueprint (`TB_04MaM6`), encompassing exactly 25 items and 100.00 points across 2 balanced sessions, with all out-of-scope topics (e.g., circular permutations, substitution exponential equations, quantifiers) rigorously eliminated.
_Avoid_: Out-of-scope bloated bank, unverified mock exam

**Ruled Handwriting Workspace (พื้นที่บรรทัดเขียนแสดงวิธีทำ 5 บรรทัด)**:
A pedagogical student workspace consisting of exactly 5 horizontal dotted ruled lines (~19px line height, ~100px total height) with a watermark, providing structured ruled space for students to write working steps, arithmetic, and reasoning cleanly on printed worksheets.
_Avoid_: Blank unguided box, cramped scratchpad

**Detailed Step-by-Step Solution (เฉลยวิธีทำละเอียด KaTeX)**:
A 3-tier instructional solution block displayed in Teacher Key Mode, featuring mathematical concept/formula references, step-by-step aligned LaTeX derivations (`\begin{aligned}`), numeric substitutions, and fast-track test-taking / trap-busting explanations.
_Avoid_: Bare answer number, unformatted scratch text

**Teacher Solution Manual (คู่มือเฉลยละเอียดสำหรับครู)**:
A complete printed or exportable document edition of the O-NET crash course where blank ruled handwriting workspaces are replaced by detailed step-by-step KaTeX solution blocks under a Continuous Solution Flow layout.
_Avoid_: Answer key cheat sheet, raw markup printout



