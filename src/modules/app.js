/**
 * Main Application Module (App Orchestrator)
 * 
 * Orchestrates CurriculumStore, StorageGateway, and SheetRenderEngine.
 * Manages UI interactions, navigation drawer, modals, search, and bootstrap.
 */

(function(window) {
  'use strict';

  // Navigation & UI State
  let expandedUnitId = 'unit-art-math-expo';
  let expandedChapterId = 'art-exp-chap-1';
  let editingExerciseIndex = -1;
  let activeEditingChapterId = null;
  let currentMainViewMode = 'studio';

  let currentSystemSettings = {
    school: 'โรงเรียนมัธยมวิทยาคม (สสวท.)',
    teacher: 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
    academicYear: 'ภาคเรียนที่ 2 ปีการศึกษา 2567',
    mathScale: '1.15'
  };

  // -------------------------------------------------------------
  // SIDEBAR NAVIGATION & MULTI-UNIT TREE
  // -------------------------------------------------------------
  function renderSidebarTree() {
    const container = document.getElementById('sidebarTopicsContainer');
    if (!container) return;

    const units = window.CurriculumStore.getUnits();
    const currentTopicId = window.CurriculumStore.getCurrentTopicId();

    let html = `
      <div class="unit-section-label">
        <span>📚 หน่วยการเรียนรู้ (สสวท. ม.ปลาย)</span>
        <span class="unit-count-pill">${units.length} เรื่อง</span>
      </div>
      <div class="units-container">
    `;

    units.forEach(unit => {
      if (unit.status === 'ready') {
        const isExpanded = (expandedUnitId === unit.id);
        html += `
          <div class="unit-card active-unit ${isExpanded ? 'expanded' : ''}" id="unitCard-${unit.id}">
            <button type="button" class="unit-header-btn" onclick="toggleUnit('${unit.id}')">
              <div class="unit-left-content">
                <span class="unit-icon">${unit.icon}</span>
                <div class="unit-info">
                  <div class="unit-badge-row">
                    <span class="unit-grade-tag">${unit.gradeShort}</span>
                    <span class="unit-status-tag ready">${unit.statusBadge}</span>
                  </div>
                  <div class="unit-title-text">${unit.title}</div>
                  <div class="unit-sub-text">${unit.subjectCode}</div>
                </div>
              </div>
              <span class="unit-chevron">▼</span>
            </button>

            <!-- ละแยกออกมา: 6 บทเรียนหลัก -->
            <div class="unit-chapters-body">
              <div class="chapters-banner-bar">
                <span class="chapters-banner-title">📚 เลือกบทเรียนหลัก (${unit.chapters ? unit.chapters.length : 0} บท)</span>
                <span class="chapters-banner-hint">คลิกบทเพื่อดูคาบย่อย</span>
              </div>
              <div class="chapters-tree-list">
        `;

        unit.chapters.forEach(chap => {
          const isChapOpen = (expandedChapterId === chap.id);
          const currentCode = chap.combinedSubjectCode || chap.subjectCode || 'ค31202';
          html += `
            <div class="chapter-tree-item ${isChapOpen ? 'open' : ''}" id="chapItem-${chap.id}">
              <button type="button" class="chapter-tree-header" onclick="toggleChapterTree('${chap.id}')">
                <div class="chapter-tree-title-group">
                  <span class="chapter-tree-title">${chap.chapterTitle}</span>
                  <span class="chapter-tree-sub">${chap.periodRange} • ${chap.periodRangeText}</span>
                </div>
                <button type="button" class="btn-chapter-tree-gear" onclick="event.stopPropagation(); openChapterSettingsModal('${chap.id}')" title="ตั้งค่ารหัสวิชาประจำบท (${chap.chapterTitle})">
                  ⚙️
                </button>
                <span class="chapter-tree-chevron">▼</span>
              </button>
              <div class="chapter-quick-action-bar">
                <span class="chapter-code-pill" title="รหัสวิชาปัจจุบัน: ${currentCode}">🏷️ ${currentCode}</span>
                <button type="button" class="btn-chapter-settings-chip" onclick="event.stopPropagation(); openChapterSettingsModal('${chap.id}')" title="ตั้งค่ารหัสวิชาและส่งต่อไปยัง 4 คาบย่อย">
                  <span>⚙️ ตั้งค่าบท</span>
                </button>
                <button type="button" class="btn-chapter-settings-chip btn-chapter-book-chip" onclick="event.stopPropagation(); openBookExportModal('${chap.id}')" title="รวมเล่มเฉพาะบทนี้ (${chap.topics ? chap.topics.length : 4} คาบ) เป็นไฟล์ PDF เดียว">
                  <span>📖 รวมเล่มบทนี้</span>
                </button>
              </div>
              <ul class="chapter-lessons-list">
          `;

          chap.topics.forEach(t => {
            const isActive = (t.id === currentTopicId) ? 'active' : '';
            html += `
              <li>
                <a href="javascript:void(0)" class="topic-item ${isActive}" data-id="${t.id}" onclick="selectTopic('${t.id}')">
                  <div class="topic-row-top">
                    <span class="topic-title-text">${t.title}</span>
                    <span class="topic-tag highlight">สสวท.</span>
                  </div>
                  <div class="topic-desc-snippet">${t.desc}</div>
                </a>
              </li>
            `;
          });

          html += `
              </ul>
            </div>
          `;
        });

        html += `
              </div>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="unit-card upcoming-unit" id="unitCard-${unit.id}">
            <button type="button" class="unit-header-btn" onclick="showUpcomingUnitModal('${unit.id}')">
              <div class="unit-left-content">
                <span class="unit-icon">${unit.icon}</span>
                <div class="unit-info">
                  <div class="unit-badge-row">
                    <span class="unit-grade-tag">${unit.gradeShort}</span>
                    <span class="unit-status-tag upcoming">${unit.statusBadge}</span>
                  </div>
                  <div class="unit-title-text" style="color: #cbd5e1;">${unit.title}</div>
                  <div class="unit-sub-text">${unit.subjectCode}</div>
                </div>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-dim); margin-top: 5px;">🔒</span>
            </button>
          </div>
        `;
      }
    });

    html += `</div>`;
    container.innerHTML = html;

    if (window.SheetRenderEngine) {
      window.SheetRenderEngine.typeset(container);
    }
  }

  function toggleUnit(unitId) {
    if (expandedUnitId === unitId) {
      expandedUnitId = null;
    } else {
      expandedUnitId = unitId;
    }
    renderSidebarTree();
  }

  function toggleChapterTree(chapId) {
    if (expandedChapterId === chapId) {
      expandedChapterId = null;
    } else {
      expandedChapterId = chapId;
    }
    renderSidebarTree();
  }

  function showUpcomingUnitModal(unitId) {
    const units = window.CurriculumStore.getUnits();
    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    document.getElementById('upcomingUnitTitle').textContent = unit.title;
    document.getElementById('upcomingUnitGrade').textContent = `${unit.grade} (${unit.subjectCode})`;
    document.getElementById('upcomingUnitDesc').textContent = unit.desc;
    document.getElementById('upcomingUnitPeriods').textContent = unit.totalPeriods;
    document.getElementById('upcomingUnitModal').classList.add('open');
  }

  function closeUpcomingModal() {
    document.getElementById('upcomingUnitModal').classList.remove('open');
  }

  // -------------------------------------------------------------
  // TOPIC & SHEET MODE CONTROLLER
  // -------------------------------------------------------------
  function selectTopic(topicId) {
    window.CurriculumStore.setCurrentTopicId(topicId);
    const data = window.CurriculumStore.getTopic(topicId);
    if (!data) return;

    // Update active highlight in sidebar
    document.querySelectorAll('.topic-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-id') === topicId);
    });

    // Auto expand parent chapter and unit
    const chapters = window.CurriculumStore.getChapters();
    const parentChap = chapters.find(c => c.topics && c.topics.some(t => t.id === topicId));
    if (parentChap) {
      expandedChapterId = parentChap.id;
      const units = window.CurriculumStore.getUnits();
      const parentUnit = units.find(u => u.chapters && u.chapters.some(c => c.id === parentChap.id));
      if (parentUnit) {
        expandedUnitId = parentUnit.id;
      }
      renderSidebarTree();
    }

    // Update Topbar and Hero UI
    const breadcrumbTopic = document.getElementById('breadcrumbTopic');
    if (breadcrumbTopic) breadcrumbTopic.textContent = data.title;
    const heroTitle = document.getElementById('heroTopicTitle');
    if (heroTitle) heroTitle.textContent = data.title;
    const heroDesc = document.getElementById('heroTopicDesc');
    if (heroDesc) heroDesc.textContent = data.standard;
    const heroBadge = document.getElementById('heroTopicBadge');
    if (heroBadge) heroBadge.textContent = `${data.gradeShort} • ${data.chapter} (${data.period})`;

    // Update Input Fields
    const currentMode = window.CurriculumStore.getCurrentSheetMode();
    const modeData = data[currentMode] || data.worksheet;
    if (document.getElementById('fieldSchool')) {
      document.getElementById('fieldSchool').value = currentSystemSettings.school || 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
    }
    if (document.getElementById('fieldTeacher')) {
      document.getElementById('fieldTeacher').value = currentSystemSettings.teacher || 'กลุ่มสาระการเรียนรู้คณิตศาสตร์';
    }
    if (document.getElementById('fieldSubject')) {
      document.getElementById('fieldSubject').value = data.subjectCode;
    }
    if (document.getElementById('fieldSheet') && modeData) {
      document.getElementById('fieldSheet').value = modeData.sheetName;
    }

    renderPaperSheet();
  }

  function switchSheetMode(mode) {
    window.CurriculumStore.setCurrentSheetMode(mode);

    document.querySelectorAll('.btn-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    const topic = window.CurriculumStore.getTopic();
    if (topic && topic[mode] && document.getElementById('fieldSheet')) {
      document.getElementById('fieldSheet').value = topic[mode].sheetName;
    }

    renderPaperSheet();
  }

  function renderPaperSheet() {
    const topic = window.CurriculumStore.getTopic();
    if (!topic || !window.SheetRenderEngine) return;

    window.SheetRenderEngine.render(topic, {
      mode: window.CurriculumStore.getCurrentSheetMode(),
      isTeacherKey: window.CurriculumStore.isTeacherKeyMode()
    });
  }

  function toggleAnswerKey(forceState) {
    const currentState = window.CurriculumStore.isTeacherKeyMode();
    const nextState = (typeof forceState === 'boolean') ? forceState : !currentState;
    window.CurriculumStore.setTeacherKeyMode(nextState);

    // Update Topbar button
    const btnTop = document.getElementById('btnToggleAnswerKey');
    if (btnTop) {
      btnTop.classList.toggle('active', nextState);
      const textSpan = btnTop.querySelector('.btn-text');
      if (textSpan) {
        textSpan.textContent = nextState ? 'โหมดเฉลย (เปิด)' : 'โหมดเฉลย';
      }
    }

    // Update Canvas Zoom toolbar button
    const btnZoom = document.getElementById('btnZoomToggleKey');
    if (btnZoom) {
      btnZoom.classList.toggle('active', nextState);
    }

    // Update Mobile dock button
    const dockBtn = document.getElementById('dockBtnAnswerKey');
    if (dockBtn) {
      dockBtn.classList.toggle('active', nextState);
    }

    renderPaperSheet();
  }

  // -------------------------------------------------------------
  // INTERACTIVE EXERCISE BLOCK EDITOR MODAL
  // -------------------------------------------------------------
  function openAddExerciseModal() {
    editingExerciseIndex = -1;
    const exercises = window.CurriculumStore.getExercises();
    const nextNum = exercises.length + 1;

    document.getElementById('modalTitle').textContent = '➕ เพิ่มโจทย์ข้อสอบใหม่';
    document.getElementById('modalInputTitle').value = `ข้อที่ ${nextNum}. `;
    document.getElementById('modalInputPoints').value = '';
    document.getElementById('modalInputLatex').value = '';
    document.getElementById('modalSelectAnswerType').value = 'handwriting-normal';
    document.getElementById('modalInputPlaceholder').value = '';
    const ansInput = document.getElementById('modalInputAnswer');
    if (ansInput) ansInput.value = '';
    document.getElementById('mcOptionA').value = '';
    document.getElementById('mcOptionB').value = '';
    document.getElementById('mcOptionC').value = '';
    document.getElementById('mcOptionD').value = '';

    applyTemplatePreset('descriptive');
    handleAnswerTypeChange();
    updateModalPreview();

    document.getElementById('exerciseModal').classList.add('open');
    setTimeout(() => document.getElementById('modalInputTitle').focus(), 100);
  }

  function openEditExerciseModal(index) {
    editingExerciseIndex = index;
    const exercises = window.CurriculumStore.getExercises();
    const ex = exercises[index];
    if (!ex) return;

    document.getElementById('modalTitle').textContent = `✏️ แก้ไขโจทย์ (ข้อที่ ${index + 1})`;
    document.getElementById('modalInputTitle').value = ex.title || '';
    document.getElementById('modalInputPoints').value = ex.points || '';
    document.getElementById('modalInputLatex').value = ex.latex || '';
    document.getElementById('modalSelectAnswerType').value = ex.answerType || 'handwriting-normal';
    document.getElementById('modalInputPlaceholder').value = ex.placeholder || '';
    const ansInput = document.getElementById('modalInputAnswer');
    if (ansInput) ansInput.value = ex.answer || '';
    document.getElementById('mcOptionA').value = ex.choiceA || '';
    document.getElementById('mcOptionB').value = ex.choiceB || '';
    document.getElementById('mcOptionC').value = ex.choiceC || '';
    document.getElementById('mcOptionD').value = ex.choiceD || '';

    document.querySelectorAll('.template-chip').forEach(c => c.classList.remove('active'));
    if (ex.answerType === 'multiple-choice') {
      document.getElementById('tplMultipleChoice')?.classList.add('active');
    } else if (ex.answerType === 'short-answer') {
      document.getElementById('tplShortAnswer')?.classList.add('active');
    } else {
      document.getElementById('tplDescriptive')?.classList.add('active');
    }

    handleAnswerTypeChange();
    updateModalPreview();

    document.getElementById('exerciseModal').classList.add('open');
    setTimeout(() => document.getElementById('modalInputTitle').focus(), 100);
  }

  function closeExerciseModal() {
    document.getElementById('exerciseModal').classList.remove('open');
  }

  function handleModalBackdropClick(event) {
    if (event.target.id === 'exerciseModal') {
      closeExerciseModal();
    }
  }

  function handleAnswerTypeChange() {
    const type = document.getElementById('modalSelectAnswerType').value;
    const mcWrap = document.getElementById('modalMCOptionsWrap');
    const placeholderWrap = document.getElementById('modalPlaceholderWrap');

    if (type === 'multiple-choice') {
      mcWrap.style.display = 'block';
      placeholderWrap.style.display = 'none';
    } else {
      mcWrap.style.display = 'none';
      placeholderWrap.style.display = 'block';
    }
    updateModalPreview();
  }

  function applyTemplatePreset(preset) {
    document.querySelectorAll('.template-chip').forEach(c => c.classList.remove('active'));
    const select = document.getElementById('modalSelectAnswerType');

    if (preset === 'descriptive') {
      document.getElementById('tplDescriptive')?.classList.add('active');
      select.value = 'handwriting-normal';
      document.getElementById('modalInputPlaceholder').value = '(แสดงวิธีทำและคำตอบอย่างละเอียด)';
      if (editingExerciseIndex === -1 && !document.getElementById('modalInputTitle').value.trim()) {
        document.getElementById('modalInputTitle').value = 'จงหาคำตอบของโจทย์ต่อไปนี้';
      }
    } else if (preset === 'multiple-choice') {
      document.getElementById('tplMultipleChoice')?.classList.add('active');
      select.value = 'multiple-choice';
      if (!document.getElementById('mcOptionA').value) document.getElementById('mcOptionA').value = 'ก. ';
      if (!document.getElementById('mcOptionB').value) document.getElementById('mcOptionB').value = 'ข. ';
      if (!document.getElementById('mcOptionC').value) document.getElementById('mcOptionC').value = 'ค. ';
      if (!document.getElementById('mcOptionD').value) document.getElementById('mcOptionD').value = 'ง. ';
    } else if (preset === 'short-answer') {
      document.getElementById('tplShortAnswer')?.classList.add('active');
      select.value = 'short-answer';
    } else if (preset === 'proof') {
      document.getElementById('tplProof')?.classList.add('active');
      select.value = 'handwriting-large';
      document.getElementById('modalInputPlaceholder').value = '(พิสูจน์โดยใช้สมบัติหรือนิยามทางคณิตศาสตร์)';
    }

    handleAnswerTypeChange();
  }

  function insertLatexSymbol(symbol) {
    const textarea = document.getElementById('modalInputLatex');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + symbol + text.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
    textarea.focus();
    updateModalPreview();
  }

  function updateModalPreview() {
    const title = document.getElementById('modalInputTitle').value || '(ยังไม่ได้ระบุหัวข้อโจทย์)';
    const points = document.getElementById('modalInputPoints').value || '';
    const latex = document.getElementById('modalInputLatex').value.trim();
    const answerType = document.getElementById('modalSelectAnswerType').value;
    const ansInput = document.getElementById('modalInputAnswer');
    const answer = ansInput ? ansInput.value.trim() : '';

    let answerHtml = '';
    if (answerType === 'multiple-choice') {
      const a = document.getElementById('mcOptionA').value || 'ก. ........................';
      const b = document.getElementById('mcOptionB').value || 'ข. ........................';
      const c = document.getElementById('mcOptionC').value || 'ค. ........................';
      const d = document.getElementById('mcOptionD').value || 'ง. ........................';
      answerHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem 1rem; margin-top: 0.5rem; font-size: 0.88rem; color: #334155;">
          <div>${a}</div>
          <div>${b}</div>
          <div>${c}</div>
          <div>${d}</div>
        </div>
      `;
    } else if (answerType === 'short-answer') {
      answerHtml = `
        <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #1e293b;">
          <span><strong>ตอบ:</strong></span>
          <div style="flex: 1; border-bottom: 1.5px dotted #94a3b8; height: 1.5rem;"></div>
        </div>
      `;
    } else if (answerType === 'blank') {
      answerHtml = `
        <div class="handwriting-grid" style="min-height: 80px; margin-top: 0.5rem; background: transparent;"></div>
      `;
    } else {
      answerHtml = `
        <div class="handwriting-grid" style="min-height: ${answerType === 'handwriting-large' ? '90px' : '65px'}; margin-top: 0.5rem;"></div>
      `;
    }

    const container = document.getElementById('modalPreviewContent');
    container.innerHTML = `
      <div class="exercise-header">
        <span>${title}</span>
        ${points ? `<span class="score-badge">${points}</span>` : ''}
      </div>
      ${latex ? `<div style="margin: 0.4rem 0; font-size: 1.05rem; padding-left: 0.5rem;">$$${latex}$$</div>` : ''}
      ${answer ? `
        <div class="sheet-teacher-answer" style="display: flex; margin-bottom: 0.5rem;">
          <span class="answer-badge">🔑 เฉลย:</span>
          <span class="answer-text">${answer}</span>
        </div>
      ` : ''}
      ${answerHtml}
    `;

    if (window.SheetRenderEngine) {
      window.SheetRenderEngine.typeset(container);
    }
  }

  function saveExerciseFromModal() {
    const title = document.getElementById('modalInputTitle').value.trim();
    if (!title) {
      alert('กรุณากรอกข้อความคำถาม / หัวข้อโจทย์');
      document.getElementById('modalInputTitle').focus();
      return;
    }

    const points = document.getElementById('modalInputPoints').value.trim();
    const latex = document.getElementById('modalInputLatex').value.trim();
    const answerType = document.getElementById('modalSelectAnswerType').value;
    const placeholder = document.getElementById('modalInputPlaceholder').value.trim();
    const ansInput = document.getElementById('modalInputAnswer');
    const answer = ansInput ? ansInput.value.trim() : '';

    const exerciseObj = {
      title: title,
      answer: answer,
      points: points,
      latex: latex,
      answerType: answerType,
      placeholder: placeholder
    };

    if (answerType === 'multiple-choice') {
      exerciseObj.choiceA = document.getElementById('mcOptionA').value.trim();
      exerciseObj.choiceB = document.getElementById('mcOptionB').value.trim();
      exerciseObj.choiceC = document.getElementById('mcOptionC').value.trim();
      exerciseObj.choiceD = document.getElementById('mcOptionD').value.trim();
    }

    window.CurriculumStore.saveExercise(null, null, editingExerciseIndex, exerciseObj);
    closeExerciseModal();
    renderPaperSheet();
  }

  function deleteExercise(index) {
    const exercises = window.CurriculumStore.getExercises();
    if (!exercises[index]) return;

    if (!confirm(`ยืนยันการลบข้อสอบ: "${exercises[index].title}" หรือไม่?`)) {
      return;
    }

    window.CurriculumStore.deleteExercise(null, null, index);
    renderPaperSheet();
  }

  function moveExercise(index, direction) {
    window.CurriculumStore.moveExercise(null, null, index, direction);
    renderPaperSheet();
  }

  function resetExercisesToDefault() {
    if (!confirm('ต้องการรีเซ็ตข้อสอบทั้งหมดในชีทนี้กลับเป็นค่าเริ่มต้นตามหลักสูตร สสวท. หรือไม่?\n(การเปลี่ยนแปลงที่คุณเพิ่มหรือแก้ไขในชีทนี้จะถูกย้อนกลับ)')) {
      return;
    }

    window.CurriculumStore.resetToDefault();
    renderPaperSheet();
  }

  function applyPreset(preset) {
    if (preset === 'standard') {
      switchSheetMode('worksheet');
      alert('✨ นำเข้าชุดข้อสอบมาตรฐาน สสวท. เรียบร้อยแล้ว');
    } else if (preset === 'summary-card') {
      switchSheetMode('summary');
      alert('✨ นำเข้าโหมดสรุปกฎและเทคนิคเรียบร้อยแล้ว');
    } else if (preset === 'exam') {
      switchSheetMode('quiz');
      alert('✨ สลับสู่โหมดแบบทดสอบ Exit Ticket (10 ข้อ)');
    }
  }

  // -------------------------------------------------------------
  // CANVAS ZOOM & UI CONTROLS
  // -------------------------------------------------------------
  function adjustCanvasZoom(delta) {
    if (window.SheetRenderEngine) window.SheetRenderEngine.adjustZoom(delta);
  }

  function resetCanvasZoom() {
    if (window.SheetRenderEngine) window.SheetRenderEngine.resetZoom();
  }

  function toggleSidebarDrawer(open) {
    const drawer = document.getElementById('sidebarDrawer');
    const overlay = document.getElementById('mobileOverlay');
    const isOpen = (open === undefined) ? !drawer.classList.contains('open') : open;

    drawer.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
  }

  function toggleCategory(catId) {
    const grp = document.getElementById(catId);
    if (grp) grp.classList.toggle('collapsed');
  }

  function handleSearchTopics() {
    const query = document.getElementById('topicSearchBox').value.trim().toLowerCase();
    const items = document.querySelectorAll('.topic-item');

    items.forEach(item => {
      const title = item.querySelector('.topic-title-text')?.textContent.toLowerCase() || '';
      const desc = item.querySelector('.topic-desc-snippet')?.textContent.toLowerCase() || '';
      const match = title.includes(query) || desc.includes(query);
      item.closest('li').style.display = match ? 'block' : 'none';
    });
  }

  function switchMainView(mode) {
    currentMainViewMode = mode;

    const btnStudio = document.getElementById('btnModeStudio');
    const btnPaper = document.getElementById('btnModePaper');
    const dockStudio = document.getElementById('dockBtnStudio');
    const dockPaper = document.getElementById('dockBtnPaper');

    if (btnStudio) btnStudio.classList.toggle('active', mode === 'studio');
    if (btnPaper) btnPaper.classList.toggle('active', mode === 'paper');
    if (dockStudio) dockStudio.classList.toggle('active', mode === 'studio');
    if (dockPaper) dockPaper.classList.toggle('active', mode === 'paper');

    const hero = document.querySelector('.workflow-hero');
    const configCard = document.getElementById('studioConfigCard');
    const canvasArea = document.getElementById('canvasViewport') || document.querySelector('.canvas-viewport');

    if (canvasArea) {
      canvasArea.style.display = 'flex';
    }

    if (mode === 'paper') {
      if (hero) hero.style.display = 'none';
      if (configCard) configCard.style.display = 'none';
      if (canvasArea) {
        canvasArea.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (hero) hero.style.display = 'block';
      if (configCard) configCard.style.display = 'block';
    }
  }

  function syncToPaper() {
    renderPaperSheet();
  }

  function copyFormula(latex) {
    navigator.clipboard.writeText(latex).then(() => {
      showSystemToast(`📋 คัดลอกสูตร: ${latex}`);
    });
  }

  // -------------------------------------------------------------
  // PERSISTENCE & STORAGE GATEWAY INTEGRATION
  // -------------------------------------------------------------
  function saveWorkflow() {
    const topic = window.CurriculumStore.getTopic();
    if (!topic) return;

    const currentMode = window.CurriculumStore.getCurrentSheetMode();
    const modeData = topic[currentMode] || topic.worksheet;
    const saveBtn = document.getElementById('btnSaveSheet');
    const originalBtnHtml = saveBtn ? saveBtn.innerHTML : '<span>💾 บันทึกชีท</span>';

    const payload = {
      school: document.getElementById('fieldSchool').value || 'โรงเรียนมัธยมวิทยาคม (สสวท.)',
      subject: document.getElementById('fieldSubject').value || topic.subjectCode,
      sheet: document.getElementById('fieldSheet').value || (modeData ? modeData.sheetName : 'ใบงานการเรียนรู้'),
      teacher: document.getElementById('fieldTeacher').value || 'กลุ่มสาระการเรียนรู้คณิตศาสตร์',
      topicId: window.CurriculumStore.getCurrentTopicId(),
      topicTitle: topic.title,
      grade: topic.grade,
      gradeShort: topic.gradeShort,
      semester: topic.semester,
      standard: topic.standard,
      mode: currentMode,
      modeLabel: currentMode === 'worksheet' ? 'แบบฝึกหัด (Worksheet)' : currentMode === 'summary' ? 'ใบสรุปสูตร (Cheat Sheet)' : 'แบบทดสอบ (Quiz)',
      part1Label: document.getElementById('labelPart1') ? document.getElementById('labelPart1').textContent : '',
      part1Html: modeData ? modeData.conceptHtml : '',
      part2Label: document.getElementById('labelPart2') ? document.getElementById('labelPart2').textContent : '',
      exercises: modeData ? modeData.exercises : []
    };

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>⏳ กำลังบันทึก...</span>';
    }

    window.StorageGateway.saveWorksheet(payload)
      .then(res => {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = originalBtnHtml;
        }
        showSaveSuccessModal(res);
      })
      .catch(err => {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = originalBtnHtml;
        }
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
      });
  }

  function showSaveSuccessModal(res) {
    document.getElementById('saveModalFileName').textContent = res.fileName || 'เอกสารการสอน';
    document.getElementById('saveModalFolderName').textContent = res.folderName || 'Google Drive';
    document.getElementById('saveModalTimestamp').textContent = res.timestamp || '-';
    document.getElementById('saveModalExerciseCount').textContent = (res.exerciseCount !== undefined ? res.exerciseCount : '-') + ' ข้อ';
    
    const badge = document.getElementById('saveModalStatusBadge');
    if (res.isLocalMock) {
      badge.textContent = 'Local Simulation Mode (Deploy on GAS for live Drive)';
      badge.style.color = 'var(--neon-amber)';
    } else {
      badge.textContent = 'บันทึกบน Google Drive & Docs เรียบร้อยแล้ว';
      badge.style.color = '#10b981';
    }

    const docLink = document.getElementById('btnOpenGoogleDoc');
    docLink.href = res.docUrl || '#';
    docLink.style.display = res.docUrl ? 'flex' : 'none';

    const folderLink = document.getElementById('btnOpenDriveFolder');
    folderLink.href = res.folderUrl || '#';
    folderLink.style.display = res.folderUrl ? 'flex' : 'none';

    const indexLink = document.getElementById('btnOpenIndexSheet');
    indexLink.href = res.indexSpreadsheetUrl || '#';
    indexLink.style.display = res.indexSpreadsheetUrl ? 'flex' : 'none';

    document.getElementById('saveSuccessModal').classList.add('open');
  }

  function closeSaveSuccessModal() {
    document.getElementById('saveSuccessModal').classList.remove('open');
  }

  function getGasApiUrl() {
    return window.StorageGateway ? window.StorageGateway.getGasApiUrl() : '';
  }

  function setGasApiUrl(url) {
    if (window.StorageGateway) window.StorageGateway.setGasApiUrl(url);
  }

  // -------------------------------------------------------------
  // SYSTEM SETTINGS & CHAPTER CASCADE LOGIC
  // -------------------------------------------------------------
  function openSystemSettingsModal() {
    document.getElementById('inputSystemSchool').value = currentSystemSettings.school;
    document.getElementById('inputSystemTeacher').value = currentSystemSettings.teacher;
    document.getElementById('inputSystemAcademicYear').value = currentSystemSettings.academicYear;
    document.getElementById('selectMathScale').value = currentSystemSettings.mathScale;
    document.getElementById('inputGasApiUrl').value = getGasApiUrl();

    const storedSheetUrl = localStorage.getItem('mathSheet_spreadsheetUrl');
    const linkSheet = document.getElementById('linkOpenGoogleSheetDb');
    if (linkSheet && storedSheetUrl) {
      linkSheet.href = storedSheetUrl;
    }

    document.getElementById('systemSettingsModal').classList.add('open');
  }

  function closeSystemSettingsModal() {
    document.getElementById('systemSettingsModal').classList.remove('open');
  }

  function saveSystemSettings() {
    const school = document.getElementById('inputSystemSchool').value.trim();
    const teacher = document.getElementById('inputSystemTeacher').value.trim();
    const academicYear = document.getElementById('inputSystemAcademicYear').value.trim();
    const mathScale = document.getElementById('selectMathScale').value;
    const apiUrl = document.getElementById('inputGasApiUrl').value.trim();

    if (school) currentSystemSettings.school = school;
    if (teacher) currentSystemSettings.teacher = teacher;
    if (academicYear) currentSystemSettings.academicYear = academicYear;
    if (mathScale) currentSystemSettings.mathScale = mathScale;

    try {
      localStorage.setItem('mathSheet_systemSettings', JSON.stringify(currentSystemSettings));
    } catch (e) {}

    setGasApiUrl(apiUrl);

    if (document.getElementById('fieldSchool')) document.getElementById('fieldSchool').value = currentSystemSettings.school;
    if (document.getElementById('fieldTeacher')) document.getElementById('fieldTeacher').value = currentSystemSettings.teacher;

    applyMathScale(currentSystemSettings.mathScale);
    renderPaperSheet();

    closeSystemSettingsModal();
    showSystemToast('✅ บันทึกการตั้งค่าระบบส่วนกลางเรียบร้อยแล้ว');

    syncSettingsToGoogleSheet(false);
  }

  function applyMathScale(scale) {
    document.documentElement.style.setProperty('--math-scale', scale);
    const container = document.getElementById('a4Paper');
    if (container && window.SheetRenderEngine) {
      window.SheetRenderEngine.typeset(container);
    }
  }

  function openChapterSettingsModal(chapId) {
    activeEditingChapterId = chapId;
    const chapters = window.CurriculumStore.getChapters();
    const chap = chapters.find(c => c.id === chapId);
    if (!chap) return;

    let saved = null;
    try {
      const raw = localStorage.getItem('mathSheet_chapterSettings_' + chapId);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {}

    const subjectName = saved?.subject || chap.subjectName || 'คณิตศาสตร์เพิ่มเติม 2';
    const subjectCode = saved?.code || chap.subjectCode || 'ค31202';
    const grade = saved?.grade || chap.grade || 'มัธยมศึกษาปีที่ 4';
    const semester = saved?.semester || chap.semester || 'ภาคเรียนที่ 2';

    document.getElementById('chapterSettingsModalTitle').textContent = `⚙️ ตั้งค่า: ${chap.chapterTitle}`;
    document.getElementById('inputChapterSubjectName').value = subjectName;
    document.getElementById('inputChapterSubjectCode').value = subjectCode;
    document.getElementById('selectChapterGrade').value = grade;
    document.getElementById('selectChapterSemester').value = semester;

    const listContainer = document.getElementById('chapterCascadePreviewList');
    if (listContainer && Array.isArray(chap.topics)) {
      listContainer.innerHTML = chap.topics.map(t => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; background: rgba(255,255,255,0.03); border-radius: 4px; font-size: 0.8rem;">
          <span style="color: #cbd5e1;">${t.title}</span>
          <span style="color: var(--neon-cyan); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">${subjectCode}</span>
        </div>
      `).join('');
    }

    document.getElementById('chapterSettingsModal').classList.add('open');
  }

  function closeChapterSettingsModal() {
    document.getElementById('chapterSettingsModal').classList.remove('open');
    activeEditingChapterId = null;
  }

  function saveChapterSettings() {
    if (!activeEditingChapterId) return;
    const chapId = activeEditingChapterId;
    const chapters = window.CurriculumStore.getChapters();
    const chap = chapters.find(c => c.id === chapId);
    if (!chap) return;

    const defaultSubjectName = chap.subjectName || 'คณิตศาสตร์เพิ่มเติม 2';
    const defaultSubjectCode = chap.subjectCode || 'ค31202';
    const subjectName = document.getElementById('inputChapterSubjectName').value.trim() || defaultSubjectName;
    const subjectCode = document.getElementById('inputChapterSubjectCode').value.trim() || defaultSubjectCode;
    const grade = document.getElementById('selectChapterGrade').value;
    const semester = document.getElementById('selectChapterSemester').value;
    const combinedSubjectCode = `${subjectName} (${subjectCode})`;

    const chapterSettingsObj = {
      id: chapId,
      chapterTitle: chap.chapterTitle,
      subject: subjectName,
      code: subjectCode,
      combinedSubjectCode: combinedSubjectCode,
      grade: grade,
      semester: semester
    };

    try {
      localStorage.setItem('mathSheet_chapterSettings_' + chapId, JSON.stringify(chapterSettingsObj));
    } catch (e) {}

    chap.subjectCode = subjectCode;
    chap.subjectName = subjectName;
    chap.combinedSubjectCode = combinedSubjectCode;
    chap.grade = grade;
    chap.semester = semester;

    window.CurriculumStore.applyChapterSettings(chapId, chapterSettingsObj);

    renderSidebarTree();
    renderPaperSheet();

    closeChapterSettingsModal();
    showSystemToast(`✅ อัปเดตรหัสวิชา "${combinedSubjectCode}" ประจำ ${chap.chapterTitle} เรียบร้อยแล้ว`);

    syncSettingsToGoogleSheet(false);
  }

  async function syncSettingsToGoogleSheet(showToastNotice = false) {
    const badge = document.getElementById('gasApiStatusBadge');
    if (badge) {
      badge.textContent = '⏳ กำลังซิงค์ขึ้น Sheets...';
      badge.style.background = 'rgba(234, 179, 8, 0.2)';
      badge.style.color = '#fde047';
    }

    const chapters = window.CurriculumStore.getChapters();
    const chapterList = chapters.map(chap => ({
      id: chap.id,
      title: chap.chapterTitle,
      code: chap.subjectCode || 'ค31202',
      subject: chap.subjectName || 'คณิตศาสตร์เพิ่มเติม 2',
      combinedSubjectCode: chap.combinedSubjectCode || `${chap.subjectName || 'คณิตศาสตร์เพิ่มเติม 2'} (${chap.subjectCode || 'ค31202'})`,
      grade: chap.grade || 'มัธยมศึกษาปีที่ 4',
      semester: chap.semester || 'ภาคเรียนที่ 2'
    }));

    try {
      const result = await window.StorageGateway.syncSettings(currentSystemSettings, chapterList);
      if (result && result.success) {
        if (badge) {
          badge.textContent = '🟢 ซิงค์กับ Google Sheets สำเร็จ';
          badge.style.background = 'rgba(16, 185, 129, 0.2)';
          badge.style.color = '#34d399';
        }
        if (result.spreadsheetUrl) {
          localStorage.setItem('mathSheet_spreadsheetUrl', result.spreadsheetUrl);
          const link = document.getElementById('linkOpenGoogleSheetDb');
          if (link) link.href = result.spreadsheetUrl;
        }
        if (showToastNotice) {
          showSystemToast('📊 ซิงค์ข้อมูลการตั้งค่าขึ้น Google Sheets สำเร็จเรียบร้อย');
        }
      }
    } catch (err) {
      console.warn('syncSettingsToGoogleSheet error:', err);
      if (badge) {
        badge.textContent = '🟡 ออฟไลน์ (บันทึกในเครื่องแทน)';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#f87171';
      }
      if (showToastNotice) {
        showSystemToast('⚠️ ไม่สามารถเชื่อมต่อ Google Sheets ได้ (บันทึกไว้ในเบราว์เซอร์แล้ว)');
      }
    }
  }

  async function fetchSettingsFromGoogleSheet(showToastNotice = false) {
    const badge = document.getElementById('gasApiStatusBadge');
    if (badge) {
      badge.textContent = '⏳ กำลังดึงข้อมูลจาก Sheets...';
      badge.style.background = 'rgba(234, 179, 8, 0.2)';
      badge.style.color = '#fde047';
    }

    try {
      const result = await window.StorageGateway.fetchSettings();
      if (result && result.success) {
        if (result.systemSettings) {
          const sys = result.systemSettings;
          if (sys.school) currentSystemSettings.school = sys.school;
          if (sys.teacher) currentSystemSettings.teacher = sys.teacher;
          if (sys.academicYear) currentSystemSettings.academicYear = sys.academicYear;
          if (sys.mathScale) currentSystemSettings.mathScale = String(sys.mathScale);

          try {
            localStorage.setItem('mathSheet_systemSettings', JSON.stringify(currentSystemSettings));
          } catch (e) {}

          applyMathScale(currentSystemSettings.mathScale);
        }

        if (result.chapterSettings) {
          const chapters = window.CurriculumStore.getChapters();
          Object.keys(result.chapterSettings).forEach(chapId => {
            const chData = result.chapterSettings[chapId];
            const chap = chapters.find(c => c.id === chapId);
            if (chap && chData) {
              window.CurriculumStore.applyChapterSettings(chapId, chData);
            }
          });
          renderSidebarTree();
        }

        if (result.spreadsheetUrl) {
          localStorage.setItem('mathSheet_spreadsheetUrl', result.spreadsheetUrl);
          const link = document.getElementById('linkOpenGoogleSheetDb');
          if (link) link.href = result.spreadsheetUrl;
        }

        if (badge) {
          badge.textContent = '🟢 อัปเดตข้อมูลตรงกับ Sheets แล้ว';
          badge.style.background = 'rgba(16, 185, 129, 0.2)';
          badge.style.color = '#34d399';
        }

        renderPaperSheet();
        if (showToastNotice) {
          showSystemToast('📥 ดึงข้อมูลการตั้งค่าล่าสุดจาก Google Sheets สำเร็จ');
        }
      }
    } catch (err) {
      console.warn('fetchSettingsFromGoogleSheet error:', err);
      if (badge) {
        badge.textContent = '🟡 โหลดจาก LocalStorage ในเครื่อง';
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.color = '#f87171';
      }
      if (showToastNotice) {
        showSystemToast('⚠️ ไม่สามารถดึงข้อมูลจาก Sheets ได้ (ใช้ข้อมูลในเครื่องแทน)');
      }
    }
  }

  function loadAllSavedSettings() {
    try {
      const savedSys = localStorage.getItem('mathSheet_systemSettings');
      if (savedSys) {
        currentSystemSettings = Object.assign(currentSystemSettings, JSON.parse(savedSys));
      }
    } catch (e) {}

    applyMathScale(currentSystemSettings.mathScale);

    const chapters = window.CurriculumStore.getChapters();
    chapters.forEach(chap => {
      try {
        const raw = localStorage.getItem('mathSheet_chapterSettings_' + chap.id);
        if (raw) {
          const chData = JSON.parse(raw);
          window.CurriculumStore.applyChapterSettings(chap.id, chData);
        }
      } catch (e) {}
    });

    renderSidebarTree();
    fetchSettingsFromGoogleSheet(false);
  }

  function showSystemToast(msg) {
    let toast = document.getElementById('systemToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'systemToast';
      toast.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; background: rgba(15, 23, 42, 0.95); color: #00f5d4; padding: 0.75rem 1.25rem; border-radius: 8px; border: 1px solid rgba(0, 245, 212, 0.3); font-size: 0.9rem; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.5); backdrop-filter: blur(8px); transition: all 0.3s ease; opacity: 0; transform: translateY(10px); pointer-events: none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3200);
  }

  function openPdfExportModal() {
    if (window.SheetRenderEngine && window.SheetRenderEngine.openExportModal) {
      window.SheetRenderEngine.openExportModal();
    } else {
      triggerAirPrint();
    }
  }

  function prepareAndPrint() {
    if (window.SheetRenderEngine && window.SheetRenderEngine.EnvironmentSniffer && window.SheetRenderEngine.EnvironmentSniffer.isIOS()) {
      window.SheetRenderEngine.openIosPdfGuideModal();
    } else {
      executeNativePrint();
    }
  }

  function executeNativePrint() {
    if (window.SheetRenderEngine && window.SheetRenderEngine.closeIosPdfGuideModal) {
      window.SheetRenderEngine.closeIosPdfGuideModal();
    }
    if (window.SheetRenderEngine) {
      window.SheetRenderEngine.print();
    } else {
      window.print();
    }
  }

  function openCleanPrintTab() {
    if (window.SheetRenderEngine && window.SheetRenderEngine.closeIosPdfGuideModal) {
      window.SheetRenderEngine.closeIosPdfGuideModal();
    }
    if (window.SheetRenderEngine && window.SheetRenderEngine.openCleanPrintTab) {
      window.SheetRenderEngine.openCleanPrintTab();
    } else {
      executeNativePrint();
    }
  }

  function closeIosPdfGuideModal() {
    if (window.SheetRenderEngine && window.SheetRenderEngine.closeIosPdfGuideModal) {
      window.SheetRenderEngine.closeIosPdfGuideModal();
    }
  }

  function getWorksheetPrintFileName() {
    return window.SheetRenderEngine ? window.SheetRenderEngine.getPrintFileName() : document.title;
  }

  // -------------------------------------------------------------
  // COMMERCIAL WORKBOOK & BOOK EXPORT CONTROLLERS
  // -------------------------------------------------------------
  function openBookExportModal(chapterId) {
    const modal = document.getElementById('bookExportModal');
    if (!modal) return;

    const selectUnit = document.getElementById('selectBookUnit');
    const selectChapter = document.getElementById('selectBookChapter');

    // 1. Populate Units Dropdown
    const allUnits = window.CurriculumStore ? window.CurriculumStore.getUnits() : [];
    const curTopicId = window.CurriculumStore ? window.CurriculumStore.getCurrentTopicId() : null;
    const curUnit = window.CurriculumStore ? window.CurriculumStore.getCurrentUnit(curTopicId) : (allUnits[0] || null);

    // If chapterId passed, find its parent unit
    let parentUnitId = curUnit ? curUnit.id : (allUnits[0] ? allUnits[0].id : null);
    if (chapterId && window.CurriculumStore) {
      allUnits.forEach(function(u) {
        if (u.chapters && u.chapters.some(function(c) { return c.id === chapterId; })) {
          parentUnitId = u.id;
        }
      });
    }

    if (selectUnit) {
      selectUnit.innerHTML = allUnits.map(function(u) {
        const isSelected = (u.id === parentUnitId) ? 'selected' : '';
        const badge = u.gradeShort ? `[${u.gradeShort}] ` : '';
        return `<option value="${u.id}" ${isSelected}>${badge}${u.title} (${u.subjectCode})</option>`;
      }).join('');
    }

    // 2. Populate Chapters Dropdown for that Unit
    populateBookChaptersDropdown(parentUnitId, chapterId);

    // 3. Render Topics Checklist
    renderBookTopicsChecklist();

    // 4. Set Initial Cover Title
    syncBookCoverTitle();

    // 5. Pre-fill Author, School, Copyright from localStorage or settings
    const savedTeacher = localStorage.getItem('math_system_teacher');
    const fTeacher = document.getElementById('fieldTeacher');
    const inputAuthor = document.getElementById('inputBookAuthor');
    if (inputAuthor) {
      inputAuthor.value = savedTeacher || (fTeacher && fTeacher.value ? fTeacher.value.trim() : 'กลุ่มสาระการเรียนรู้คณิตศาสตร์');
    }

    const savedSchool = localStorage.getItem('math_system_school');
    const fSchool = document.getElementById('fieldSchool');
    const inputSchool = document.getElementById('inputBookSchool');
    if (inputSchool) {
      inputSchool.value = savedSchool || (fSchool && fSchool.value ? fSchool.value.trim() : 'โรงเรียนมัธยมวิทยาคม (สสวท.)');
    }

    const inputCopyright = document.getElementById('inputBookCopyright');
    if (inputCopyright && !inputCopyright.value) {
      inputCopyright.value = '© สงวนลิขสิทธิ์ตาม พ.ร.บ. ห้ามทำซ้ำ ดัดแปลง หรือแจกจ่ายต่อในเชิงพาณิชย์โดยไม่ได้รับอนุญาต';
    }

    updateBookEditionNotice();
    modal.classList.add('open');
  }

  function populateBookChaptersDropdown(unitId, selectedChapId) {
    const selectChapter = document.getElementById('selectBookChapter');
    if (!selectChapter) return;

    const allUnits = window.CurriculumStore ? window.CurriculumStore.getUnits() : [];
    const unit = allUnits.find(function(u) { return u.id === unitId; });
    const chapters = (unit && unit.chapters) ? unit.chapters : [];

    let html = `<option value="ALL">🌟 รวมทุกบทในเรื่องนี้ (${chapters.length} บท • เล่มสมบูรณ์)</option>`;
    chapters.forEach(function(c) {
      const isSelected = (c.id === selectedChapId) ? 'selected' : '';
      const topicCount = c.topics ? c.topics.length : 4;
      html += `<option value="${c.id}" ${isSelected}>${c.chapterTitle || c.title} (${topicCount} คาบ)</option>`;
    });

    selectChapter.innerHTML = html;
  }

  function onBookUnitChange() {
    const selectUnit = document.getElementById('selectBookUnit');
    const unitId = selectUnit ? selectUnit.value : null;
    populateBookChaptersDropdown(unitId, null);
    renderBookTopicsChecklist();
    syncBookCoverTitle();
  }

  function onBookChapterChange() {
    renderBookTopicsChecklist();
    syncBookCoverTitle();
  }

  function renderBookTopicsChecklist() {
    const selectUnit = document.getElementById('selectBookUnit');
    const selectChapter = document.getElementById('selectBookChapter');
    const container = document.getElementById('bookTopicsChecklist');
    if (!container) return;

    const unitId = selectUnit ? selectUnit.value : null;
    const chapId = selectChapter ? selectChapter.value : 'ALL';

    const allUnits = window.CurriculumStore ? window.CurriculumStore.getUnits() : [];
    const unit = allUnits.find(function(u) { return u.id === unitId; });
    const chapters = (unit && unit.chapters) ? unit.chapters : [];

    let topicsToRender = [];
    if (chapId === 'ALL') {
      chapters.forEach(function(c) {
        if (c.topics) {
          c.topics.forEach(function(t) {
            topicsToRender.push({
              id: t.id,
              title: t.title,
              desc: t.desc || '',
              chapterName: c.title
            });
          });
        }
      });
    } else {
      const c = chapters.find(function(item) { return item.id === chapId; });
      if (c && c.topics) {
        c.topics.forEach(function(t) {
          topicsToRender.push({
            id: t.id,
            title: t.title,
            desc: t.desc || '',
            chapterName: c.title
          });
        });
      }
    }

    if (!topicsToRender.length) {
      container.innerHTML = '<div style="color: #94a3b8; font-size: 0.85rem; padding: 0.5rem; text-align: center;">ไม่มีรายการคาบเรียนในหัวข้อนี้</div>';
      updateBookSelectedCount();
      return;
    }

    let html = '';
    let lastChap = '';
    topicsToRender.forEach(function(t, idx) {
      if (chapId === 'ALL' && t.chapterName !== lastChap) {
        lastChap = t.chapterName;
        html += `<div style="font-size: 0.75rem; font-weight: 700; color: #38bdf8; padding: 4px 6px; background: rgba(56, 189, 248, 0.1); border-radius: 4px; margin-top: ${idx > 0 ? '6px' : '0'};">📂 ${lastChap}</div>`;
      }
      html += `
        <label style="display: flex; align-items: center; gap: 0.65rem; padding: 0.45rem 0.65rem; background: rgba(255, 255, 255, 0.04); border-radius: 6px; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.07); transition: all 0.15s ease;">
          <input type="checkbox" class="book-topic-cb" value="${t.id}" checked onchange="updateBookSelectedCount()" style="width: 1.05rem; height: 1.05rem; accent-color: var(--neon-cyan); cursor: pointer;">
          <div style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
            <span style="color: #ffffff; font-size: 0.85rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.title}</span>
            <span style="color: #94a3b8; font-size: 0.75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.desc}</span>
          </div>
        </label>
      `;
    });

    container.innerHTML = html;
    updateBookSelectedCount();
  }

  function selectAllBookTopics(selectAll) {
    const checkboxes = document.querySelectorAll('.book-topic-cb');
    checkboxes.forEach(function(cb) {
      cb.checked = !!selectAll;
    });
    updateBookSelectedCount();
  }

  function updateBookSelectedCount() {
    const checked = document.querySelectorAll('.book-topic-cb:checked');
    const badge = document.getElementById('bookSelectedCount');
    if (badge) {
      badge.textContent = checked.length;
    }
  }

  function syncBookCoverTitle() {
    const selectUnit = document.getElementById('selectBookUnit');
    const selectChapter = document.getElementById('selectBookChapter');
    const inputTitle = document.getElementById('inputBookCoverTitle');
    if (!inputTitle) return;

    const unitId = selectUnit ? selectUnit.value : null;
    const chapId = selectChapter ? selectChapter.value : 'ALL';
    const allUnits = window.CurriculumStore ? window.CurriculumStore.getUnits() : [];
    const unit = allUnits.find(function(u) { return u.id === unitId; });

    if (chapId === 'ALL') {
      if (unit) inputTitle.value = unit.title;
    } else {
      const chapters = (unit && unit.chapters) ? unit.chapters : [];
      const c = chapters.find(function(item) { return item.id === chapId; });
      if (c) inputTitle.value = c.chapterTitle || c.title;
    }
  }

  function closeBookExportModal() {
    const modal = document.getElementById('bookExportModal');
    if (modal) modal.classList.remove('open');
  }

  function updateBookEditionNotice() {
    const sel = document.getElementById('selectBookEdition');
    const notice = document.getElementById('bookEditionNotice');
    if (!sel || !notice) return;

    if (sel.value === 'student') {
      notice.textContent = 'โหมดแนะนำสำหรับการจำหน่าย: ให้นักเรียนฝึกทำโจทย์อย่างเป็นระเบียบ (ซ่อนเฉลย 100%)';
      notice.style.color = '#38bdf8';
    } else if (sel.value === 'teacher') {
      notice.textContent = 'โหมดคู่มือผู้สอน: แสดงวิธีทำละเอียดทุกขั้นตอนและคำตอบตัวโต ชัดเจน 100%';
      notice.style.color = '#34d399';
    } else {
      notice.textContent = 'โหมดครบเครื่อง: รวมทั้งเล่มโจทย์ในครึ่งแรก + ภาคผนวกเฉลยรวมท้ายเล่ม คุ้มค่าที่สุดสำหรับการพิมพ์จำหน่าย';
      notice.style.color = '#f472b6';
    }
  }

  function executeBookExport() {
    const checkedBoxes = document.querySelectorAll('.book-topic-cb:checked');
    const topicIds = Array.from(checkedBoxes).map(function(cb) { return cb.value; });

    if (!topicIds.length) {
      alert('กรุณาติ๊กเลือกคาบเรียนที่ต้องการรวมเล่มอย่างน้อย 1 คาบ');
      return;
    }

    const selectUnit = document.getElementById('selectBookUnit');
    const selectChapter = document.getElementById('selectBookChapter');
    const unitId = selectUnit ? selectUnit.value : null;
    const chapId = selectChapter ? selectChapter.value : 'ALL';

    const selectEdition = document.getElementById('selectBookEdition');
    const bookType = selectEdition ? selectEdition.value : 'student';

    const checkCover = document.getElementById('checkIncludeCover');
    const includeCover = checkCover ? checkCover.checked : true;

    const inputTitle = document.getElementById('inputBookCoverTitle');
    const coverTitle = (inputTitle && inputTitle.value.trim()) ? inputTitle.value.trim() : '';

    const inputAuthor = document.getElementById('inputBookAuthor');
    const authorName = (inputAuthor && inputAuthor.value.trim()) ? inputAuthor.value.trim() : '';

    const inputSchool = document.getElementById('inputBookSchool');
    const schoolName = (inputSchool && inputSchool.value.trim()) ? inputSchool.value.trim() : '';

    const inputCopyright = document.getElementById('inputBookCopyright');
    const copyrightText = (inputCopyright && inputCopyright.value.trim()) ? inputCopyright.value.trim() : '';

    const checkPages = document.getElementById('checkContinuousPageNums');
    const showPageNumbers = checkPages ? checkPages.checked : true;

    const checkHideHeader = document.getElementById('checkHideStudentHeader');
    const hideStudentHeader = checkHideHeader ? checkHideHeader.checked : true;

    closeBookExportModal();

    if (window.SheetRenderEngine && window.SheetRenderEngine.openBookPrintTab) {
      window.SheetRenderEngine.openBookPrintTab({
        topicIds: topicIds,
        scope: (chapId === 'ALL' ? 'unit' : 'chapter'),
        chapterId: (chapId === 'ALL' ? null : chapId),
        unitId: unitId,
        bookType: bookType,
        includeCover: includeCover,
        coverTitle: coverTitle,
        authorName: authorName,
        schoolName: schoolName,
        copyrightText: copyrightText,
        showPageNumbers: showPageNumbers,
        hideStudentHeader: hideStudentHeader
      });
    } else {
      alert('ไม่พบโมดูล SheetRenderEngine.openBookPrintTab');
    }
  }

  // -------------------------------------------------------------
  // BOOTSTRAP INITIALIZATION
  // -------------------------------------------------------------
  function initApp() {
    if (window.SheetRenderEngine) {
      window.SheetRenderEngine.init();
    }

    renderSidebarTree();
    selectTopic(window.CurriculumStore.getCurrentTopicId());
    loadAllSavedSettings();

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        prepareAndPrint();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchBox = document.getElementById('topicSearchBox');
        if (searchBox) searchBox.focus();
      }
    });
  }

  // Expose global functions to window for DOM onclick events
  window.renderSidebarTree = renderSidebarTree;
  window.toggleUnit = toggleUnit;
  window.toggleChapterTree = toggleChapterTree;
  window.showUpcomingUnitModal = showUpcomingUnitModal;
  window.closeUpcomingModal = closeUpcomingModal;
  window.selectTopic = selectTopic;
  window.switchSheetMode = switchSheetMode;
  window.renderPaperSheet = renderPaperSheet;
  window.toggleAnswerKey = toggleAnswerKey;
  window.openAddExerciseModal = openAddExerciseModal;
  window.openEditExerciseModal = openEditExerciseModal;
  window.closeExerciseModal = closeExerciseModal;
  window.handleModalBackdropClick = handleModalBackdropClick;
  window.handleAnswerTypeChange = handleAnswerTypeChange;
  window.applyTemplatePreset = applyTemplatePreset;
  window.insertLatexSymbol = insertLatexSymbol;
  window.updateModalPreview = updateModalPreview;
  window.saveExerciseFromModal = saveExerciseFromModal;
  window.deleteExercise = deleteExercise;
  window.moveExercise = moveExercise;
  window.resetExercisesToDefault = resetExercisesToDefault;
  window.applyPreset = applyPreset;
  window.adjustCanvasZoom = adjustCanvasZoom;
  window.resetCanvasZoom = resetCanvasZoom;
  window.toggleSidebarDrawer = toggleSidebarDrawer;
  window.toggleCategory = toggleCategory;
  window.handleSearchTopics = handleSearchTopics;
  window.switchMainView = switchMainView;
  window.syncToPaper = syncToPaper;
  window.copyFormula = copyFormula;
  window.saveWorkflow = saveWorkflow;
  window.showSaveSuccessModal = showSaveSuccessModal;
  window.closeSaveSuccessModal = closeSaveSuccessModal;
  window.getGasApiUrl = getGasApiUrl;
  window.setGasApiUrl = setGasApiUrl;
  window.openSystemSettingsModal = openSystemSettingsModal;
  window.closeSystemSettingsModal = closeSystemSettingsModal;
  window.saveSystemSettings = saveSystemSettings;
  window.applyMathScale = applyMathScale;
  window.openChapterSettingsModal = openChapterSettingsModal;
  window.closeChapterSettingsModal = closeChapterSettingsModal;
  window.saveChapterSettings = saveChapterSettings;
  window.loadAllSavedSettings = loadAllSavedSettings;
  window.syncSettingsToGoogleSheet = syncSettingsToGoogleSheet;
  window.fetchSettingsFromGoogleSheet = fetchSettingsFromGoogleSheet;
  window.showSystemToast = showSystemToast;
  window.prepareAndPrint = prepareAndPrint;
  window.executeNativePrint = executeNativePrint;
  window.openCleanPrintTab = openCleanPrintTab;
  window.closeIosPdfGuideModal = closeIosPdfGuideModal;
  window.getWorksheetPrintFileName = getWorksheetPrintFileName;
  window.openBookExportModal = openBookExportModal;
  window.closeBookExportModal = closeBookExportModal;
  window.onBookUnitChange = onBookUnitChange;
  window.onBookChapterChange = onBookChapterChange;
  window.selectAllBookTopics = selectAllBookTopics;
  window.updateBookSelectedCount = updateBookSelectedCount;
  window.updateBookEditionNotice = updateBookEditionNotice;
  window.executeBookExport = executeBookExport;
  window.initApp = initApp;

  // Provide window.CURRICULUM_DATABASE backwards compatibility
  Object.defineProperty(window, 'CURRICULUM_DATABASE', {
    get: function() {
      return window.CurriculumStore ? window.CurriculumStore.getRawDatabase() : {};
    }
  });

  // Ready handler (robust against Apps Script iframe readyState)
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initApp, 10);
  } else {
    document.addEventListener('DOMContentLoaded', initApp);
    window.addEventListener('load', initApp);
  }

})(window);
