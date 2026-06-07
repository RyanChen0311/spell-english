/**
 * script.js — English Vocabulary Learning App
 *
 * Features
 * --------
 * - Add English words with Chinese translations
 * - Auto-generates letter-by-letter spelling display (e.g. "c • a • t")
 * - Text-to-speech via Web Speech API:
 *     1. Pronounce the full word (en-US)
 *     2. Spell each letter aloud with pauses
 *     3. Read the Chinese translation (zh-TW)
 * - Persist vocabulary to localStorage
 * - Save / load / delete named word-list records
 * - Keyboard shortcut: Enter in either input field adds the word
 *
 * Storage keys
 * ------------
 * - "vocabulary"         → current word list (Array)
 * - "vocabulary_records" → saved named records (Object)
 */

'use strict';

class VocabularyManager {

  // ── Constructor ────────────────────────────────────────────────────────

  constructor() {
    this.words   = JSON.parse(localStorage.getItem('vocabulary'))         || [];
    this.records = JSON.parse(localStorage.getItem('vocabulary_records')) || {};

    this._initElements();
    this._bindEvents();
    this._renderWords();
    this._updateRecordList();
  }

  // ── DOM initialisation ─────────────────────────────────────────────────

  _initElements() {
    this.englishInput       = document.getElementById('englishWord');
    this.chineseInput       = document.getElementById('chineseTranslation');
    this.addButton          = document.getElementById('addWord');
    this.wordContainer      = document.getElementById('wordContainer');
    this.wordTemplate       = document.getElementById('word-template');

    this.wordListTitle      = document.getElementById('wordListTitle');

    this.recordNameInput    = document.getElementById('recordName');
    this.saveRecordButton   = document.getElementById('saveRecord');
    this.recordList         = document.getElementById('recordList');
    this.loadRecordButton   = document.getElementById('loadRecord');
    this.deleteRecordButton = document.getElementById('deleteRecord');
  }

  // ── Event binding ──────────────────────────────────────────────────────

  _bindEvents() {
    this.addButton.addEventListener('click', () => this.addWord());
    this.englishInput.addEventListener('keypress',  e => { if (e.key === 'Enter') this.addWord(); });
    this.chineseInput.addEventListener('keypress',  e => { if (e.key === 'Enter') this.addWord(); });

    this.saveRecordButton.addEventListener('click',   () => this._saveRecord());
    this.loadRecordButton.addEventListener('click',   () => this._loadRecord());
    this.deleteRecordButton.addEventListener('click', () => this._deleteRecord());
  }

  // ── Word management ────────────────────────────────────────────────────

  /**
   * Read input fields, validate, fetch an example sentence, and append a new word entry.
   */
  async addWord() {
    const english = this.englishInput.value.trim();
    const chinese = this.chineseInput.value.trim();

    if (!english || !chinese) {
      alert('請輸入英文單字和中文意思');
      return;
    }

    this.addButton.disabled    = true;
    this.addButton.textContent = '建立中';

    const example   = await this._fetchExample(english);
    const exampleZh = example ? await this._translateText(example) : null;

    this.words.push({
      id:      Date.now(),
      english,
      chinese,
      spelling: english.split('').join(' • '),
      example,
      exampleZh,
    });

    this._saveWords();
    this._renderWords();
    this._clearInputs();

    this.addButton.disabled    = false;
    this.addButton.textContent = '新增';
  }

