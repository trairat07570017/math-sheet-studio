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
