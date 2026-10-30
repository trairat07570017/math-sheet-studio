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

      printWindow.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <link rel="stylesheet" href="${fontsCss}">
  <link rel="stylesheet" href="${katexCss}">
  <style>
    @page { size: A4 portrait; margin: 12mm 14mm 12mm 14mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Sarabun', 'Prompt', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
    }
    .a4-paper-sheet {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      padding: 20px 25px;
      background: #ffffff;
    }
    .sheet-main-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.65rem;
      margin-bottom: 0.85rem;
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
    }
    .sheet-exercise {
      margin-bottom: 0.75rem;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .exercise-header { font-weight: 600; line-height: 1.5; margin-bottom: 0.35rem; }
    .sheet-formula-box, .sheet-solution-box {
      background: #f8fafc;
      border-left: 3.5px solid #2563eb;
      padding: 0.55rem 0.85rem;
      margin-bottom: 0.45rem;
      break-inside: avoid;
    }
    .handwriting-grid {
      min-height: 145px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: repeating-linear-gradient(0deg, transparent, transparent 25px, #e2e8f0 26px);
      margin-top: 0.4rem;
    }
    .handwriting-grid.grid-large { min-height: 195px; }
    .sheet-footer-line {
      border-top: 1px solid #cbd5e1;
      color: #64748b;
      font-size: 8pt;
      margin-top: 0.85rem;
      padding-top: 0.4rem;
      break-inside: avoid;
    }
    .katex-display { margin: 0.2rem 0; font-size: 1.08em; line-height: 1.5; }
    .katex { font-size: 1.06em; }
    .no-print, .exercise-actions-bar, .add-exercise-container { display: none !important; }
    @media print {
      body { margin: 0; }
      .a4-paper-sheet { max-width: 100%; padding: 0; }
    }
  </style>
</head>
<body>
  ${paperClone.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 300);
    };
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