  /**
   * Fetch the first available example sentence for a word from the Free Dictionary API.
   * Returns null if not found or on network error.
   * @param {string} word
   * @returns {Promise<string|null>}
   */
  async _fetchExample(word) {
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) return null;
      const data = await res.json();
      for (const entry of data) {
        for (const meaning of entry.meanings) {
          for (const def of meaning.definitions) {
            if (def.example) return def.example;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Translate English text to Traditional Chinese via MyMemory API.
   * @param {string} text
   * @returns {Promise<string|null>}
   */
  async _translateText(text) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-TW`;
      const res  = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.responseStatus === 200) return data.responseData.translatedText;
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Remove a word entry by its ID.
   * @param {number} id
   */
  deleteWord(id) {
    this.words = this.words.filter(w => w.id !== id);
    this._saveWords();
    this._renderWords();
  }

  // ── Text-to-speech ─────────────────────────────────────────────────────

  /**
   * Speak a word using the Web Speech API:
   *   1. Full pronunciation (en-US)
   *   2. Letter-by-letter spelling with 300 ms gaps
   *   3. Chinese translation (zh-TW)
   *
   * @param {string} word     English word to pronounce and spell
   * @param {string} chinese  Chinese translation to read at the end
   */
  async speakWord(word, chinese) {
    speechSynthesis.cancel();

    const speak = (text, lang = 'en-US') =>
      new Promise(resolve => {
        const utt   = new SpeechSynthesisUtterance(text);
        utt.lang    = lang;
        utt.onend   = resolve;
        speechSynthesis.speak(utt);
      });

    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

    await speak(word);
    await pause(800);

    for (const letter of word.split('')) {
      await speak(letter);
      await pause(100);
    }

    await pause(800);
    await speak(chinese, 'zh-TW');
  }

  // ── Rendering ──────────────────────────────────────────────────────────

  _renderWords() {
    this.wordContainer.innerHTML = '';
    this.wordListTitle.style.display = this.words.length ? '' : 'none';

    this.words.forEach(word => {
      const el = this.wordTemplate.content.cloneNode(true);

      el.querySelector('.english-word').textContent        = word.english;
      el.querySelector('.spelling').textContent            = word.spelling;
      el.querySelector('.chinese-translation').textContent = word.chinese;

      const exampleEl   = el.querySelector('.example-sentence');
      const exampleZhEl = el.querySelector('.example-zh');
      if (word.example) {
        exampleEl.textContent   = word.example;
        exampleZhEl.textContent = word.exampleZh || '';
      } else {
        exampleEl.style.display   = 'none';
        exampleZhEl.style.display = 'none';
      }

      el.querySelector('.speak-btn').addEventListener('click',  () => this.speakWord(word.english, word.chinese));
      el.querySelector('.delete-btn').addEventListener('click', () => this.deleteWord(word.id));

      this.wordContainer.appendChild(el);
    });
  }

  // ── Record management ──────────────────────────────────────────────────

  _saveRecord() {
    const name = this.recordNameInput.value.trim();
    if (!name) { alert('請輸入單字表名稱'); return; }

    this.records[name] = [...this.words];
    localStorage.setItem('vocabulary_records', JSON.stringify(this.records));
    this._updateRecordList();
    this.recordNameInput.value = '';
    alert(`「${name}」單字表成功存成`);
  }

  _loadRecord() {
    const name = this.recordList.value;
    if (!name) { alert('請選擇一個單字表'); return; }

    this.words = [...this.records[name]];
    this._saveWords();
    this._renderWords();
  }

  _deleteRecord() {
    const name = this.recordList.value;
    if (!name) { alert('請選擇一個單字表'); return; }

    if (!confirm(`刪除單字表「${name}」?`)) return;

    delete this.records[name];
    localStorage.setItem('vocabulary_records', JSON.stringify(this.records));
    this._updateRecordList();
    alert(`「${name}」單字表成功刪除`);
  }

  _updateRecordList() {
    this.recordList.innerHTML = '<option value="">單字表</option>';
    Object.keys(this.records).forEach(name => {
      const opt   = document.createElement('option');
      opt.value   = name;
      opt.textContent = name;
      this.recordList.appendChild(opt);
    });
  }

  // ── localStorage helpers ───────────────────────────────────────────────

  _saveWords() {
    localStorage.setItem('vocabulary', JSON.stringify(this.words));
  }

  _clearInputs() {
    this.englishInput.value  = '';
    this.chineseInput.value  = '';
    this.englishInput.focus();
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => new VocabularyManager());