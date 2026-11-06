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
              <div class="handwriting-grid" style="min-height: 78px; background: transparent; border: 1px dashed #cbd5e1;"></div>
            `;
          } else {
            const minH = ex.answerType === 'handwriting-large' ? '95px' : '68px';
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
              <div class="sheet-solution-box" style="margin: 0.15rem 0 0.12rem 0; padding: 0.25rem 0.55rem; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;">
                <div style="font-size: 0.84rem; font-weight: 600; color: #1d4ed8; margin-bottom: 0.12rem;">📘 แสดงวิธีทำ:</div>
                <div class="equation-stage" style="overflow-x: auto; color: #0f172a; font-size: 0.88rem; line-height: 1.35;">$$${l}$$</div>
                ${ex.placeholder ? `<div style="font-size: 0.8rem; color: #64748b; font-style: italic; margin-top: 0.12rem;">${ex.placeholder}</div>` : ''}
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
                  <div class="cover-toc-title">📋 สารบัญเนื้อหาภายในเล่ม (${topics.length} ใบงานสมบูรณ์):</div>
                  <div class="cover-toc-grid">
                    ${topics.map(function(t, idx) {
                      const cleanTitle = (t.title || '').replace(/^(?:คาบที่|ใบงานที่)\s*\d+\s*:\s*/i, '').trim();
                      const pNum = 2 * idx + 5;
                      return `
                        <div class="cover-toc-item">
                          <span class="toc-num">${idx + 1}</span>
                          <span class="toc-name">${cleanTitle}</span>
                          <span class="toc-pnum">น.${pNum}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <div class="cover-toc-meta-note">
                    <span>📘 คำนำ & Roadmap น.2</span>
                    <span>📐 สรุปสูตร น.3-4</span>
                    <span>🔑 ตารางเฉลยคำตอบ น.${5 + totalLessons * 2}</span>
                    <span>📝 บันทึกผล น.${5 + totalLessons * 2 + Math.ceil(totalLessons / 12)}</span>
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
              <p class="appendix-desc">แสดงขั้นตอนการคำนวณและเทคนิคคิดลัด สำหรับแบบฝึกหัดทั้ง ${totalLessons} ใบงาน</p>
              <div class="appendix-line"></div>
            </div>
          </div>
        `;
      }

      // Helper for Preface & Learning Roadmap
      function renderPrefaceHtml() {
        return `
          <div class="a4-paper-sheet book-preface-page">
            <div class="preface-card-container">
              <div class="preface-header">
                <div class="preface-badge">📘 คำนำ & แผนที่การเรียนรู้ (Preface & Learning Roadmap)</div>
                <h2 class="preface-title">คู่มือแบบฝึกหัดคณิตศาสตร์ สสวท. ฉบับสมบูรณ์</h2>
                <div class="preface-meta">${subjectCode} • ${grade} • ${coverTitle}</div>
              </div>

              <div class="preface-body">
                <div class="preface-section">
                  <h3 class="preface-sec-title">🎯 ความมุ่งหมายและปรัชญาของเอกสารชุดนี้</h3>
                  <p class="preface-text">
                    เอกสารรวมเล่มแบบฝึกหัดชุดนี้ จัดทำขึ้นเพื่อมุ่งเน้นการสร้างเสริมและพัฒนาทักษะกระบวนการคิดทางคณิตศาสตร์อย่างเป็นระบบ อิงตามมาตรฐานการเรียนรู้และผลการเรียนรู้ กลุ่มสาระการเรียนรู้คณิตศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560) ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 ของ สสวท. โดยเรียบเรียงเนื้อหาจากมโนทัศน์พื้นฐาน สู่การคำนวณขั้นสูง และการประยุกต์ใช้ในข้อสอบเข้ามหาวิทยาลัย (A-Level / สสวท.)
                  </p>
                </div>

                <div class="preface-section">
                  <h3 class="preface-sec-title">📐 โครงสร้างใบงานแบบ 3 มิติ (Three-Dimensional Learning)</h3>
                  <div class="preface-feature-grid">
                    <div class="preface-feature-item">
                      <div class="feature-icon">📘</div>
                      <div class="feature-title">ตอนที่ 1: สรุปสาระสำคัญ</div>
                      <div class="feature-desc">นิยาม ทฤษฎีบท และเทคนิคคิดเร็ว KaTeX คมชัดระดับเวกเตอร์ สรุปประเด็นสำคัญก่อนลงมือปฏิบัติ</div>
                    </div>
                    <div class="preface-feature-item">
                      <div class="feature-icon">💡</div>
                      <div class="feature-title">ตอนที่ 2: ครูสาธิตวิธีทำ (3 ตัวอย่าง)</div>
                      <div class="feature-desc">แสดงวิธีทำอย่างละเอียดเป็นขั้นเป็นตอน อธิบายจุดสังเกต ข้อควรระวัง และเทคนิคการจัดรูป</div>
                    </div>
                    <div class="preface-feature-item">
                      <div class="feature-icon">✏️</div>
                      <div class="feature-title">ตอนที่ 3: แบบฝึกหัดทบทวน (6 ข้อ)</div>
                      <div class="feature-desc">เว้นพื้นที่บรรทัดเขียนตอบอย่างเป็นระเบียบ ให้นักเรียนได้ฝึกคิดและแสดงวิธีทำจริงด้วยตนเอง</div>
                    </div>
                  </div>
                </div>

                <div class="preface-section">
                  <h3 class="preface-sec-title">🗺️ แผนที่การเรียนรู้สู่ความสำเร็จ (Learning Roadmap)</h3>
                  <div class="preface-roadmap-box">
                    <div class="roadmap-step">
                      <span class="step-num">Step 1</span>
                      <strong>ทำความเข้าใจมโนทัศน์:</strong> ศึกษาและทบทวนกรอบสรุปสูตรในตอนที่ 1 ให้เข้าใจนิยามและที่มา
                    </div>
                    <div class="roadmap-step">
                      <span class="step-num">Step 2</span>
                      <strong>วิเคราะห์ตัวอย่างสาธิต:</strong> สังเกตขั้นตอนการแก้ปัญหาจากตัวอย่างของครูทั้ง 3 ข้ออย่างพินิจ
                    </div>
                    <div class="roadmap-step">
                      <span class="step-num">Step 3</span>
                      <strong>ฝึกปฏิบัติด้วยตนเอง:</strong> แสดงวิธีทำในแบบฝึกหัดทั้ง 6 ข้ออย่างเป็นระเบียบตามเส้นบรรทัด
                    </div>
                    <div class="roadmap-step">
                      <span class="step-num">Step 4</span>
                      <strong>ตรวจทานผลสัมฤทธิ์:</strong> ตรวจคำตอบสุดท้ายจาก "ตารางสรุปเฉลยคำตอบสั้นท้ายเล่ม" (หน้า ${5 + totalLessons * 2}–${6 + totalLessons * 2})
                    </div>
                  </div>
                </div>
              </div>

              <div class="preface-footer">
                <div>กลุ่มสาระการเรียนรู้คณิตศาสตร์ • ${schoolName}</div>
                <div>เรียบเรียงโดย ${authorName} • หน้า 2</div>
              </div>
            </div>
          </div>
        `;
      }

      // Helper for Master Formula Blueprint (Cheat Sheet)
      function renderCheatSheetHtml(part) {
        const isComplex = (coverTitle.indexOf('เชิงซ้อน') !== -1 || (topics[0] && topics[0].id.indexOf('complex-') === 0));
        const isExpo = (coverTitle.indexOf('เอกซ์โพเนนเชียล') !== -1 || (topics[0] && topics[0].id.indexOf('expo-') === 0));

        let cardGridHtml = '';

        if (isComplex) {
          if (part === 1) {
            cardGridHtml = `
              <div class="cs-card">
                <div class="cs-card-title">1. หน่วยจินตภาพ $i$ และคาบยกกำลัง</div>
                <div class="cs-card-body">
                  $$i = \sqrt{-1}, \quad i^2 = -1, \quad i^3 = -i, \quad i^4 = 1$$
                  $$i^{4k+r} = i^r \quad (r \in \{0, 1, 2, 3\}) \implies \text{นำกำลังหาร 4 ดูเศษ}$$
                  $$\sum_{k=1}^{4} i^k = i + (-1) + (-i) + 1 = 0 \quad (\text{ผลบวก 4 ตัวเรียงกัน = 0})$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">2. รูปมาตรฐานและการดำเนินการ</div>
                <div class="cs-card-body">
                  $$z = a + bi \implies a = \text{Re}(z), \; b = \text{Im}(z) \in \mathbb{R}$$
                  $$a + bi = c + di \iff a = c \;\text{และ}\; b = d$$
                  $$(a + bi)(c + di) = (ac - bd) + (ad + bc)i$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">3. สังยุค (Conjugate) และสมบัติ</div>
                <div class="cs-card-body">
                  $$z = a + bi \implies \bar{z} = a - bi$$
                  $$\overline{z_1 \pm z_2} = \bar{z_1} \pm \bar{z_2}, \quad \overline{z_1 z_2} = \bar{z_1}\bar{z_2}$$
                  $$z\bar{z} = |z|^2 = a^2 + b^2, \quad z + \bar{z} = 2\text{Re}(z)$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">4. ตัวผกผันการคูณและการหาร</div>
                <div class="cs-card-body">
                  $$z^{-1} = \frac{1}{z} = \frac{\bar{z}}{|z|^2} = \frac{a - bi}{a^2 + b^2} \quad (z \neq 0)$$
                  $$\frac{z_1}{z_2} = \frac{z_1 \bar{z_2}}{|z_2|^2} \implies \text{นำสังยุคของตัวส่วนคูณทั้งเศษและส่วน}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">5. ค่าสัมบูรณ์ (Modulus) และสมบัติ</div>
                <div class="cs-card-body">
                  $$|z| = \sqrt{a^2 + b^2} = |\bar{z}| = |-z| = |-\bar{z}|$$
                  $$|z_1 z_2| = |z_1||z_2|, \quad \left|\frac{z_1}{z_2}\right| = \frac{|z_1|}{|z_2|}, \quad |z^n| = |z|^n$$
                  $$|z_1 + z_2| \le |z_1| + |z_2| \quad (\text{อสมการสามเหลี่ยม})$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">6. ระนาบเชิงซ้อนและการหมุนเวกเตอร์</div>
                <div class="cs-card-body">
                  $$\text{แกน } X = \text{แกนจริง (Real)}, \quad \text{แกน } Y = \text{แกนจินตภาพ (Imaginary)}$$
                  $$\text{การคูณด้วย } i \implies \text{หมุนเวกเตอร์ทวนเข็มนาฬิกา } 90^\circ$$
                  $$\text{การคูณด้วย } -1 \implies \text{หมุนเวกเตอร์ } 180^\circ$$
                </div>
              </div>
            `;
          } else {
            cardGridHtml = `
              <div class="cs-card">
                <div class="cs-card-title">7. รูปเชิงขั้ว (Polar Form)</div>
                <div class="cs-card-body">
                  $$z = r(\cos\theta + i\sin\theta) = r\,\text{cis}\,\theta$$
                  $$r = |z| = \sqrt{a^2 + b^2}, \quad \tan\theta = \frac{b}{a}$$
                  $$\bar{z} = r\,\text{cis}(-\theta), \quad z^{-1} = \frac{1}{r}\,\text{cis}(-\theta)$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">8. การคูณและหารในรูปเชิงขั้ว</div>
                <div class="cs-card-body">
                  $$z_1 z_2 = r_1 r_2\,\text{cis}(\theta_1 + \theta_2) \implies \text{คูณขนาด บวกมุม}$$
                  $$\frac{z_1}{z_2} = \frac{r_1}{r_2}\,\text{cis}(\theta_1 - \theta_2) \implies \text{หารขนาด ลบมุม}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">9. ทฤษฎีบทเดอมัวฟ์ (De Moivre)</div>
                <div class="cs-card-body">
                  $$z^n = r^n\,\text{cis}(n\theta) = r^n(\cos n\theta + i\sin n\theta)$$
                  $$(1 \pm i)^n = (\sqrt{2})^n \,\text{cis}\left(\pm \frac{n\pi}{4}\right)$$
                  $$(1 \pm \sqrt{3}i)^n = 2^n \,\text{cis}\left(\pm \frac{n\pi}{3}\right)$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">10. การหารากที่ $n$ ของจำนวนเชิงซ้อน</div>
                <div class="cs-card-body">
                  $$w_k = \sqrt[n]{r}\,\text{cis}\left(\frac{\theta + 2k\pi}{n}\right), \quad k = 0, 1, \dots, n-1$$
                  $$\sum_{k=0}^{n-1} w_k = 0 \quad (\text{ผลรวมรากที่ } n \text{ เป็น } 0 \text{ เสมอ เมื่อ } n \ge 2)$$
                  $$\text{รากทั้ง } n \text{ ตัวเป็นจุดยอดของรูป } n \text{ เหลี่ยมด้านเท่ามุมเท่า}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">11. การแก้สมการกำลังสอง</div>
                <div class="cs-card-body">
                  $$ax^2 + bx + c = 0 \implies x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
                  $$\text{ถ้า } b^2 - 4ac < 0 \implies x = \frac{-b \pm i\sqrt{4ac - b^2}}{2a}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">12. ทฤษฎีบทรากสังยุค (Conjugate Root)</div>
                <div class="cs-card-body">
                  $$\text{ถ้า } a_n x^n + \dots + a_0 = 0 \text{ มีสัมประสิทธิ์เป็นจริง}$$
                  $$\text{และมีรากเป็น } z_0 = a+bi \implies \bar{z_0} = a-bi \text{ ต้องเป็นรากด้วย}$$
                  $$(x - z_0)(x - \bar{z_0}) = x^2 - 2ax + (a^2 + b^2) \text{ เป็นตัวประกอบ}$$
                </div>
              </div>
            `;
          }
        } else if (isExpo) {
          if (part === 1) {
            cardGridHtml = `
              <div class="cs-card">
                <div class="cs-card-title">1. สมบัติพื้นฐานของเลขยกกำลัง</div>
                <div class="cs-card-body">
                  $$a^m \cdot a^n = a^{m+n}, \quad \frac{a^m}{a^n} = a^{m-n}$$
                  $$(a^m)^n = a^{mn}, \quad (ab)^n = a^n b^n, \quad \left(\frac{a}{b}\right)^n = \frac{a^n}{b^n}$$
                  $$a^0 = 1 \; (a \neq 0), \quad a^{-n} = \frac{1}{a^n}, \quad a^{m/n} = \sqrt[n]{a^m}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">2. ฟังก์ชันเอกซ์โพเนนเชียล</div>
                <div class="cs-card-body">
                  $$f = \{(x, y) \in \mathbb{R} \times \mathbb{R}^+ \mid y = a^x, \; a > 0, \; a \neq 1\}$$
                  $$\text{โดเมน } D_f = \mathbb{R}, \quad \text{เรนจ์ } R_f = (0, \infty)$$
                  $$\text{กราฟผ่านจุด } (0, 1) \text{ เสมอ และมีแกน } X \text{ เป็นเส้นกำกับแนวนอน}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">3. พฤติกรรมฟังก์ชันเพิ่ม-ฟังก์ชันลด</div>
                <div class="cs-card-body">
                  $$a > 1 \implies \text{ฟังก์ชันเพิ่ม } (x_1 < x_2 \iff a^{x_1} < a^{x_2})$$
                  $$0 < a < 1 \implies \text{ฟังก์ชันลด } (x_1 < x_2 \iff a^{x_1} > a^{x_2})$$
                  $$\text{ฟังก์ชัน } 1-1 \implies a^{x_1} = a^{x_2} \iff x_1 = x_2$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">4. สมการและอสมการเอกซ์โพเนนเชียล</div>
                <div class="cs-card-body">
                  $$\text{ทำฐานให้เท่ากัน: } a^{f(x)} = a^{g(x)} \implies f(x) = g(x)$$
                  $$\text{สมมุติตัวแปร: } A(a^x)^2 + B(a^x) + C = 0 \implies \text{ให้ } u = a^x > 0$$
                  $$\text{อสมการ: ถ้า } a > 1 \implies f(x) < g(x) \iff a^{f(x)} < a^{g(x)}$$
                  $$\text{ถ้า } 0 < a < 1 \implies \text{กลับเครื่องหมายอสมการ}$$
                </div>
              </div>
            `;
          } else {
            cardGridHtml = `
              <div class="cs-card">
                <div class="cs-card-title">5. นิยามฟังก์ชันลอการิทึม</div>
                <div class="cs-card-body">
                  $$y = \log_a x \iff x = a^y \quad (a > 0, \; a \neq 1, \; x > 0)$$
                  $$\text{โดเมน } D_f = (0, \infty), \quad \text{เรนจ์ } R_f = \mathbb{R}$$
                  $$\text{เป็นอินเวอร์สของ } y = a^x, \quad \text{กราฟผ่าน } (1, 0) \text{ เสมอ}$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">6. เอกลักษณ์และสมบัติของลอการิทึม</div>
                <div class="cs-card-body">
                  $$\log_a 1 = 0, \quad \log_a a = 1, \quad a^{\log_a x} = x, \quad \log_a(a^x) = x$$
                  $$\log_a(MN) = \log_a M + \log_a N, \quad \log_a\left(\frac{M}{N}\right) = \log_a M - \log_a N$$
                  $$\log_a(M^k) = k\log_a M, \quad \log_{a^p}(M) = \frac{1}{p}\log_a M$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">7. การเปลี่ยนฐานลอการิทึม</div>
                <div class="cs-card-body">
                  $$\log_a b = \frac{\log_c b}{\log_c a} = \frac{1}{\log_b a}, \quad a^{\log_b c} = c^{\log_b a}$$
                  $$\log x = \log_{10} x \; (\text{ลอการิทึมสามัญ}), \quad \ln x = \log_e x \; (e \approx 2.71828)$$
                  $$\log N = \text{Characteristic (จำนวนเต็ม)} + \text{Mantissa } [0, 1)$$
                </div>
              </div>

              <div class="cs-card">
                <div class="cs-card-title">8. สมการและอสมการลอการิทึม</div>
                <div class="cs-card-body">
                  $$\log_a f(x) = \log_a g(x) \implies f(x) = g(x) \; (\text{ต้องตรวจคำตอบ } > 0)$$
                  $$\text{อสมการ: ถ้า } a > 1 \implies \text{คงเครื่องหมาย}$$
                  $$\text{ถ้า } 0 < a < 1 \implies \text{กลับเครื่องหมาย และอย่าลืมเงื่อนไขหลัง } \log > 0$$
                </div>
              </div>
            `;
          }
        } else {
          // Dynamic fallback for other subjects (Stat, Art, etc.)
          const startIdx = (part === 1) ? 0 : Math.floor(topics.length / 2);
          const endIdx = (part === 1) ? Math.floor(topics.length / 2) : topics.length;
          const sliceTopics = topics.slice(startIdx, endIdx);
          
          cardGridHtml = sliceTopics.slice(0, 6).map(function(t, idx) {
            const cleanTitle = (t.title || '').replace(/^(?:คาบที่|ใบงานที่)\s*\d+\s*:\s*/i, '').trim();
            const ch = (t.worksheet && t.worksheet.conceptHtml) || '';
            const matchStage = ch.match(/<div class="equation-stage">([\s\S]*?)<\/div>/);
            const mathSnippet = matchStage ? matchStage[1].trim() : '$$f(x) \text{ มาตรฐาน สสวท.}$$';
            
            return `
              <div class="cs-card">
                <div class="cs-card-title">${startIdx + idx + 1}. ${cleanTitle}</div>
                <div class="cs-card-body">
                  ${mathSnippet}
                </div>
              </div>
            `;
          }).join('');
        }

        const partTitle = (part === 1) ? 'พีชคณิต มโนทัศน์ และสมบัติสำคัญ' : 'สูตรขั้นสูง เทคนิคคิดเร็ว และการประยุกต์';
        const pageNum = (part === 1) ? 3 : 4;

        return `
          <div class="a4-paper-sheet book-cheatsheet-page">
            <div class="cheatsheet-card-container">
              <div class="cheatsheet-header">
                <div class="cheatsheet-badge">📐 แผ่นสรุปสูตรฉบับพกพา (Master Formula Blueprint • ตอนที่ ${part})</div>
                <h2 class="cheatsheet-title">${partTitle}</h2>
                <div class="cheatsheet-meta">${subjectCode} • ${coverTitle} • ฉบับทบทวนก่อนสอบ</div>
              </div>

              <div class="cheatsheet-grid">
                ${cardGridHtml}
              </div>

              <div class="cheatsheet-footer">
                <span>หน้า ${pageNum} • สรุปสูตรฉบับพกพา ตอนที่ ${part}</span>
                <span>${coverTitle} • ${authorName}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Helper for Summary Answer Key (2 Pages)
      function renderSummaryAnswerKeyHtml(chunk, pageIdx, totalPages, pNum) {
        return `
          <div class="a4-paper-sheet book-answerkey-page">
            <div class="answerkey-card-container">
              <div class="answerkey-header">
                <div class="answerkey-badge">🔑 ตารางสรุปเฉลยคำตอบสั้นท้ายเล่ม (Summary Answer Key • หน้า ${pageIdx}/${totalPages})</div>
                <h2 class="answerkey-title">เฉลยคำตอบสุดท้ายสำหรับตรวจทานด้วยตนเอง</h2>
                <div class="answerkey-meta">${subjectCode} • ${coverTitle} • สำหรับนักเรียนตรวจผลสัมฤทธิ์</div>
              </div>

              <div class="answerkey-grid">
                ${chunk.map(function(t) {
                  const lessonNum = (t.id || '').replace(/^[a-z]+-l0*/i, '') || '1';
                  const cleanTitle = (t.title || '').replace(/^(?:คาบที่|ใบงานที่)\s*\d+\s*:\s*/i, '').trim();
                  const exs = (t.worksheet && t.worksheet.exercises) || [];
                  const studentExs = exs.filter(function(e) { return !e.latex; });

                  return `
                    <div class="answerkey-item-card">
                      <div class="answerkey-item-header">
                        <span class="ak-num">[${lessonNum}]</span>
                        <span class="ak-title">${cleanTitle}</span>
                      </div>
                      <div class="answerkey-answers-list">
                        ${studentExs.map(function(ex, eIdx) {
                          const ans = ex.answer || '-';
                          return `
                            <div class="ak-ans-row">
                              <span class="ak-ans-label">ข้อ ${eIdx + 1}:</span>
                              <span class="ak-ans-val">${ans}</span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="answerkey-footer">
                <span>หน้า ${pNum} • ตารางเฉลยคำตอบสั้น ${coverTitle}</span>
                <span>© ${authorName} • MathSheet AI Studio</span>
              </div>
            </div>
          </div>
        `;
      }

      // Helper for Learning Log & Notes
      function renderLearningNotesHtml(pNum) {
        return `
          <div class="a4-paper-sheet book-notes-page">
            <div class="notes-card-container">
              <div class="notes-header">
                <div class="notes-badge">📝 บันทึกสรุปผลการเรียนรู้และโน้ตสำคัญ (Learning Log & Master Notes)</div>
                <h2 class="notes-title">ตารางติดตามความก้าวหน้าและบันทึกช่วยจำส่วนบุคคล</h2>
                <div class="notes-meta">${subjectCode} • ${coverTitle} • ทั้งหมด ${totalLessons} ใบงาน</div>
              </div>

              <div class="notes-checklist-section">
                <div class="notes-sec-title">✓ บันทึกความก้าวหน้ารายใบงาน (Progress Tracker):</div>
                <div class="notes-checklist-grid">
                  ${topics.map(function(t, idx) {
                    const cleanTitle = (t.title || '').replace(/^(?:คาบที่|ใบงานที่)\s*\d+\s*:\s*/i, '').trim();
                    return `
                      <div class="notes-check-item">
                        <span class="check-box">[ &nbsp; ]</span>
                        <span class="check-lesson-num">${idx + 1}</span>
                        <span class="check-name">${cleanTitle}</span>
                        <span class="check-score">....../10</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="notes-ruled-section">
                <div class="notes-sec-title">📌 บันทึกเทคนิค สูตร และข้อควรระวังส่วนบุคคล (Personal Key Takeaways):</div>
                <div class="notes-ruled-lines"></div>
              </div>

              <div class="notes-footer">
                <span>หน้า ${pNum} • บันทึกผลการเรียนรู้</span>
                <span>${authorName} • ${schoolName}</span>
              </div>
            </div>
          </div>
        `;
      }

      // Helper for Premium Back Cover
      function renderBackCoverHtml(pNum) {
        return `
          <div class="a4-paper-sheet book-back-cover-page">
            <div class="back-cover-card-container">
              <div class="back-cover-header-badges">
                <span class="back-cover-pill-ipst">สสวท. มาตรฐานหลักสูตรแกนกลาง</span>
                <span class="back-cover-pill-code">${subjectCode} • ${grade}</span>
              </div>

              <div class="back-cover-center-box">
                <div class="back-cover-math-icon">📘</div>
                <div class="back-cover-edition-ribbon">ฉบับแบบฝึกหัดนักเรียน (Student Workbook)</div>
                <h1 class="back-cover-title-text">${coverTitle}</h1>
                <div class="back-cover-subtitle-text">${coverSubtitle}</div>
                <div class="back-cover-curriculum-standard-note">อิงมาตรฐานการเรียนรู้และผลการเรียนรู้ สาระคณิตศาสตร์เพิ่มเติม (ฉบับปรับปรุง 2560)</div>

                <div class="back-cover-highlights-card">
                  <div class="highlights-title">🌟 จุดเด่นและสาระสำคัญของเอกสารชุดนี้:</div>
                  <div class="highlights-list">
                    <div class="highlight-item">
                      <span class="hl-bullet">✓</span>
                      <div><strong>${totalLessons} ใบงานสมบูรณ์:</strong> เรียบเรียงเนื้อหาครอบคลุมทุกมิติตามหลักสูตร สสวท. ฉบับจริง</div>
                    </div>
                    <div class="highlight-item">
                      <span class="hl-bullet">✓</span>
                      <div><strong>${totalLessons * 3} ตัวอย่างสาธิตละเอียด:</strong> แสดงกระบวนการคิดและลำดับขั้นตอนการแก้ปัญหาอย่างเป็นระบบ</div>
                    </div>
                    <div class="highlight-item">
                      <span class="hl-bullet">✓</span>
                      <div><strong>${totalLessons * 6} ข้อแบบฝึกหัดพร้อมเส้นกริด:</strong> เว้นพื้นที่บรรทัดให้นักเรียนได้ลงมือคิดและแสดงวิธีทำจริง</div>
                    </div>
                    <div class="highlight-item">
                      <span class="hl-bullet">✓</span>
                      <div><strong>แผ่นสรุปสูตรฉบับพกพา 2 หน้า:</strong> รวมมโนทัศน์และสูตรสำคัญทุกหัวข้อ สำหรับทบทวนก่อนเข้าห้องสอบ</div>
                    </div>
                    <div class="highlight-item">
                      <span class="hl-bullet">✓</span>
                      <div><strong>ตารางสรุปเฉลยคำตอบสั้นท้ายเล่ม:</strong> ตรวจทานความถูกต้องของคำตอบสุดท้ายได้ด้วยตนเองทันที</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="back-cover-footer-meta">
                <div class="back-author-col">
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
                <div class="back-copyright-col">
                  <div class="copyright-text">${copyrightText}</div>
                  <div class="tech-note">High-Fidelity KaTeX Vector Publishing • MathSheet AI Studio</div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      // Assemble content
      let renderedPages = [];

      // 1. Front Matter
      if (opts.includeCover !== false) {
        renderedPages.push(renderCoverHtml()); // Page 1
      }

      // In Student Workbook (Commercial Edition): Include Preface & 2-Page Cheat Sheet
      const isStudentEdition = (bookType === 'student');
      if (isStudentEdition && opts.includeCover !== false) {
        renderedPages.push(renderPrefaceHtml());      // Page 2
        renderedPages.push(renderCheatSheetHtml(1));  // Page 3
        renderedPages.push(renderCheatSheetHtml(2));  // Page 4
      }

      // 2. Lessons
      if (bookType === 'complete') {
        // Student part
        topics.forEach(function(t, idx) {
          const pNum = (opts.includeCover !== false ? 5 : 1) + idx * 2;
          const pageStr = showPageNums ? `ใบงานที่ ${idx + 1} จาก ${totalLessons} • หน้า ${pNum}-${pNum+1}` : '';
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
          const pageStr = showPageNums ? `เฉลยใบงานที่ ${idx + 1} จาก ${totalLessons} (เฉลยละเอียด)` : '';
          renderedPages.push(buildTopicSheetHtml(t, {
            mode: 'worksheet',
            isTeacherKey: true,
            pageFooterText: pageStr
          }));
        });
      } else {
        const isTeacher = (bookType === 'teacher');
        topics.forEach(function(t, idx) {
          const pOffset = (isStudentEdition && opts.includeCover !== false) ? 5 : (opts.includeCover !== false ? 2 : 1);
          const pNum = pOffset + idx * 2;
          const pageStr = showPageNums ? `ใบงานที่ ${idx + 1} จาก ${totalLessons} • หน้า ${pNum}-${pNum+1}` : '';
          renderedPages.push(buildTopicSheetHtml(t, {
            mode: 'worksheet',
            isTeacherKey: isTeacher,
            pageFooterText: pageStr
          }));
        });
      }

      // 3. Back Matter for Student Workbook: Summary Answer Key, Learning Notes & Back Cover
      if (isStudentEdition && opts.includeCover !== false) {
        // Chunk topics by 12 for Answer Key (12 lessons per page)
        const chunkSize = 12;
        const answerChunks = [];
        for (let i = 0; i < topics.length; i += chunkSize) {
          answerChunks.push(topics.slice(i, i + chunkSize));
        }

        answerChunks.forEach(function(chunk, cIdx) {
          const keyPNum = 5 + totalLessons * 2 + cIdx;
          renderedPages.push(renderSummaryAnswerKeyHtml(chunk, cIdx + 1, answerChunks.length, keyPNum));
        });

        const notesPNum = 5 + totalLessons * 2 + answerChunks.length;
        renderedPages.push(renderLearningNotesHtml(notesPNum));

        const backPNum = notesPNum + 1;
        renderedPages.push(renderBackCoverHtml(backPNum));
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
    html {
      margin: 0;
      padding: 0;
      background: #ffffff;
      background-color: #ffffff;
    }
    body {
      margin: 0;
      padding: 0;
      background: #0f172a;
      color: #0f172a;
      font-family: 'Sarabun', 'Prompt', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
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
      padding: 10px 14px;
      margin: 10px auto 0 auto;
      max-width: 98%;
    }
    .cover-toc-title {
      font-weight: 700;
      font-size: 0.88rem;
      color: #1e293b;
      margin-bottom: 0.4rem;
      font-family: 'Prompt', sans-serif;
    }
    .cover-toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.2rem 0.85rem;
    }
    .cover-toc-item {
      display: flex;
      align-items: flex-start;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: #334155;
      line-height: 1.25;
      min-width: 0;
    }
    .cover-toc-item .toc-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 17px;
      height: 17px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 50%;
      font-size: 0.68rem;
      font-weight: 700;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .cover-toc-item .toc-name {
      flex: 1;
      min-width: 0;
      white-space: normal;
      word-break: break-word;
      overflow-wrap: break-word;
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
      padding-bottom: 0.35rem;
      margin-bottom: 0.45rem;
      break-inside: avoid;
      page-break-inside: avoid;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-school-name { font-size: 1.15rem; font-weight: 700; margin: 0 0 0.1rem 0; color: #0f172a; }
    .sheet-subject-title { font-size: 0.88rem; font-weight: 600; margin: 0 0 0.1rem 0; color: #334155; }
    .sheet-teacher-meta { font-size: 0.8rem; color: #475569; margin: 0.05rem 0 0.15rem 0; font-weight: 500; }
    .sheet-curriculum-standard { color: #64748b; font-size: 0.75rem; margin: 0; }
    .sheet-student-meta {
      display: flex;
      justify-content: space-between;
      border-top: 1px dashed #cbd5e1;
      padding-top: 0.35rem;
      margin-top: 0.35rem;
      font-size: 0.8rem;
    }
    .sheet-block {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 0.4rem 0.7rem;
      margin-bottom: 0.42rem;
      background: #ffffff;
      break-inside: auto;
      page-break-inside: auto;
    }
    .sheet-block-badge {
      color: #1e3a8a;
      font-weight: 700;
      font-size: 0.88rem;
      margin-bottom: 0.2rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-exercise {
      margin-bottom: 0.32rem;
      padding-top: 0.18rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .exercise-header {
      font-weight: 600;
      line-height: 1.35;
      margin-bottom: 0.16rem;
      break-after: avoid;
      page-break-after: avoid;
    }
    .sheet-formula-box, .sheet-solution-box {
      background: #f8fafc !important;
      border-left: 3.5px solid #2563eb;
      padding: 0.3rem 0.6rem;
      margin-bottom: 0.22rem;
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
      padding: 0.25rem 0.55rem;
      margin: 0.2rem 0 0.25rem 0;
      color: #064e3b;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .sheet-teacher-answer .answer-badge {
      font-weight: 700;
      color: #047857;
      font-size: 0.88rem;
    }
    .sheet-teacher-answer .answer-text {
      color: #064e3b;
      font-weight: 600;
    }
    .handwriting-grid {
      min-height: 78px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: repeating-linear-gradient(0deg, transparent, transparent 19px, #e2e8f0 20px) !important;
      margin-top: 0.18rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .handwriting-grid.grid-large { min-height: 110px; }
    .sheet-footer-line {
      border-top: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 8pt;
      margin-top: 0.4rem;
      padding-top: 0.25rem;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-before: avoid !important;
      page-break-before: avoid !important;
    }
    .katex-display { margin: 0.12rem 0; font-size: 1.02em; line-height: 1.4; }
    .katex { font-size: 1.04em; }
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
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        color: #0f172a !important;
        width: 100% !important;
        min-height: 100% !important;
        height: auto !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .book-floating-toolbar, .book-floating-fab, .no-print {
        display: none !important;
      }
      .book-container {
        padding: 0 !important;
        margin: 0 !important;
        gap: 0 !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
        width: 100% !important;
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
        background-color: #ffffff !important;
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
        background: #ffffff !important;
        background-color: #ffffff !important;
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
        background: #ffffff !important;
        background-color: #ffffff !important;
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
        background: #ffffff !important;
        background-color: #ffffff !important;
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
        break-before: avoid !important;
        page-break-before: avoid !important;
      }

      /* Commercial Publishing Pages */
      .book-preface-page, .book-cheatsheet-page, .book-answerkey-page, .book-notes-page, .book-back-cover-page {
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
        page-break-after: avoid !important;
        page-break-after: avoid !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        background: #ffffff !important;
        background-color: #ffffff !important;
      }
      .preface-card-container, .cheatsheet-card-container, .answerkey-card-container, .notes-card-container, .back-cover-card-container {
        min-height: 271mm !important;
        height: 271mm !important;
        max-height: 271mm !important;
        padding: 6mm 8mm !important;
      }

      /* Strict 2-Page Leaf Containment */
      .book-lesson-sheet .sheet-exercise {
        padding: 0.2rem 0 !important;
        margin-bottom: 0.2rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .book-lesson-sheet .sheet-solution-box {
        margin: 0.12rem 0 0.12rem 0 !important;
        padding: 0.2rem 0.5rem !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .book-lesson-sheet .sheet-solution-box .equation-stage {
        font-size: 0.86rem !important;
        line-height: 1.32 !important;
      }
      .book-lesson-sheet .sheet-solution-box .katex-display {
        margin: 0.1em 0 !important;
      }
      .book-lesson-sheet .handwriting-grid {
        min-height: 68px !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .book-lesson-sheet .sheet-block {
        margin-bottom: 0.32rem !important;
      }
      .book-lesson-sheet .sheet-concept-body {
        margin-bottom: 0.3rem !important;
      }
    }

    /* Screen Styles for Commercial Publishing Pages */
    .book-preface-page, .book-cheatsheet-page, .book-answerkey-page, .book-notes-page, .book-back-cover-page {
      width: 100%;
      max-width: 800px;
      min-height: 1120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px;
      background: #ffffff;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.35);
      border-radius: 4px;
      box-sizing: border-box;
      break-inside: avoid;
      page-break-inside: avoid;
      page-break-before: always;
      break-before: page;
    }

    .preface-card-container, .cheatsheet-card-container, .answerkey-card-container, .notes-card-container, .back-cover-card-container {
      height: 100%;
      min-height: 1060px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 2px solid #1e3a8a;
      border-radius: 8px;
      padding: 28px 24px;
      background: #ffffff;
      box-sizing: border-box;
    }

    .preface-header, .cheatsheet-header, .answerkey-header, .notes-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.5rem;
      margin-bottom: 0.6rem;
    }
    .preface-badge, .cheatsheet-badge, .answerkey-badge, .notes-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #1e3a8a;
      background: #dbeafe;
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 0.25rem;
      font-family: 'Prompt', sans-serif;
    }
    .preface-title, .cheatsheet-title, .answerkey-title, .notes-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0.15rem 0;
      font-family: 'Prompt', sans-serif;
    }
    .preface-meta, .cheatsheet-meta, .answerkey-meta, .notes-meta {
      font-size: 0.82rem;
      color: #475569;
      font-family: 'Prompt', sans-serif;
    }

    .preface-section { margin-bottom: 0.8rem; }
    .preface-sec-title { font-size: 0.95rem; font-weight: 700; color: #1e3a8a; margin: 0 0 0.3rem 0; font-family: 'Prompt', sans-serif; }
    .preface-text { font-size: 0.86rem; color: #334155; line-height: 1.6; margin: 0; text-align: justify; }

    .preface-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-top: 0.35rem; }
    .preface-feature-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.55rem; font-size: 0.8rem; }
    .feature-icon { font-size: 1.25rem; margin-bottom: 0.2rem; }
    .feature-title { font-weight: 700; color: #0f172a; margin-bottom: 0.2rem; }
    .feature-desc { color: #64748b; line-height: 1.4; font-size: 0.75rem; }

    .preface-roadmap-box { background: #eff6ff; border-left: 3px solid #2563eb; border-radius: 4px; padding: 0.55rem 0.75rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.82rem; }
    .roadmap-step { display: flex; gap: 0.5rem; align-items: baseline; }
    .step-num { font-weight: 700; color: #1d4ed8; background: #dbeafe; padding: 1px 6px; border-radius: 3px; font-size: 0.75rem; white-space: nowrap; }

    .preface-footer, .cheatsheet-footer, .answerkey-footer, .notes-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1.5px solid #cbd5e1;
      padding-top: 0.45rem;
      font-size: 0.78rem;
      color: #64748b;
      font-family: 'Prompt', sans-serif;
    }

    .cheatsheet-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.55rem; flex: 1; margin: 0.4rem 0; }
    .cs-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.45rem 0.6rem; font-size: 0.8rem; }
    .cs-card-title { font-weight: 700; color: #1e3a8a; border-bottom: 1.5px solid #93c5fd; padding-bottom: 0.2rem; margin-bottom: 0.25rem; font-size: 0.84rem; font-family: 'Prompt', sans-serif; }
    .cs-card-body { color: #0f172a; line-height: 1.45; }
    .cs-card-body .katex-display { margin: 0.2em 0 !important; font-size: 0.88em !important; }

    .answerkey-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem 0.65rem; flex: 1; margin: 0.4rem 0; }
    .answerkey-item-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.35rem 0.55rem; background: #f8fafc; font-size: 0.78rem; }
    .answerkey-item-header { font-weight: 700; color: #1e3a8a; border-bottom: 1.5px solid #3b82f6; padding-bottom: 0.15rem; margin-bottom: 0.25rem; display: flex; gap: 0.35rem; align-items: baseline; font-size: 0.8rem; font-family: 'Prompt', sans-serif; }
    .ak-num { color: #2563eb; font-weight: 700; }
    .ak-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .answerkey-answers-list { display: grid; grid-template-columns: 1fr 1fr; gap: 0.15rem 0.4rem; }
    .ak-ans-row { display: flex; gap: 0.25rem; align-items: baseline; font-size: 0.76rem; }
    .ak-ans-label { color: #64748b; font-weight: 600; }
    .ak-ans-val { color: #0f172a; font-weight: 600; }
    .ak-ans-val .katex { font-size: 0.95em !important; }

    .notes-checklist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem 0.6rem; font-size: 0.74rem; margin-bottom: 0.6rem; }
    .notes-check-item { display: flex; gap: 0.35rem; align-items: center; border-bottom: 1px dotted #e2e8f0; padding-bottom: 0.12rem; }
    .check-box { color: #94a3b8; font-weight: 700; font-family: monospace; }
    .check-lesson-num { font-weight: 700; color: #1e3a8a; min-width: 1.2rem; }
    .check-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155; }
    .check-score { color: #94a3b8; font-size: 0.7rem; }
    .notes-sec-title { font-size: 0.84rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.3rem; font-family: 'Prompt', sans-serif; }
    .notes-ruled-lines {
      height: 240px;
      background-image: repeating-linear-gradient(0deg, transparent, transparent 23px, #e2e8f0 24px);
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }

    .back-cover-card-container {
      height: 100%;
      min-height: 1060px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 2px solid #1e3a8a;
      border-radius: 8px;
      padding: 35px 30px;
      background: #ffffff;
      box-sizing: border-box;
    }
    .back-cover-header-badges { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 0.75rem; }
    .back-cover-pill-ipst { font-size: 0.85rem; font-weight: 700; color: #1e3a8a; background: #dbeafe; padding: 3px 10px; border-radius: 4px; font-family: 'Prompt', sans-serif; }
    .back-cover-pill-code { font-size: 0.95rem; font-weight: 700; color: #0f172a; font-family: 'Prompt', sans-serif; }
    .back-cover-center-box { text-align: center; padding: 15px 0; }
    .back-cover-math-icon { font-size: 3.5rem; margin-bottom: 0.35rem; line-height: 1; }
    .back-cover-edition-ribbon { display: inline-block; font-size: 0.95rem; font-weight: 700; color: #047857; background: #d1fae5; border: 1px solid #10b981; padding: 4px 14px; border-radius: 20px; margin-bottom: 0.75rem; font-family: 'Prompt', sans-serif; }
    .back-cover-title-text { font-size: 2.1rem; font-weight: 700; color: #0f172a; margin: 0.2rem 0 0.4rem 0; line-height: 1.3; font-family: 'Prompt', sans-serif; }
    .back-cover-subtitle-text { font-size: 1.15rem; font-weight: 600; color: #2563eb; margin-bottom: 0.4rem; font-family: 'Prompt', sans-serif; }
    .back-cover-curriculum-standard-note { font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem; font-family: 'Prompt', sans-serif; }
    .back-cover-highlights-card { background: #f8fafc; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 1.1rem 1.35rem; text-align: left; max-width: 600px; margin: 0 auto; }
    .highlights-title { font-size: 0.98rem; font-weight: 700; color: #1e3a8a; margin-bottom: 0.65rem; font-family: 'Prompt', sans-serif; }
    .highlights-list { display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.86rem; color: #334155; }
    .highlight-item { display: flex; gap: 0.5rem; align-items: baseline; }
    .hl-bullet { color: #10b981; font-weight: 700; }
    .back-cover-footer-meta { display: flex; justify-content: space-between; align-items: flex-end; border-top: 2px solid #0f172a; padding-top: 0.85rem; }
    .back-author-col { font-family: 'Prompt', sans-serif; }
    .back-author-col .author-label { font-size: 0.8rem; color: #64748b; }
    .back-author-col .author-val { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 2px 0; }
    .back-author-col .school-val { font-size: 0.85rem; color: #334155; }
    .back-copyright-col { text-align: right; font-family: 'Prompt', sans-serif; }
    .back-copyright-col .copyright-text { font-size: 0.82rem; color: #64748b; margin-bottom: 3px; }
    .back-copyright-col .tech-note { font-size: 0.72rem; color: #0ea5e9; font-weight: 600; }

    .toc-pnum { font-size: 0.7rem; color: #64748b; font-weight: 600; margin-left: 3px; }
    .cover-toc-meta-note {
      display: flex;
      justify-content: space-around;
      background: #eff6ff;
      border-radius: 4px;
      padding: 0.3rem 0.5rem;
      margin-top: 0.45rem;
      font-size: 0.72rem;
      color: #1e40af;
      font-weight: 600;
      font-family: 'Prompt', sans-serif;
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
        <div style="font-size: 0.8rem; color: #94a3b8;">${totalLessons} ใบงานสมบูรณ์ • ${editionBadge}</div>
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
