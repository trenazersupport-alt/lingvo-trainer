/* === ГЛАВНАЯ ВИТРИНА И ХАБ КУРСОВ (home.page.js) === */
window.HomePage = {
  cards: [
    { lang: 'KO', code: 'ko-KR', phrase: '시작이 반이다', translit: 'Сиджаги панида', meaning: 'Хорошее начало — половина дела' },
    { lang: 'EN', code: 'en-US', phrase: 'Every step counts', translit: 'Эври степ каунтс', meaning: 'Каждый шаг имеет значение' },
    { lang: 'KO', code: 'ko-KR', phrase: '천리길도 한 걸음부터', translit: 'Чхоллигильдо хан горымбутхо', meaning: 'Путь в тысячу ли начинается с первого шага' },
    { lang: 'EN', code: 'en-US', phrase: 'Practice makes progress', translit: 'Прэктис мэйкс прогресс', meaning: 'Практика рождает прогресс' },
    { lang: 'KO', code: 'ko-KR', phrase: '꿈을 향해 나아가다', translit: 'Ккумыль хянхэ наагада', meaning: 'Двигаться навстречу мечте' },
    { lang: 'EN', code: 'en-US', phrase: 'Speak with confidence', translit: 'Спик виз конфиденс', meaning: 'Говори с уверенностью' }
  ],

  speak(text, langCode) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langCode;
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  },

  render(root) {
    document.querySelectorAll('.lt-lang-pill').forEach(b => b.classList.remove('active'));
    const cardsHtml = this.cards.map((c) =>
      '<div class="lt-art-card">' +
        '<span class="lt-art-badge">' + c.lang + '</span>' +
        '<div class="lt-art-hover-panel">' +
          '<div class="lt-art-phrase">' + c.phrase + '</div>' +
          '<div class="lt-art-translit">' + c.translit + '</div>' +
          '<div class="lt-art-meaning">' + c.meaning + '</div>' +
          '<button class="lt-btn-secondary" style="padding:5px 11px; font-size:0.78rem;" onclick="HomePage.speak(\'' + c.phrase.replace(/'/g, "\\'") + '\', \'' + c.code + '\')">Озвучить</button>' +
        '</div>' +
      '</div>'
    ).join('');

    root.innerHTML =
      '<div class="lt-hero-header">' +
        '<h1>Изучай языки в ритме живого общения</h1>' +
        '<p>Выберите курс KR или GB в верхней панели, чтобы открыть словари, грамматику и практику</p>' +
      '</div>' +
      '<div class="lt-showcase-grid">' + cardsHtml + '</div>';
  },

  renderCourseHub(root, lang) {
    const isKo = lang === 'ko';
    const title = isKo ? 'Курс корейского языка (KR)' : 'Курс английского языка (GB)';

    const learnItems = [
      { title: 'База слов', desc: 'Карточки с озвучкой, примерами и начислением +10 XP' },
      { title: 'Личный словарь', desc: 'Ваши сохранённые слова и сложные термины' }
    ];
    if (isKo) {
      learnItems.push({ title: 'Корни слов (Ханча)', desc: 'Иероглифическая основа корейской лексики' });
    }
    learnItems.push(
      { title: 'Грамматика', desc: 'Конструкции, частицы и живые примеры' },
      { title: 'Тренировка голоса', desc: 'Проверка произношения через микрофон (+5 XP)' }
    );

    const practiceItems = [
      { title: 'Игра: Вопрос-Ответ', desc: 'Быстрая проверка памяти на время (+5 XP)' },
      { title: 'Повторение голосом', desc: 'Аудиотренажёр на слух' },
      { title: 'Видеоразборы', desc: 'Скоро', soon: true },
      { title: 'Чаты и ИИ-помощник', desc: 'Практика диалогов и разбор ошибок' },
      { title: 'Рейтинг учеников', desc: 'Ваша позиция в общей лиге', onClick: "Router.go('rating')" }
    ];

    const renderGroup = (heading, list) =>
      '<div style="margin-bottom:22px;">' +
        '<div style="font-size:0.78rem; text-transform:uppercase; letter-spacing:1px; color:#f87171; font-weight:700; margin-bottom:10px;">' + heading + '</div>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">' +
          list.map(it =>
            '<button class="lt-glass-drop-item" style="background:rgba(16,18,26,0.78); border:1px solid rgba(255,255,255,0.12); padding:13px 16px;" ' +
              (it.onClick ? 'onclick="' + it.onClick + '"' : '') + '>' +
              '<span class="lt-glass-drop-title">' + it.title + (it.soon ? ' <span style="color:#f87171; font-size:0.72rem;">[Скоро]</span>' : '') + '</span>' +
              '<span class="lt-glass-drop-sub">' + it.desc + '</span>' +
            '</button>'
          ).join('') +
        '</div>' +
      '</div>';

    root.innerHTML =
      '<div style="max-width:620px; margin:0 auto;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">' +
          '<h2 style="font-size:1.35rem;">' + title + '</h2>' +
          '<button class="lt-btn-secondary" onclick="Router.go(\'home\')">На витрину</button>' +
        '</div>' +
        renderGroup('Обучение', learnItems) +
        renderGroup('Практика и сообщество', practiceItems) +
      '</div>';
  }
};
