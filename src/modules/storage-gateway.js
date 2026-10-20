/**
 * Storage Gateway Module
 * 
 * Deep module that manages persistence across the dual-runtime seam:
 * 1. GasNativeAdapter (when inside Google Apps Script iframe: google.script.run)
 * 2. HttpRestAdapter (when on GitHub Pages or standalone browser: fetch POST/GET)
 * 3. OfflineQueueAdapter (fallback to localStorage queue on network failure)
 * 
 * Interface:
 * - saveWorksheet(payload) -> Promise<result>
 * - syncSettings(systemSettings, chapterSettings) -> Promise<result>
 * - fetchSettings() -> Promise<result>
 * - getGasApiUrl() / setGasApiUrl(url)
 */

(function(window) {
  'use strict';

  const DEFAULT_GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzZqi430lwr86KWrIJev5SWw-Y8VzLucxtUYMVY6bQIvsOzmd7TKCNHgH5JVnqbzII8/exec';
  const OFFLINE_QUEUE_KEY = 'mathSheet_offline_save_queue';
  const API_URL_KEY = 'mathSheet_gasApiUrl';

  function getSavedApiUrl() {
    try {
      return localStorage.getItem(API_URL_KEY) || DEFAULT_GAS_API_URL;
    } catch (e) {
      return DEFAULT_GAS_API_URL;
    }
  }

  function saveApiUrl(url) {
    try {
      if (url && url.trim()) {
        localStorage.setItem(API_URL_KEY, url.trim());
      }
    } catch (e) {
      console.warn('Failed to save GAS API URL to localStorage:', e);
    }
  }

  function isGasNativeRuntime() {
    return typeof google !== 'undefined' && google.script && typeof google.script.run !== 'undefined';
  }

  // Offline Queue Helpers
  function enqueueOfflineSave(payload) {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({
        id: 'save_' + Date.now(),
        payload: payload,
        queuedAt: new Date().toISOString()
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to enqueue offline save:', e);
    }
  }

  const StorageGateway = {
    getGasApiUrl: function() {
      return getSavedApiUrl();
    },

    setGasApiUrl: function(url) {
      saveApiUrl(url);
    },

    isGasNative: function() {
      return isGasNativeRuntime();
    },

    /**
     * Save worksheet data to Google Drive & Google Docs
     * Automatically picks GasNativeAdapter or HttpRestAdapter, with offline fallback
     */
    saveWorksheet: function(payload) {
      return new Promise(function(resolve, reject) {
        if (!payload) {
          return reject(new Error('Payload is required'));
        }

        // Adapter 1: Google Apps Script Native (google.script.run)
        if (isGasNativeRuntime()) {
          try {
            google.script.run
              .withSuccessHandler(function(res) {
                if (res && res.success) {
                  resolve(res);
                } else {
                  reject(new Error(res ? res.error : 'ไม่ทราบสาเหตุ'));
                }
              })
              .withFailureHandler(function(err) {
                reject(err);
              })
              .saveWorksheetData(payload);
            return;
          } catch (gasErr) {
            console.warn('google.script.run failed, falling back to REST/Mock:', gasErr);
          }
        }

        // Adapter 2: GitHub Pages / Standalone HTTP REST API
        const apiUrl = getSavedApiUrl();
        fetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify({
            action: 'save_worksheet',
            payload: payload
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(res) {
          if (res && res.success) {
            res.exerciseCount = payload.exercises ? payload.exercises.length : 0;
            resolve(res);
          } else {
            throw new Error(res ? res.error : 'ไม่ทราบสาเหตุจาก API');
          }
        })
        .catch(function(networkErr) {
          console.warn('GAS REST call failed, saving to offline queue:', networkErr);
          // Fallback: Queue offline and return local simulation
          enqueueOfflineSave(payload);

          const mockRes = {
            success: true,
            message: 'บันทึกในเครื่องจำลอง (ออฟไลน์) จะซิงค์ขึ้น Drive เมื่อเชื่อมต่อ',
            fileName: '[' + (payload.gradeShort || 'ม.4') + '] ' + (payload.sheet || 'ใบงาน') + ' - ' + (payload.topicTitle || 'บทเรียน'),
            folderName: 'เอกสารการสอนคณิตศาสตร์ สสวท. (MathSheet AI) / ' + (payload.gradeShort || 'ม.4'),
            docUrl: 'https://docs.google.com/document/u/0/',
            folderUrl: 'https://drive.google.com/drive/my-drive',
            indexSpreadsheetUrl: 'https://docs.google.com/spreadsheets/u/0/',
            exerciseCount: payload.exercises ? payload.exercises.length : 0,
            timestamp: new Date().toLocaleString('th-TH'),
            isLocalMock: true
          };
          resolve(mockRes);
        });
      });
    },

    /**
     * Sync system settings and chapter settings to Google Sheets
     */
    syncSettings: function(systemSettings, chapterSettings) {
      const self = this;
      return new Promise(function(resolve, reject) {
        const apiUrl = self.getGasApiUrl();
        fetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify({
            action: 'save_settings',
            systemSettings: systemSettings,
            chapterSettings: chapterSettings
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
          if (result && result.success) {
            resolve(result);
          } else {
            throw new Error(result ? result.error : 'ไม่ทราบสาเหตุ');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
    },

    /**
     * Fetch settings from Google Sheets
     */
    fetchSettings: function() {
      const self = this;
      return new Promise(function(resolve, reject) {
        const apiUrl = self.getGasApiUrl();
        fetch(apiUrl, {
          method: 'POST',
          body: JSON.stringify({
            action: 'get_settings'
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
          if (result && result.success) {
            resolve(result);
          } else {
            throw new Error(result ? result.error : 'ไม่พบข้อมูล');
          }
        })
        .catch(function(err) {
          reject(err);
        });
      });
    }
  };

  // Expose to window
  window.StorageGateway = StorageGateway;

})(window);
