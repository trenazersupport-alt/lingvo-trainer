// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
let curLang = localStorage.getItem('lt_cur_lang') || 'ko';
let curTab = localStorage.getItem('lt_cur_tab') || 'words';

let searchQuery = '';
let selectedCat = 'all';

// ДАННЫЕ ИЗ ПАМЯТИ УСТРОЙСТВА
let learnedIds = JSON.parse(localStorage.getItem('lt_learned') || '[]');
let personalIds = JSON.parse(localStorage.getItem('lt_personal') || '[]');
let hardIds = JSON.parse(localStorage.getItem('lt_hard') || '[]');
let hardStreak = JSON.parse(localStorage.getItem('lt_hard_streak') || '{}');

function toggleHard(id) {
  hardIds = hardIds.includes(id) ? hardIds.filter(x => x !== id) : [...hardIds, id];
  localStorage.setItem('lt_hard', JSON.stringify(hardIds));
  render();
}
let customWords = JSON.parse(localStorage.getItem('lt_custom_words') || '{"ko":[],"en":[]}');

// БАЗОВЫЕ СЛОВАРИ (С ПОСЛОВНЫМ ПЕРЕВОДОМ ДЛЯ ПРИМЕРОВ)
const baseWords = {
  ko: [
    {
      id: 'ko_1',
      word: '안녕하세요',
      translit: 'аннёнхасэё',
      meaning: 'Здравствуйте',
      cat: 'Приветствие',
      pos: 'Фраза / Вежливый стиль',
      ex: '안녕하세요, 오늘 날씨가 정말 좋아요.',
      exTr: 'Здравствуйте, сегодня погода действительно хорошая.',
      wordMap: {
        '안녕하세요': 'Здравствуйте',
        '오늘': 'сегодня',
        '날씨가': 'погода (именительный падеж)',
        '정말': 'действительно / правда',
        '좋아요': 'хорошая (вежливый стиль)'
      }
    },
    {
      id: 'ko_2',
      word: '감사합니다',
      translit: 'камсахамнида',
      meaning: 'Спасибо',
      cat: 'Приветствие',
      pos: 'Фраза / Официальный стиль',
      ex: '도와주셔서 정말 감사합니다.',
      exTr: 'Большое спасибо за то, что помогли.',
      wordMap: {
        '도와주셔서': 'за то, что помогли',
        '정말': 'очень / действительно',
        '감사합니다': 'благодарю / спасибо'
      }
    },
    {
      id: 'ko_3',
      word: '공부하다',
      translit: 'конбухада',
      meaning: 'Учиться / Изучать',
      cat: 'Глаголы',
      pos: 'Глагол',
      ex: '저는 매일 한국어를 열심히 공부해요.',
      exTr: 'Я каждый день усердно изучаю корейский язык.',
      wordMap: {
        '저는': 'я (вежливая форма)',
        '매일': 'каждый день',
        '한국어를': 'корейский язык (винительный падеж)',
        '열심히': 'усердно / старательно',
        '공부해요': 'изучаю / учусь'
      }
    },
    {
      id: 'ko_4',
      word: '친구',
      translit: 'чхингу',
      meaning: 'Друг',
      cat: 'Люди',
      pos: 'Существительное',
      ex: '주말에 친구와 같이 영화를 볼 거예요.',
      exTr: 'На выходных я буду смотреть фильм вместе с другом.',
      wordMap: {
        '주말에': 'на выходных',
        '친구와': 'с другом',
        '같이': 'вместе',
        '영화를': 'фильм (винительный падеж)',
        '볼': 'смотреть (будущее время)',
        '거예요': 'собираюсь / буду'
      }
    }
  ],
  en: [
    {
      id: 'en_1',
      word: 'Determine',
      translit: '[dɪˈtɜːmɪn]',
      meaning: 'Определять / Решать',
      cat: 'Глаголы',
      pos: 'Verb (Глагол)',
      ex: 'Your daily habits determine your future success.',
      exTr: 'Твои ежедневные привычки определяют твой будущий успех.',
      wordMap: {
        'Your': 'Твои',
        'daily': 'ежедневные',
        'habits': 'привычки',
        'determine': 'определяют',
        'your': 'твой',
        'future': 'будущий',
        'success': 'успех'
      }
    },
    {
      id: 'en_2',
      word: 'Confidence',
      translit: '[ˈkɒnfɪdəns]',
      meaning: 'Уверенность',
      cat: 'Абстрактное',
      pos: 'Noun (Существительное)',
      ex: 'Speaking every day builds real confidence.',
      exTr: 'Разговорная практика каждый день формирует настоящую уверенность.',
      wordMap: {
        'Speaking': 'Разговорная практика',
        'every': 'каждый',
        'day': 'день',
        'builds': 'строит / формирует',
        'real': 'настоящую',
        'confidence': 'уверенность'
      }
    }
  ]
};

// РАЗДЕЛ ХАНЧА (КОРЕЙСКИЕ КОРНИ СЛОВ)
const hanjaGroups = [
  {
    root: '학 (學)',
    meaning: 'Учёба, наука, знание',
    words: [
      { word: '학생', translit: 'хаксэн', tr: 'Ученик / Студент' },
      { word: '학교', translit: 'хаккё', tr: 'Школа' },
      { word: '학원', translit: 'хагвон', tr: 'Учебная академия / Курсы' },
      { word: '학습', translit: 'хаксып', tr: 'Обучение / Усвоение' }
    ]
  },
  {
    root: '국 (國)',
    meaning: 'Страна, государство',
    words: [
      { word: '한국', translit: 'хангук', tr: 'Южная Корея' },
      { word: '외국', translit: 'вэгук', tr: 'Заграница / Иностранное государство' },
      { word: '외국어', translit: 'вэгуго', tr: 'Иностранный язык' },
      { word: '국제', translit: 'кукчэ', tr: 'Международный' }
    ]
  },
  {
    root: '식 (食)',
    meaning: 'Еда, пища, питание',
    words: [
      { word: '음식', translit: 'ымщик', tr: 'Еда / Блюдо' },
      { word: '식당', translit: 'щиктанг', tr: 'Ресторан / Столовая' },
      { word: '간식', translit: 'канщик', tr: 'Перекус / Снек' },
      { word: '식사', translit: 'щикса', tr: 'Приём пищи / Трапеза' }
    ]
  }
];

// РАЗДЕЛ ГРАММАТИКА
const grammarData = {
  ko: [
    {
      title: 'Окончания вежливого стиля -아요 / -어요',
      level: 'Начальный (TOPIK 1)',
      desc: 'Используется в повседневном вежливом общении. Если последняя гласная корня ㅏ или ㅗ, добавляется -아요. В остальных случаях — -어요.',
      example: '가다 (идти) → 가요 | 먹다 (есть) → 먹어요'
    },
    {
      title: 'Частица направления -에 (в, на, к)',
      level: 'Начальный (TOPIK 1)',
      desc: 'Присоединяется к существительному места и показывает, куда направлено действие.',
      example: '학교에 가요 — Я иду в школу.'
    }
  ],
  en: [
    {
      title: 'Present Simple vs Present Continuous',
      level: 'A1–A2 (Базовый)',
      desc: 'Present Simple описывает регулярные действия и факты (I study every day). Present Continuous — действие прямо сейчас (I am studying now).',
      example: 'She speaks English well. / She is speaking right now.'
    }
  ]
};
// ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА И ВКЛАДОК
function setLang(lang) {
  curLang = lang;
  localStorage.setItem('lt_cur_lang', lang);
  selectedCat = 'all';
  document.body.className = lang === 'ko' ? 'lang-ko' : 'lang-en';
  document.getElementById('btnLangKo').classList.toggle('active', lang === 'ko');
  document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');

  const hanjaBtn = document.querySelector('.nav-btn[data-tab="hanja"]');
  if (hanjaBtn) {
    hanjaBtn.style.display = lang === 'ko' ? 'flex' : 'none';
  }
  if (lang === 'en' && curTab === 'hanja') {
    switchTab('words');
    return;
  }
  render();
}

function switchTab(tab) {
  curTab = tab;
  localStorage.setItem('lt_cur_tab', tab);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  render();
}


// ОЗВУЧКА ТЕКСТА
function speakText(text) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}
// ПОСЛОВНЫЙ ПЕРЕВОД ПРИ НАЖАТИИ НА СЛОВО В ПРЕДЛОЖЕНИИ
function showWordHint(cardId, word, meaning) {
  const bar = document.getElementById('tip_' + cardId);
  if (!bar) return;
  bar.innerHTML = `🔍 <b>${word}</b> — ${meaning}`;
  bar.classList.add('visible');
}

