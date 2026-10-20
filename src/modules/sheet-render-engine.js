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
    init: function() {
      const self = this;
      initKaTeXPolling(function() {
        const paper = document.getElementById('a4Paper');
        if (paper) typesetMath(paper);
      });

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
     */
    print: function(topicData, options) {
      const paper = document.getElementById('a4Paper');
      if (paper) paper.style.transform = 'none';

      _originalDocTitle = document.title;
      document.title = this.getPrintFileName(topicData, options);

      setTimeout(function() {
        window.print();
      }, 50);
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
