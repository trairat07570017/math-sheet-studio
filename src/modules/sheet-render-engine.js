/**
 * Sheet Render Engine Module
 * 
 * Deep module that compiles lesson domain models into the A4 printable document DOM,
 * encapsulates KaTeX auto-render and typesetting orchestration,
 * and manages print isolation and dynamic PDF filename assignments.
 * 
 * Interface:
 * - render(paperElement, topicData, options)
 * - typeset(element)
 * - setZoom(delta) / resetZoom() / getZoom()
 * - print(topicData, options)
 * - getPrintFileName(topicData, options)
 */

(function(window) {
  'use strict';

  let _currentZoom = 1.0;
  let _originalDocTitle = document.title;
  let _katexPollingInterval = null;

  // Environment Sniffer for Mobile, iOS/iPadOS, and In-App WebViews
  const EnvironmentSniffer = {
    isIOS: function() {
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const isApple = /iPad|iPhone|iPod/.test(ua);
      const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      return isApple || isIPadOS;
    },
    isAndroid: function() {
      return /Android/i.test(navigator.userAgent || '');
    },
    isMobile: function() {
      return this.isIOS() || this.isAndroid() || (window.innerWidth <= 840);
    },
    isInAppBrowser: function() {
      const ua = (navigator.userAgent || '').toLowerCase();
      return (
        ua.includes('line') ||
        ua.includes('fbav') ||
        ua.includes('fban') ||
        ua.includes('instagram') ||
        ua.includes('twitter') ||
        ua.includes('messenger') ||
        ua.includes('micromessenger')
      );
    },
    isInIframe: function() {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }
  };

  // Typeset math on any element using KaTeX
  function typesetMath(rootElement) {
    const el = rootElement || document.body;
    if (typeof window.renderMathInElement === 'function') {
      try {
        // Pre-sanitize any equation-stage that might have unrendered \begin{...} without $$
        const stages = el.querySelectorAll ? el.querySelectorAll('.equation-stage') : [];
        if (stages.length) {
          stages.forEach(function(stg) {
            if (!stg.querySelector('.katex')) {
              const raw = stg.textContent.trim();
              if (raw.indexOf('\\begin{aligned}') !== -1 && raw.indexOf('$$') === -1 && raw.indexOf('\\[') === -1) {
                stg.innerHTML = '$$' + raw + '$$';
              }
            }
          });
        }

        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false,
          errorColor: '#ef4444'
        });
      } catch (err) {
        console.warn('KaTeX rendering error:', err);
      }
    }
  }

  // Poll until KaTeX is ready if it loaded deferred
  function initKaTeXPolling(callback) {
    if (typeof window.renderMathInElement === 'function') {
      typesetMath(document.body);
      if (callback) callback();
      return;
    }
    let attempts = 0;
    if (_katexPollingInterval) clearInterval(_katexPollingInterval);
    _katexPollingInterval = setInterval(function() {
      attempts++;
      if (typeof window.renderMathInElement === 'function') {
        typesetMath(document.body);
        if (callback) callback();
        clearInterval(_katexPollingInterval);
        _katexPollingInterval = null;
      } else if (attempts > 40) {
        clearInterval(_katexPollingInterval);
        _katexPollingInterval = null;
      }
    }, 75);
  }

  const SheetRenderEngine = {
    EnvironmentSniffer: EnvironmentSniffer,

    init: function() {
      const self = this;
      initKaTeXPolling(function() {
        const paper = document.getElementById('a4Paper');
        if (paper) typesetMath(paper);
      });

      this.initInAppBanner();

      // Window print listeners for automatic PDF filename & zoom neutralization
      window.addEventListener('beforeprint', function() {
        const paper = document.getElementById('a4Paper');
        if (paper) paper.style.transform = 'none';
        _originalDocTitle = document.title;
        document.title = self.getPrintFileName();
      });

      window.addEventListener('afterprint', function() {
        const paper = document.getElementById('a4Paper');
        if (paper) paper.style.transform = 'scale(' + _currentZoom + ')';
        if (_originalDocTitle) document.title = _originalDocTitle;
      });

      return this;
    },

    typeset: function(el) {
      typesetMath(el);
    },

    getZoom: function() {
      return _currentZoom;
    },

    setZoom: function(zoomLevel) {
      _currentZoom = Math.max(0.4, Math.min(2.0, parseFloat(zoomLevel) || 1.0));
      this.applyZoom();
      return _currentZoom;
    },

    adjustZoom: function(delta) {
      return this.setZoom(_currentZoom + delta);
    },

    resetZoom: function() {
      return this.setZoom(1.0);
    },

    applyZoom: function() {
      const paper = document.getElementById('a4Paper');
      const valEl = document.getElementById('canvasZoomVal');
      if (paper) {
        paper.style.transform = 'scale(' + _currentZoom + ')';
      }
      if (valEl) {
        valEl.textContent = Math.round(_currentZoom * 100) + '%';
      }
    },

    /**
     * Compute clean filename for browser Print / Save to PDF
     */
    getPrintFileName: function(topicData, options) {
      const data = topicData || (window.CurriculumStore ? window.CurriculumStore.getTopic() : null);
      const isTeacher = options && options.isTeacherKey !== undefined ? options.isTeacherKey : (window.CurriculumStore ? window.CurriculumStore.isTeacherKeyMode() : false);
      const mode = options && options.mode ? options.mode : (window.CurriculumStore ? window.CurriculumStore.getCurrentSheetMode() : 'worksheet');

      const fSheet = document.getElementById('fieldSheet');
      const fSubject = document.getElementById('fieldSubject');

      let sheetName = (fSheet && fSheet.value.trim()) ? fSheet.value.trim() : '';
      if (!sheetName && data) {
        const modeData = data[mode] || data.worksheet;
        sheetName = modeData ? modeData.sheetName : data.title;
      }
      if (!sheetName) sheetName = 'ใบงานคณิตศาสตร์';

      const grade = data ? data.gradeShort : 'ม.ปลาย';
      let subCode = '';
      if (fSubject && fSubject.value) {
        const match = fSubject.value.match(/\(([^)]+)\)/);
        if (match) {
          subCode = match[1].trim();
        } else if (fSubject.value.trim().length <= 10) {
          subCode = fSubject.value.trim();
        }
      }

      const cleanSheetName = sheetName.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, ' ').trim();
      const prefix = isTeacher ? '[เฉลย] ' : '';

      if (subCode) {
        return prefix + '[' + grade + '-' + subCode + '] ' + cleanSheetName;
      } else {
        return prefix + '[' + grade + '] ' + cleanSheetName;
      }
    },

    /**
     * Trigger browser print with title swap and zoom preservation
     * Handles iOS Safari direct activation requirement synchronously
     */
    /**
     * Trigger native browser vector print (Print / Save as PDF)
     * Operates 100% synchronously so iOS Safari and Chrome don't drop the user gesture.
     */
    print: function(topicData, options) {
      const canvasArea = document.getElementById('canvasViewport') || document.querySelector('.canvas-viewport');
      if (canvasArea) canvasArea.style.display = 'flex';

      const paper = document.getElementById('a4Paper');
      if (paper) paper.style.transform = 'none';

      _originalDocTitle = document.title;
      document.title = this.getPrintFileName(topicData, options);

      try {
        window.print();
      } catch (err) {
        console.warn('Window print execution error:', err);
      }
    },

    /**
     * Open Clean Standalone A4 Print View in a new browser tab.
     * Contains only the A4 document + KaTeX and Sarabun fonts without any studio UI.
     * In Safari on iOS, this enables native Share > "Save to Files" or "Print" effortlessly.
     */
    openCleanPrintTab: function(topicData, options) {
      const paper = document.getElementById('a4Paper');
      if (!paper) {
        alert('ไม่พบหน้ากระดาษใบงานสำหรับส่งออก');
        return;
      }

      const fileName = this.getPrintFileName(topicData, options);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // Fallback to direct print if popup blocked
        this.print(topicData, options);
        return;
      }

      // Clone clean paper without editor controls
      const paperClone = paper.cloneNode(true);
      paperClone.style.transform = 'none';
      const toRemove = paperClone.querySelectorAll('.no-print, .exercise-actions-bar, .add-exercise-container');
      toRemove.forEach(function(el) { el.remove(); });

      const fontsCss = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Prompt:wght@400;500;600&family=Sarabun:wght@400;500;600&display=swap';
      const katexCss = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      const katexJs = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      const katexAutoRenderJs = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';

      printWindow.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <link rel="stylesheet" href="${fontsCss}">
  <link rel="stylesheet" href="${katexCss}">
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Sarabun', 'Prompt', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .a4-paper-sheet {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px 24px;
      background: #ffffff;
      box-sizing: border-box;
    }
    .sheet-main-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.65rem;
      margin-bottom: 0.85rem;
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-school-name { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.2rem 0; color: #0f172a; }
    .sheet-subject-title { font-size: 0.95rem; font-weight: 600; margin: 0 0 0.15rem 0; color: #334155; }
    .sheet-teacher-meta { font-size: 0.85rem; color: #475569; margin: 0.15rem 0 0.25rem 0; font-weight: 500; }
    .sheet-curriculum-standard { color: #64748b; font-size: 0.8rem; margin: 0; }
    .sheet-student-meta {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #cbd5e1;
      padding-top: 0.45rem;
      margin-top: 0.45rem;
      font-size: 0.85rem;
    }
    .sheet-block {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.75rem 1rem;
      margin-bottom: 0.85rem;
      background: #ffffff;
      break-inside: auto;
      page-break-inside: auto;
    }
    .sheet-block-badge {
      color: #1e3a8a;
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 0.4rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-exercise {
      margin-bottom: 0.75rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .exercise-header {
      font-weight: 600;
      line-height: 1.5;
      margin-bottom: 0.35rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-formula-box, .sheet-solution-box {
      background: #f8fafc !important;
      border-left: 3.5px solid #2563eb;
      padding: 0.55rem 0.85rem;
      margin-bottom: 0.45rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .handwriting-grid {
      min-height: 145px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: repeating-linear-gradient(0deg, transparent, transparent 25px, #e2e8f0 26px) !important;
      margin-top: 0.4rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .handwriting-grid.grid-large { min-height: 195px; }
    .sheet-footer-line {
      border-top: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 8pt;
      margin-top: 0.85rem;
      padding-top: 0.4rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .katex-display { margin: 0.2rem 0; font-size: 1.08em; line-height: 1.5; }
    .katex { font-size: 1.06em; }
    .no-print, .exercise-actions-bar, .add-exercise-container { display: none !important; }
    @media print {
      body {
        margin: 0 !important;
        background: #ffffff !important;
      }
      .a4-paper-sheet {
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .sheet-exercise {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .sheet-main-header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .sheet-block-badge {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .exercise-header {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .sheet-formula-box, .sheet-solution-box, .handwriting-grid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  </style>
  <script src="${katexJs}"><\/script>
  <script src="${katexAutoRenderJs}"><\/script>
</head>
<body>
  ${paperClone.outerHTML}
  <script>
    async function initAndPrint() {
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (err) {}
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\\\[', right: '\\\\]', display: true },
            { left: '\\\\(', right: '\\\\)', display: false }
          ],
          throwOnError: false,
          errorColor: '#ef4444'
        });
      }
      setTimeout(function() {
        window.print();
      }, 150);
    }
    if (document.readyState === 'complete') {
      initAndPrint();
    } else {
      window.addEventListener('load', initAndPrint);
    }
  <\/script>
</body>
</html>`);
      printWindow.document.close();
    },

    /**
     * Open Commercial Workbook Print View in a new browser tab.
     * Renders multiple lessons (chapter or entire unit) with:
     * - Modern A4 Cover Page (IPST Commercial Edition)
     * - Strict per-lesson page breaks (break-before: page)
     * - 3 Edition modes: Student, Teacher Key, Complete (with Appendix)
     * - Floating toolbar for instant Preview and Vector Print / Save as PDF
     */
    openBookPrintTab: function(bookOptions) {
      const opts = bookOptions || {};
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('เบราว์เซอร์บล็อกหน้าต่างใหม่ (Pop-up Blocked) กรุณากดอนุญาตให้เปิด Pop-up เพื่อดูเล่มพรีวิว');
        return;
      }

      // Gather topics
      let topics = [];
      let defaultTitle = 'เอกสารรวมเล่มคณิตศาสตร์';
      let defaultSubjectCode = 'ค31202';
      let defaultGrade = 'มัธยมศึกษาปีที่ 4';
      let defaultSemester = 'ภาคเรียนที่ 2';

      if (opts.topicIds && opts.topicIds.length) {
        topics = opts.topicIds.map(function(id) {
          return window.CurriculumStore ? window.CurriculumStore.getTopic(id) : null;
        }).filter(Boolean);
        if (topics.length && topics[0]) {
          defaultSubjectCode = topics[0].subjectCode || defaultSubjectCode;
          defaultGrade = topics[0].grade || defaultGrade;
          defaultSemester = topics[0].semester || defaultSemester;
        }
      } else if (opts.scope === 'chapter' && opts.chapterId) {
        const chapter = window.CurriculumStore ? window.CurriculumStore.getChapter(opts.chapterId) : null;
        if (chapter) {
          defaultTitle = chapter.chapterTitle || chapter.title;
          defaultSubjectCode = chapter.subjectCode || defaultSubjectCode;
          defaultGrade = chapter.grade || defaultGrade;
          defaultSemester = chapter.semester || defaultSemester;
        }
        topics = window.CurriculumStore ? window.CurriculumStore.getChapterTopics(opts.chapterId) : [];
      } else if (opts.scope === 'unit' && opts.unitId) {
        const units = window.CurriculumStore ? window.CurriculumStore.getUnits() : [];
        const unit = units.find(function(u) { return u.id === opts.unitId; });
        if (unit) {
          defaultTitle = unit.title;
          defaultSubjectCode = unit.subjectCode || defaultSubjectCode;
          defaultGrade = unit.grade || defaultGrade;
        }
        topics = window.CurriculumStore ? window.CurriculumStore.getUnitTopics(opts.unitId) : [];
      } else {
        const curChap = window.CurriculumStore ? window.CurriculumStore.getChapterByTopicId() : null;
        if (curChap) {
          defaultTitle = curChap.chapterTitle || curChap.title;
          defaultSubjectCode = curChap.subjectCode || defaultSubjectCode;
          defaultGrade = curChap.grade || defaultGrade;
          topics = window.CurriculumStore.getChapterTopics(curChap.id);
        } else {
          topics = window.CurriculumStore ? window.CurriculumStore.getUnitTopics() : [];
        }
      }

      if (!topics || !topics.length) {
        alert('ไม่พบรายการบทเรียนสำหรับรวมเล่ม');
        printWindow.close();
        return;
      }

      const totalLessons = topics.length;
      const fSchool = document.getElementById('fieldSchool');
      const schoolName = opts.schoolName || (fSchool && fSchool.value ? fSchool.value.trim() : 'โรงเรียนมัธยมวิทยาคม (สสวท.)');
      const fTeacher = document.getElementById('fieldTeacher');
      const authorName = opts.authorName || (fTeacher && fTeacher.value ? fTeacher.value.trim() : 'กลุ่มสาระการเรียนรู้คณิตศาสตร์');
      const coverTitle = opts.coverTitle || defaultTitle;
      const coverSubtitle = opts.coverSubtitle || (opts.scope === 'unit' ? 'หลักสูตรแกนกลาง สสวท. ฉบับสมบูรณ์' : 'เอกสารประกอบการเรียนรู้และฝึกทักษะ');
      const subjectCode = opts.subjectCode || defaultSubjectCode;
      const grade = opts.grade || defaultGrade;
      const academicYear = opts.academicYear || 'ภาคเรียนที่ 2 ปีการศึกษา 2568';
      const copyrightText = opts.copyrightText || '© สงวนลิขสิทธิ์ตาม พ.ร.บ. ห้ามทำซ้ำหรือดัดแปลงเพื่อการจำหน่ายโดยไม่ได้รับอนุญาต';
      const copyrightShort = copyrightText.split(' ')[0] + ' ' + (authorName || 'MathSheet AI');
      const showPageNums = opts.showPageNumbers !== false;
      const hideStudentHeader = opts.hideStudentHeader !== false;
      const bookType = opts.bookType || 'student';

      let editionBadge = '📘 ฉบับแบบฝึกหัดนักเรียน (Student Workbook)';
      let filePrefix = '[เล่มรวมนักเรียน] ';
      if (bookType === 'teacher') {
        editionBadge = '🔑 ฉบับเฉลยละเอียดสำหรับครู (Teacher Solution Key)';
        filePrefix = '[เล่มเฉลยครู] ';
      } else if (bookType === 'complete') {
        editionBadge = '📦 ฉบับรวมสมบูรณ์ (โจทย์ + เฉลยท้ายเล่ม)';
        filePrefix = '[เล่มรวมสมบูรณ์] ';
      }

      const cleanDocTitle = (filePrefix + coverTitle).replace(/[/\\?%*:|"<>]/g, '-');

      // Helper function to render a single topic sheet HTML
      function buildTopicSheetHtml(topicData, sheetOpts) {
        const sOpts = sheetOpts || {};
        const mode = sOpts.mode || 'worksheet';
        const isTeacher = !!sOpts.isTeacherKey;
        const modeData = topicData[mode] || topicData.worksheet;
        if (!modeData) return '';

        const subj = sOpts.subject || topicData.subjectCode || subjectCode;
        const sheetName = modeData.sheetName || topicData.title;
        const pageFooter = sOpts.pageFooterText || '';

        // Part 1 concept
        let conceptHtml = modeData.conceptHtml || '';
        conceptHtml = conceptHtml.replace(/<div class="equation-stage">([\s\S]*?)<\/div>/g, function(match, inner) {
          const trimmed = inner.trim();
          if (trimmed && !trimmed.startsWith('$$') && !trimmed.startsWith('\\[') && trimmed.includes('\\begin{')) {
            return '<div class="equation-stage">\n    $$' + trimmed + '$$\n  </div>';
          }
          return match;
        });

        // Part 2 exercises
        let exHtml = '';
        const exercises = modeData.exercises || [];
        exercises.forEach(function(ex, idx) {
          let answerAreaHtml = '';
          if (ex.answerType === 'multiple-choice') {
            answerAreaHtml = `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem 1.25rem; margin-top: 0.65rem; font-size: 0.92rem; color: #334155; padding-left: 0.5rem;">
                <div><strong>ก.</strong> ${ex.choiceA || '................................'}</div>
                <div><strong>ข.</strong> ${ex.choiceB || '................................'}</div>
                <div><strong>ค.</strong> ${ex.choiceC || '................................'}</div>
                <div><strong>ง.</strong> ${ex.choiceD || '................................'}</div>
              </div>
            `;
          } else if (ex.answerType === 'short-answer') {
            answerAreaHtml = `
              <div style="margin-top: 0.65rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.92rem; color: #1e293b; padding-left: 0.5rem;">
                <span><strong>ตอบ:</strong></span>
                <div style="flex: 1; border-bottom: 1.5px dotted #94a3b8; height: 1.6rem;"></div>
              </div>
            `;
          } else if (ex.answerType === 'blank') {
            answerAreaHtml = `
              <div class="handwriting-grid" style="min-height: 145px; background: transparent; border: 1px dashed #cbd5e1;"></div>
            `;
          } else {
            const minH = ex.answerType === 'handwriting-large' ? '195px' : '145px';
            const isLarge = ex.answerType === 'handwriting-large' ? 'grid-large' : '';
            answerAreaHtml = `
              <div class="handwriting-grid ${isLarge}" style="min-height: ${minH};"></div>
            `;
          }

          const isWorkedExample = !!ex.latex;
          let workedExampleHtml = '';
          if (isWorkedExample) {
            let l = (ex.latex || '').trim();
            if (l.startsWith('$$') && l.endsWith('$$')) l = l.slice(2, -2).trim();
            l = l.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
            workedExampleHtml = `
              <div class="sheet-solution-box" style="margin: 0.3rem 0 0.15rem 0; padding: 0.45rem 0.75rem; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;">
                <div style="font-size: 0.88rem; font-weight: 600; color: #1d4ed8; margin-bottom: 0.2rem;">📘 แสดงวิธีทำ:</div>
                <div class="equation-stage" style="overflow-x: auto; color: #0f172a;">$$${l}$$</div>
                ${ex.placeholder ? `<div style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-top: 0.2rem;">${ex.placeholder}</div>` : ''}
              </div>
            `;
          }

          let teacherAnswerHtml = '';
          if (!isWorkedExample && ex.answer && isTeacher) {
            teacherAnswerHtml = `
              <div class="sheet-teacher-answer" style="display: flex; align-items: baseline; gap: 0.5rem; background: #f0fdf4; border: 1.5px solid #059669; border-radius: 4px; padding: 0.35rem 0.65rem; margin: 0.3rem 0 0.45rem 0; color: #064e3b;">
                <span class="answer-badge" style="font-weight: 700; color: #047857; font-size: 0.9rem;">🔑 เฉลย:</span>
                <span class="answer-text" style="color: #064e3b; font-weight: 600;">${ex.answer}</span>
              </div>
            `;
          }

          exHtml += `
            <div class="sheet-exercise" data-index="${idx}" style="${idx === 0 ? 'border-top: none; padding-top: 0;' : ''}">
              <div class="exercise-header">
                <span>${ex.title}</span>
              </div>
              ${isWorkedExample ? workedExampleHtml : `
                ${teacherAnswerHtml}
                ${isTeacher && ex.answer ? '' : answerAreaHtml}
              `}
            </div>
          `;
        });

        return `
          <div class="a4-paper-sheet book-lesson-sheet ${isTeacher ? 'show-teacher-key' : ''}">
            <div class="sheet-main-header">
              <div class="sheet-school-name">${schoolName}</div>
              <div class="sheet-subject-title">${subj} • ${sheetName}</div>
              <div class="sheet-teacher-meta">ครูผู้สอน: ${authorName}</div>
              <div class="sheet-curriculum-standard">${topicData.standard || ''}</div>
              ${!hideStudentHeader ? `
                <div class="sheet-student-meta">
                  <span>ชื่อ-สกุล: ............................................................................................</span>
                  <span>ชั้น ม........./.........</span>
                  <span>เลขที่ .............</span>
                </div>
              ` : ''}
            </div>

            <div class="sheet-block">
              <div class="sheet-block-badge">📘 ตอนที่ 1: สรุปสาระสำคัญและนิยามหลักสูตร สสวท.</div>
              <div class="sheet-concept-body">${conceptHtml}</div>
            </div>

            <div class="sheet-block">
              <div class="sheet-block-badge">${isTeacher ? '🔑 ตอนที่ 2: ข้อสอบและเฉลยละเอียด' : '✏️ ตอนที่ 2: ข้อสอบและแบบฝึกหัดทบทวน'}</div>
              <div class="sheet-exercise-body">${exHtml}</div>
            </div>

            <div class="sheet-footer-line book-footer-line">
              <span>${topicData.gradeShort || 'ม.ปลาย'} • ${subj} • ${topicData.title}</span>
              ${pageFooter ? `<strong style="color: #0f172a; font-size: 8.5pt;">${pageFooter}</strong>` : ''}
              <span>${copyrightShort}</span>
            </div>
          </div>
        `;
      }

      // Helper function to render Cover Page
      function renderCoverHtml() {
        return `
          <div class="a4-paper-sheet book-cover-page">
            <div class="cover-card-container">
              <div class="cover-header-badges">
                <span class="cover-pill-ipst">สสวท. มาตรฐานหลักสูตรแกนกลาง</span>
                <span class="cover-pill-code">${subjectCode} • ${grade}</span>
              </div>

              <div class="cover-center-box">
                <div class="cover-math-icon">📐</div>
                <div class="cover-edition-ribbon">${editionBadge}</div>
                <h1 class="cover-title-text">${coverTitle}</h1>
                ${coverSubtitle ? `<div class="cover-subtitle-text">${coverSubtitle}</div>` : ''}
                <div class="cover-curriculum-standard-note">อิงมาตรฐานการเรียนรู้และตัวชี้วัด สาระคณิตศาสตร์เพิ่มเติม (ฉบับปรับปรุง 2560)</div>

                <div class="cover-toc-container">
                  <div class="cover-toc-title">📋 สารบัญเนื้อหาภายในเล่ม (${topics.length} คาบเรียนสมบูรณ์):</div>
                  <div class="cover-toc-grid">
                    ${topics.map(function(t, idx) {
                      return `
                        <div class="cover-toc-item">
                          <span class="toc-num">${idx + 1}</span>
                          <span class="toc-name">${t.title}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>

              <div class="cover-footer-meta">
                <div class="cover-author-col">
                  <div class="author-label">จัดทำและเรียบเรียงโดย:</div>
                  <div class="author-val">${authorName}</div>
                  <div class="school-val">${schoolName} • ${(function() {
                    let txt = academicYear || '';
                    if (txt.indexOf('ภาคเรียน') === -1 && defaultSemester) {
                      return defaultSemester + ' ' + txt;
                    }
                    return txt;
                  })()}</div>
                </div>
                <div class="cover-copyright-col">
                  <div class="copyright-text">${copyrightText}</div>
                  <div class="tech-note">High-Fidelity KaTeX Vector Publishing • MathSheet AI Studio</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Helper for Appendix Divider
      function renderAppendixHtml() {
        return `
          <div class="a4-paper-sheet book-appendix-divider">
            <div class="appendix-inner-card">
              <div class="appendix-icon">🔑</div>
              <div class="appendix-badge">ภาคผนวกพิเศษ (Teacher Solution Appendix)</div>
              <h2 class="appendix-title">เฉลยคำตอบและวิธีทำละเอียดทุกข้อ</h2>
              <p class="appendix-desc">แสดงขั้นตอนการคำนวณและเทคนิคคิดลัด สำหรับแบบฝึกหัดทั้ง ${totalLessons} คาบเรียน</p>
              <div class="appendix-line"></div>
            </div>
          </div>
        `;
      }

      // Assemble content
      let renderedPages = [];

      // 1. Cover
      if (opts.includeCover !== false) {
        renderedPages.push(renderCoverHtml());
      }

      // 2. Lessons
      if (bookType === 'complete') {
        // Student part
        topics.forEach(function(t, idx) {
          const pageStr = showPageNums ? `คาบที่ ${idx + 1} จาก ${totalLessons} (ตอนที่ 1: แบบฝึกหัด)` : '';
          renderedPages.push(buildTopicSheetHtml(t, {
            mode: 'worksheet',
            isTeacherKey: false,
            pageFooterText: pageStr
          }));
        });

        // Appendix
        renderedPages.push(renderAppendixHtml());

        // Teacher part
        topics.forEach(function(t, idx) {
          const pageStr = showPageNums ? `เฉลยคาบที่ ${idx + 1} จาก ${totalLessons} (ตอนที่ 2: เฉลยละเอียด)` : '';
          renderedPages.push(buildTopicSheetHtml(t, {
            mode: 'worksheet',
            isTeacherKey: true,
            pageFooterText: pageStr
          }));
        });
      } else {
        const isTeacher = (bookType === 'teacher');
        topics.forEach(function(t, idx) {
          const pageStr = showPageNums ? `คาบที่ ${idx + 1} จาก ${totalLessons}` : '';
          renderedPages.push(buildTopicSheetHtml(t, {
            mode: 'worksheet',
            isTeacherKey: isTeacher,
            pageFooterText: pageStr
          }));
        });
      }

      const fontsCss = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Prompt:wght@400;500;600;700&family=Sarabun:wght@400;500;600;700&display=swap';
      const katexCss = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
      const katexJs = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
      const katexAutoRenderJs = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';

      printWindow.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanDocTitle}</title>
  <link rel="stylesheet" href="${fontsCss}">
  <link rel="stylesheet" href="${katexCss}">
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      color: #0f172a;
      font-family: 'Sarabun', 'Prompt', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .book-floating-toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid #00f5d4;
      padding: 0.65rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      color: #ffffff;
      font-family: 'Prompt', sans-serif;
    }
    .book-container {
      padding: 25px 0 60px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      background: #0f172a;
    }
    .a4-paper-sheet {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px 24px;
      background: #ffffff;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.35);
      box-sizing: border-box;
      border-radius: 4px;
    }
    .book-lesson-sheet {
      page-break-before: always;
      break-before: page;
      break-inside: auto;
      page-break-inside: auto;
    }
    .book-cover-page {
      width: 100%;
      max-width: 800px;
      min-height: 1120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 24px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40%, #f1f5f9 100%);
      border: 2px solid #cbd5e1;
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .cover-card-container {
      height: 100%;
      min-height: 1060px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 2px solid #1e3a8a;
      border-radius: 8px;
      padding: 35px 30px;
      background: #ffffff;
    }
    .cover-header-badges {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.75rem;
    }
    .cover-pill-ipst {
      font-size: 0.85rem;
      font-weight: 700;
      color: #1e3a8a;
      background: #dbeafe;
      padding: 3px 10px;
      border-radius: 4px;
      font-family: 'Prompt', sans-serif;
    }
    .cover-pill-code {
      font-size: 0.95rem;
      font-weight: 700;
      color: #0f172a;
      font-family: 'Prompt', sans-serif;
    }
    .cover-center-box {
      text-align: center;
      padding: 15px 0;
    }
    .cover-math-icon {
      font-size: 3.5rem;
      margin-bottom: 0.35rem;
      line-height: 1;
    }
    .cover-edition-ribbon {
      display: inline-block;
      font-size: 0.95rem;
      font-weight: 700;
      color: #047857;
      background: #d1fae5;
      border: 1px solid #10b981;
      padding: 4px 14px;
      border-radius: 20px;
      margin-bottom: 0.75rem;
      font-family: 'Prompt', sans-serif;
    }
    .cover-title-text {
      font-size: 2.1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.2rem 0 0.4rem 0;
      line-height: 1.3;
      font-family: 'Prompt', sans-serif;
    }
    .cover-subtitle-text {
      font-size: 1.15rem;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 0.4rem;
      font-family: 'Prompt', sans-serif;
    }
    .cover-curriculum-standard-note {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 1.25rem;
    }
    .cover-toc-container {
      text-align: left;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 15px auto 0 auto;
      max-width: 95%;
    }
    .cover-toc-title {
      font-weight: 700;
      font-size: 0.92rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
      font-family: 'Prompt', sans-serif;
    }
    .cover-toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem 1rem;
    }
    .cover-toc-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.82rem;
      color: #334155;
    }
    .cover-toc-item .toc-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 50%;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
    }
    .cover-footer-meta {
      border-top: 2px solid #0f172a;
      padding-top: 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 0.85rem;
    }
    .author-label { font-size: 0.75rem; color: #64748b; }
    .author-val { font-size: 1rem; font-weight: 700; color: #0f172a; }
    .school-val { font-size: 0.85rem; color: #475569; }
    .cover-copyright-col { text-align: right; }
    .copyright-text { font-size: 0.78rem; color: #475569; font-weight: 500; }
    .tech-note { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }

    .book-appendix-divider {
      width: 100%;
      max-width: 800px;
      min-height: 1100px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      page-break-before: always;
      break-before: page;
      break-after: avoid;
      page-break-after: avoid;
      break-inside: avoid;
      page-break-inside: avoid;
      background: #f8fafc;
    }
    .appendix-inner-card {
      border: 3px double #2563eb;
      border-radius: 12px;
      padding: 50px 35px;
      max-width: 600px;
      background: #ffffff;
    }
    .appendix-icon { font-size: 4rem; line-height: 1; margin-bottom: 0.5rem; }
    .appendix-badge { display: inline-block; font-size: 0.95rem; font-weight: 700; color: #1e40af; background: #dbeafe; padding: 4px 14px; border-radius: 20px; margin-bottom: 1rem; font-family: 'Prompt', sans-serif; }
    .appendix-title { font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0; font-family: 'Prompt', sans-serif; }
    .appendix-desc { font-size: 1rem; color: #475569; margin: 0; line-height: 1.6; }
    .appendix-line { width: 80px; height: 3px; background: #2563eb; margin: 1.5rem auto 0 auto; border-radius: 2px; }

    .sheet-main-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.55rem;
      margin-bottom: 0.75rem;
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-school-name { font-size: 1.2rem; font-weight: 700; margin: 0 0 0.15rem 0; color: #0f172a; }
    .sheet-subject-title { font-size: 0.92rem; font-weight: 600; margin: 0 0 0.15rem 0; color: #334155; }
    .sheet-teacher-meta { font-size: 0.82rem; color: #475569; margin: 0.1rem 0 0.2rem 0; font-weight: 500; }
    .sheet-curriculum-standard { color: #64748b; font-size: 0.78rem; margin: 0; }
    .sheet-student-meta {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #cbd5e1;
      padding-top: 0.4rem;
      margin-top: 0.4rem;
      font-size: 0.82rem;
    }
    .sheet-block {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.65rem 0.9rem;
      margin-bottom: 0.75rem;
      background: #ffffff;
      break-inside: auto;
      page-break-inside: auto;
    }
    .sheet-block-badge {
      color: #1e3a8a;
      font-weight: 700;
      font-size: 0.92rem;
      margin-bottom: 0.35rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-exercise {
      margin-bottom: 0.7rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .exercise-header {
      font-weight: 600;
      line-height: 1.5;
      margin-bottom: 0.3rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-formula-box, .sheet-solution-box {
      background: #f8fafc !important;
      border-left: 3.5px solid #2563eb;
      padding: 0.5rem 0.8rem;
      margin-bottom: 0.4rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .sheet-teacher-answer {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      background: #f0fdf4 !important;
      border: 1.5px solid #059669 !important;
      border-radius: 4px;
      padding: 0.35rem 0.65rem;
      margin: 0.3rem 0 0.45rem 0;
      color: #064e3b;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .sheet-teacher-answer .answer-badge {
      font-weight: 700;
      color: #047857;
      font-size: 0.9rem;
    }
    .sheet-teacher-answer .answer-text {
      color: #064e3b;
      font-weight: 600;
    }
    .handwriting-grid {
      min-height: 145px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: repeating-linear-gradient(0deg, transparent, transparent 25px, #e2e8f0 26px) !important;
      margin-top: 0.35rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .handwriting-grid.grid-large { min-height: 195px; }
    .sheet-footer-line {
      border-top: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 8pt;
      margin-top: 0.85rem;
      padding-top: 0.4rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .katex-display { margin: 0.2rem 0; font-size: 1.08em; line-height: 1.5; }
    .katex { font-size: 1.06em; }
    .no-print { display: none !important; }

    .book-floating-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: linear-gradient(135deg, #00f5d4 0%, #0284c7 100%);
      color: #021a1f;
      font-family: 'Prompt', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.75rem 1.4rem;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 22px rgba(0, 245, 212, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .book-floating-fab:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 6px 28px rgba(0, 245, 212, 0.75);
    }

    @media print {
      body {
        margin: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .book-floating-toolbar, .book-floating-fab, .no-print {
        display: none !important;
      }
      .book-container {
        padding: 0 !important;
        gap: 0 !important;
        background: #ffffff !important;
      }
      .a4-paper-sheet {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        background: #ffffff !important;
      }
      .book-cover-page {
        border: none !important;
        height: 275mm !important;
        max-height: 275mm !important;
        min-height: 275mm !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-before: avoid !important;
        page-break-before: avoid !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .cover-card-container {
        border: 2px solid #0f172a !important;
        height: 275mm !important;
        max-height: 275mm !important;
        min-height: 275mm !important;
        padding: 24px 22px !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
      }
      .book-appendix-divider {
        border: none !important;
        height: 275mm !important;
        max-height: 275mm !important;
        min-height: 275mm !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        page-break-before: always !important;
        break-before: page !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .sheet-main-header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .sheet-block {
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
      .sheet-block-badge {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .sheet-exercise {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .exercise-header {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      .sheet-formula-box, .sheet-solution-box, .sheet-teacher-answer, .handwriting-grid {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .sheet-footer-line {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  </style>
  <script src="${katexJs}"><\/script>
  <script src="${katexAutoRenderJs}"><\/script>
</head>
<body>
  <div class="book-floating-toolbar no-print">
    <div style="display: flex; align-items: center; gap: 0.65rem;">
      <span style="font-size: 1.4rem;">📚</span>
      <div>
        <div style="font-weight: 700; font-size: 1rem; color: #ffffff;">${coverTitle}</div>
        <div style="font-size: 0.8rem; color: #94a3b8;">${totalLessons} คาบเรียนสมบูรณ์ • ${editionBadge}</div>
        <div style="font-size: 0.74rem; color: #67e8f9; margin-top: 3px;">
          💡 แนะนำการพิมพ์: ตรวจดูว่าเลือก <strong>&quot;บันทึกเป็น PDF&quot;</strong>, ติ๊กถูกที่ <strong>&quot;กราฟิกพื้นหลัง (Background graphics)&quot;</strong> และเอาติ๊กถูกออกจาก <strong>&quot;หัวกระดาษและท้ายกระดาษ&quot;</strong>
        </div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 0.65rem;">
      <button type="button" class="btn-toolbar-print" onclick="window.print()" style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #00f5d4, #0284c7); color: #021a1f; border: none; padding: 0.55rem 1.25rem; border-radius: 6px; font-weight: 700; font-family: 'Prompt', sans-serif; cursor: pointer; font-size: 0.95rem; box-shadow: 0 0 14px rgba(0, 245, 212, 0.5);">
        <span>📥</span>
        <span>ดาวน์โหลดเป็น PDF (บันทึกเล่ม)</span>
      </button>
      <button type="button" class="btn-toolbar-close" onclick="window.close()" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #cbd5e1; padding: 0.55rem 0.85rem; border-radius: 6px; font-family: 'Prompt', sans-serif; cursor: pointer; font-size: 0.88rem;">
        ✕ ปิดแท็บ
      </button>
    </div>
  </div>

  <button type="button" class="book-floating-fab no-print" onclick="window.print()" title="คลิกเพื่อบันทึกเป็นไฟล์ PDF คมชัด 100%">
    <span style="font-size: 1.25rem;">📥</span>
    <span>ดาวน์โหลดเป็น PDF</span>
  </button>

  <div class="book-container">
    ${renderedPages.join('\n')}
  </div>

  <script>
    async function typesetAndAutoDownload() {
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (err) {
        console.warn('Font loading check:', err);
      }
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\\\[', right: '\\\\]', display: true },
            { left: '\\\\(', right: '\\\\)', display: false }
          ],
          throwOnError: false,
          errorColor: '#ef4444'
        });
      }
      await new Promise(function(r) { setTimeout(r, 200); });
      ${opts.autoDownload ? `
        window.print();
      ` : ''}
    }
    if (document.readyState === 'complete') {
      typesetAndAutoDownload();
    } else {
      window.addEventListener('load', typesetAndAutoDownload);
    }
  <\/script>
</body>
</html>`);
      printWindow.document.close();
    },

    /**
     * Show iOS PDF Save Guide Modal
     */
    openIosPdfGuideModal: function() {
      const modal = document.getElementById('iosPdfGuideModal');
      if (modal) modal.classList.add('open');
    },

    /**
     * Close iOS PDF Save Guide Modal
     */
    closeIosPdfGuideModal: function() {
      const modal = document.getElementById('iosPdfGuideModal');
      if (modal) modal.classList.remove('open');
    },

    /**
     * Show top banner when running in restricted In-App Browsers or IFrames
     */
    initInAppBanner: function() {
      if (EnvironmentSniffer.isInAppBrowser() || (EnvironmentSniffer.isInIframe() && EnvironmentSniffer.isMobile())) {
        const banner = document.getElementById('inAppBrowserBanner');
        if (banner) banner.style.display = 'flex';
      }
    },

    /**
     * Render entire A4 Paper Sheet
     */
    render: function(topicData, options) {
      if (!topicData) return;
      const opts = options || {};
      const mode = opts.mode || (window.CurriculumStore ? window.CurriculumStore.getCurrentSheetMode() : 'worksheet');
      const isTeacher = opts.isTeacherKey !== undefined ? opts.isTeacherKey : (window.CurriculumStore ? window.CurriculumStore.isTeacherKeyMode() : false);
      const modeData = topicData[mode] || topicData.worksheet;
      if (!modeData) return;

      const fSchool = document.getElementById('fieldSchool');
      const school = (fSchool && fSchool.value) ? fSchool.value : 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
      const fSubject = document.getElementById('fieldSubject');
      const subject = (fSubject && fSubject.value) ? fSubject.value : topicData.subjectCode;
      const fSheet = document.getElementById('fieldSheet');
      const sheetName = (fSheet && fSheet.value) ? fSheet.value : modeData.sheetName;

      // Update Header Text
      const paperSchool = document.getElementById('paperSchoolName');
      if (paperSchool) paperSchool.textContent = school;
      const paperSubject = document.getElementById('paperSubjectMeta');
      if (paperSubject) paperSubject.textContent = subject + ' • ' + sheetName;
      const paperStd = document.getElementById('paperStandardMeta');
      if (paperStd) paperStd.textContent = topicData.standard;

      const teacherMetaEl = document.getElementById('paperTeacherMeta');
      const fTeacher = document.getElementById('fieldTeacher');
      const teacherName = (fTeacher && fTeacher.value) ? fTeacher.value : 'กลุ่มสาระการเรียนรู้คณิตศาสตร์';
      if (teacherMetaEl) {
        teacherMetaEl.textContent = 'ครูผู้สอน: ' + teacherName;
      }

      // Update Part 1 (Concepts & Formulas)
      const labelPart1 = document.getElementById('labelPart1');
      if (labelPart1) {
        if (mode === 'worksheet') {
          labelPart1.textContent = '📘 ตอนที่ 1: สรุปสาระสำคัญและนิยามหลักสูตร สสวท.';
        } else if (mode === 'summary') {
          labelPart1.textContent = '⚡ ตอนที่ 1: สรุปสูตรเข้มข้น & กฎสำคัญที่ต้องจำ';
        } else {
          labelPart1.textContent = '📋 ตอนที่ 1: คำชี้แจงและเกณฑ์การให้คะแนน';
        }
      }
      const conceptBody = document.getElementById('contentConceptBody');
      if (conceptBody) {
        let ch = modeData.conceptHtml || '';
        // Defensive check: ensure any equation-stage with \begin{aligned} has $$
        ch = ch.replace(/<div class="equation-stage">([\s\S]*?)<\/div>/g, function(match, inner) {
          const trimmed = inner.trim();
          if (trimmed && !trimmed.startsWith('$$') && !trimmed.startsWith('\\[') && trimmed.includes('\\begin{')) {
            return '<div class="equation-stage">\n    $$' + trimmed + '$$\n  </div>';
          }
          return match;
        });
        conceptBody.innerHTML = ch;
      }

      // Update Part 2 (Exercises)
      const labelPart2 = document.getElementById('labelPart2');
      if (labelPart2) {
        if (mode === 'worksheet') {
          labelPart2.textContent = '✏️ ตอนที่ 2: ข้อสอบและแบบฝึกหัดทบทวน';
        } else if (mode === 'summary') {
          labelPart2.textContent = '🎯 ตอนที่ 2: โจทย์ตัวอย่างและแบบฝึกหัดทบทวน';
        } else {
          labelPart2.textContent = '📝 ตอนที่ 2: ข้อสอบวัดผลสัมฤทธิ์ทางการเรียน';
        }
      }

      let exHtml = '';
      const exercises = modeData.exercises || [];

      exercises.forEach(function(ex, idx) {
        let answerAreaHtml = '';
        if (ex.answerType === 'multiple-choice') {
          answerAreaHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem 1.25rem; margin-top: 0.65rem; font-size: 0.92rem; color: #334155; padding-left: 0.5rem;">
              <div><strong>ก.</strong> ${ex.choiceA || '................................'}</div>
              <div><strong>ข.</strong> ${ex.choiceB || '................................'}</div>
              <div><strong>ค.</strong> ${ex.choiceC || '................................'}</div>
              <div><strong>ง.</strong> ${ex.choiceD || '................................'}</div>
            </div>
          `;
        } else if (ex.answerType === 'short-answer') {
          answerAreaHtml = `
            <div style="margin-top: 0.65rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.92rem; color: #1e293b; padding-left: 0.5rem;">
              <span><strong>ตอบ:</strong></span>
              <div style="flex: 1; border-bottom: 1.5px dotted #94a3b8; height: 1.6rem;"></div>
            </div>
          `;
        } else if (ex.answerType === 'blank') {
          answerAreaHtml = `
            <div class="handwriting-grid" style="min-height: 145px; background: transparent; border: 1px dashed #cbd5e1;"></div>
          `;
        } else {
          const minH = ex.answerType === 'handwriting-large' ? '195px' : '145px';
          const isLarge = ex.answerType === 'handwriting-large' ? 'grid-large' : '';
          answerAreaHtml = `
            <div class="handwriting-grid ${isLarge}" style="min-height: ${minH};"></div>
          `;
        }

        exHtml += `
          <div class="sheet-exercise interactive-block" data-index="${idx}" style="${idx === 0 ? 'border-top: none; padding-top: 0;' : ''}">
            <div class="exercise-actions-bar no-print">
              <button type="button" class="action-btn" onclick="openEditExerciseModal(${idx})" title="แก้ไขข้อสอบนี้">
                ✏️ แก้ไข
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="เลื่อนข้อขึ้น">
                ⬆️
              </button>
              <button type="button" class="action-btn" onclick="moveExercise(${idx}, 1)" ${idx === exercises.length - 1 ? 'disabled' : ''} title="เลื่อนข้อลง">
                ⬇️
              </button>
              <button type="button" class="action-btn delete-btn" onclick="deleteExercise(${idx})" title="ลบข้อนี้">
                🗑️ ลบ
              </button>
            </div>

            <div class="exercise-header">
              <span>${ex.title}</span>
            </div>
            ${ex.latex ? `
              <div class="sheet-solution-box" style="margin: 0.3rem 0 0.15rem 0; padding: 0.45rem 0.75rem; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;">
                <div style="font-size: 0.88rem; font-weight: 600; color: #1d4ed8; margin-bottom: 0.2rem;">📘 แสดงวิธีทำ:</div>
                <div class="equation-stage" style="overflow-x: auto; color: #0f172a;">$$${(function(lat) {
                  let l = (lat || '').trim();
                  if (l.startsWith('$$') && l.endsWith('$$')) l = l.slice(2, -2).trim();
                  return l.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
                })(ex.latex)}$$</div>
                ${ex.placeholder ? `<div style="font-size: 0.82rem; color: #64748b; font-style: italic; margin-top: 0.2rem;">${ex.placeholder}</div>` : ''}
              </div>
            ` : `
              ${ex.answer ? `
                <div class="sheet-teacher-answer">
                  <span class="answer-badge">🔑 เฉลย:</span>
                  <span class="answer-text">${ex.answer}</span>
                </div>
              ` : ''}
              ${answerAreaHtml}
            `}
          </div>
        `;
      });

      exHtml += `
        <div class="add-exercise-container no-print">
          <button type="button" class="btn-add-exercise-block" onclick="openAddExerciseModal()">
            <span style="font-size: 1.2rem; line-height: 1;">＋</span>
            <span>เพิ่มข้อสอบใหม่ในชุดนี้</span>
          </button>
          <button type="button" class="btn-reset-exercises" onclick="resetExercisesToDefault()" title="คืนค่าเริ่มต้นของ สสวท. สำหรับบทนี้">
            🔄 คืนค่าเดิม
          </button>
        </div>
      `;

      const exerciseBody = document.getElementById('contentExerciseBody');
      if (exerciseBody) {
        exerciseBody.innerHTML = exHtml;
      }

      const footerLabel = document.getElementById('paperFooterLabel');
      if (footerLabel) {
        footerLabel.textContent = 'หัวข้อ: ' + topicData.title;
      }

      const paperEl = document.getElementById('a4Paper');
      if (paperEl) {
        paperEl.classList.toggle('show-teacher-key', isTeacher);
        typesetMath(paperEl);
      }

      const toolbarEl = document.getElementById('formulaToolbar');
      if (toolbarEl) typesetMath(toolbarEl);
    }
  };

  // Expose to window
  window.SheetRenderEngine = SheetRenderEngine;

})(window);
