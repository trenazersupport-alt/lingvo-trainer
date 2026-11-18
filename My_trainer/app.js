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

    ws.innerHTML = `
      <div class="section-header">
        <h2>${curTab === 'words' ? '📚 База слов' : '⭐ Мой личный словарь'} (${list.length})</h2>
        <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
      </div>
      <div class="toolbar">
      <input type="text" style="display:none" aria-hidden="true" />
      <input type="password" style="display:none" aria-hidden="true" />
      <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="search_field_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск слова или перевода..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />            
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

const WORD_GROUPS_LIST = [
  { id: '1. Человек и физиология', icon: '🧍', desc: 'Тело, здоровье, еда, одежда, возраст' },
  { id: '2. Психология и внутренний мир', icon: '🧠', desc: 'Эмоции, характер, память, восприятие' },
  { id: '3. Общение и социум', icon: '💬', desc: 'Этикет, споры, семья, профессии' },
  { id: '4. Природа и мир', icon: '🌿', desc: 'Животные, растения, погода, космос' },
  { id: '5. Быт и пространство', icon: '🏠', desc: 'Дом, транспорт, город, техника' },
  { id: '6. Абстрактные понятия', icon: '⏳', desc: 'Время, форма, счет, действия, свойства' },
  { id: '7. Культура и наука', icon: '🎭', desc: 'Искусство, наука, закон, религия' }
];

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

const _origRenderForWords = render;
render = function() {
  if (curTab !== 'words') return _origRenderForWords();
  const ws = document.getElementById('workspace');
  const all = getAllWords();

  if (!selectedGroup && !searchQuery.trim()) {
    ws.innerHTML = `
      <div class="section-header">
        <h2>📚 База слов — выберите раздел</h2>
        <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
      </div>
      <div class="toolbar">
        <input type="text" style="display:none" aria-hidden="true" />
        <input type="password" style="display:none" aria-hidden="true" />
        <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="search_field_no_autofill" autocomplete="off" class="input-dark" placeholder="Быстрый поиск по всем разделам..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
      </div>
      <div class="cat-grid">
        ${WORD_GROUPS_LIST.map(g => {
          const count = all.filter(w => w.group === g.id).length;
          return `
            <div class="cat-tile" onclick="selectedGroup='${g.id}'; selectedSubCat='all'; render()">
              <div>
                <div style="font-size:1.6rem; margin-bottom:8px;">${g.icon}</div>
                <div class="cat-tile-title">${g.id}</div>
                <div class="cat-tile-sub">${g.desc}</div>
              </div>
              <div style="margin-top:12px; font-size:0.85rem; color:#ff6b6b; font-weight:600;">Слов в разделе: ${count} →</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  let list = selectedGroup ? all.filter(w => w.group === selectedGroup) : all;
  const subCats = [...new Set(list.map(w => w.cat).filter(Boolean))];
  if (selectedSubCat !== 'all') list = list.filter(w => w.cat === selectedSubCat);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q)));
  }

  ws.innerHTML = `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="selectedGroup=''; searchQuery=''; render()">← К разделам</button>
        <h2>${selectedGroup || 'Результаты поиска'} (${list.length})</h2>
      </div>
      <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
    </div>
    <div class="toolbar">
      <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="search_field_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск в разделе..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
      ${subCats.length ? `
        <select class="select-dark" onchange="selectedSubCat=this.value; render()">
          <option value="all" ${selectedSubCat === 'all' ? 'selected' : ''}>Все подтемы</option>
          ${subCats.map(c => `<option value="${c}" ${selectedSubCat === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      ` : ''}
    </div>
    <div class="word-list">
      ${list.length ? list.map(renderWordRowCompact).join('') : '<p style="color:#999;">В этой подтеме пока нет слов.</p>'}
    </div>
  `;
};
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
      showMsg(`✅ Верно! Распознано: «${said}»`, '#2ecc71');
    } else {
      showMsg(`❌ Услышано: «${said}» (Эталон: ${targetWord})`, '#ffb84d');
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
if (typeof switchTab === 'function') switchTab(curTab);
// ДИЗАЙН ЛИЧНОГО СЛОВАРЯ (ТОЛЬКО РАЗДЕЛЫ С ДОБАВЛЕННЫМИ СЛОВАМИ + МОИ СЛОВА)
let mySelectedGroup = '';
let mySelectedSubCat = 'all';

const _origRenderForMyDict = render;
render = function() {
  if (curTab !== 'myDict') return _origRenderForMyDict();
  const ws = document.getElementById('workspace');
  const myWords = getAllWords().filter(w => personalIds.includes(w.id) || String(w.id).startsWith('custom_'));

  if (!myWords.length) {
    ws.innerHTML = `
      <div class="section-header">
        <h2>⭐ Личный словарь (0)</h2>
        <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
      </div>
      <div class="game-box" style="margin-top:20px;">
        <p style="color:#ccc; line-height:1.6;">
          В вашем личном словаре пока пусто.<br>
          Добавьте слова через меню <b>«⋮ → ☆ В свой словарь»</b> в <b>Базе слов</b> или создайте свою карточку кнопкой <b>«➕ Добавить слово»</b> — и здесь автоматически появятся нужные разделы!
        </p>
      </div>
    `;
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
    ws.innerHTML = `
      <div class="section-header">
        <h2>⭐ Личный словарь (${myWords.length})</h2>
        <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
      </div>
      <div class="toolbar">
        <input type="text" style="display:none" aria-hidden="true" />
        <input type="password" style="display:none" aria-hidden="true" />
        <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="my_search_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск по личному словарю..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
      </div>
      <div class="cat-grid">
        ${activeGroups.map(g => `
          <div class="cat-tile" onclick="mySelectedGroup='${g.id}'; mySelectedSubCat='all'; render()">
            <div>
              <div style="font-size:1.6rem; margin-bottom:8px;">${g.icon}</div>
              <div class="cat-tile-title">${g.title || g.id}</div>
              <div class="cat-tile-sub">${g.desc}</div>
            </div>
            <div style="margin-top:12px; font-size:0.85rem; color:#ff6b6b; font-weight:600;">Добавлено слов: ${g.count} →</div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  let list = myWords;
  let headerTitle = 'Результаты поиска';
  if (mySelectedGroup === 'custom_group') {
    list = customOnly;
    headerTitle = '✨ Мои созданные слова';
  } else if (mySelectedGroup) {
    list = myWords.filter(w => w.group === mySelectedGroup);
    headerTitle = mySelectedGroup;
  }

  const subCats = [...new Set(list.map(w => w.cat).filter(Boolean))];
  if (mySelectedSubCat !== 'all') list = list.filter(w => w.cat === mySelectedSubCat);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q)));
  }

  ws.innerHTML = `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="mySelectedGroup=''; searchQuery=''; render()">← К разделам</button>
        <h2>${headerTitle} (${list.length})</h2>
      </div>
      <button class="btn-primary" onclick="openModal('addWordModal')">➕ Добавить слово</button>
    </div>
    <div class="toolbar">
      <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="my_search_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск в разделе..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
      ${subCats.length ? `
        <select class="select-dark" onchange="mySelectedSubCat=this.value; render()">
          <option value="all" ${mySelectedSubCat === 'all' ? 'selected' : ''}>Все подтемы</option>
          ${subCats.map(c => `<option value="${c}" ${mySelectedSubCat === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      ` : ''}
    </div>
    <div class="word-list">
      ${list.length ? list.map(renderWordRowCompact).join('') : '<p style="color:#999;">В этой подтеме пока нет слов.</p>'}
    </div>
  `;
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

const _origRenderForHanja = render;
render = function() {
  if (curTab !== 'hanja') return _origRenderForHanja();
  const ws = document.getElementById('workspace');

  if (curLang !== 'ko') {
    ws.innerHTML = `
      <div class="section-header"><h2>🏯 Ханча (Корни иероглифов)</h2></div>
      <div class="game-box" style="margin-top:20px;">
        <p style="color:#ccc;">Раздел <b>Ханча</b> относится к корейскому языку. Переключите язык на <b>🇰🇷 Корейский</b> в верхнем меню!</p>
      </div>
    `;
    return;
  }

  const listData = typeof hanjaFullList !== 'undefined' ? hanjaFullList : [];

  if (!selectedHanjaRoot && !searchQuery.trim()) {
    ws.innerHTML = `
      <div class="section-header">
        <h2>🏯 Ханча — выберите корень (${listData.length})</h2>
      </div>
      <div class="toolbar">
        <input type="text" style="display:none" aria-hidden="true" />
        <input type="password" style="display:none" aria-hidden="true" />
        <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="hanja_search_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск по корню или слову Ханча..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
      </div>
      <div class="cat-grid">
        ${listData.map(h => `
          <div class="cat-tile" onclick="selectedHanjaRoot='${h.root}'; render()">
            <div>
              <div style="font-size:1.5rem; font-weight:700; color:#ff6b6b; margin-bottom:6px;">${h.root}</div>
              <div class="cat-tile-title">${h.meaning}</div>
            </div>
            <div style="margin-top:12px; font-size:0.85rem; color:#aaa; font-weight:600;">Слов на корень: ${h.words.length} →</div>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  let wordsToShow = [];
  let titleText = 'Результаты поиска';
  if (selectedHanjaRoot) {
    const found = listData.find(h => h.root === selectedHanjaRoot);
    wordsToShow = found ? found.words : [];
    titleText = found ? `${found.root} — ${found.meaning}` : selectedHanjaRoot;
  } else {
    wordsToShow = listData.flatMap(h => h.words);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    wordsToShow = wordsToShow.filter(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q)));
  }

  ws.innerHTML = `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="selectedHanjaRoot=''; searchQuery=''; render()">← К корням</button>
        <h2>${titleText} (${wordsToShow.length})</h2>
      </div>
    </div>
    <div class="toolbar">
      <input type="search" readonly onfocus="this.removeAttribute('readonly')" name="hanja_search_no_autofill" autocomplete="off" class="input-dark" placeholder="Поиск в списке..." value="${searchQuery}" oninput="searchQuery=this.value; render()" />
    </div>
    <div class="word-list">
      ${wordsToShow.length ? wordsToShow.map(renderWordRowCompact).join('') : '<p style="color:#999;">Слов не найдено.</p>'}
    </div>
  `;
};
// ИНТЕРАКТИВНЫЕ УРОКИ ГРАММАТИКИ (ТЕОРИЯ + МИКРОФОН + МИНИ-ТЕСТ)
let selGrammarMod = '';
let selGrammarLesson = '';
let completedLessons = JSON.parse(localStorage.getItem('lt_done_lessons') || '[]');
let lessonQuizAnswers = {};

function answerLessonQuiz(lessonId, qIdx, optIdx, correctIdx, btnEl) {
  const parent = btnEl.parentElement;
  parent.querySelectorAll('button').forEach(b => {
    b.style.borderColor = '#3c3c4e';
    b.style.background = '#22222e';
  });
  if (optIdx === correctIdx) {
    btnEl.style.borderColor = '#2ecc71';
    btnEl.style.background = '#1e5c30';
    lessonQuizAnswers[lessonId + '_' + qIdx] = true;
  } else {
    btnEl.style.borderColor = '#ff4747';
    btnEl.style.background = '#6e1919';
    lessonQuizAnswers[lessonId + '_' + qIdx] = false;
  }
}

function finishGrammarLesson(lessonId, totalQ) {
  let correctCount = 0;
  for (let i = 0; i < totalQ; i++) {
    if (lessonQuizAnswers[lessonId + '_' + i]) correctCount++;
  }
  const resEl = document.getElementById('lessonFinishMsg');
  if (correctCount < totalQ) {
    if (resEl) {
      resEl.style.color = '#ffb84d';
      resEl.textContent = `⚠️ Правильных ответов: ${correctCount} из ${totalQ}. Исправьте ошибки, чтобы завершить урок!`;
    }
    return;
  }
  if (!completedLessons.includes(lessonId)) {
    completedLessons.push(lessonId);
    localStorage.setItem('lt_done_lessons', JSON.stringify(completedLessons));
  }
  if (resEl) {
    resEl.style.color = '#2ecc71';
    resEl.textContent = '🎉 Поздравляем! Урок успешно пройден и сохранён в прогрессе!';
  }
}

const _origRenderForGrammar = render;
render = function() {
  if (curTab !== 'grammar') return _origRenderForGrammar();
  const ws = document.getElementById('workspace');
  const modules = (typeof grammarCourse !== 'undefined' && grammarCourse[curLang]) ? grammarCourse[curLang] : [];

  // 1. ЭКРАН ВЫБОРА МОДУЛЯ
  if (!selGrammarMod) {
    ws.innerHTML = `
      <div class="section-header">
        <h2>📖 Грамматика и уроки (${curLang === 'ko' ? 'Корейский' : 'Английский'})</h2>
      </div>
      <div class="cat-grid">
        ${modules.map(m => {
          const doneCount = m.lessons.filter(l => completedLessons.includes(l.id)).length;
          return `
            <div class="cat-tile" onclick="selGrammarMod='${m.id}'; selGrammarLesson=''; render()">
              <div>
                <div style="font-size:1.7rem; margin-bottom:8px;">${m.icon}</div>
                <div class="cat-tile-title">${m.title}</div>
                <div class="cat-tile-sub">${m.desc}</div>
              </div>
              <div style="margin-top:14px; font-size:0.85rem; color:${doneCount === m.lessons.length ? '#2ecc71' : '#ff6b6b'}; font-weight:600;">
                Пройдено уроков: ${doneCount} из ${m.lessons.length} →
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  const modObj = modules.find(m => m.id === selGrammarMod);
  if (!modObj) { selGrammarMod = ''; return render(); }

  // 2. ЭКРАН СПИСКА УРОКОВ ВНУТРИ МОДУЛЯ
  if (!selGrammarLesson) {
    ws.innerHTML = `
      <div class="section-header">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <button class="btn-secondary" onclick="selGrammarMod=''; render()">← К модулям</button>
          <h2>${modObj.icon} ${modObj.title}</h2>
        </div>
      </div>
      <div class="word-list">
        ${modObj.lessons.map(l => {
          const isDone = completedLessons.includes(l.id);
          return `
            <div class="word-row ${isDone ? 'is-learned' : ''}" style="cursor:pointer;" onclick="selGrammarLesson='${l.id}'; render()">
              <div class="word-row-info">
                <div class="word-row-orig" style="font-size:1.1rem;">${l.title}</div>
                <div style="font-size:0.85rem; color:#aaa; margin-top:4px;">Теория • Произношение • Мини-тест (${l.quiz.length} вопр.)</div>
              </div>
              <div style="font-weight:700; color:${isDone ? '#2ecc71' : '#ff6b6b'};">
                ${isDone ? '✅ Пройдено' : 'Начать →'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  // 3. ЭКРАН САМОГО УРОКА (ТЕОРИЯ + МИКРОФОН + ТЕСТ)
  const les = modObj.lessons.find(l => l.id === selGrammarLesson);
  if (!les) { selGrammarLesson = ''; return render(); }
  const safeSpeak = les.speakTarget.replace(/'/g, "\\'");

  ws.innerHTML = `
    <div class="section-header">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="selGrammarLesson=''; render()">← К урокам</button>
        <h2>${les.title}</h2>
      </div>
    </div>

    <div class="game-box" style="max-width:760px; text-align:left; margin-bottom:18px;">
      <h3 style="color:#ff6b6b; margin-bottom:10px;">📘 1. Теория и примеры</h3>
      <p style="color:#ddd; line-height:1.6; margin-bottom:14px;">${les.theory}</p>
      <div class="word-list">
        ${les.items.map(it => `
          <div class="word-row" style="background:#1b1b26;">
            <div class="word-row-info">
              <div class="word-row-top">
                <span class="word-row-orig">${it.char}</span>
                <span class="word-row-tr">${it.tr}</span>
              </div>
              <div class="word-row-mean" style="font-size:0.9rem; color:#bbb;">${it.note}</div>
            </div>
            <button class="icon-circle-btn" title="Прослушать" onclick="speakText('${it.char.split('(').at(0).split('→').at(-1).trim().replace(/'/g, "\\'")}')">🔊</button>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="game-box" style="max-width:760px; text-align:left; margin-bottom:18px;">
      <h3 style="color:#ffb84d; margin-bottom:10px;">🎙️ 2. Практика произношения</h3>
      <p style="color:#ccc; margin-bottom:12px;">Прослушайте контрольную фразу и произнесите её в микрофон: <b>${les.speakHint}</b></p>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button class="btn-secondary" onclick="speakText('${safeSpeak}')">🔊 Послушать образец</button>
        <button class="btn-primary" onclick="checkSpeech('${safeSpeak}', this, 'lesson_sp_${les.id}')">🎙️ Произнести в микрофон</button>
      </div>
      <div id="speech_res_lesson_sp_${les.id}" style="font-size:0.92rem; margin-top:10px; font-weight:600;"></div>
    </div>

    <div class="game-box" style="max-width:760px; text-align:left;">
      <h3 style="color:#2ecc71; margin-bottom:12px;">📝 3. Мини-тест для закрепления</h3>
      ${les.quiz.map((q, qIdx) => `
        <div style="margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #2a2a38;">
          <div style="font-weight:600; color:#fff; margin-bottom:8px;">${qIdx + 1}. ${q.q}</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${q.opts.map((opt, oIdx) => `
              <button class="game-opt-btn" style="padding:9px 14px; font-size:0.9rem;" onclick="answerLessonQuiz('${les.id}', ${qIdx}, ${oIdx}, ${q.ans}, this)">${opt}</button>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn-primary" style="width:100%;" onclick="finishGrammarLesson('${les.id}', ${les.quiz.length})">✅ Завершить урок и проверить тест</button>
      <div id="lessonFinishMsg" style="margin-top:10px; font-weight:600; text-align:center;"></div>
    </div>
  `;
};
// ОБНОВЛЕННЫЙ РАЗДЕЛ «ТРЕНИРОВКА ПРОИЗНОШЕНИЯ» (БЕЗ UNDEFINED И С РАБОЧИМИ КНОПКАМИ)
let voiceWordId = '';

const _origRenderForVoice = render;
render = function() {
  if (curTab !== 'voice') return _origRenderForVoice();
  const ws = document.getElementById('workspace');
  const pool = getAllWords().filter(w => w.ex && w.ex.trim().length > 0);
  const list = pool.length ? pool : getAllWords();

  let item = list.find(w => w.id === voiceWordId) || list.at(0);
  if (item) voiceWordId = item.id;

  if (!item) {
    ws.innerHTML = '<div class="section-header"><h2>🎙️ Тренировка произношения</h2></div><p style="color:#999;">Нет слов для тренировки.</p>';
    return;
  }

  const isLearned = learnedIds.includes(item.id);
  const isHard = hardIds.includes(item.id);
  const isPersonal = personalIds.includes(item.id);
  const safeWord = item.word.replace(/'/g, "\\'");
  const safeEx = (item.ex || '').replace(/'/g, "\\'");

  ws.innerHTML = `
    <div class="section-header">
      <h2>🎙️ Тренировка произношения</h2>
      <button class="btn-primary" onclick="nextVoiceWord()">🔄 Следующее слово</button>
    </div>
    <div class="word-card ${isLearned ? 'learned' : ''}" style="max-width:760px;">
      <div class="card-top">
        <div>
          <div class="word-main">${item.word}</div>
          <div class="word-translit">${item.translit || ''}</div>
        </div>
        <button class="action-chip" onclick="speakText('${safeWord}')">🔊 Слово</button>
      </div>
      <div class="word-meaning">${item.meaning}</div>
      <div style="font-size:0.85rem; color:#888; margin-bottom:12px;">${item.cat || ''}</div>
      ${item.ex ? `
        <div class="example-box">
          <div style="font-size:1.05rem; color:#fff; margin-bottom:4px;">${item.ex}</div>
          <div style="font-size:0.9rem; color:#aaa;">${item.exTr || ''}</div>
        </div>
      ` : ''}
      <div id="speech_${item.id}" style="margin:10px 0; font-weight:600; min-height:22px;"></div>
      <div class="card-actions">
        ${item.ex ? `<button class="action-chip" onclick="speakText('${safeEx}')">🔊 Пример</button>` : ''}
        <button class="action-chip" onclick="checkSpeech('${safeWord}', '${item.id}')">🎙️ Слово</button>
        ${item.ex ? `<button class="action-chip" onclick="checkSpeech('${safeEx}', '${item.id}')">🎙️ Фраза</button>` : ''}
        <button class="action-chip ${isLearned ? 'learned-active' : ''}" onclick="toggleLearned('${item.id}')">${isLearned ? '✅ Выучено' : '⬜ Выучить'}</button>
        <button class="action-chip" style="${isHard ? 'border-color:#ffb84d; color:#ffb84d;' : ''}" onclick="toggleHard('${item.id}')">${isHard ? '🔁 Повторю позже' : '🕒 Повторить позже'}</button>
        <button class="action-chip" onclick="togglePersonal('${item.id}')">${isPersonal ? '★ В личном' : '☆ В личный'}</button>
        <button class="action-chip" style="color:#ff7b7b;" onclick="openReport('${safeWord}')">🚩 Ошибка</button>
      </div>
    </div>
  `;
};
function nextVoiceWord() {
  const pool = getAllWords().filter(w => w.ex && w.ex.trim().length > 0);
  const list = pool.length ? pool : getAllWords();
  if (list.length <= 1) return;
  let next = list.at(Math.floor(Math.random() * list.length));
  if (next.id === voiceWordId) next = list.at((list.indexOf(next) + 1) % list.length);
  voiceWordId = next.id;
  render();
}
// ПРИВЯЗКА МОДАЛЬНОГО ОКНА ПОДДЕРЖКИ И ОШИБОК К ПОЧТЕ trenazer.support@gmail.com
const SUPPORT_EMAIL = 'trenazer.support@gmail.com';

function openReport(wordText) {
  const subjEl = document.getElementById('reportSubject');
  const textEl = document.getElementById('reportText');
  if (subjEl) {
    subjEl.value = wordText ? `Ошибка в карточке: ${wordText}` : 'Вопрос в службу поддержки';
  }
  if (textEl) textEl.value = '';
  if (typeof openModal === 'function') openModal('reportModal');
}

async function sendReportEmail() {
  const subj = (document.getElementById('reportSubject')?.value || 'Обращение в поддержку').trim();
  const userMail = (document.getElementById('reportUserEmail')?.value || '').trim();
  const msg = (document.getElementById('reportText')?.value || '').trim();

  if (!msg) {
    return alert('Пожалуйста, опишите ошибку или ваш вопрос перед отправкой.');
  }

  const btn = document.querySelector('#reportModal .btn-primary');
  const oldText = btn ? btn.textContent : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Отправляем письмо...';
  }

  try {
    const res = await fetch(`https://formsubmit.co{SUPPORT_EMAIL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `Lingvo Trainer: ${subj}`,
        Тема: subj,
        Язык: curLang === 'ko' ? 'Корейский' : 'Английский',
        Почта_для_ответа: userMail || 'Не указана',
        Сообщение: msg
      })
    });

    if (res.ok) {
      alert('✅ Сообщение успешно отправлено на trenazer.support@gmail.com!');
      if (typeof closeModal === 'function') closeModal('reportModal');
    } else {
      alert('⚠️ Не удалось отправить письмо. Попробуйте чуть позже.');
    }
  } catch (e) {
    alert('⚠️ Ошибка сети при отправке. Проверьте интернет-соединение.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = oldText;
    }
  }
}
  const fullBody = `Тема: ${subj}\nЯзык тренажёра: ${curLang === 'ko' ? 'Корейский' : 'Английский'}\nПочта пользователя для ответа: ${userMail || 'не указана'}\n\nСообщение:\n${msg}`;
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Lingvo Trainer: ' + subj)}&body=${encodeURIComponent(fullBody)}`;

  window.location.href = mailtoUrl;
  if (typeof closeModal === 'function') closeModal('reportModal');
}

