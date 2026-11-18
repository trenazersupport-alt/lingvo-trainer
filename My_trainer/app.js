// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
let curLang = 'ko';
let curTab = 'words';
let searchQuery = '';
let selectedCat = 'all';

// ДАННЫЕ ИЗ ПАМЯТИ УСТРОЙСТВА
let learnedIds = JSON.parse(localStorage.getItem('lt_learned') || '[]');
let personalIds = JSON.parse(localStorage.getItem('lt_personal') || '[]');
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
  selectedCat = 'all';
  document.body.className = lang === 'ko' ? 'lang-ko' : 'lang-en';
  document.getElementById('btnLangKo').classList.toggle('active', lang === 'ko');
  document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
  render();
}

function switchTab(tab) {
  curTab = tab;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
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

// ПРОВЕРКА ПРОИЗНОШЕНИЯ ГОЛОСОМ (СЛОВО ИЛИ ПРЕДЛОЖЕНИЕ)
function checkSpeech(targetText, feedbackId, btnEl) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const fb = document.getElementById(feedbackId);
  if (!SpeechRec) {
    fb.textContent = '⚠️ Ваш браузер не поддерживает распознавание речи. Попробуйте Google Chrome.';
    fb.classList.add('show');
    return;
  }
  const rec = new SpeechRec();
  rec.lang = curLang === 'ko' ? 'ko-KR' : 'en-US';
  rec.interimResults = false;

  btnEl.classList.add('mic-listening');
  fb.textContent = '🎙️ Слушаю... Произнесите фразу четко.';
  fb.classList.add('show');

  rec.onresult = (e) => {
    const said = e.results[0][0].transcript;
    const cleanTarget = targetText.toLowerCase().replace(/[.,!?]/g, '').trim();
    const cleanSaid = said.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (cleanSaid === cleanTarget || cleanTarget.includes(cleanSaid) && cleanSaid.length > 2) {
      fb.innerHTML = `✅ Отлично! Распознано: <b>«${said}»</b>`;
      fb.style.color = '#2ecc71';
    } else {
      fb.innerHTML = `🔄 Услышано: <b>«${said}»</b>. Попробуйте ещё раз!`;
      fb.style.color = '#ffb84d';
    }
  };
  rec.onerror = () => {
    fb.textContent = '⚠️ Не удалось распознать голос. Проверьте доступ к микрофону.';
    fb.style.color = '#ff6b6b';
  };
  rec.onend = () => btnEl.classList.remove('mic-listening');
  rec.start();
}

// ПОСЛОВНЫЙ ПЕРЕВОД ПРИ НАЖАТИИ НА СЛОВО В ПРЕДЛОЖЕНИИ
function showWordHint(cardId, word, meaning) {
  const bar = document.getElementById('tip_' + cardId);
  if (!bar) return;
  bar.innerHTML = `🔍 <b>${word}</b> — ${meaning}`;
  bar.classList.add('visible');
}

function buildInteractiveSentence(item) {
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
  const isPersonal = personalIds.includes(item.id);
  const safeWord = item.word.replace(/'/g, "\\'");
  const safeEx = item.ex.replace(/'/g, "\\'");

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

    ws.innerHTML = `
      <div class="section-header">
        <h2>${curTab === 'words' ? '📚 База слов' : '⭐ Мой личный словарь'} (${list.length})</h2>
        <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
      </div>
      <div class="toolbar">
        <input type="text" class="input-dark" placeholder="Поиск слова или перевода..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
        <select class="select-dark" onchange="selectedCat=this.value; render()">
          ${cats.map(c => `<option value="${c}" ${c === selectedCat ? 'selected' : ''}>${c === 'all' ? 'Все категории' : c}</option>`).join('')}
        </select>
      </div>
      <div class="cards-grid">
        ${list.length ? list.map(renderWordCard).join('') : '<p style="color:#999;">Список пока пуст. Добавьте слова или переключите категорию!</p>'}
      </div>
    `;
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
    const list = getAllWords();
    const rnd = list[Math.floor(Math.random() * list.length)];
    ws.innerHTML = `
      <div class="section-header">
        <h2>🎙️ Тренировка произношения</h2>
        <button class="btn-secondary" onclick="render()">🔄 Следующее слово</button>
      </div>
      ${rnd ? renderWordCard(rnd) : ''}
    `;
  } else {
    const titles = {
      game: '🎮 Игра: Вопрос — Ответ на время',
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