function buildInteractiveSentence(item) {
    if (!item || !item.ex) return '';
  const tokens = item.ex.split(' ');
  return tokens.map(tok => {
    const clean = tok.replace(/[.,!?]/g, '');
    const hint = (item.wordMap && (item.wordMap[clean] || item.wordMap[tok])) || 'Нажмите для разбора в словаре';
    const safeHint = hint.replace(/'/g, "\\'");
    const safeClean = clean.replace(/'/g, "\\'");
    return `<span class="clickable-word" onclick="showWordHint('${item.id}', '${safeClean}', '${safeHint}')">${tok}</span>`;
  }).join(' ');
}

// СТАТУСЫ: ВЫУЧИЛ И ЛИЧНЫЙ СЛОВАРЬ
function toggleLearned(id) {
  learnedIds = learnedIds.includes(id) ? learnedIds.filter(x => x !== id) : [...learnedIds, id];
  localStorage.setItem('lt_learned', JSON.stringify(learnedIds));
  render();
}

function togglePersonal(id) {
  personalIds = personalIds.includes(id) ? personalIds.filter(x => x !== id) : [...personalIds, id];
  localStorage.setItem('lt_personal', JSON.stringify(personalIds));
  render();
}

function getAllWords() {
  return [...baseWords[curLang], ...(customWords[curLang] || [])];
}

// ДОБАВЛЕНИЕ СВОЕГО СЛОВА
function saveNewWord() {
  const word = document.getElementById('newWordOrig').value.trim();
  const translit = document.getElementById('newWordTranslit').value.trim();
  const meaning = document.getElementById('newWordMeaning').value.trim();
  const cat = document.getElementById('newWordCat').value.trim() || 'Мои слова';
  const ex = document.getElementById('newWordEx').value.trim() || word;
  const exTr = document.getElementById('newWordExTr').value.trim() || meaning;

  if (!word || !meaning) {
    alert('Заполните хотя бы само слово и его перевод!');
    return;
  }
  const newItem = {
    id: 'cust_' + Date.now(),
    word, translit, meaning, cat,
    pos: 'Пользовательское слово',
    ex, exTr,
    wordMap: { [word]: meaning }
  };
  customWords[curLang].unshift(newItem);
  personalIds.push(newItem.id);
  localStorage.setItem('lt_custom_words', JSON.stringify(customWords));
  localStorage.setItem('lt_personal', JSON.stringify(personalIds));
  closeModal('addWordModal');
  render();
}

// МОДАЛЬНЫЕ ОКНА И ОТПРАВКА ОШИБОК НА ПОЧТУ
function openModal(id) {
  if (id === 'aboutModal') updateStatsBox();
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function openReportModal(subject) {
  document.getElementById('reportSubject').value = subject;
  openModal('reportModal');
}

function sendReportEmail() {
  const subj = document.getElementById('reportSubject').value;
  const userMail = document.getElementById('reportUserEmail').value.trim();
  const text = document.getElementById('reportText').value.trim();
  if (!text) {
    alert('Опишите, пожалуйста, проблему или вопрос.');
    return;
  }
  const body = `От пользователя: ${userMail || 'Не указана'}\nТема: ${subj}\n\nОписание:\n${text}`;
  window.location.href = `mailto:trenazer.support@://gmail.com{encodeURIComponent('Lingvo Trainer: ' + subj)}&body=${encodeURIComponent(body)}`;
  closeModal('reportModal');
}

function updateStatsBox() {
  const all = getAllWords();
  document.getElementById('appStatsBox').innerHTML = `
    <div>📚 Всего слов в текущем языке: <b>${all.length}</b></div>
    <div>✅ Выучено вами: <b>${learnedIds.length}</b></div>
    <div>⭐ В личном словаре: <b>${personalIds.length}</b></div>
  `;
}

// ОТРИСОВКА КАРТОЧКИ СЛОВА
function renderWordCard(item) {
  const isLearned = learnedIds.includes(item.id);
  const isHard = hardIds.includes(item.id);
  const isPersonal = personalIds.includes(item.id);
  const safeWord = item.word.replace(/'/g, "\\'");
    const safeEx = (item.ex || '').replace(/'/g, "\\'");

  return `
    <div class="word-card ${isLearned ? 'learned' : ''}">
      <div class="card-top">
        <div>
          <div class="word-main">${item.word}</div>
          <div class="word-translit">${item.translit || ''}</div>
        </div>
        <button class="action-chip" onclick="speakText('${safeWord}')" title="Озвучить слово">🔊 Слово</button>
      </div>
      <div class="word-meaning">${item.meaning}</div>
      <div class="tags-row">
        <span class="tag">${item.cat}</span>
        <span class="tag">${item.pos || ''}</span>
      </div>

      <div class="example-box">
        <div class="example-sentence">${buildInteractiveSentence(item)}</div>
        <div class="example-translation">${item.exTr}</div>
        <div class="word-tooltip-bar" id="tip_${item.id}"></div>
      </div>

      <div class="speech-feedback" id="fb_${item.id}"></div>

      <div class="card-actions">
        <button class="action-chip" onclick="speakText('${safeEx}')">🔊 Пример</button>
        <button class="action-chip" onclick="checkSpeech('${safeWord}', 'fb_${item.id}', this)">🎙️ Слово</button>
        <button class="action-chip" onclick="checkSpeech('${safeEx}', 'fb_${item.id}', this)">🎙️ Фраза</button>
        <button class="action-chip ${isLearned ? 'learned-active' : ''}" onclick="toggleLearned('${item.id}')">
          ${isLearned ? '✅ Выучено' : '⬜ Выучить'}
        </button>
        <button class="action-chip" style="${isHard ? 'border-color:#ffb84d; color:#ffb84d;' : ''}" onclick="toggleHard('${item.id}')">
  ${isHard ? '🔁 Повторю позже' : '🕒 Повторить позже'}
</button>
        <button class="action-chip" onclick="togglePersonal('${item.id}')">
          ${isPersonal ? '⭐ В словаре' : '☆ В личный'}
        </button>
        <button class="action-chip" onclick="openReportModal('Ошибка в карточке: ${safeWord}')" title="Сообщить об ошибке">🚩 Ошибка</button>
      </div>
    </div>
  `;
}

// ГЛАВНЫЙ РЕНДЕР РАБОЧЕЙ ОБЛАСТИ
function render() {
  const ws = document.getElementById('workspace');

  if (curTab === 'words' || curTab === 'myDict') {
    let list = getAllWords();
    if (curTab === 'myDict') {
      list = list.filter(w => personalIds.includes(w.id));
    }
    const cats = ['all', ...new Set(list.map(w => w.cat))];
    if (selectedCat !== 'all') list = list.filter(w => w.cat === selectedCat);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));
    }
  const ITEMS_PER_PAGE = 8;
  const pageKey = curTab + '_' + curLang + '_' + selectedCat + '_' + searchQuery;
  if (window._ltLastPageKey !== pageKey) {
    window._ltLastPageKey = pageKey;
    window._ltDictPage = 1;
  }
  const totalPages = Math.max(1, Math.ceil(list.length / ITEMS_PER_PAGE));
  if (!window._ltDictPage || window._ltDictPage > totalPages) window._ltDictPage = 1;
  const startIdx = (window._ltDictPage - 1) * ITEMS_PER_PAGE;
  const pageItems = list.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const catsOptionsHtml = cats.map(function(c) {
    return '<option value="' + c + '" ' + (c === selectedCat ? 'selected' : '') + '>' + (c === 'all' ? 'Все категории' : c) + '</option>';
  }).join('');

  const cardsHtml = pageItems.length
    ? pageItems.map(renderWordCard).join('')
    : '<p style="color:#999;">Список пока пуст. Добавьте слова или переключите категорию.</p>';

  const pagerHtml = list.length > ITEMS_PER_PAGE
    ? '<div class="lt-pager-bar">' +
        '<span class="lt-pager-info">Страница ' + window._ltDictPage + ' из ' + totalPages + '</span>' +
        '<div class="lt-pager-btns">' +
          '<button class="lt-pager-btn" onclick="window._ltDictPage=Math.max(1, window._ltDictPage-1); render();" ' + (window._ltDictPage <= 1 ? 'disabled' : '') + '>Назад</button>' +
          '<button class="lt-pager-btn" onclick="window._ltDictPage=Math.min(' + totalPages + ', window._ltDictPage+1); render();" ' + (window._ltDictPage >= totalPages ? 'disabled' : '') + '>Вперёд</button>' +
        '</div>' +
      '</div>'
    : '';

  ws.innerHTML =
    '<div class="section-header">' +
      '<h2>' + (curTab === 'words' ? 'База слов' : 'Мой личный словарь') + ' (' + list.length + ')</h2>' +
      '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
    '</div>' +
    '<div class="toolbar">' +
      '<input type="search" class="input-dark" placeholder="Поиск слова или перевода..." value="' + searchQuery + '" oninput="searchQuery=this.value; render()" />' +
      '<select class="select-dark" onchange="selectedCat=this.value; render()">' + catsOptionsHtml + '</select>' +
    '</div>' +
    '<div class="cards-grid wide-rows">' + cardsHtml + '</div>' +
    pagerHtml;
 } else if (curTab === 'hanja') {
    ws.innerHTML = `
      <div class="section-header">
        <h2>🧩 Корейские корни слов (Ханча)</h2>
      </div>
      <p style="color:#bbb; margin-bottom:18px;">Учите группы слов с общим иероглифическим корнем — так запоминать новую лексику в 3 раза быстрее.</p>
      ${hanjaGroups.map(g => `
        <div class="hanja-group-card">
          <div><span class="hanja-root-badge">${g.root}</span> <strong>${g.meaning}</strong></div>
          <div class="hanja-words-list">
            ${g.words.map(w => `
              <div class="hanja-item">
                <div>
                  <div style="font-weight:700; font-size:1.1rem;">${w.word}</div>
                  <div style="font-size:0.8rem; color:#ff6b6b;">${w.translit}</div>
                  <div style="font-size:0.88rem; color:#ccc;">${w.tr}</div>
                </div>
                <button class="action-chip" onclick="speakText('${w.word}')">🔊</button>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
} else if (curTab === 'grammar') {
    const items = grammarData[curLang] || [];
    ws.innerHTML = `
      <div class="section-header">
        <h2>📖 Грамматика (${curLang === 'ko' ? 'Корейский' : 'Английский'})</h2>
      </div>
      ${items.map(g => `
        <div class="grammar-card">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <h3 style="color:#fff;">${g.title}</h3>
            <span class="tag">${g.level}</span>
          </div>
          <p style="color:#ccc; line-height:1.6; margin-bottom:10px;">${g.desc}</p>
          <div style="background:#111117; padding:10px; border-radius:8px; color:#ffb84d; font-weight:600;">${g.example}</div>
        </div>
      `).join('')}
    `;
   } else if (curTab === 'voice') {
    const all = getAllWords();
    if (!all.length) {
      ws.innerHTML = '<div class="section-header"><h2>Тренировка произношения</h2></div><p style="color:#ccc;">Словарь пуст.</p>';
      return;
    }
    if (!window._ltVoiceWordId || !all.some(w => w.id === window._ltVoiceWordId)) {
      window._ltVoiceWordId = all[Math.floor(Math.random() * all.length)].id;
    }
    const w = all.find(item => item.id === window._ltVoiceWordId) || all.at(0);
    const isLearned = learnedIds.includes(w.id);
    const isPersonal = personalIds.includes(w.id);
    const isHard = hardIds.includes(w.id);
    const safeWord = String(w.word || '').replace(/'/g, "\\'");
    const exText = w.example || w.ex || '';
    const exTr = w.exampleTr || w.exTr || '';
    const safeEx = String(exText).replace(/'/g, "\\'");

    ws.innerHTML =
      '<div class="section-header">' +
        '<h2>Тренировка произношения</h2>' +
        '<button class="btn-primary" onclick="window._ltVoiceWordId=null; render();">Следующее слово</button>' +
      '</div>' +
      '<div class="game-box" style="max-width:none; text-align:left; background:rgba(14,15,20,0.86); border:1px solid rgba(255,255,255,0.14);">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">' +
          '<div>' +
            '<div style="font-size:1.7rem; font-weight:700; color:#fff;">' + w.word + '</div>' +
            (w.translit ? '<div style="color:#f87171; font-size:0.95rem; margin-top:2px;">' + w.translit + '</div>' : '') +
            '<div style="color:#e4e6eb; font-size:1.1rem; margin-top:8px;">' + w.meaning + '</div>' +
          '</div>' +
          '<button class="btn-secondary" onclick="speakText(\'' + safeWord + '\')">Озвучить слово</button>' +
        '</div>' +
        (exText ? '<div style="margin-top:16px; padding:12px 14px; background:rgba(10,11,15,0.75); border-left:2px solid #dc2626;">' +
          '<div style="color:#fff; font-weight:600;">' + exText + '</div>' +
          (exTr ? '<div style="color:#9ea4b0; font-size:0.88rem; margin-top:4px;">' + exTr + '</div>' : '') +
        '</div>' : '') +
        '<div id="speech_res_' + w.id + '" style="margin-top:14px; min-height:22px; font-weight:600; font-size:0.92rem;"></div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1);">' +
          '<button class="btn-primary" onclick="window.checkSpeech(\'' + safeWord + '\', this, \'' + w.id + '\')">Произнести слово</button>' +
          (exText ? '<button class="btn-secondary" onclick="speakText(\'' + safeEx + '\')">Озвучить фразу</button>' : '') +
          (exText ? '<button class="btn-secondary" onclick="window.checkSpeech(\'' + safeEx + '\', this, \'' + w.id + '\')">Произнести фразу</button>' : '') +
          '<button class="btn-secondary" onclick="toggleLearned(\'' + w.id + '\'); render();">' + (isLearned ? 'Выучено' : 'Отметить выученным') + '</button>' +
          '<button class="btn-secondary" onclick="toggleHard(\'' + w.id + '\'); render();">' + (isHard ? 'Убрать из повтора' : 'Повторить позже') + '</button>' +
          '<button class="btn-secondary" onclick="togglePersonal(\'' + w.id + '\'); render();">' + (isPersonal ? 'В личном словаре' : '+ В личный словарь') + '</button>' +
          '<button class="btn-secondary" style="color:#ff8787;" onclick="openReport(\'' + safeWord + '\')">Ошибка</button>' +
        '</div>' +
      '</div>';
  } else if (curTab === 'game') {
    renderGameScreen(ws);
  } else if (curTab === 'repeatGame') {
    renderRepeatVoiceScreen(ws);
  } else {
    const titles = {
      video: '🎬 Видеоразборы фраз из дорам и интервью',
      chats: '💬 Общий чат, личные комнаты и ИИ-помощник',
      rating: '🏆 Рейтинг лучших учеников'
    };
    ws.innerHTML = `
      <div class="dev-placeholder">
        <h3>${titles[curTab] || 'Раздел в разработке'}</h3>
        <p style="color:#bbb; max-width:500px; margin:0 auto 18px;">
          Этот модуль уже заложен в архитектуру приложения и откроется сразу после подключения облачной базы аккаунтов (Этапы 2–4).
        </p>
        <button class="btn-primary" onclick="switchTab('words')">Вернуться к изучению слов</button>
      </div>
    `;
  }
}

// ЗАПУСК ПРИ ОТКРЫТИИ
render();
// МГНОВЕННАЯ РЕГИСТРАЦИЯ И ПРОФИЛЬ
let localUsers = JSON.parse(localStorage.getItem('lt_local_users') || '{}');
let currentUser = JSON.parse(localStorage.getItem('lt_active_user') || 'null');

function setAuthMsg(text, isError = false) {
  const el = document.getElementById('authMsg');
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#ff6b6b' : '#2ecc71';
}

function updateAccountUI() {
  const guestBox = document.getElementById('authGuestBox');
  const userBox = document.getElementById('authUserBox');
  const topBtn = document.getElementById('topAccountBtn');
  if (currentUser) {
    guestBox.style.display = 'none';
    userBox.style.display = 'block';
    document.getElementById('userEmailLabel').textContent = currentUser.email;
    if (topBtn) topBtn.textContent = '✅ ' + currentUser.email.split('@')[0];
  } else {
    guestBox.style.display = 'block';
    userBox.style.display = 'none';
    if (topBtn) topBtn.textContent = '👤 Аккаунт';
  }
}

function authSignUp() {
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value.trim();
  if (!email || !email.includes('@') || password.length < 6) {
    return setAuthMsg('Введите корректную почту и пароль (от 6 символов)', true);
  }
  if (localUsers[email]) {
    return setAuthMsg('Этот Email уже зарегистрирован. Нажмите «Войти».', true);
  }
  localUsers[email] = {
    email,
    password,
    learnedIds: [...learnedIds],
    personalIds: [...personalIds],
    customWords: JSON.parse(JSON.stringify(customWords))
  };
  localStorage.setItem('lt_local_users', JSON.stringify(localUsers));
  currentUser = { email };
  localStorage.setItem('lt_active_user', JSON.stringify(currentUser));
  updateAccountUI();
  setAuthMsg('');
}

function authSignIn() {
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  const password = document.getElementById('authPassword').value.trim();
  const acc = localUsers[email];
  if (!acc || acc.password !== password) {
    return setAuthMsg('Неверная почта или пароль (или аккаунт ещё не создан)', true);
  }
  learnedIds = acc.learnedIds || [];
  personalIds = acc.personalIds || [];
  customWords = acc.customWords || { ko: [], en: [] };
  localStorage.setItem('lt_learned', JSON.stringify(learnedIds));
  localStorage.setItem('lt_personal', JSON.stringify(personalIds));
  localStorage.setItem('lt_custom_words', JSON.stringify(customWords));
  currentUser = { email };
  localStorage.setItem('lt_active_user', JSON.stringify(currentUser));
  updateAccountUI();
  render();
  setAuthMsg('');
}

function authSignOut() {
  syncToCloud(false);
  currentUser = null;
  localStorage.removeItem('lt_active_user');
  updateAccountUI();
  setAuthMsg('');
}

function syncToCloud(showAlert = false) {
  if (!currentUser || !localUsers[currentUser.email]) return;
  localUsers[currentUser.email].learnedIds = [...learnedIds];
  localUsers[currentUser.email].personalIds = [...personalIds];
  localUsers[currentUser.email].customWords = JSON.parse(JSON.stringify(customWords));
  localStorage.setItem('lt_local_users', JSON.stringify(localUsers));
  if (showAlert) alert('✅ Прогресс и личный словарь успешно сохранены в профиле!');
}

const _oldToggleLearned = toggleLearned;
toggleLearned = function(id) { _oldToggleLearned(id); syncToCloud(false); };

const _oldTogglePersonal = togglePersonal;
togglePersonal = function(id) { _oldTogglePersonal(id); syncToCloud(false); };

const _oldSaveNewWord = saveNewWord;
saveNewWord = function() { _oldSaveNewWord(); syncToCloud(false); };

updateAccountUI();
// РЕЗЕРВНОЕ КОПИРОВАНИЕ СЛОВАРЯ В ФАЙЛ (.JSON)
function exportBackup() {
  const backupData = {
    app: 'LingvoTrainer',
    date: new Date().toISOString(),
    user: currentUser ? currentUser.email : 'guest',
    learnedIds,
    personalIds,
    customWords
  };
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lingvo_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.app !== 'LingvoTrainer') {
        return alert('⚠️ Выбран неверный файл резервной копии.');
      }
      learnedIds = data.learnedIds || [];
      personalIds = data.personalIds || [];
      customWords = data.customWords || { ko: [], en: [] };
      localStorage.setItem('lt_learned', JSON.stringify(learnedIds));
      localStorage.setItem('lt_personal', JSON.stringify(personalIds));
      localStorage.setItem('lt_custom_words', JSON.stringify(customWords));
      syncToCloud(false);
      render();
      alert('✅ Словарь и прогресс успешно восстановлены из файла!');
    } catch (err) {
      alert('⚠️ Ошибка при чтении файла резервной копии.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
// ДВИЖОК ИГРЫ: ВОПРОС — ОТВЕТ НА ВРЕМЯ
let gameState = { active: false, lang: 'ko', score: 0, combo: 0, timeLeft: 60, timerId: null, currentQ: null };
let gameBestScore = parseInt(localStorage.getItem('lt_game_best') || '0', 10);

function renderGameScreen(ws) {
  if (!gameState.active) {
    ws.innerHTML = `
      <div class="section-header"><h2>🎮 Игра: Вопрос — Ответ на время</h2></div>
      <div class="game-box">
        <p style="color:#ccc; line-height:1.6; margin-bottom:16px;">
          У тебя есть <b>60 секунд</b>, чтобы перевести как можно больше слов! За правильные ответы подряд начисляются бонусные очки.
        </p>
        <div style="font-size:1.1rem; color:#ffb84d; margin-bottom:18px;">🏆 Личный рекорд: <b>${gameBestScore}</b> очков</div>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button class="btn-primary" onclick="startQuizGame('ko')">🇰🇷 Играть (Корейский)</button>
          <button class="btn-primary" onclick="startQuizGame('en')">🇬🇧 Играть (Английский)</button>
        </div>
      </div>
    `;
  } else {
    const q = gameState.currentQ;
    ws.innerHTML = `
      <div class="section-header">
        <h2>🎮 Раунд: ${gameState.lang === 'ko' ? 'Корейский' : 'Английский'}</h2>
        <button class="btn-secondary" onclick="stopQuizGame()">⏹ Завершить</button>
      </div>
      <div class="game-box">
        <div class="game-hud">
          <span>⏱ Время: <b id="gameTimerVal" style="color:#ff6b6b;">${gameState.timeLeft}</b>с</span>
          <span>🔥 Серия: <b>${gameState.combo}</b></span>
          <span>⭐ Очки: <b>${gameState.score}</b></span>
        </div>
        <div class="game-question">${q.word}</div>
        <div style="color:#ff6b6b; font-size:0.95rem;">${q.translit || ''}</div>
        <button class="action-chip" style="margin-top:10px;" onclick="speakText('${q.word.replace(/'/g, "\\'")}')">🔊 Прослушать</button>
        <div class="game-options">
          ${q.options.map((opt, idx) => `<button class="game-opt-btn" id="gopt_${idx}" onclick="answerQuiz(${idx})">${opt}</button>`).join('')}
        </div>
      </div>
    `;
  }
}

function startQuizGame(lang) {
  const pool = [...baseWords[lang], ...(customWords[lang] || [])];
  if (pool.length < 2) return alert('Добавьте хотя бы 2 слова в словарь для старта игры!');
  clearInterval(gameState.timerId);
  gameState = { active: true, lang, score: 0, combo: 0, timeLeft: 60, timerId: null, currentQ: null };
  nextQuizQuestion();
  gameState.timerId = setInterval(() => {
    gameState.timeLeft--;
    const el = document.getElementById('gameTimerVal');
    if (el) el.textContent = gameState.timeLeft;
    if (gameState.timeLeft <= 0) stopQuizGame(true);
  }, 1000);
}

function nextQuizQuestion() {
  const pool = [...baseWords[gameState.lang], ...(customWords[gameState.lang] || [])];
  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool.filter(w => w.id !== target.id).map(w => w.meaning).sort(() => 0.5 - Math.random()).slice(0, 3);
  const options = [target.meaning, ...distractors].sort(() => 0.5 - Math.random());
  gameState.currentQ = { ...target, options, correctIdx: options.indexOf(target.meaning) };
  render();
}

function answerQuiz(idx) {
  const btn = document.getElementById('gopt_' + idx);
  if (!btn || btn.disabled) return;
  document.querySelectorAll('.game-opt-btn').forEach(b => b.disabled = true);
  if (idx === gameState.currentQ.correctIdx) {
    btn.classList.add('correct');
    gameState.combo++;
    gameState.score += 10 + (gameState.combo * 2);
  } else {
    btn.classList.add('wrong');
    const rightBtn = document.getElementById('gopt_' + gameState.currentQ.correctIdx);
    if (rightBtn) rightBtn.classList.add('correct');
    gameState.combo = 0;
  }
  setTimeout(() => { if (gameState.active) nextQuizQuestion(); }, 550);
}

function stopQuizGame(isTimeUp = false) {
  clearInterval(gameState.timerId);
  const finalScore = gameState.score;
  gameState.active = false;
  if (finalScore > gameBestScore) {
    gameBestScore = finalScore;
    localStorage.setItem('lt_game_best', String(gameBestScore));
  }
  render();
  if (isTimeUp) alert(`⏱ Время вышло! Твой результат: ${finalScore} очков (Рекорд: ${gameBestScore})`);
}
// ГОЛОСОВОЕ ПОВТОРЕНИЕ НА ВРЕМЯ (ДО 20 СЛОВ, 3 ПОПЫТКИ, СЛОЖНЫЕ СЛОВА)
let repSession = { active: false, queue: [], fails: {}, timeLeft: 25, maxTime: 25, timerId: null, passed: 0, msg: '' };

function renderRepeatVoiceScreen(ws) {
  const all = getAllWords();
  const candidates = all.filter(w => learnedIds.includes(w.id) || hardIds.includes(w.id));

  if (!repSession.active) {
    ws.innerHTML = `
      <div class="section-header"><h2>🔁 Повторение пройденного голосом</h2></div>
      <div class="game-box">
        <p style="color:#ccc; line-height:1.6; margin-bottom:14px;">
          Система берет до <b>20 слов</b> из твоих выученных и отмеченных «Повторить позже». Тебе показывают перевод — нужно успеть произнести слово вслух за отведенное время.
        </p>
        <div style="color:#ffb84d; margin-bottom:16px;">
          Доступно для повторения (${curLang === 'ko' ? 'Корейский' : 'Английский'}): <b>${candidates.length}</b> слов (из них сложных: <b>${all.filter(w => hardIds.includes(w.id)).length}</b>)
        </div>
        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          <button class="btn-primary" onclick="startRepeatSession(20)">▶️ Старт (20 сек / слово)</button>
          <button class="btn-primary" onclick="startRepeatSession(30)">▶️ Старт (30 сек / слово)</button>
        </div>
      </div>
    `;
  } else {
   const cur = repSession.queue[0];
    const failsCount = repSession.fails[cur.id] || 0;
    ws.innerHTML = `
      <div class="section-header">
        <h2>🔁 Осталось слов: ${repSession.queue.length} • Пройдено: ${repSession.passed}</h2>
        <button class="btn-secondary" onclick="stopRepeatSession()">⏹ Завершить</button>
      </div>
      <div class="game-box">
        <div class="game-hud">
          <span>⏱ Время: <b id="repTimerVal" style="color:#ff6b6b;">${repSession.timeLeft}</b>с</span>
          <span>⚠️ Попытка: <b>${failsCount + 1} из 3</b></span>
          <span>${hardIds.includes(cur.id) ? '🔥 Сложное слово' : '✅ Изученное'}</span>
        </div>
        <div style="color:#aaa; font-size:0.9rem;">Произнеси на ${curLang === 'ko' ? 'корейском' : 'английском'}:</div>
        <div class="game-question">${cur.meaning}</div>
        <div style="color:#888; font-size:0.85rem; margin-bottom:16px;">Категория: ${cur.cat}</div>
        <button class="btn-primary" style="font-size:1.1rem; padding:14px 24px;" onclick="speakAnswerForRepeat(this)">
          🎙️ Нажать и произнести
        </button>
        <div id="repFeedback" style="margin-top:14px; font-size:0.95rem; color:#ffb84d;">${repSession.msg}</div>
      </div>
    `;
  }
}
function startRepeatSession(sec) {
  const all = getAllWords();
  let pool = all.filter(w => hardIds.includes(w.id) || learnedIds.includes(w.id));
  if (!pool.length) pool = [...all];
  const queue = pool.sort(() => 0.5 - Math.random()).slice(0, 20);
  clearInterval(repSession.timerId);
  repSession = { active: true, queue, fails: {}, timeLeft: sec, maxTime: sec, timerId: null, passed: 0, msg: '' };
  startRepeatWordTimer();
  render();
}

function startRepeatWordTimer() {
  clearInterval(repSession.timerId);
  repSession.timeLeft = repSession.maxTime;
  repSession.timerId = setInterval(() => {
    repSession.timeLeft--;
    const el = document.getElementById('repTimerVal');
    if (el) el.textContent = repSession.timeLeft;
    if (repSession.timeLeft <= 0) handleRepeatMiss('⏱ Время вышло!');
  }, 1000);
}

function handleRepeatMiss(reason) {
  const cur = repSession.queue.shift();
  const count = (repSession.fails[cur.id] || 0) + 1;
  repSession.fails[cur.id] = count;

  if (count >= 3) {
    if (!hardIds.includes(cur.id)) hardIds.push(cur.id);
    hardStreak[cur.id] = 0;
    localStorage.setItem('lt_hard', JSON.stringify(hardIds));
    localStorage.setItem('lt_hard_streak', JSON.stringify(hardStreak));
    repSession.msg = `❗ 3 ошибки на слове «${cur.word}» (${cur.translit}). Оно добавлено в «Сложные» для следующих повторений!`;
  } else {
    repSession.queue.push(cur);
    repSession.msg = `${reason} Слово «${cur.word}» перенесено в конец очереди (попытка ${count}/3).`;
  }
  if (!repSession.queue.length) return stopRepeatSession(true);
  startRepeatWordTimer();
  render();
}

function speakAnswerForRepeat(btnEl) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return alert('Распознавание речи не поддерживается в этом браузере. Используйте Chrome.');
  const cur = repSession.queue[0];
  const rec = new SpeechRec();
  rec.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  btnEl.textContent = '🎙️ Слушаю...';
  rec.onresult = (e) => {
    const said = e.results[0][0].transcript.toLowerCase().replace(/[.,!?]/g, '').trim();
    const target = cur.word.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (said === target || (target.includes(said) && said.length > 1)) {
      repSession.queue.shift();
      repSession.passed++;
      if (hardIds.includes(cur.id)) {
        hardStreak[cur.id] = (hardStreak[cur.id] || 0) + 1;
        if (hardStreak[cur.id] >= 2) {
          hardIds = hardIds.filter(x => x !== cur.id);
          delete hardStreak[cur.id];
        }
        localStorage.setItem('lt_hard', JSON.stringify(hardIds));
        localStorage.setItem('lt_hard_streak', JSON.stringify(hardStreak));
      }
      repSession.msg = `✅ Верно! «${cur.word}» засчитано.`;
      if (!repSession.queue.length) return stopRepeatSession(true);
      startRepeatWordTimer();
      render();
    } else {
      handleRepeatMiss(`❌ Услышано «${said}».`);
    }
  };
  rec.onerror = () => { btnEl.textContent = '🎙️ Нажать и произнести'; };
  rec.start();
}

function stopRepeatSession(finished = false) {
  clearInterval(repSession.timerId);
  const done = repSession.passed;
  repSession.active = false;
  render();
  if (finished) alert(`🎉 Тренировка завершена! Уверенно произнесено слов: ${done}.`);
}
// НОВЫЙ ДИЗАЙН БАЗЫ СЛОВ: 7 РАЗДЕЛОВ + СПИСОК + МЕНЮ ТРИ ТОЧКИ (⋮)
let selectedGroup = '';
let selectedSubCat = 'all';
let openDotsId = null;
function toggleDotsMenu(id, e) {
  e.stopPropagation();
  openDotsId = (openDotsId === id) ? null : id;
  render();
}

document.addEventListener('click', () => {
  if (openDotsId) { openDotsId = null; render(); }
});

function renderWordRowCompact(item) {
  const isLearned = learnedIds.includes(item.id);
  const isPersonal = personalIds.includes(item.id);
  const isHard = hardIds.includes(item.id);
  const isOpen = openDotsId === item.id;
  const safeWord = item.word.replace(/'/g, "\\'");

  return `
    <div class="word-row ${isLearned ? 'is-learned' : ''}">
      <div class="word-row-info">
        <div class="word-row-top">
          <span class="word-row-orig">${item.word}</span>
          <span class="word-row-tr">${item.translit || ''}</span>
          ${isLearned ? '<span style="color:#2ecc71; font-size:0.8rem;">✅</span>' : ''}
          ${isHard ? '<span style="color:#ffb84d; font-size:0.8rem;">🔁</span>' : ''}
        </div>
        <div class="word-row-mean">${item.meaning}</div>
        <div style="font-size:0.78rem; color:#777; margin-top:2px;">${item.cat || ''}</div>
        <div id="speech_res_${item.id}" style="font-size:0.85rem; margin-top:4px; font-weight:600;"></div>
      </div>
      <div class="word-row-actions">
        <button class="icon-circle-btn" title="Проверить произношение" onclick="checkSpeech('${safeWord}', this, '${item.id}')">🎙️</button>
        <button class="icon-circle-btn" title="Прослушать" onclick="speakText('${safeWord}')">🔊</button>
        <div class="dots-wrapper">
          <button class="icon-circle-btn" title="Действия" onclick="toggleDotsMenu('${item.id}', event)">⋮</button>
          <div class="dots-menu ${isOpen ? 'open' : ''}" onclick="event.stopPropagation()">
            <button class="dots-item" onclick="togglePersonal('${item.id}'); openDotsId=null;">
              ${isPersonal ? '★ Убрать из словаря' : '☆ В свой словарь'}
            </button>
            <button class="dots-item" onclick="toggleHard('${item.id}'); openDotsId=null;">
              ${isHard ? '🔁 Убрать из повтора' : '🕒 Выучить позже'}
            </button>
            <button class="dots-item" onclick="toggleLearned('${item.id}'); openDotsId=null;">
              ${isLearned ? '✅ Снять «Выучено»' : '⬜ Выучено'}
            </button>
            <button class="dots-item" style="color:#ff7b7b;" onclick="openReport('${safeWord}'); openDotsId=null;">
              ⚠️ Сообщить об ошибке
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
// УНИВЕРСАЛЬНАЯ ПРОВЕРКА ПРОИЗНОШЕНИЯ ДЛЯ ВСЕХ РАЗДЕЛОВ
function checkSpeech(targetWord, rawBtn, itemId) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btnEl = (rawBtn && typeof rawBtn === 'object') ? rawBtn : null;
  const legacyId = (typeof rawBtn === 'string') ? rawBtn : itemId;
  const resBox = document.getElementById('speech_res_' + legacyId) || document.getElementById('speech_' + legacyId) || document.getElementById('voiceResult');

  const showMsg = (text, color) => {
    if (resBox) {
      resBox.textContent = text;
      resBox.style.color = color;
    }
  };

  if (!targetWord) {
    return showMsg('⚠️ Для этой карточки не задан текст для произношения.', '#ffb84d');
  }
  if (!SpeechRec) {
    return showMsg('⚠️ Распознавание речи не поддерживается. Откройте сайт в Chrome.', '#ff6b6b');
  }

  const rec = new SpeechRec();
  rec.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  const oldText = btnEl ? btnEl.textContent : '';
  if (btnEl) {
    btnEl.textContent = '🔴';
    btnEl.style.borderColor = '#ff4747';
  }
  showMsg('🎙️ Слушаю... Произнесите вслух', '#aaa');

  rec.onresult = function(event) {
    const said = event.results.item(0).item(0).transcript.trim();

    const cleanSaid = said.toLowerCase().replace(/[.,!?]/g, '');
    const cleanTarget = targetWord.toLowerCase().replace(/[.,!?]/g, '');

    if (cleanSaid === cleanTarget || (cleanTarget.includes(cleanSaid) && cleanSaid.length > 1)) {
     showMsg('✅ Верно! Распознано: «' + said + '»', '#2ecc71');
    } else {
    showMsg('❌ Услышано: «' + said + '» (Эталон: ' + targetWord + ')', '#ffb84d');
    }
  };

  rec.onerror = function(event) {
  if (event.error === 'aborted') return;
  if (event.error === 'not-allowed') {
      showMsg('🚫 Разрешите доступ к микрофону в настройках браузера.', '#ff6b6b');
    } else if (event.error === 'no-speech') {
      showMsg('🔇 Речь не услышана. Нажмите на микрофон и скажите громче.', '#ffb84d');
    } else {
      showMsg('⚠️ Ошибка микрофона: ' + event.error, '#ff6b6b');
    }
  };

  rec.onend = function() {
    if (btnEl) {
      btnEl.textContent = oldText;
      btnEl.style.borderColor = '';
    }
  };

  try {
    rec.start();
  } catch (e) {
    if (btnEl) btnEl.textContent = oldText;
  }
}
// ДИЗАЙН ЛИЧНОГО СЛОВАРЯ (ТОЛЬКО РАЗДЕЛЫ С ДОБАВЛЕННЫМИ СЛОВАМИ + МОИ СЛОВА)
let mySelectedGroup = '';
let mySelectedSubCat = 'all';

const _origRenderForMyDict = render;
render = function() {
  if (curTab !== 'myDict') return _origRenderForMyDict();
  const ws = document.getElementById('workspace');
  const myWords = getAllWords().filter(w => personalIds.includes(w.id) || String(w.id).startsWith('custom_'));

  if (!myWords.length) {
       ws.innerHTML =
      '<div class="section-header">' +
        '<h2>Личный словарь (0)</h2>' +
        '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
      '</div>' +
      '<div class="game-box" style="margin-top:20px;">' +
        '<p style="color:#ccc; line-height:1.6;">' +
          'В вашем личном словаре пока пусто.<br>' +
          'Добавьте слова через меню <b>⋮ → В свой словарь</b> в <b>Базе слов</b> или создайте свою карточку кнопкой <b>+ Добавить слово</b> — и здесь автоматически появятся нужные разделы!' +
        '</p>' +
      '</div>';
    return;
  }

  const activeGroups = [];
  WORD_GROUPS_LIST.forEach(g => {
    const count = myWords.filter(w => w.group === g.id).length;
    if (count > 0) activeGroups.push({ ...g, count });
  });

  const customOnly = myWords.filter(w => !w.group || !WORD_GROUPS_LIST.some(g => g.id === w.group));
  if (customOnly.length > 0) {
    activeGroups.push({
      id: 'custom_group',
      title: 'Мои созданные слова',
      icon: '✨',
      desc: 'Карточки, добавленные вами вручную',
      count: customOnly.length
    });
  }

   if (!mySelectedGroup && !searchQuery.trim()) {
    const tilesHtml = activeGroups.map(function(g) {
      return '<div class="cat-tile" onclick="mySelectedGroup=\'' + g.id + '\'; mySelectedSubCat=\'all\'; render()">' +
        '<div style="font-size:1.9rem; margin-bottom:8px;">' + g.icon + '</div>' +
        '<div class="cat-tile-title">' + g.title + '</div>' +
        '<div class="cat-tile-sub">' + g.desc + '</div>' +
        '<div style="margin-top:12px; font-size:0.82rem; color:#ff6b6b; font-weight:600;">Слов в разделе: ' + g.count + '</div>' +
      '</div>';
    }).join('');

    ws.innerHTML =
      '<div class="section-header">' +
        '<h2>Личный словарь (' + myWords.length + ')</h2>' +
        '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
      '</div>' +
      '<div class="toolbar">' +
        '<input type="text" style="display:none" aria-hidden="true" />' +
        '<input type="password" style="display:none" aria-hidden="true" />' +
        '<input type="search" readonly onfocus="this.removeAttribute(\'readonly\')" name="search_my_dict_no_autofill" autocomplete="off" class="input-dark" placeholder="Быстрый поиск по моим словам..." value="' + searchQuery + '" oninput="searchQuery=this.value; render()" />' +
      '</div>' +
      '<div class="cat-grid">' + tilesHtml + '</div>';
    return;
  }
  let list = myWords;
  let headerTitle = 'Результаты поиска';
  if (mySelectedGroup === 'custom_group') {
    list = customOnly;
    headerTitle = 'Мои добавленные слова';
  } else if (mySelectedGroup) {
    list = myWords.filter(function(w) { return w.group === mySelectedGroup; });
    const grpObj = WORD_GROUPS_LIST.find(function(g) { return g.id === mySelectedGroup; });
    headerTitle = grpObj ? grpObj.title : 'Раздел';
  }

  const subCats = ['all'].concat(Array.from(new Set(list.map(function(w) { return w.cat; }).filter(Boolean))));
  if (mySelectedSubCat !== 'all') list = list.filter(function(w) { return w.cat === mySelectedSubCat; });
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(function(w) {
      return w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q));
    });
  }

  const PER_PAGE = 9;
  const myKey = curLang + '_' + mySelectedGroup + '_' + mySelectedSubCat + '_' + searchQuery;
  if (window._ltMyDictKey !== myKey) {
    window._ltMyDictKey = myKey;
    window._ltMyDictPage = 1;
  }
  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  if (!window._ltMyDictPage || window._ltMyDictPage > totalPages) window._ltMyDictPage = 1;
  const start = (window._ltMyDictPage - 1) * PER_PAGE;
  const pageList = list.slice(start, start + PER_PAGE);

  const subCatsHtml = subCats.map(function(c) {
    return '<option value="' + c + '" ' + (mySelectedSubCat === c ? 'selected' : '') + '>' + (c === 'all' ? 'Все подкатегории' : c) + '</option>';
  }).join('');

  const rowsHtml = pageList.length
    ? pageList.map(renderWordRowCompact).join('')
    : '<p style="color:#888;">В этой категории пока нет слов.</p>';

  const pagerHtml = list.length > PER_PAGE
    ? '<div class="lt-pager-bar">' +
        '<span class="lt-pager-info">Страница ' + window._ltMyDictPage + ' из ' + totalPages + '</span>' +
        '<div class="lt-pager-btns">' +
          '<button class="lt-pager-btn" onclick="window._ltMyDictPage=Math.max(1, window._ltMyDictPage-1); render();" ' + (window._ltMyDictPage <= 1 ? 'disabled' : '') + '>Назад</button>' +
          '<button class="lt-pager-btn" onclick="window._ltMyDictPage=Math.min(' + totalPages + ', window._ltMyDictPage+1); render();" ' + (window._ltMyDictPage >= totalPages ? 'disabled' : '') + '>Вперёд</button>' +
        '</div>' +
      '</div>'
    : '';

  ws.innerHTML =
    '<div class="section-header">' +
      '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
        '<button class="btn-secondary" onclick="mySelectedGroup=\'\'; searchQuery=\'\'; render()">← К разделам</button>' +
        '<h2>' + headerTitle + ' (' + list.length + ')</h2>' +
      '</div>' +
      '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
    '</div>' +
    '<div class="toolbar">' +
      '<input type="search" readonly onfocus="this.removeAttribute(\'readonly\')" name="search_my_sub_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск в разделе..." value="' + searchQuery + '" oninput="searchQuery=this.value; render()" />' +
      '<select class="select-dark" onchange="mySelectedSubCat=this.value; render()">' + subCatsHtml + '</select>' +
    '</div>' +
    '<div class="word-list">' + rowsHtml + '</div>' +
    pagerHtml;
};
// НОВЫЙ ДИЗАЙН ХАНЧА: ПЛИТКИ КОРНЕЙ + СПИСОК СЛОВ + МЕНЮ ТРИ ТОЧКИ (⋮)
let selectedHanjaRoot = '';

const _origGetAllWordsForHanja = getAllWords;
getAllWords = function() {
  const base = _origGetAllWordsForHanja();
  if (curLang === 'ko' && typeof hanjaFullList !== 'undefined') {
    const hWords = hanjaFullList.flatMap(h => h.words.map(w => ({ ...w, group: '🏯 Ханча (Иероглифика)' })));
    return [...base, ...hWords];
  }
  return base;
};

if (typeof WORD_GROUPS_LIST !== 'undefined' && !WORD_GROUPS_LIST.some(g => g.id === '🏯 Ханча (Иероглифика)')) {
  WORD_GROUPS_LIST.push({ id: '🏯 Ханча (Иероглифика)', icon: '🏯', desc: 'Слова с китайскими корнями' });
}
let selGramMod = null;
let selGramLesson = null;
let gramQuizAns = {};
let completedLessons = JSON.parse(localStorage.getItem('lt_done_lessons') || '[]');

function speakGramText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

function checkGramVoice(target) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const st = document.getElementById('gramVoiceStatus');
  if (!SR) {
    if (st) st.innerHTML = '<span style="color:#ff6b6b;">Распознавание речи не поддерживается вашим браузером.</span>';
    return;
  }
  const rec = new SR();
  rec.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  if (st) st.innerHTML = '<span style="color:#ffb84d;">Говорите фразу в микрофон...</span>';
  rec.onresult = function(e) {
    const said = e.results[0][0].transcript;
    const cleanSaid = said.toLowerCase().replace(/[.,!?]/g, '').trim();
    const cleanTgt = target.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (cleanSaid.includes(cleanTgt) || cleanTgt.includes(cleanSaid)) {
      if (st) st.innerHTML = '<span style="color:#2ecc71;">Отлично! Распознано: «' + said + '»</span>';
    } else {
      if (st) st.innerHTML = '<span style="color:#ffb84d;">Услышано: «' + said + '». Попробуйте ещё раз.</span>';
    }
  };
  rec.start();
}

