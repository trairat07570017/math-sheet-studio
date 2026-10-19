/**
 * Google Apps Script - Web App Entry Point & REST API for GitHub Pages
 * ระบบสร้างเอกสารการสอนคณิตศาสตร์ ม.ปลาย (อิงตามหลักสูตร สสวท.)
 */

function doGet(e) {
  // If called as an API by GitHub Pages (e.g. ?action=get_settings)
  if (e && e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    if (action === 'get_settings') {
      return createJsonResponse(getSettingsFromDatabaseSheet());
    }
  }

  // Otherwise serve HTML Web App
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('MathSheet AI Studio — เอกสารการสอนคณิตศาสตร์ ม.ปลาย (สสวท.)')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var action = data.action || '';

    if (action === 'save_settings') {
      var result = saveSettingsToDatabaseSheet(data.systemSettings, data.chapterSettings);
      return createJsonResponse(result);
    } else if (action === 'get_settings') {
      return createJsonResponse(getSettingsFromDatabaseSheet());
    } else if (action === 'save_worksheet') {
      var docResult = saveWorksheetData(data.payload);
      return createJsonResponse(docResult);
    } else {
      return createJsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * ฐานข้อมูลหลักสูตรคณิตศาสตร์ ม.ปลาย ตามมาตรฐาน สสวท.
 */
function getCurriculumTopics() {
  return [
    {
      unit: 'ฟังก์ชันเอกซ์โพเนนเชียลและฟังก์ชันลอการิทึม (Exponential & Logarithmic Functions)',
      grade: 'มัธยมศึกษาปีที่ 4',
      gradeShort: 'ม.4',
      semester: 'ภาคเรียนที่ 2',
      subjectCode: 'คณิตศาสตร์เพิ่มเติม 2 (ค31202)',
      totalPeriods: 24,
      chapters: [
        {
          chapter: 1,
          title: 'บทที่ 1: เลขยกกำลังและกรณฑ์ในระบบจำนวนจริง (คาบที่ 1 - 4)',
          periods: [
            { id: 'expo-l01', period: 1, title: 'คาบที่ 1: เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนเต็ม', desc: '5 สมบัติหลัก นิยาม a^0=1 และ a^-n=1/a^n' },
            { id: 'expo-l02', period: 2, title: 'คาบที่ 2: รากที่ n ในระบบจำนวนจริงและจำนวนจริงในรูปกรณฑ์', desc: 'ค่าหลักของรากที่ n และเงื่อนไขค่าสัมบูรณ์ |a| เมื่อ n เป็นเลขคู่' },
            { id: 'expo-l03', period: 3, title: 'คาบที่ 3: การดำเนินการของกรณฑ์และสังยุค (Conjugate)', desc: 'การบวก ลบ คูณ หารกรณฑ์ และการจัดรูปตัวส่วนไม่ให้ติดกรณฑ์' },
            { id: 'expo-l04', period: 4, title: 'คาบที่ 4: เลขยกกำลังที่มีเลขชี้กำลังเป็นจำนวนตรรกยะ', desc: 'ความสัมพันธ์ a^(m/n) = (root_n(a))^m และการจัดรูปเลขชี้กำลังเศษส่วน' }
          ]
        },
        {
          chapter: 2,
          title: 'บทที่ 2: ฟังก์ชันเอกซ์โพเนนเชียลและกราฟ (คาบที่ 5 - 8)',
          periods: [
            { id: 'expo-l05', period: 5, title: 'คาบที่ 5: นิยามฟังก์ชันเอกซ์โพเนนเชียลและข้อตกลงเรื่องฐาน', desc: 'รูปแบบ y = a^x เงื่อนไข a > 0, a != 1 โดเมน R และเรนจ์ (0, inf)' },
            { id: 'expo-l06', period: 6, title: 'คาบที่ 6: กราฟของฟังก์ชันเอกซ์โพเนนเชียล (เพิ่ม vs ลด)', desc: 'ฟังก์ชันเพิ่มเมื่อ a > 1 ฟังก์ชันลดเมื่อ 0 < a < 1 จุดตัด (0,1)' },
            { id: 'expo-l07', period: 7, title: 'คาบที่ 7: การเลื่อนขนานกราฟและฟังก์ชันเอกซ์โพประยุกต์', desc: 'การจัดรูป y = a^(x-h) + k เส้นกำกับแนวนอน y = k และการหาเรนจ์' },
            { id: 'expo-l08', period: 8, title: 'คาบที่ 8: การเปรียบเทียบค่าของเลขยกกำลัง', desc: 'การเปรียบเทียบค่าเลขยกกำลังเมื่อฐานมากกว่า 1 หรือฐานอยู่ระหว่าง 0 กับ 1' }
          ]
        },
        {
          chapter: 3,
          title: 'บทที่ 3: สมการและอสมการเอกซ์โพเนนเชียล (คาบที่ 9 - 12)',
          periods: [
            { id: 'expo-l09', period: 9, title: 'คาบที่ 9: สมการเอกซ์โพเนนเชียล รูปแบบฐานเท่ากัน', desc: 'การใช้สมบัติ 1-1: a^u = a^v <=> u = v' },
            { id: 'expo-l10', period: 10, title: 'คาบที่ 10: สมการเอกซ์โพเนนเชียล รูปแบบเปลี่ยนตัวแปรพหุนาม', desc: 'จัดรูป A(a^x)^2 + B(a^x) + C = 0 กำหนด u = a^x > 0' },
            { id: 'expo-l11', period: 11, title: 'คาบที่ 11: สมการเอกซ์โพเนนเชียล ฐานไม่เท่ากันและเลขชี้กำลังสมมาตร', desc: 'สมการ a^u = b^u (u = 0) และสมการรูป a^x + a^-x = k' },
            { id: 'expo-l12', period: 12, title: 'คาบที่ 12: อสมการเอกซ์โพเนนเชียล', desc: 'การแก้อสมการและข้อควรระวังกลับเครื่องหมายเมื่อฐาน 0 < a < 1' }
          ]
        },
        {
          chapter: 4,
          title: 'บทที่ 4: ฟังก์ชันลอการิทึมและสมบัติพื้นฐาน (คาบที่ 13 - 16)',
          periods: [
            { id: 'expo-l13', period: 13, title: 'คาบที่ 13: ฟังก์ชันลอการิทึมในฐานะอินเวอร์สของเอกซ์โพ', desc: 'นิยาม y = log_a x <=> x = a^y เงื่อนไข x > 0, a > 0, a != 1' },
            { id: 'expo-l14', period: 14, title: 'คาบที่ 14: กราฟของฟังก์ชันลอการิทึม', desc: 'จุดตัดแกน (1,0) เส้นกำกับ x = 0 ฟังก์ชันเพิ่ม vs ลด' },
            { id: 'expo-l15', period: 15, title: 'คาบที่ 15: สมบัติพื้นฐานของลอการิทึม 5 ข้อแรก', desc: 'log_a 1, log_a a, log ผลคูณ ผลหาร และเลขชี้กำลัง' },
            { id: 'expo-l16', period: 16, title: 'คาบที่ 16: สมบัติการเปลี่ยนฐานและการยกกำลังที่ฐาน', desc: 'การเปลี่ยนฐาน log_b a = log_c a / log_c b และ log_(b^q) a^p' }
          ]
        },
        {
          chapter: 5,
          title: 'บทที่ 5: ลอการิทึมขั้นสูงและสมการลอการิทึม (คาบที่ 17 - 20)',
          periods: [
            { id: 'expo-l17', period: 17, title: 'คาบที่ 17: ลอการิทึมสามัญ ลอการิทึมธรรมชาติ แมนทิสซาและแคแรกเทอริสติก', desc: 'log x (ฐาน 10), ln x (ฐาน e) และรูป N = M x 10^c' },
            { id: 'expo-l18', period: 18, title: 'คาบที่ 18: การเปิดตารางและการประมาณค่าลอการิทึม', desc: 'การหา Antilogarithm และการประมาณค่า log' },
            { id: 'expo-l19', period: 19, title: 'คาบที่ 19: สมการลอการิทึม รูปแบบฐานเท่ากันและการยุบ log', desc: 'log_a u = log_a v และการตรวจคำตอบโดเมน u, v > 0 เสมอ' },
            { id: 'expo-l20', period: 20, title: 'คาบที่ 20: สมการลอการิทึม รูปแบบเปลี่ยนตัวแปรและการ take log ทั้งสองข้าง', desc: 'สมการพหุนามของ log และสมการที่เลขชี้กำลังติดตัวแปร x^(log x)' }
          ]
        },
        {
          chapter: 6,
          title: 'บทที่ 6: อสมการลอการิทึมและการประยุกต์โจทย์จริง (คาบที่ 21 - 24)',
          periods: [
            { id: 'expo-l21', period: 21, title: 'คาบที่ 21: อสมการลอการิทึม', desc: 'ข้อควรระวังเงื่อนไขหลัง log และการกลับเครื่องหมายเมื่อ 0 < a < 1' },
            { id: 'expo-l22', period: 22, title: 'คาบที่ 22: การประยุกต์: การสลายตัวของสารกัมมันตรังสีและครึ่งชีวิต', desc: 'สูตร N(t) = N0(1/2)^(t/T) และ N(t) = N0 e^(-lambda t)' },
            { id: 'expo-l23', period: 23, title: 'คาบที่ 23: การประยุกต์: การเติบโตของประชากรและดอกเบี้ยทบต้น', desc: 'สูตร P(t) = P0 e^(kt) และ A = P(1+r/n)^(nt)' },
            { id: 'expo-l24', period: 24, title: 'คาบที่ 24: การประยุกต์: ระดับความเป็นกรด-ด่าง (pH) และระดับเสียง (Decibel)', desc: 'สูตร pH = -log[H+] และ beta = 10 log(I/I0) ตะลุยโจทย์ A-Level' }
          ]
        }
      ]
    }
  ];
}

/**
 * บันทึกข้อมูลชีทการสอนลง Google Drive & สร้าง Google Docs อัตโนมัติ
 * @param {Object} data ข้อมูลชีทจากหน้าเว็บ
 * @return {Object} ผลลัพธ์พร้อม URL ของเอกสารและโฟลเดอร์
 */
function saveWorksheetData(data) {
  try {
    if (!data) {
      throw new Error('ไม่พบข้อมูลเอกสารการสอนที่ส่งมา');
    }

    // 1. จัดเตรียมชื่อเอกสารและโฟลเดอร์
    var school = data.school || 'โรงเรียนมัธยมวิทยาคม (สสวท.)';
    var subject = data.subject || 'คณิตศาสตร์ ม.ปลาย';
    var sheetName = data.sheet || 'ใบงานการเรียนรู้';
    var topicTitle = data.topicTitle || 'บทเรียนคณิตศาสตร์';
    var gradeShort = data.gradeShort || (data.grade ? data.grade.replace('มัธยมศึกษาปีที่ ', 'ม.') : 'ม.ปลาย');
    var timestampStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd_HHmm');
    var docTitle = '[' + gradeShort + '] ' + sheetName + ' - ' + topicTitle + ' (' + timestampStr + ')';

    // 2. ค้นหาหรือสร้างโฟลเดอร์ใน Google Drive
    var rootFolderName = 'เอกสารการสอนคณิตศาสตร์ สสวท. (MathSheet AI)';
    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), rootFolderName);
    var targetFolder = getOrCreateFolder(rootFolder, gradeShort);

    // 3. สร้าง Google Docs ด้วย DocumentApp
    var doc = DocumentApp.create(docTitle);
    var docFile = DriveApp.getFileById(doc.getId());
    targetFolder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile); // นำออกจาก root เพื่อไม่ให้รก

    // 4. ตั้งค่าหน้ากระดาษเป็นขนาด A4 และระยะขอบมาตรฐานงานพิมพ์
    var body = doc.getBody();
    body.setPageWidth(595.276); // A4 Width in pt
    body.setPageHeight(841.89); // A4 Height in pt
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(40);
    body.setMarginRight(40);

    // กำหนด Font เริ่มต้น
    var baseFont = 'Sarabun';

    // 5. ส่วนหัวเอกสาร (Header & School Info)
    var schoolPara = body.appendParagraph(school);
    schoolPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    schoolPara.setFontFamily(baseFont);
    schoolPara.setFontSize(15);
    schoolPara.setBold(true);
    schoolPara.setForegroundColor('#0f172a');
    schoolPara.setSpacingAfter(2);

    var subjectPara = body.appendParagraph(subject + ' • ' + sheetName);
    subjectPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subjectPara.setFontFamily(baseFont);
    subjectPara.setFontSize(12);
    subjectPara.setBold(true);
    subjectPara.setForegroundColor('#1d4ed8');
    subjectPara.setSpacingAfter(2);

    if (data.teacher) {
      var teacherPara = body.appendParagraph('ครูผู้สอน: ' + data.teacher);
      teacherPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      teacherPara.setFontFamily(baseFont);
      teacherPara.setFontSize(9.5);
      teacherPara.setForegroundColor('#475569');
      teacherPara.setSpacingAfter(2);
    }

    var stdPara = body.appendParagraph(data.standard || 'สาระการเรียนรู้คณิตศาสตร์ มาตรฐาน สสวท.');
    stdPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    stdPara.setFontFamily(baseFont);
    stdPara.setFontSize(9);
    stdPara.setItalic(true);
    stdPara.setForegroundColor('#64748b');
    stdPara.setSpacingAfter(10);

    // 6. กล่องข้อมูลนักเรียน (ตาราง 1 แถว 3 คอลัมน์)
    var studentTable = body.appendTable([
      ['ชื่อ-นามสกุล: ............................................................................', 'ชั้น ม........./........', 'เลขที่: ..............']
    ]);
    studentTable.setBorderColor('#cbd5e1');
    studentTable.setBorderWidth(1);
    for (var r = 0; r < studentTable.getNumRows(); r++) {
      var row = studentTable.getRow(r);
      for (var c = 0; c < row.getNumCells(); c++) {
        var cell = row.getCell(c);
        cell.setFontFamily(baseFont);
        cell.setFontSize(9.5);
        cell.setForegroundColor('#334155');
        cell.setPaddingTop(4);
        cell.setPaddingBottom(4);
      }
    }

    body.appendParagraph('').setSpacingAfter(8);

    // 7. ตอนที่ 1: สรุปสาระสำคัญและสูตร (Part 1)
    var part1Header = body.appendParagraph(data.part1Label || '📘 ตอนที่ 1: สรุปสาระสำคัญและนิยามหลักสูตร สสวท.');
    part1Header.setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    part1Header.setFontFamily(baseFont);
    part1Header.setFontSize(11);
    part1Header.setBold(true);
    part1Header.setForegroundColor('#0f172a');
    part1Header.setSpacingBefore(8);
    part1Header.setSpacingAfter(4);

    var cleanConceptLines = stripHtmlToCleanLines(data.part1Html);
    if (cleanConceptLines.length > 0) {
      for (var i = 0; i < cleanConceptLines.length; i++) {
        var line = cleanConceptLines[i];
        var p = body.appendParagraph(line);
        p.setFontFamily(baseFont);
        p.setFontSize(10);
        p.setForegroundColor('#1e293b');
        p.setSpacingAfter(3);
        if (line.indexOf('[สูตรสำคัญ]') !== -1 || line.indexOf('$$') !== -1) {
          p.setBold(true);
          p.setForegroundColor('#1e3a8a');
          p.setIndentStart(15);
        }
      }
    }

    body.appendParagraph('').setSpacingAfter(8);

    // 8. ตอนที่ 2: ข้อสอบและแบบฝึกหัด (Part 2)
    var part2Header = body.appendParagraph(data.part2Label || '✏️ ตอนที่ 2: ข้อสอบและแบบฝึกหัดทบทวน');
    part2Header.setHeading(DocumentApp.ParagraphHeading.HEADING_2);
    part2Header.setFontFamily(baseFont);
    part2Header.setFontSize(11);
    part2Header.setBold(true);
    part2Header.setForegroundColor('#0f172a');
    part2Header.setSpacingBefore(10);
    part2Header.setSpacingAfter(6);

    var exercises = data.exercises || [];
    for (var j = 0; j < exercises.length; j++) {
      var ex = exercises[j];

      // หัวข้อโจทย์ (ไม่ใส่คะแนนตามคำสั่งครู)
      var exTitle = body.appendParagraph(ex.title);
      exTitle.setFontFamily(baseFont);
      exTitle.setFontSize(10.5);
      exTitle.setBold(true);
      exTitle.setForegroundColor('#0f172a');
      exTitle.setSpacingBefore(6);
      exTitle.setSpacingAfter(2);

      // สูตร LaTeX (ถ้ามี)
      if (ex.latex) {
        var latexPara = body.appendParagraph('$$ ' + ex.latex + ' $$');
        latexPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        latexPara.setFontFamily(baseFont);
        latexPara.setFontSize(11);
        latexPara.setItalic(true);
        latexPara.setForegroundColor('#1e3a8a');
        latexPara.setSpacingAfter(4);
      }

      // รูปแบบพื้นที่คำตอบ
      if (ex.answerType === 'multiple-choice') {
        var choiceTable = body.appendTable([
          ['ก. ' + (ex.choiceA || '................................'), 'ข. ' + (ex.choiceB || '................................')],
          ['ค. ' + (ex.choiceC || '................................'), 'ง. ' + (ex.choiceD || '................................')]
        ]);
        choiceTable.setBorderColor('#e2e8f0');
        choiceTable.setBorderWidth(0.5);
        for (var tr = 0; tr < choiceTable.getNumRows(); tr++) {
          var tRow = choiceTable.getRow(tr);
          for (var tc = 0; tc < tRow.getNumCells(); tc++) {
            var tCell = tRow.getCell(tc);
            tCell.setFontFamily(baseFont);
            tCell.setFontSize(9.5);
            tCell.setForegroundColor('#334155');
            tCell.setPaddingTop(3);
            tCell.setPaddingBottom(3);
          }
        }
      } else if (ex.answerType === 'short-answer') {
        var ansPara = body.appendParagraph('ตอบ: ......................................................................................................................................................');
        ansPara.setFontFamily(baseFont);
        ansPara.setFontSize(10);
        ansPara.setForegroundColor('#334155');
        ansPara.setSpacingAfter(8);
      } else {
        // handwriting box (พื้นที่ว่างสำหรับแสดงวิธีทำ ไม่มีข้อความลายน้ำ)
        var height = (ex.answerType === 'handwriting-large') ? 170 : 130;
        var boxTable = body.appendTable([
          ['']
        ]);
        boxTable.setBorderColor('#cbd5e1');
        boxTable.setBorderWidth(1);
        var boxCell = boxTable.getRow(0).getCell(0);
        boxCell.setFontFamily(baseFont);
        boxCell.setFontSize(8.5);
        boxCell.setForegroundColor('#94a3b8');
        boxCell.setPaddingTop(6);
        boxCell.setPaddingBottom(height);
      }

      body.appendParagraph('').setSpacingAfter(4);
    }

    // 9. ส่วนท้ายหน้ากระดาษ (Footer)
    var footer = doc.addFooter();
    var footerPara = footer.appendParagraph('หัวข้อ: ' + topicTitle + ' • มาตรฐานหลักสูตร สสวท. • สร้างด้วย MathSheet AI Studio');
    footerPara.setFontFamily(baseFont);
    footerPara.setFontSize(8);
    footerPara.setForegroundColor('#94a3b8');
    footerPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);

    // บันทึกการแก้ไข Doc
    doc.saveAndClose();

    // 10. บันทึกประวัติลง Google Sheets (Index Log)
    var logSheetUrl = '';
    try {
      logSheetUrl = appendToWorksheetIndexLog(rootFolder, {
        timestamp: timestampStr,
        grade: gradeShort,
        subject: subject,
        topic: topicTitle,
        sheetType: data.modeLabel || data.mode,
        docTitle: docTitle,
        exerciseCount: exercises.length,
        teacher: data.teacher || '',
        docUrl: doc.getUrl()
      });
    } catch (sheetErr) {
      console.warn('Logging to index sheet skipped:', sheetErr);
    }

    return {
      success: true,
      message: 'สร้างและบันทึกเอกสาร Google Docs ลง Google Drive สำเร็จแล้ว!',
      docId: doc.getId(),
      docUrl: doc.getUrl(),
      folderName: targetFolder.getName(),
      folderUrl: targetFolder.getUrl(),
      fileName: docTitle,
      indexSpreadsheetUrl: logSheetUrl,
      timestamp: new Date().toLocaleString('th-TH')
    };

  } catch (error) {
    console.error('Error in saveWorksheetData:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * ฟังก์ชันช่วยค้นหาหรือสร้างโฟลเดอร์
 */
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * ฟังก์ชันช่วยแปลง HTML เป็นข้อความสะอาดสำหรับ Google Docs
 */
function stripHtmlToCleanLines(html) {
  if (!html) return [];
  var text = html
    .replace(/<div class="equation-stage">([\s\S]*?)<\/div>/gi, '\n[สูตรสำคัญ]: $1\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '$1')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '$1')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '$1')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '$1')
    .replace(/<[^>]+>/g, '');

  return text.split('\n')
    .map(function(line) { return line.trim(); })
    .filter(function(line) { return line.length > 0; });
}

/**
 * ฟังก์ชันช่วยบันทึกข้อมูลสรุปลง Google Sheets Index
 */
function appendToWorksheetIndexLog(rootFolder, logData) {
  var fileName = 'ทะเบียนเอกสารการสอนคณิตศาสตร์ (Index Log)';
  var files = rootFolder.getFilesByName(fileName);
  var ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(fileName);
    var ssFile = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(ssFile);
    DriveApp.getRootFolder().removeFile(ssFile);

    var sheet = ss.getActiveSheet();
    sheet.setName('ประวัติการสร้างชีท');
    sheet.appendRow([
      'วัน-เวลาบันทึก',
      'ระดับชั้น',
      'รหัสวิชา',
      'หัวข้อบทเรียน',
      'ประเภทชีท',
      'ชื่อเอกสาร',
      'จำนวนข้อสอบ',
      'ครูผู้สอน',
      'ลิงก์ Google Docs'
    ]);
    sheet.getRange(1, 1, 1, 9).setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var logSheet = ss.getActiveSheet();
  logSheet.appendRow([
    logData.timestamp,
    logData.grade,
    logData.subject,
    logData.topic,
    logData.sheetType,
    logData.docTitle,
    logData.exerciseCount,
    logData.teacher,
    logData.docUrl
  ]);

  return ss.getUrl();
}

/**
 * ค้นหาหรือสร้าง Google Sheets สำหรับเก็บฐานข้อมูลการตั้งค่า
 */
function getOrCreateDatabaseSpreadsheet() {
  var rootFolderName = 'เอกสารการสอนคณิตศาสตร์ สสวท. (MathSheet AI)';
  var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), rootFolderName);
  var fileName = 'ฐานข้อมูล MathSheet AI Studio (การตั้งค่า & ทะเบียน)';
  var files = rootFolder.getFilesByName(fileName);
  var ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(fileName);
    var ssFile = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(ssFile);
    DriveApp.getRootFolder().removeFile(ssFile);

    // สร้าง Sheet 1: การตั้งค่าระบบ
    var sysSheet = ss.getActiveSheet();
    sysSheet.setName('การตั้งค่าระบบ');
    sysSheet.appendRow(['คีย์ (Key)', 'ค่าที่ตั้งไว้ (Value)', 'คำอธิบาย (Description)', 'บันทึกล่าสุด (Last Updated)']);
    sysSheet.getRange(1, 1, 1, 4).setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
    sysSheet.appendRow(['school', 'โรงเรียนมัธยมวิทยาคม (สสวท.)', 'ชื่อโรงเรียน/สถาบัน', new Date().toLocaleString('th-TH')]);
    sysSheet.appendRow(['teacher', 'กลุ่มสาระการเรียนรู้คณิตศาสตร์', 'ชื่อครูผู้สอน', new Date().toLocaleString('th-TH')]);
    sysSheet.appendRow(['academicYear', 'ภาคเรียนที่ 2 ปีการศึกษา 2567', 'ปีการศึกษา', new Date().toLocaleString('th-TH')]);
    sysSheet.appendRow(['mathScale', '1.15', 'ขนาดตัวสมการ KaTeX (1.0, 1.15, 1.25)', new Date().toLocaleString('th-TH')]);
    sysSheet.setFrozenRows(1);

    // สร้าง Sheet 2: รหัสวิชาประจำบท
    var chapSheet = ss.insertSheet('รหัสวิชาประจำบท');
    chapSheet.appendRow(['รหัสบท (ID)', 'ชื่อบทเรียน (Title)', 'รหัสวิชา (Code)', 'ชื่อรายวิชา (Subject)', 'รหัสวิชารวม (Combined)', 'ระดับชั้น (Grade)', 'ภาคเรียน (Semester)', 'บันทึกล่าสุด']);
    chapSheet.getRange(1, 1, 1, 8).setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
    chapSheet.setFrozenRows(1);
  }

  return ss;
}

