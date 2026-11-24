/* === ГЛАВНАЯ ВИТРИНА И ХАБ КУРСОВ (home.page.js) === */
window.HomePage = {
  cards: [
    { img: '1.jpg', lang: 'EN', code: 'en-US', phrase: 'Every small step builds your fluency.', translit: '[эври смол степ билдз ё флуэнси]', meaning: 'Каждый маленький шаг строит твою беглость речи.' },
    { img: '2.jpg', lang: 'EN', code: 'en-US', phrase: 'Mistakes are proof that you are trying.', translit: '[мистэйкс а пруф зэт ю а траинг]', meaning: 'Ошибки — это доказательство того, что ты стараешься.' },
    { img: '3.jpg', lang: 'KO', code: 'ko-KR', phrase: '시작이 반이다.', translit: '[сиджаги панида]', meaning: 'Хорошее начало — половина дела.' },
    { img: '4.jpg', lang: 'KO', code: 'ko-KR', phrase: '천 리 길도 한 걸음부터.', translit: '[чхон ли гильдо хан горымбутхо]', meaning: 'Путь в тысячу ли начинается с одного шага.' },
    { img: '5.jpg', lang: 'EN', code: 'en-US', phrase: 'I can handle it.', translit: '[ай кэн хэндл ит]', meaning: 'Я справлюсь с этим.' },
    { img: '6.jpg', lang: 'KO', code: 'ko-KR', phrase: '포기하지 않으면 반드시 이루어진다.', translit: '[пхогихаджи анымён пандыси ируоджинда]', meaning: 'Если не сдаваться, мечта обязательно сбудется.' }
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
    document.body.classList.remove('theme-ko', 'theme-en');
    document.querySelectorAll('.lt-lang-pill').forEach(b => b.classList.remove('active'));

    const cardsHtml = this.cards.map(c =>
      '<div class="lt-art-card" style="background-image:url(\'' + c.img + '\');">' +
        '<span class="lt-art-badge">' + c.lang + '</span>' +
        '<div class="lt-art-hover-panel">' +
          '<div class="lt-art-phrase">' + c.phrase + '</div>' +
          '<div class="lt-art-translit">' + c.translit + '</div>' +
          '<div class="lt-art-meaning">' + c.meaning + '</div>' +
          '<button class="lt-speak-mini-btn" onclick="HomePage.speak(\'' + c.phrase.replace(/'/g, "\\'") + '\', \'' + c.code + '\')">Озвучить</button>' +
        '</div>' +
      '</div>'
    ).join('');

    root.innerHTML = '<div class="lt-showcase-grid">' + cardsHtml + '</div>';
  },

  renderCourseHub(root, lang) {
    const isKo = lang === 'ko';
    document.body.classList.remove('theme-ko', 'theme-en');
    document.body.classList.add(isKo ? 'theme-ko' : 'theme-en');

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
      '<div style="margin-bottom:20px;">' +
        '<div style="font-size:0.76rem; text-transform:uppercase; letter-spacing:1px; color:#f87171; font-weight:700; margin-bottom:8px;">' + heading + '</div>' +
        '<div style="display:flex; flex-direction:column; gap:7px;">' +
          list.map(it =>
            '<button class="lt-glass-drop-item" style="background:rgba(12,14,20,0.82); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.14); padding:12px 15px;" ' +
              (it.onClick ? 'onclick="' + it.onClick + '"' : '') + '>' +
              '<span class="lt-glass-drop-title">' + it.title + (it.soon ? ' <span style="color:#f87171; font-size:0.72rem;">[Скоро]</span>' : '') + '</span>' +
              '<span class="lt-glass-drop-sub">' + it.desc + '</span>' +
            '</button>'
          ).join('') +
        '</div>' +
      '</div>';

    root.innerHTML =
      '<div style="width:100%; max-width:580px; margin:0 auto;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; background:rgba(12,14,20,0.82); padding:12px 16px; border:1px solid rgba(220,38,38,0.5);">' +
          '<h2 style="font-size:1.2rem;">' + title + '</h2>' +
          '<button class="lt-btn-secondary" style="padding:6px 12px;" onclick="Router.go(\'home\')">На витрину</button>' +
        '</div>' +
        renderGroup('Обучение', learnItems) +
        renderGroup('Практика и сообщество', practiceItems) +
      '</div>';
  }
};
