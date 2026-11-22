/* === МОДУЛЬ СТРАНИЦ: ДРУЗЬЯ, ПОДПИСЧИКИ И СВОДНЫЙ СЛОВАРЬ ИЗУЧЕННЫХ СЛОВ (social_views.js) === */
(function () {
  const PROF_KEY = 'lt_user_profile_v1';
  const SOCIAL_KEY = 'lt_social_lists_v1';

  function loadProfSafe() {
    try {
      const r = localStorage.getItem(PROF_KEY);
      if (r) return JSON.parse(r);
    } catch (e) {}
    return { nick: 'ekstshafor', friends: [], followers: 24, suggestedFriends: [] };
  }

  function saveProfSafe(p) {
    try { localStorage.setItem(PROF_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function loadSocialLists() {
    try {
      const r = localStorage.getItem(SOCIAL_KEY);
      if (r) return JSON.parse(r);
    } catch (e) {}
    return {
      followersList: [
        { id: 'fl_1', name: 'Хана Чхве', handle: '@hana_seoul', lang: 'Корейский (носитель)', online: true },
        { id: 'fl_2', name: 'Дмитрий Л.', handle: '@dima_learn', lang: 'Корейский A2', online: true },
        { id: 'fl_3', name: 'Алина М.', handle: '@alina_en', lang: 'Английский B2', online: false },
        { id: 'fl_4', name: 'Тэмин Кан', handle: '@taemin_k', lang: 'Корейский (носитель)', online: true },
        { id: 'fl_5', name: 'Ольга Смирнова', handle: '@olga_topik', lang: 'Корейский B1', online: false },
        { id: 'fl_6', name: 'Кевин Пак', handle: '@kevin_kr', lang: 'Носитель KO / EN', online: true },
        { id: 'fl_7', name: 'Наталья К.', handle: '@natali_en', lang: 'Английский C1', online: false },
        { id: 'fl_8', name: 'Юна Ли', handle: '@yuna_busan', lang: 'Корейский (носитель)', online: true },
        { id: 'fl_9', name: 'Артём В.', handle: '@artem_hanja', lang: 'Корейский A1', online: false },
        { id: 'fl_10', name: 'София Р.', handle: '@sofia_study', lang: 'Английский B1', online: true },
        { id: 'fl_11', name: 'Минхо Чон', handle: '@minho_j', lang: 'Корейский (носитель)', online: false },
        { id: 'fl_12', name: 'Елена Б.', handle: '@elena_lang', lang: 'Корейский A2', online: true }
      ],
      friendRequests: [
        { id: 'req_1', name: 'Субин Ким', handle: '@subin_seoul', lang: 'Носитель KO • Ищет обмен', online: true },
        { id: 'req_2', name: 'Максим Г.', handle: '@max_english', lang: 'Английский B2', online: true },
        { id: 'req_3', name: 'Джису Пак', handle: '@jisoo_kr', lang: 'Корейский (носитель)', online: false }
      ],
      extraSuggested: [
        { id: 'sug_4', name: 'Чонгук Ли', handle: '@jk_tutor', lang: 'Носитель KO • Грамматика', online: true },
        { id: 'sug_5', name: 'Виктория Н.', handle: '@vika_words', lang: 'Английский C1', online: true },
        { id: 'sug_6', name: 'Хёнджин Чхве', handle: '@hj_seoul', lang: 'Корейский (носитель)', online: false },
        { id: 'sug_7', name: 'Павел Д.', handle: '@pavel_ko', lang: 'Корейский B1', online: true }
      ]
    };
  }

  function saveSocialLists(data) {
    try { localStorage.setItem(SOCIAL_KEY, JSON.stringify(data)); } catch (e) {}
  }

  window._ltSocialState = {
    mode: 'friends', // 'friends' | 'followers'
    subFilter: 'all', // 'all' | 'online' | 'requests'
    page: 0,
    suggestedExpanded: false,
    learnedLangFilter: 'all' // 'all' | 'ko' | 'en'
  };

  window.openSocialListPage = function (mode, subFilter) {
    window._ltSocialState.mode = mode || 'friends';
    window._ltSocialState.subFilter = subFilter || 'all';
    window._ltSocialState.page = 0;
    window._ltSocialState.suggestedExpanded = false;
    if (typeof switchTab === 'function') {
      switchTab('social_list');
    } else {
      window.curTab = 'social_list';
      if (typeof render === 'function') render();
    }
  };

  window.openLearnedSummaryPage = function () {
    window._ltSocialState.learnedLangFilter = 'all';
    if (typeof switchTab === 'function') {
      switchTab('learned_summary');
    } else {
      window.curTab = 'learned_summary';
      if (typeof render === 'function') render();
    }
  };

  window.ltSocialAcceptRequest = function (reqId) {
    const social = loadSocialLists();
    const prof = loadProfSafe();
    const idx = social.friendRequests.findIndex(function (x) { return x.id === reqId; });
    if (idx === -1) return;
    const person = social.friendRequests.splice(idx, 1).at(0);
    if (!Array.isArray(prof.friends)) prof.friends = [];
    prof.friends.unshift({
      id: person.id,
      name: person.name,
      handle: person.handle,
      lang: person.lang,
      online: person.online !== false,
      isFriend: true
    });
    saveSocialLists(social);
    saveProfSafe(prof);
    if (typeof render === 'function') render();
  };

  window.ltSocialDeclineRequest = function (reqId) {
    const social = loadSocialLists();
    social.friendRequests = social.friendRequests.filter(function (x) { return x.id !== reqId; });
    saveSocialLists(social);
    if (typeof render === 'function') render();
  };

  window.ltSocialAddSuggested = function (sugId) {
    const social = loadSocialLists();
    const prof = loadProfSafe();
    let person = null;

    if (Array.isArray(prof.suggestedFriends)) {
      const i1 = prof.suggestedFriends.findIndex(function (x) { return x.id === sugId; });
      if (i1 !== -1) person = prof.suggestedFriends.splice(i1, 1).at(0);
    }
    if (!person && Array.isArray(social.extraSuggested)) {
      const i2 = social.extraSuggested.findIndex(function (x) { return x.id === sugId; });
      if (i2 !== -1) person = social.extraSuggested.splice(i2, 1).at(0);
    }
    if (!person) return;

    if (!Array.isArray(prof.friends)) prof.friends = [];
    prof.friends.unshift({
      id: person.id,
      name: person.name,
      handle: person.handle,
      lang: person.lang,
      online: true,
      isFriend: true
    });
    saveSocialLists(social);
    saveProfSafe(prof);
    if (typeof render === 'function') render();
  };

  window.ltSocialAddFollowerToFriends = function (flId) {
    const social = loadSocialLists();
    const prof = loadProfSafe();
    const person = social.followersList.find(function (x) { return x.id === flId; });
    if (!person) return;
    if (!Array.isArray(prof.friends)) prof.friends = [];
    if (!prof.friends.some(function (f) { return f.id === flId; })) {
      prof.friends.unshift({
        id: person.id,
        name: person.name,
        handle: person.handle,
        lang: person.lang,
        online: person.online !== false,
        isFriend: true
      });
      saveProfSafe(prof);
    }
    if (typeof render === 'function') render();
  };

  window.ltSocialRemoveFriend = function (frId) {
    const prof = loadProfSafe();
    if (!Array.isArray(prof.friends)) return;
    prof.friends = prof.friends.filter(function (f) { return f.id !== frId; });
    saveProfSafe(prof);
    if (typeof render === 'function') render();
  };
  /* === ОТРИСОВКА СТРАНИЦ «ДРУЗЬЯ» И «ПОДПИСЧИКИ» ПО МАКЕТУ === */
  window.renderSocialListView = function (ws) {
    const st = window._ltSocialState;
    const prof = loadProfSafe();
    const social = loadSocialLists();
    const isFriendsMode = st.mode === 'friends';

    const friendsList = (Array.isArray(prof.friends) ? prof.friends : []).map(function (f, idx) {
      return Object.assign({ online: idx % 2 === 0 }, f);
    });
    const baseList = isFriendsMode ? friendsList : social.followersList;
    const requestsList = social.friendRequests || [];

    let filteredList = [];
    if (st.subFilter === 'requests') {
      filteredList = requestsList;
    } else if (st.subFilter === 'online') {
      filteredList = baseList.filter(function (u) { return u.online; });
    } else {
      filteredList = baseList;
    }

    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(filteredList.length / perPage));
    if (st.page >= totalPages) st.page = totalPages - 1;
    if (st.page < 0) st.page = 0;
    const pageItems = filteredList.slice(st.page * perPage, st.page * perPage + perPage);

    const baseSug = Array.isArray(prof.suggestedFriends) ? prof.suggestedFriends : [];
    const extraSug = Array.isArray(social.extraSuggested) ? social.extraSuggested : [];
    const allSuggested = baseSug.concat(extraSug);
    const shownSuggested = st.suggestedExpanded ? allSuggested : allSuggested.slice(0, 4);

    const firstTabLabel = isFriendsMode ? ('Все друзья (' + friendsList.length + ')') : ('Все подписчики (' + social.followersList.length + ')');
    const onlineCount = baseList.filter(function (u) { return u.online; }).length;

    ws.innerHTML =
      '<div class="lt-soc-shell">' +
        '<div class="lt-soc-topbar">' +
          '<div class="lt-soc-tabs">' +
            '<button class="lt-soc-tab ' + (st.subFilter === 'all' ? 'is-active' : '') + '" onclick="window._ltSocialState.subFilter=\'all\'; window._ltSocialState.page=0; render();">' + firstTabLabel + '</button>' +
            '<button class="lt-soc-tab ' + (st.subFilter === 'online' ? 'is-active' : '') + '" onclick="window._ltSocialState.subFilter=\'online\'; window._ltSocialState.page=0; render();">Онлайн (' + onlineCount + ')</button>' +
            '<button class="lt-soc-tab is-req ' + (st.subFilter === 'requests' ? 'is-active' : '') + '" onclick="window._ltSocialState.subFilter=\'requests\'; window._ltSocialState.page=0; render();">Заявки в друзья (' + requestsList.length + ')</button>' +
          '</div>' +
          '<button class="lt-soc-close-btn" onclick="openUserProfile(\'self\')" title="Закрыть и вернуться в профиль">✕</button>' +
        '</div>' +

        '<div class="lt-soc-body">' +
          '<div class="lt-soc-left">' +
            '<div class="lt-soc-rows">' +
              (pageItems.length ? pageItems.map(function (u) {
                const alreadyFriend = friendsList.some(function (f) { return f.id === u.id; });
                let actionButtons = '';

                if (st.subFilter === 'requests') {
                  actionButtons =
                    '<button class="btn-primary" style="padding:4px 10px; font-size:0.76rem;" onclick="ltSocialAcceptRequest(\'' + u.id + '\')">Принять</button>' +
                    '<button class="btn-secondary" style="padding:4px 9px; font-size:0.76rem;" onclick="ltSocialDeclineRequest(\'' + u.id + '\')">Отклонить</button>';
                } else if (isFriendsMode) {
                  actionButtons =
                    '<button class="btn-secondary" style="padding:4px 10px; font-size:0.76rem;" onclick="alert(\'Чат с ' + u.name.replace(/'/g, "\\'") + ' открыт в разделе Сообщения\')">Написать</button>' +
                    '<button class="btn-secondary" style="padding:4px 9px; font-size:0.76rem; color:#ff8787;" onclick="ltSocialRemoveFriend(\'' + u.id + '\')">Удалить</button>';
                } else {
                  actionButtons = alreadyFriend
                    ? '<span style="font-size:0.76rem; color:#9ea4b0; padding:4px 8px; border:1px solid rgba(255,255,255,0.12);">В друзьях</span>'
                    : '<button class="btn-primary" style="padding:4px 10px; font-size:0.76rem;" onclick="ltSocialAddFollowerToFriends(\'' + u.id + '\')">Добавить в друзья</button>';
                }

                return '<div class="lt-soc-row">' +
                  '<div class="lt-soc-user">' +
                    '<div class="lt-mini-ava" style="position:relative;">' + u.name.at(0) +
                      (u.online ? '<span class="lt-online-dot" title="Онлайн"></span>' : '') +
                    '</div>' +
                    '<div style="min-width:0;">' +
                      '<div style="color:#fff; font-weight:600; font-size:0.9rem;">' + u.name + ' <span style="color:#f87171; font-size:0.78rem; font-weight:400;">' + (u.handle || '') + '</span></div>' +
                      '<div style="color:#9ea4b0; font-size:0.78rem;">' + (u.lang || '') + '</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="lt-soc-row-actions">' + actionButtons + '</div>' +
                '</div>';
              }).join('') : '<div style="padding:24px; text-align:center; color:#9ea4b0; font-size:0.88rem;">В этом списке пока никого нет.</div>') +
            '</div>' +

            '<div class="lt-soc-pager">' +
              '<button class="lt-alb-arrow-btn" ' + (st.page <= 0 ? 'disabled' : '') + ' onclick="window._ltSocialState.page--; render();">«</button>' +
              '<span style="font-size:0.8rem; color:#9ea4b0;">Страница ' + (st.page + 1) + ' из ' + totalPages + '</span>' +
              '<button class="lt-alb-arrow-btn" ' + (st.page >= totalPages - 1 ? 'disabled' : '') + ' onclick="window._ltSocialState.page++; render();">»</button>' +
            '</div>' +
          '</div>' +

          '<div class="lt-soc-right">' +
            '<div class="lt-soc-sug-box">' +
              '<div class="lt-prof-card-title">Возможные друзья</div>' +
              '<div style="display:flex; flex-direction:column; gap:8px;">' +
                (shownSuggested.length ? shownSuggested.map(function (sf) {
                  return '<div class="lt-soc-sug-item">' +
                    '<div class="lt-mini-ava">' + sf.name.at(0) + '</div>' +
                    '<div style="flex:1; min-width:0;">' +
                      '<div style="color:#fff; font-weight:600; font-size:0.84rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + sf.name + '</div>' +
                      '<div style="color:#9ea4b0; font-size:0.74rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + sf.lang + '</div>' +
                    '</div>' +
                    '<button class="btn-secondary" style="padding:3px 8px; font-size:0.74rem;" onclick="ltSocialAddSuggested(\'' + sf.id + '\')">+ Добавить</button>' +
                  '</div>';
                }).join('') : '<div style="color:#9ea4b0; font-size:0.8rem;">Новых рекомендаций пока нет</div>') +
              '</div>' +
            '</div>' +
            (allSuggested.length > 4 ? (
              '<div style="display:flex; justify-content:flex-end; margin-top:8px;">' +
                '<button class="lt-soc-expand-btn" onclick="window._ltSocialState.suggestedExpanded = !window._ltSocialState.suggestedExpanded; render();">' +
                  (st.suggestedExpanded ? 'Свернуть' : 'Развернуть') +
                '</button>' +
              '</div>'
            ) : '') +
          '</div>' +
        '</div>' +
      '</div>';
  };

  /* === СВОДНАЯ СТРАНИЦА ИЗУЧЕННЫХ СЛОВ (КОРЕЙСКИЙ + АНГЛИЙСКИЙ) === */
  window.renderLearnedSummaryView = function (ws) {
    const st = window._ltSocialState;
        let allLearned = [];
    const learnedSet = new Set();
    try {
      if (typeof learnedIds !== 'undefined' && Array.isArray(learnedIds)) {
        learnedIds.forEach(function (id) { learnedSet.add(String(id)); });
      }
      Object.keys(localStorage).forEach(function (k) {
        if (k.toLowerCase().includes('learned')) {
          const parsed = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(parsed)) parsed.forEach(function (id) { learnedSet.add(String(id)); });
        }
      });
    } catch (e) {}

    try {
      let pool = [];
      if (typeof getAllWords === 'function') {
        pool = getAllWords();
      } else if (typeof WORDS !== 'undefined' && Array.isArray(WORDS)) {
        pool = WORDS;
      }
      pool.forEach(function (w) {
        if (w && learnedSet.has(String(w.id))) {
          const langCode = w.lang || (/[가-힣]/.test(w.word || '') ? 'ko' : 'en');
          allLearned.push({
            id: w.id,
            lang: langCode,
            word: w.word,
            translit: w.translit || w.roman || '',
            meaning: w.meaning || w.translation || ''
          });
        }
      });
    } catch (e) {}

    const koCount = allLearned.filter(function (x) { return x.lang === 'ko'; }).length;
    const enCount = allLearned.filter(function (x) { return x.lang === 'en'; }).length;
    const shown = allLearned.filter(function (x) {
      return st.learnedLangFilter === 'all' || x.lang === st.learnedLangFilter;
    });

    ws.innerHTML =
      '<div class="lt-soc-shell">' +
        '<div class="lt-soc-topbar">' +
          '<div class="lt-soc-tabs">' +
            '<button class="lt-soc-tab ' + (st.learnedLangFilter === 'all' ? 'is-active' : '') + '" onclick="window._ltSocialState.learnedLangFilter=\'all\'; render();">Все изученные (' + allLearned.length + ')</button>' +
            '<button class="lt-soc-tab ' + (st.learnedLangFilter === 'ko' ? 'is-active' : '') + '" onclick="window._ltSocialState.learnedLangFilter=\'ko\'; render();">Корейский (' + koCount + ')</button>' +
            '<button class="lt-soc-tab ' + (st.learnedLangFilter === 'en' ? 'is-active' : '') + '" onclick="window._ltSocialState.learnedLangFilter=\'en\'; render();">Английский (' + enCount + ')</button>' +
          '</div>' +
          '<button class="lt-soc-close-btn" onclick="openUserProfile(\'self\')" title="Закрыть и вернуться в профиль">✕</button>' +
        '</div>' +

               '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:10px; flex-wrap:wrap;">' +
          '<div style="font-size:0.86rem; color:#9ea4b0;">Объединённый прогресс по всем курсам платформы</div>' +
          '<div style="display:flex; gap:8px;">' +
            '<button class="btn-secondary" style="padding:5px 11px; font-size:0.78rem;" onclick="if(typeof setLang===\'function\') setLang(\'ko\'); switchTab(\'cards\');">Курс корейского →</button>' +
            '<button class="btn-secondary" style="padding:5px 11px; font-size:0.78rem;" onclick="if(typeof setLang===\'function\') setLang(\'en\'); switchTab(\'cards\');">Курс английского →</button>' +
          '</div>' +
        '</div>' +

        (shown.length ? (
          '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(270px, 1fr)); gap:10px;">' +
            shown.map(function (item) {
              return '<div style="padding:10px 12px; background:rgba(10,11,15,0.82); border:1px solid rgba(255,255,255,0.12); border-left:2px solid #dc2626; display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
                '<div>' +
                  '<div style="font-weight:700; color:#fff; font-size:0.95rem;">' + item.word + '</div>' +
                  (item.translit ? '<div style="color:#f87171; font-size:0.78rem;">' + item.translit + '</div>' : '') +
                  '<div style="color:#cbd5e1; font-size:0.84rem; margin-top:2px;">' + item.meaning + '</div>' +
                '</div>' +
                '<span class="tag" style="font-size:0.7rem; padding:2px 6px;">' + item.lang.toUpperCase() + '</span>' +
              '</div>';
            }).join('') +
          '</div>'
        ) : '<div style="padding:28px; text-align:center; color:#9ea4b0; font-size:0.9rem;">В выбранной категории пока нет отмеченных изученных слов. Отмечайте слова кнопкой «Знаю» в карточках!</div>') +
      '</div>';
  };

   /* === ПОДКЛЮЧЕНИЕ В RENDER И ПРИВЯЗКА СЧЁТЧИКОВ ПРОФИЛЯ === */
  function syncProfileSocialLinks() {
    if (typeof curTab === 'undefined' || curTab !== 'profile') return;

    const leftCards = document.querySelectorAll('.lt-prof-col-left .lt-prof-card');
    leftCards.forEach(function (card) {
      const title = card.querySelector('.lt-prof-card-title');
      if (title && title.textContent.trim().startsWith('Друзья')) {
        title.style.cursor = 'pointer';
        title.title = 'Открыть страницу друзей';
        title.onclick = function () { window.openSocialListPage('friends', 'all'); };
      }
    });

        const allTitles = document.querySelectorAll('.lt-profile-shell .lt-prof-card-title');
    allTitles.forEach(function (title) {
      const txt = title.textContent.trim();
      if (txt.startsWith('Возможные друзья')) {
        title.style.cursor = 'pointer';
        title.title = 'Открыть все рекомендации друзей';
        title.onclick = function () { window.openSuggestedFriendsPage(); };
      } else if (txt.startsWith('Сообщества')) {
        title.style.cursor = 'pointer';
        title.title = 'Открыть каталог сообществ';
        title.onclick = function () { window.openCommunitiesPage('all'); };
      }
    });
    const stats = document.querySelectorAll('.lt-prof-stats-row .lt-prof-stat');
    if (stats.length >= 4) {
      stats.item(1).onclick = function () { window.openSocialListPage('friends', 'all'); };
      stats.item(2).onclick = function () { window.openSocialListPage('followers', 'all'); };
      stats.item(3).onclick = function () { window.openLearnedSummaryPage(); };
    }
  }

  const _prevRenderBeforeSocial = window.render;
  window.render = function () {
    if (typeof curTab !== 'undefined' && curTab === 'social_list') {
      document.body.classList.add('is-home');
      const ws = document.getElementById('workspace');
      if (ws) { window.renderSocialListView(ws); return; }
    }
    if (typeof curTab !== 'undefined' && curTab === 'learned_summary') {
      document.body.classList.add('is-home');
      const ws = document.getElementById('workspace');
      if (ws) { window.renderLearnedSummaryView(ws); return; }
    }
    if (typeof curTab !== 'undefined' && curTab === 'suggested_friends') {
      document.body.classList.add('is-home');
      const ws = document.getElementById('workspace');
      if (ws) { window.renderSuggestedFriendsPage(ws); return; }
    }
    if (typeof curTab !== 'undefined' && curTab === 'communities_hub') {
      document.body.classList.add('is-home');
      const ws = document.getElementById('workspace');
      if (ws) { window.renderCommunitiesPage(ws); return; }
    }
    const res = typeof _prevRenderBeforeSocial === 'function' ? _prevRenderBeforeSocial() : undefined;
    syncProfileSocialLinks();
    return res;
  };
})();
/* === СТРАНИЦЫ: «ВОЗМОЖНЫЕ ДРУЗЬЯ» И «СООБЩЕСТВА ПО ИНТЕРЕСАМ» === */
(function () {
  const COMM_KEY = 'lt_user_communities_v1';

  function getCommunitiesData() {
    try {
      const r = localStorage.getItem(COMM_KEY);
      if (r) return JSON.parse(r);
    } catch (e) {}
    return [
      { id: 'c_topik', title: 'Подготовка к TOPIK I–II', tag: 'Экзамены', members: 1420, joined: true, desc: 'Разбор пробных вариантов, лексика 1–6 гыпа и еженедельные мини-тесты.' },
      { id: 'c_hanja', title: 'Корни слов и Ханча', tag: 'Лексика', members: 860, joined: true, desc: 'Изучаем китайско-корейские корни для быстрого запоминания десятков однокоренных слов.' },
      { id: 'c_speaking', title: 'Разговорный клуб KO / EN', tag: 'Практика', members: 2190, joined: true, desc: 'Поиск напарников для голосовых созвонов, переписки и языкового обмена.' },
      { id: 'c_dorama', title: 'Аудирование по дорамам и подкастам', tag: 'Аудирование', members: 1745, joined: false, desc: 'Разбор живой разговорной речи, сленга и устойчивых фраз из корейских сериалов.' },
      { id: 'c_en_c1', title: 'English Speaking & Idioms B2–C1', tag: 'Английский', members: 1310, joined: false, desc: 'Ежедневная практика продвинутой лексики, фразовых глаголов и дебатов.' },
      { id: 'c_grammar', title: 'Грамматика корейского с нуля', tag: 'Грамматика', members: 2540, joined: false, desc: 'Понятные схемы частиц, окончаний и вежливых стилей речи для начинающих.' }
    ];
  }

  function saveCommunitiesData(list) {
    try { localStorage.setItem(COMM_KEY, JSON.stringify(list)); } catch (e) {}
  }

  window._ltHubState = {
    sugFilter: 'all', // 'all' | 'native'
    sugQuery: '',
    commFilter: 'all', // 'all' | 'mine'
    creatingComm: false
  };

  window.openSuggestedFriendsPage = function () {
    window._ltHubState.sugFilter = 'all';
    window._ltHubState.sugQuery = '';
    if (typeof switchTab === 'function') switchTab('suggested_friends');
    else { window.curTab = 'suggested_friends'; if (typeof render === 'function') render(); }
  };

  window.openCommunitiesPage = function (filter) {
    window._ltHubState.commFilter = filter || 'all';
    window._ltHubState.creatingComm = false;
    if (typeof switchTab === 'function') switchTab('communities_hub');
    else { window.curTab = 'communities_hub'; if (typeof render === 'function') render(); }
  };

  window.ltToggleCommunityMembership = function (commId) {
    const list = getCommunitiesData();
    const item = list.find(function (c) { return c.id === commId; });
    if (!item) return;
    item.joined = !item.joined;
    item.members += item.joined ? 1 : -1;
    saveCommunitiesData(list);

    // Синхронизируем список сообществ в профиле
    try {
      const pRaw = localStorage.getItem('lt_user_profile_v1');
      if (pRaw) {
        const p = JSON.parse(pRaw);
        p.communities = list.filter(function (c) { return c.joined; }).map(function (c) {
          return { id: c.id, title: c.title, members: c.members + ' участников' };
        });
        localStorage.setItem('lt_user_profile_v1', JSON.stringify(p));
      }
    } catch (e) {}

    if (typeof render === 'function') render();
  };

  window.ltCreateCommunityItem = function () {
    const tInp = document.getElementById('ltNewCommTitle');
    const tagInp = document.getElementById('ltNewCommTag');
    const dInp = document.getElementById('ltNewCommDesc');
    if (!tInp || !tInp.value.trim()) return;
    const list = getCommunitiesData();
    list.unshift({
      id: 'c_' + Date.now(),
      title: tInp.value.trim(),
      tag: (tagInp && tagInp.value.trim()) ? tagInp.value.trim() : 'Клуб',
      members: 1,
      joined: true,
      desc: (dInp && dInp.value.trim()) ? dInp.value.trim() : 'Новое учебное сообщество на платформе Lingvo Trainer.'
    });
    saveCommunitiesData(list);
    window._ltHubState.creatingComm = false;
    if (typeof render === 'function') render();
  };

  window.renderSuggestedFriendsPage = function (ws) {
    const st = window._ltHubState;
    let pool = [];
    try {
      const p = JSON.parse(localStorage.getItem('lt_user_profile_v1') || '{}');
      const s = JSON.parse(localStorage.getItem('lt_social_lists_v1') || '{}');
      pool = (Array.isArray(p.suggestedFriends) ? p.suggestedFriends : []).concat(Array.isArray(s.extraSuggested) ? s.extraSuggested : []);
    } catch (e) {}

    const q = (st.sugQuery || '').toLowerCase().trim();
    const filtered = pool.filter(function (u) {
      if (st.sugFilter === 'native' && !(u.lang || '').toLowerCase().includes('носитель')) return false;
      if (q && !(u.name || '').toLowerCase().includes(q) && !(u.handle || '').toLowerCase().includes(q)) return false;
      return true;
    });

    ws.innerHTML =
      '<div class="lt-soc-shell">' +
        '<div class="lt-soc-topbar">' +
          '<div class="lt-soc-tabs">' +
            '<button class="lt-soc-tab ' + (st.sugFilter === 'all' ? 'is-active' : '') + '" onclick="window._ltHubState.sugFilter=\'all\'; render();">Возможные друзья (' + pool.length + ')</button>' +
            '<button class="lt-soc-tab ' + (st.sugFilter === 'native' ? 'is-active' : '') + '" onclick="window._ltHubState.sugFilter=\'native\'; render();">Носители языка</button>' +
          '</div>' +
          '<button class="lt-soc-close-btn" onclick="openUserProfile(\'self\')" title="Закрыть и вернуться в профиль">✕</button>' +
        '</div>' +

        '<div style="margin-bottom:14px;">' +
          '<input class="input-dark" placeholder="Поиск участников по имени или @нику..." value="' + (st.sugQuery || '') + '" oninput="window._ltHubState.sugQuery=this.value; render();" />' +
        '</div>' +

        (filtered.length ? (
          '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:12px;">' +
            filtered.map(function (u) {
              return '<div style="padding:12px 14px; background:rgba(10,11,15,0.82); border:1px solid rgba(255,255,255,0.14); display:flex; justify-content:space-between; align-items:center; gap:10px;">' +
                '<div style="display:flex; align-items:center; gap:10px; min-width:0;">' +
                  '<div class="lt-mini-ava" style="margin:0;">' + u.name.at(0) + '</div>' +
                  '<div style="min-width:0;">' +
                    '<div style="color:#fff; font-weight:700; font-size:0.92rem;">' + u.name + '</div>' +
                    '<div style="color:#f87171; font-size:0.76rem;">' + (u.handle || '') + '</div>' +
                    '<div style="color:#9ea4b0; font-size:0.78rem; margin-top:2px;">' + (u.lang || '') + '</div>' +
                  '</div>' +
                '</div>' +
                '<button class="btn-primary" style="padding:5px 11px; font-size:0.78rem;" onclick="ltSocialAddSuggested(\'' + u.id + '\')">+ Добавить</button>' +
              '</div>';
            }).join('') +
          '</div>'
        ) : '<div style="padding:24px; text-align:center; color:#9ea4b0; font-size:0.88rem;">Новых рекомендаций по выбранному фильтру пока нет.</div>') +
      '</div>';
  };

  window.renderCommunitiesPage = function (ws) {
    const st = window._ltHubState;
    const list = getCommunitiesData();
    const myCount = list.filter(function (c) { return c.joined; }).length;
    const shown = list.filter(function (c) { return st.commFilter === 'all' || c.joined; });

    ws.innerHTML =
      '<div class="lt-soc-shell">' +
        '<div class="lt-soc-topbar">' +
          '<div class="lt-soc-tabs">' +
            '<button class="lt-soc-tab ' + (st.commFilter === 'all' ? 'is-active' : '') + '" onclick="window._ltHubState.commFilter=\'all\'; render();">Все сообщества (' + list.length + ')</button>' +
            '<button class="lt-soc-tab ' + (st.commFilter === 'mine' ? 'is-active' : '') + '" onclick="window._ltHubState.commFilter=\'mine\'; render();">Мои подписки (' + myCount + ')</button>' +
            '<button class="btn-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="window._ltHubState.creatingComm = !window._ltHubState.creatingComm; render();">+ Создать сообщество</button>' +
          '</div>' +
          '<button class="lt-soc-close-btn" onclick="openUserProfile(\'self\')" title="Закрыть и вернуться в профиль">✕</button>' +
        '</div>' +

        (st.creatingComm ? (
          '<div style="padding:12px 14px; background:rgba(10,11,15,0.85); border:1px solid rgba(220,38,38,0.45); margin-bottom:14px; display:flex; gap:8px; flex-wrap:wrap;">' +
            '<input id="ltNewCommTitle" class="input-dark" placeholder="Название сообщества" style="flex:1; min-width:180px;" />' +
            '<input id="ltNewCommTag" class="input-dark" placeholder="Тематика (например: TOPIK)" style="width:180px;" />' +
            '<input id="ltNewCommDesc" class="input-dark" placeholder="Краткое описание клуба..." style="flex:2; min-width:220px;" />' +
            '<button class="btn-primary" onclick="ltCreateCommunityItem()">Создать</button>' +
          '</div>'
        ) : '') +

        '        '<div style="display:flex; flex-direction:column; gap:10px; width:100%;">' +
          shown.map(function (c) {
            return '<div style="padding:14px 16px; background:rgba(10,11,15,0.85); border:1px solid rgba(255,255,255,0.14); border-left:3px solid #dc2626; display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap;">' +
              '<div style="flex:1; min-width:260px;">' +
                '<div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; flex-wrap:wrap;">' +
                  '<span style="color:#fff; font-weight:700; font-size:0.98rem;">' + c.title + '</span>' +
                  '<span class="tag" style="font-size:0.7rem; padding:2px 6px;">' + c.tag + '</span>' +
                  '<span style="color:#9ea4b0; font-size:0.78rem;">• ' + c.members + ' участников</span>' +
                '</div>' +
                '<div style="color:#b8bec9; font-size:0.84rem; line-height:1.45;">' + c.desc + '</div>' +
              '</div>' +
              '<div style="flex-shrink:0;">' +
                '<button class="' + (c.joined ? 'btn-secondary' : 'btn-primary') + '" style="padding:6px 14px; font-size:0.8rem;" onclick="ltToggleCommunityMembership(\'' + c.id + '\')">' +
                  (c.joined ? 'Вы участник ✓' : 'Вступить') +
                '</button>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  };
})();
/* === УНИВЕРСАЛЬНЫЙ ПЕРЕХВАТ КЛИКОВ ПО СЧЁТЧИКАМ И ЗАГОЛОВКАМ ПРОФИЛЯ === */
document.addEventListener('click', function (e) {
  if (typeof curTab === 'undefined' || curTab !== 'profile') return;

  // 1. Клики по кнопкам-счётчикам под обложкой
  const statBtn = e.target.closest('.lt-prof-stat');
  if (statBtn) {
    const lbl = statBtn.querySelector('.lt-prof-stat-lbl');
    const txt = lbl ? lbl.textContent.trim().toLowerCase() : '';
    if (txt.includes('друз')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openSocialListPage === 'function') window.openSocialListPage('friends', 'all');
      return;
    }
    if (txt.includes('подписч')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openSocialListPage === 'function') window.openSocialListPage('followers', 'all');
      return;
    }
    if (txt.includes('слов')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openLearnedSummaryPage === 'function') window.openLearnedSummaryPage();
      return;
    }
  }

  // 2. Клики по заголовкам карточек профиля: «Друзья», «Возможные друзья», «Сообщества по интересам»
  const cardTitle = e.target.closest('.lt-prof-card-title');
  if (cardTitle) {
    const t = cardTitle.textContent.trim();
    if (t.startsWith('Возможные друзья')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openSuggestedFriendsPage === 'function') window.openSuggestedFriendsPage();
      return;
    }
    if (t.startsWith('Сообщества')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openCommunitiesPage === 'function') window.openCommunitiesPage('all');
      return;
    }
    if (t.startsWith('Друзья')) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openSocialListPage === 'function') window.openSocialListPage('friends', 'all');
      return;
    }
  }
}, true);