/**
 * บันทึกการตั้งค่าลง Google Sheets
 */
function saveSettingsToDatabaseSheet(systemSettings, chapterSettings) {
  try {
    var ss = getOrCreateDatabaseSpreadsheet();
    var nowStr = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');

    // 1. บันทึกการตั้งค่าระบบส่วนกลาง
    if (systemSettings) {
      var sysSheet = ss.getSheetByName('การตั้งค่าระบบ');
      if (!sysSheet) {
        sysSheet = ss.insertSheet('การตั้งค่าระบบ');
        sysSheet.appendRow(['คีย์ (Key)', 'ค่าที่ตั้งไว้ (Value)', 'คำอธิบาย (Description)', 'บันทึกล่าสุด (Last Updated)']);
        sysSheet.getRange(1, 1, 1, 4).setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
        sysSheet.setFrozenRows(1);
      }

      var keys = ['school', 'teacher', 'academicYear', 'mathScale'];
      var descMap = {
        school: 'ชื่อโรงเรียน/สถาบัน',
        teacher: 'ชื่อครูผู้สอน',
        academicYear: 'ปีการศึกษา',
        mathScale: 'ขนาดตัวสมการ KaTeX'
      };

      var data = sysSheet.getDataRange().getValues();
      var keyRowMap = {};
      for (var r = 1; r < data.length; r++) {
        keyRowMap[data[r][0]] = r + 1; // 1-based row index
      }

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (systemSettings[k] !== undefined) {
          if (keyRowMap[k]) {
            sysSheet.getRange(keyRowMap[k], 2, 1, 3).setValues([[systemSettings[k], descMap[k] || '', nowStr]]);
          } else {
            sysSheet.appendRow([k, systemSettings[k], descMap[k] || '', nowStr]);
          }
        }
      }
    }

    // 2. บันทึกการตั้งค่ารายบท (Chapter Cascade Settings)
    if (chapterSettings && Array.isArray(chapterSettings)) {
      var chapSheet = ss.getSheetByName('รหัสวิชาประจำบท');
      if (!chapSheet) {
        chapSheet = ss.insertSheet('รหัสวิชาประจำบท');
        chapSheet.appendRow(['รหัสบท (ID)', 'ชื่อบทเรียน (Title)', 'รหัสวิชา (Code)', 'ชื่อรายวิชา (Subject)', 'รหัสวิชารวม (Combined)', 'ระดับชั้น (Grade)', 'ภาคเรียน (Semester)', 'บันทึกล่าสุด']);
        chapSheet.getRange(1, 1, 1, 8).setBackground('#1e3a8a').setFontColor('#ffffff').setFontWeight('bold');
        chapSheet.setFrozenRows(1);
      }

      var chapData = chapSheet.getDataRange().getValues();
      var chapRowMap = {};
      for (var cr = 1; cr < chapData.length; cr++) {
        chapRowMap[chapData[cr][0]] = cr + 1;
      }

      for (var c = 0; c < chapterSettings.length; c++) {
        var ch = chapterSettings[c];
        if (ch && ch.id) {
          var rowValues = [
            ch.id,
            ch.title || ch.chapterTitle || '',
            ch.code || ch.subjectCode || 'ค31202',
            ch.subject || ch.subjectName || 'คณิตศาสตร์เพิ่มเติม 2',
            ch.combinedSubjectCode || '',
            ch.grade || 'มัธยมศึกษาปีที่ 4',
            ch.semester || 'ภาคเรียนที่ 2',
            nowStr
          ];

          if (chapRowMap[ch.id]) {
            chapSheet.getRange(chapRowMap[ch.id], 1, 1, 8).setValues([rowValues]);
          } else {
            chapSheet.appendRow(rowValues);
          }
        }
      }
    }

    return {
      success: true,
      message: 'บันทึกการตั้งค่าลง Google Sheets สำเร็จแล้ว',
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: ss.getName(),
      timestamp: nowStr
    };
  } catch (err) {
    console.error('saveSettingsToDatabaseSheet error:', err);
    return { success: false, error: err.toString() };
  }
}