function checkGramQuiz(lessonId, totalQ) {
  let ok = 0;
  for (let i = 0; i < totalQ; i++) {
    const sel = document.querySelector('input[name="gq_' + i + '"]:checked');
    if (sel && parseInt(sel.value, 10) === parseInt(sel.getAttribute('data-ans'), 10)) ok++;
  }
  const resBox = document.getElementById('gramQuizResult');
  if (ok === totalQ) {
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      localStorage.setItem('lt_done_lessons', JSON.stringify(completedLessons));
    }
    if (resBox) resBox.innerHTML = '<span style="color:#2ecc71; font-weight:600;">Тест пройден (' + ok + ' из ' + totalQ + '). Урок засчитан!</span>';
  } else {
    if (resBox) resBox.innerHTML = '<span style="color:#ff6b6b;">Верных ответов: ' + ok + ' из ' + totalQ + '. Проверьте теорию и повторите.</span>';
  }
}

const _origRenderForGrammar = render;
render = function() {
  if (curTab !== 'grammar') return _origRenderForGrammar();
  const ws = document.getElementById('workspace');
  const mods = (typeof grammarCourse !== 'undefined' && grammarCourse[curLang]) ? grammarCourse[curLang] : [];

  if (!selGramMod) {
    const PER_PAGE = 8;
    const gKey = 'gm_' + curLang;
    if (window._ltGramModKey !== gKey) { window._ltGramModKey = gKey; window._ltGramModPage = 1; }
    const totalPages = Math.max(1, Math.ceil(mods.length / PER_PAGE));
    if (!window._ltGramModPage || window._ltGramModPage > totalPages) window._ltGramModPage = 1;
    const pageMods = mods.slice((window._ltGramModPage - 1) * PER_PAGE, window._ltGramModPage * PER_PAGE);

    const rowsHtml = pageMods.map(function(m) {
      const doneCnt = (m.lessons || []).filter(function(l) { return completedLessons.includes(l.id); }).length;
      return '<div class="word-row" style="cursor:pointer;" onclick="selGramMod=\'' + m.id + '\'; selGramLesson=null; render()">' +
        '<div>' +
          '<div class="word-row-orig">' + m.title + '</div>' +
          '<div class="word-row-mean">' + m.desc + '</div>' +
        '</div>' +
        '<div style="color:#ff8787; font-size:0.82rem; font-weight:600;">Пройдено: ' + doneCnt + ' / ' + (m.lessons ? m.lessons.length : 0) + '</div>' +
      '</div>';
    }).join('');

    const pagerHtml = mods.length > PER_PAGE
      ? '<div class="lt-pager-bar"><span class="lt-pager-info">Страница ' + window._ltGramModPage + ' из ' + totalPages + '</span><div class="lt-pager-btns">' +
        '<button class="lt-pager-btn" onclick="window._ltGramModPage=Math.max(1,window._ltGramModPage-1); render();" ' + (window._ltGramModPage <= 1 ? 'disabled' : '') + '>Назад</button>' +
        '<button class="lt-pager-btn" onclick="window._ltGramModPage=Math.min(' + totalPages + ',window._ltGramModPage+1); render();" ' + (window._ltGramModPage >= totalPages ? 'disabled' : '') + '>Вперёд</button>' +
        '</div></div>'
      : '';

    ws.innerHTML =
      '<div class="section-header"><h2>Грамматика — Модули (' + mods.length + ')</h2></div>' +
      '<div class="word-list">' + (rowsHtml || '<p style="color:#999;">Модули загружаются...</p>') + '</div>' +
      pagerHtml;
    return;
  }
  const modObj = mods.find(function(m) { return m.id === selGramMod; });
  if (!modObj) { selGramMod = null; return render(); }
  const lessons = modObj.lessons || [];

  if (!selGramLesson) {
    const rowsHtml = lessons.map(function(l) {
      const isDone = completedLessons.includes(l.id);
      return '<div class="word-row" style="cursor:pointer;" onclick="selGramLesson=\'' + l.id + '\'; render()">' +
        '<div>' +
          '<div class="word-row-orig">' + l.title + '</div>' +
          '<div class="word-row-mean">' + (l.theory ? l.theory.slice(0, 95) + '...' : '') + '</div>' +
        '</div>' +
        '<div style="color:' + (isDone ? '#2ecc71' : '#9ea4b0') + '; font-size:0.82rem; font-weight:600;">' + (isDone ? 'Пройден' : 'Открыть урок') + '</div>' +
      '</div>';
    }).join('');

    ws.innerHTML =
      '<div class="section-header">' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<button class="btn-secondary" onclick="selGramMod=null; render()">← К модулям</button>' +
          '<h2>' + modObj.title + '</h2>' +
        '</div>' +
      '</div>' +
      '<div class="word-list">' + rowsHtml + '</div>';
    return;
  }

  const lesson = lessons.find(function(l) { return l.id === selGramLesson; });
  if (!lesson) { selGramLesson = null; return render(); }

  const itemsHtml = (lesson.items || []).map(function(it) {
    const safeChar = it.char.replace(/'/g, "\\'");
    return '<div class="word-row" style="cursor:pointer;" onclick="speakGramText(\'' + safeChar + '\')">' +
      '<div><span class="word-row-orig">' + it.char + '</span> <span style="color:#f87171; font-size:0.82rem;">' + (it.tr || '') + '</span>' +
      '<div class="word-row-mean">' + (it.note || '') + '</div></div>' +
      '<button class="lt-pill-btn" onclick="event.stopPropagation(); speakGramText(\'' + safeChar + '\')">Озвучить</button>' +
    '</div>';
  }).join('');

  const quizHtml = (lesson.quiz || []).map(function(qItem, qi) {
    const opts = qItem.opts.map(function(opt, oi) {
      return '<label style="display:block; margin:4px 0; cursor:pointer; color:#ddd;">' +
        '<input type="radio" name="gq_' + qi + '" value="' + oi + '" data-ans="' + qItem.ans + '" /> ' + opt +
      '</label>';
    }).join('');
    return '<div style="margin-bottom:12px; padding:10px; background:rgba(12,13,17,0.75); border:1px solid rgba(255,255,255,0.1);">' +
      '<div style="font-weight:600; color:#fff; margin-bottom:6px;">' + (qi + 1) + '. ' + qItem.q + '</div>' + opts +
    '</div>';
  }).join('');

  const safeTarget = (lesson.voiceTarget || '').replace(/'/g, "\\'");
  ws.innerHTML =
    '<div class="section-header">' +
      '<div style="display:flex; align-items:center; gap:12px;">' +
        '<button class="btn-secondary" onclick="selGramLesson=null; render()">← К урокам</button>' +
        '<h2>' + lesson.title + '</h2>' +
      '</div>' +
    '</div>' +
    '<div class="game-box" style="max-width:none; text-align:left; margin-bottom:12px; background:rgba(14,15,20,0.82);">' +
      '<div style="color:#ff8787; font-weight:600; margin-bottom:6px;">Теория</div>' +
      '<p style="color:#e4e6eb; line-height:1.55;">' + (lesson.theory || '') + '</p>' +
    '</div>' +
    '<div class="word-list" style="margin-bottom:14px;">' + itemsHtml + '</div>' +
    (lesson.voiceTarget ? '<div class="game-box" style="max-width:none; text-align:left; margin-bottom:14px; background:rgba(14,15,20,0.82);">' +
      '<div style="color:#ff8787; font-weight:600; margin-bottom:6px;">Практика произношения</div>' +
      '<div style="color:#fff; margin-bottom:8px;">Скажите фразу: <b>' + lesson.voiceHint + '</b></div>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
        '<button class="btn-secondary" onclick="speakGramText(\'' + safeTarget + '\')">Прослушать эталон</button>' +
        '<button class="btn-primary" onclick="checkGramVoice(\'' + safeTarget + '\')">Проверить голосом</button>' +
      '</div>' +
      '<div id="gramVoiceStatus" style="margin-top:8px; font-size:0.85rem;"></div>' +
    '</div>' : '') +
    (quizHtml ? '<div class="game-box" style="max-width:none; text-align:left; background:rgba(14,15,20,0.82);">' +
      '<div style="color:#ff8787; font-weight:600; margin-bottom:8px;">Мини-тест</div>' +
      quizHtml +
      '<button class="btn-primary" onclick="checkGramQuiz(\'' + lesson.id + '\', ' + lesson.quiz.length + ')">Проверить ответы</button>' +
      '<div id="gramQuizResult" style="margin-top:8px;"></div>' +
    '</div>' : '');
};
const _origRenderForVideoRating = render;
render = function() {
  if (curTab === 'video') {
    const ws = document.getElementById('workspace');
    ws.innerHTML = '<div class="section-header"><h2>Видеоразборы</h2></div><div class="game-box" style="margin-top:20px;"><p style="color:#ccc;">Раздел в разработке. Скоро здесь появятся разборы диалогов и грамматики.</p></div>';
    return;
  }
  if (curTab === 'rating') {
    const ws = document.getElementById('workspace');
    ws.innerHTML = '<div class="section-header"><h2>Рейтинг учеников</h2></div><div class="game-box" style="margin-top:20px;"><p style="color:#ccc;">Таблица лидеров станет доступна после подключения облачной синхронизации.</p></div>';
    return;
  }
  return _origRenderForVideoRating();
};
function openReport(wordText) {
  const subjEl = document.getElementById('reportSubject');
  const textEl = document.getElementById('reportText');
  if (subjEl) {
      subjEl.value = wordText ? 'Ошибка в карточке: ' + wordText : 'Вопрос в службу поддержки';
  }
  if (textEl) textEl.value = '';
  if (typeof openModal === 'function') openModal('reportModal');
}
function sendReportEmail() {
  const subj = document.getElementById('reportSubject').value;
  const email = document.getElementById('reportUserEmail').value.trim();
  const msg = document.getElementById('reportText').value.trim();

  if (!msg) {
    alert('Ошибка: пожалуйста, опишите вопрос или проблему перед отправкой.');
    return;
  }
 let iframe = document.getElementById('hidden_mail_frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = 'hidden_mail_frame';
    iframe.id = 'hidden_mail_frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://formsubmit.co';
  form.target = 'hidden_mail_frame';

  const fields = {
    _subject: 'Lingvo Trainer: ' + subj,
    _captcha: 'false',
    Тема: subj,
    Язык: curLang === 'ko' ? 'Корейский' : 'Английский',
    Почта_для_ответа: userMail || 'Не указана',
    Сообщение: msg
  };

  Object.entries(fields).forEach(([key, val]) => {
    const inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = key;
    inp.value = val;
    form.appendChild(inp);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();

  alert('✅ Сообщение отправлено на trenazer.support@gmail.com!\n(Если вы отправляете впервые, проверьте почту и папку «Спам» для подтверждения формы).');
  if (typeof closeModal === 'function') closeModal('reportModal');
}
// УПРАВЛЕНИЕ ВЫДВИЖНОЙ ШТОРКОЙ ПО КНОПКЕ-СТРЕЛОЧКЕ
function toggleDrawerMenu(e) {
  if (e) e.stopPropagation();
  const sb = document.querySelector('.sidebar');
  const btn = document.getElementById('floatingMenuBtn');
  if (!sb) return;
  const isOpen = sb.classList.toggle('drawer-open');
  if (btn) btn.textContent = isOpen ? '«' : '»';
}

function syncDrawerLayout() {
  const sb = document.querySelector('.sidebar');
  const isOpen = sb && sb.classList.contains('drawer-open');
  document.body.classList.toggle('drawer-is-open', !!isOpen);
}

const _origToggleDrawer = toggleDrawerMenu;
toggleDrawerMenu = function(e) {
  _origToggleDrawer(e);
  syncDrawerLayout();
};
// СТАРТОВАЯ ГЛАВНАЯ СТРАНИЦА ПРИ ОТКРЫТИИ САЙТА
curTab = 'about';
localStorage.setItem('lt_cur_tab', 'about');

const HERO_ART_CARDS = [
  {
    img: '1.jpg',
    lang: 'en-US',
    badge: 'EN',
    phrase: 'Every small step builds your fluency.',
    translit: '[ˈevri smɔːl step bɪldz jɔː ˈfluːənsi]',
    meaning: 'Каждый маленький шаг строит твою беглость речи.'
  },
  {
    img: '2.jpg',
    lang: 'en-US',
    badge: 'EN',
    phrase: 'Mistakes are proof that you are trying.',
    translit: '[mɪˈsteɪks ɑː pruːf ðæt juː ɑː ˈtraɪɪŋ]',
    meaning: 'Ошибки — это доказательство того, что ты стараешься.'
  },
  {
    img: '3.jpg',
    lang: 'ko-KR',
    badge: 'KO',
    phrase: '시작이 반이다.',
    translit: '[сичжаги панида]',
    meaning: 'Хорошее начало — половина дела.'
  },
  {
    img: '4.jpg',
    lang: 'ko-KR',
    badge: 'KO',
    phrase: '천 리 길도 한 걸음부터.',
    translit: '[чхон ли кильдо хан корымпхутхо]',
    meaning: 'Путь в тысячу ли начинается с одного шага.'
  },
  {
    img: '5.jpg',
    lang: 'en-US',
    badge: 'EN',
    phrase: 'I can handle it.',
    translit: '[aɪ kæn ˈhændl ɪt]',
    meaning: 'Я справлюсь с этим.'
  },
  {
    img: '6.jpg',
    lang: 'ko-KR',
    badge: 'KO',
    phrase: '포기하지 않으면 반드시 이루어진다.',
    translit: '[пхогихачжи анымён пандыщи ируочжинда]',
    meaning: 'Если не сдаваться, мечта обязательно сбудется.'
  }
];

function speakHeroCard(idx, event) {
  if (event) event.stopPropagation();
  const item = HERO_ART_CARDS[idx];
  if (!item || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(item.phrase);
  u.lang = item.lang;
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

const _origRenderForHome = window.render;
window.render = function() {
  const ws = document.getElementById('workspace');
  if (curTab !== 'about') {
    document.body.classList.remove('is-home');
    return typeof _origRenderForHome === 'function' ? _origRenderForHome() : undefined;
  }
  document.body.classList.add('is-home');
  if (!ws) return;
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });

  const cardsHtml = HERO_ART_CARDS.map(function(c, i) {
    return '<div class="hero-art-card" onclick="speakHeroCard(' + i + ', event)">' +
      '<img src="' + c.img + '" alt="' + c.phrase + '" />' +
      '<span class="hero-art-lang">' + c.badge + '</span>' +
      '<div class="hero-art-overlay">' +
        '<div class="hero-art-phrase">' + c.phrase + '</div>' +
        '<div class="hero-art-translit">' + c.translit + '</div>' +
        '<div class="hero-art-meaning">' + c.meaning + '</div>' +
        '<button class="hero-art-voice-btn" onclick="speakHeroCard(' + i + ', event)">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' +
          'Озвучить' +
        '</button>' +
      '</div>' +
    '</div>';
  }).join('');

  ws.style.background = "#000000 url('bg.jpg') right bottom / contain no-repeat";
  ws.innerHTML =
    '<div class="hero-stage">' +
      '<div class="hero-art-grid">' + cardsHtml + '</div>' +
    '</div>';
};
const _origRenderBeforeHome = _origRenderForHome;
window._origRenderForHome = function() {
  const ws = document.getElementById('workspace');
  if (ws) ws.style.background = '';
  if (typeof _origRenderBeforeHome === 'function') _origRenderBeforeHome();
};
if (curTab === 'about') window.render();