/**
 * ดึงข้อมูลการตั้งค่าจาก Google Sheets
 */
function getSettingsFromDatabaseSheet() {
  try {
    var ss = getOrCreateDatabaseSpreadsheet();
    var systemSettings = {};
    var chapterSettings = {};

    // 1. อ่านการตั้งค่าระบบ
    var sysSheet = ss.getSheetByName('การตั้งค่าระบบ');
    if (sysSheet) {
      var sysData = sysSheet.getDataRange().getValues();
      for (var r = 1; r < sysData.length; r++) {
        var key = sysData[r][0];
        var val = sysData[r][1];
        if (key) {
          systemSettings[key] = val;
        }
      }
    }

    // 2. อ่านการตั้งค่ารายบท
    var chapSheet = ss.getSheetByName('รหัสวิชาประจำบท');
    if (chapSheet) {
      var chData = chapSheet.getDataRange().getValues();
      for (var cr = 1; cr < chData.length; cr++) {
        var id = chData[cr][0];
        if (id) {
          chapterSettings[id] = {
            id: id,
            title: chData[cr][1],
            code: chData[cr][2],
            subject: chData[cr][3],
            combinedSubjectCode: chData[cr][4],
            grade: chData[cr][5],
            semester: chData[cr][6]
          };
        }
      }
    }

    return {
      success: true,
      systemSettings: systemSettings,
      chapterSettings: chapterSettings,
      spreadsheetUrl: ss.getUrl()
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
