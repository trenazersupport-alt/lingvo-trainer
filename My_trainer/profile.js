/* === МОДУЛЬ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ (profile.js) === */
(function () {
  const PROFILE_STORAGE_KEY = 'lt_user_profile_v1';

  function getDefaultProfile() {
    const emailEl = document.getElementById('userEmailLabel');
    const rawEmail = emailEl ? emailEl.textContent.trim() : '';
    const baseNick = rawEmail && rawEmail.includes('@') ? rawEmail.split('@').at(0) : 'ekstshafor';

    return {
      nick: baseNick,
      handle: '@' + baseNick.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      status: 'Изучаю корейский и английский каждый день',
      birthday: '14 мая 1998',
      showBirthday: true,
      city: 'Владимир, Россия',
      showCity: true,
      avatar: '',
      cover: '',
      followers: 24,
      streakDays: 12,
      friends: [
        { id: 'u_mina', name: 'Мина Пак', handle: '@minapak', lang: 'Корейский B1', isFriend: true },
        { id: 'u_alex', name: 'Алексей К.', handle: '@alex_kr', lang: 'Корейский A2', isFriend: true },
        { id: 'u_soyeon', name: 'Соён Ким', handle: '@soyeon_seoul', lang: 'Носитель KO', isFriend: true },
        { id: 'u_kate', name: 'Екатерина В.', handle: '@kate_en', lang: 'Английский B2', isFriend: true }
      ],
      suggestedFriends: [
        { id: 'u_jihoon', name: 'Джихун Ли', handle: '@jihoon_study', lang: 'Носитель KO • Ищет обмен' },
        { id: 'u_daria', name: 'Дарья С.', handle: '@daria_hangul', lang: 'Корейский A1 • TOPIK I' },
        { id: 'u_mark', name: 'Марк Т.', handle: '@mark_vocab', lang: 'Английский C1' }
      ],
      communities: [
        { id: 'c_topik', title: 'Подготовка к TOPIK I–II', members: '1 420 участников' },
        { id: 'c_hanja', title: 'Корни слов и Ханча', members: '860 участников' },
        { id: 'c_speaking', title: 'Разговорный клуб KO / EN', members: '2 190 участников' }
      ],
      photos: [
        { id: 'p1', title: 'Конспект по ханче', color: 'linear-gradient(135deg,#2a1215,#12131a)', hidden: false },
        { id: 'p2', title: 'Карточки TOPIK', color: 'linear-gradient(135deg,#1b1e2b,#2d1519)', hidden: false },
        { id: 'p3', title: 'Вечерняя практика', color: 'linear-gradient(135deg,#241418,#161822)', hidden: false },
        { id: 'p4', title: 'Словарь глаголов', color: 'linear-gradient(135deg,#191c26,#331418)', hidden: false }
      ],
      notes: [
        { id: 'n1', title: 'Разница между 은/는 и 이/가', text: '은/는 выделяет тему или противопоставление, 이/가 — новое действие или субъект.' }
      ],
      savedLinks: [
        { id: 'l1', title: 'Словарь Naver Korean-Russian', url: 'https://naver.com' }
      ],
      posts: [
        {
          id: 'post_1',
          authorName: baseNick,
          time: 'Сегодня в 10:15',
          text: 'Закрепил сегодня 25 новых слов из раздела «Человек и общение» и повторил базовые ключи ханчи.',
          wordTag: '사랑 (саран) — любовь'
        }
      ]
    };
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return getDefaultProfile();
      return Object.assign(getDefaultProfile(), JSON.parse(raw));
    } catch (e) {
      return getDefaultProfile();
    }
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  window._ltProfileState = {
    viewMode: 'self',
    guestFriendStatus: 'none',
    activeSubPanel: null,
    editing: false,
    addingPost: false
  };
  window.openUserProfile = function (mode) {
    if (mode) window._ltProfileState.viewMode = mode;
    window._ltProfileState.activeSubPanel = null;
    if (typeof closeModal === 'function') closeModal('accountModal');
    if (typeof switchTab === 'function') {
      switchTab('profile');
    } else {
      window.curTab = 'profile';
      if (typeof render === 'function') render();
    }
  };

  window.toggleProfileSubMenu = function (panel) {
    const menu = document.getElementById('ltProfMoreDropdown');
    if (panel) {
      window._ltProfileState.activeSubPanel =
        window._ltProfileState.activeSubPanel === panel ? null : panel;
      if (menu) menu.classList.remove('open');
      render();
      return;
    }
    if (menu) menu.classList.toggle('open');
  };

  window.toggleGuestActionMenu = function () {
    const m = document.getElementById('ltGuestActionsDropdown');
    if (m) m.classList.toggle('open');
  };

  window.handleGuestFriendAction = function (action) {
    const st = window._ltProfileState;
    if (action === 'add') {
      st.guestFriendStatus = 'friend';
    } else if (action === 'remove') {
      st.guestFriendStatus = 'none';
    } else if (action === 'block') {
      st.guestFriendStatus = 'blocked';
    } else if (action === 'copy') {
      const p = loadProfile();
      const link = window.location.origin + window.location.pathname + '#user=' + encodeURIComponent(p.handle);
      if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
      alert('Ссылка на профиль скопирована: ' + link);
    } else if (action === 'report') {
      if (typeof openReportModal === 'function') openReportModal('Жалоба на профиль пользователя');
    }
    render();
  };

  window.publishProfilePost = function (withWord) {
    const p = loadProfile();
    const textEl = document.getElementById('ltNewPostText');
    const text = textEl ? textEl.value.trim() : '';
    if (!text && !withWord) {
      alert('Введите текст записи.');
      return;
    }
    let wordTag = '';
    if (withWord && typeof getAllWords === 'function') {
      const all = getAllWords();
      if (all.length) {
        const rnd = all.at(Math.floor(Math.random() * all.length));
        wordTag = rnd.word + (rnd.translit ? ' (' + rnd.translit + ')' : '') + ' — ' + rnd.meaning;
      }
    }
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    p.posts.unshift({
      id: 'post_' + Date.now(),
      authorName: p.nick,
      time: 'Сегодня в ' + hh + ':' + mm,
      text: text || 'Закрепляю слово дня в личной ленте:',
      wordTag: wordTag
    });
    saveProfile(p);
    window._ltProfileState.addingPost = false;
    render();
  };

  window.deleteProfilePost = function (postId) {
    const p = loadProfile();
    p.posts = p.posts.filter(item => item.id !== postId);
    saveProfile(p);
    render();
  };

  window.togglePhotoVisibility = function (photoId) {
    const p = loadProfile();
    const ph = p.photos.find(x => x.id === photoId);
    if (ph) ph.hidden = !ph.hidden;
    saveProfile(p);
    render();
  };

  window.saveProfileSettings = function () {
    const p = loadProfile();
    const nickEl = document.getElementById('ltEditNick');
    const statusEl = document.getElementById('ltEditStatus');
    const bdayEl = document.getElementById('ltEditBday');
    const cityEl = document.getElementById('ltEditCity');
    const showBdayEl = document.getElementById('ltEditShowBday');
    const showCityEl = document.getElementById('ltEditShowCity');
    const avatarEl = document.getElementById('ltEditAvatarUrl');
    const coverEl = document.getElementById('ltEditCoverUrl');

    if (nickEl && nickEl.value.trim()) p.nick = nickEl.value.trim();
    if (statusEl) p.status = statusEl.value.trim();
    if (bdayEl) p.birthday = bdayEl.value.trim();
    if (cityEl) p.city = cityEl.value.trim();
    if (showBdayEl) p.showBirthday = showBdayEl.checked;
    if (showCityEl) p.showCity = showCityEl.checked;
    if (avatarEl) p.avatar = avatarEl.value.trim();
    if (coverEl) p.cover = coverEl.value.trim();

    const accBtn = document.getElementById('topAccountBtn');
    if (accBtn) accBtn.textContent = p.nick;

    saveProfile(p);
    window._ltProfileState.editing = false;
    window._ltProfileState.activeSubPanel = null;
    render();
  };

  window.addProfileNote = function () {
    const t = document.getElementById('ltNewNoteTitle');
    const b = document.getElementById('ltNewNoteBody');
    if (!t || !b || !t.value.trim() || !b.value.trim()) return;
    const p = loadProfile();
    p.notes.unshift({ id: 'n_' + Date.now(), title: t.value.trim(), text: b.value.trim() });
    saveProfile(p);
    render();
  };
  window.renderUserProfileView = function (ws) {
    const p = loadProfile();
    const st = window._ltProfileState;
    const isSelf = st.viewMode === 'self';
    const learnedCount = typeof learnedIds !== 'undefined' ? learnedIds.length : 0;
    const visiblePhotos = isSelf ? p.photos : p.photos.filter(ph => !ph.hidden);

    const coverStyle = p.cover
      ? `background-image:url('${p.cover}'); background-size:cover; background-position:center;`
      : `background:linear-gradient(120deg, #181a22 0%, #2d1216 55%, #121318 100%);`;

    const avatarHtml = p.avatar
      ? `<img src="${p.avatar}" alt="${p.nick}" style="width:100%; height:100%; object-fit:cover;" />`
      : `<div class="lt-prof-avatar-placeholder">${(p.nick || 'U').at(0).toUpperCase()}</div>`;

    let rightActionHtml = '';
    if (isSelf) {
      rightActionHtml = `
        <button class="btn-primary lt-prof-action-btn" onclick="window._ltProfileState.editing = !window._ltProfileState.editing; render();">
          ${st.editing ? 'Закрыть редактор' : 'Редактировать профиль'}
        </button>
      `;
    } else if (st.guestFriendStatus === 'none') {
      rightActionHtml = `
        <button class="btn-primary lt-prof-action-btn" onclick="handleGuestFriendAction('add')">Добавить в друзья</button>
      `;
    } else {
      const label = st.guestFriendStatus === 'blocked' ? 'Заблокирован ▾' : 'В друзьях ▾';
      rightActionHtml = `
        <div class="lt-prof-dropdown-wrap">
          <button class="btn-secondary lt-prof-action-btn" onclick="toggleGuestActionMenu()">${label}</button>
          <div id="ltGuestActionsDropdown" class="lt-prof-dropdown-menu">
            ${st.guestFriendStatus === 'friend'
              ? `<button onclick="handleGuestFriendAction('remove')">Удалить из друзей</button>`
              : `<button onclick="handleGuestFriendAction('add')">Разблокировать и добавить</button>`}
            <button onclick="handleGuestFriendAction('block')">Заблокировать</button>
            <button onclick="handleGuestFriendAction('report')">Пожаловаться на профиль</button>
            <button onclick="handleGuestFriendAction('copy')">Скопировать ссылку профиля</button>
          </div>
        </div>
      `;
    }

    let subPanelHtml = '';
    if (st.activeSubPanel === 'notes') {
      subPanelHtml = `
        <div class="lt-prof-card" style="margin-bottom:12px;">
          <div class="lt-prof-card-title">Личные заметки и конспекты</div>
          ${isSelf ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            <input id="ltNewNoteTitle" class="input-dark" placeholder="Заголовок заметки" style="flex:1; min-width:180px;" />
            <input id="ltNewNoteBody" class="input-dark" placeholder="Текст правила или примера..." style="flex:2; min-width:220px;" />
            <button class="btn-primary" onclick="addProfileNote()">Сохранить</button>
          </div>` : ''}
          ${p.notes.map(n => `
            <div style="padding:8px 10px; background:rgba(10,11,15,0.75); border-left:2px solid #dc2626; margin-bottom:6px;">
              <div style="font-weight:700; color:#fff; font-size:0.9rem;">${n.title}</div>
              <div style="color:#b8bec9; font-size:0.84rem; margin-top:3px;">${n.text}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (st.activeSubPanel === 'links') {
      subPanelHtml = `
        <div class="lt-prof-card" style="margin-bottom:12px;">
          <div class="lt-prof-card-title">Сохранённые ссылки и материалы</div>
          ${p.savedLinks.map(l => `
            <div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.08); margin-bottom:6px;">
              <a href="${l.url}" target="_blank" style="color:#f87171; font-weight:600; text-decoration:none;">${l.title} ↗</a>
            </div>
          `).join('')}
        </div>
      `;
    } else if (st.activeSubPanel === 'media') {
      subPanelHtml = `
        <div class="lt-prof-card" style="margin-bottom:12px;">
          <div class="lt-prof-card-title">Видео и аудиоматериалы профиля</div>
          <div style="color:#9ea4b0; font-size:0.86rem;">Здесь отображаются сохранённые видеоразборы диалогов и аудиодорожки для аудирования.</div>
        </div>
      `;
    } else if (st.activeSubPanel === 'friends') {
      subPanelHtml = `
        <div class="lt-prof-card" style="margin-bottom:12px;">
          <div class="lt-prof-card-title">Все друзья (${p.friends.length})</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:8px;">
            ${p.friends.map(f => `
              <div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">
                <div class="lt-mini-ava">${f.name.at(0)}</div>
                <div>
                  <div style="color:#fff; font-weight:600; font-size:0.88rem;">${f.name}</div>
                  <div style="color:#9ea4b0; font-size:0.78rem;">${f.lang}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const editPanelHtml = (isSelf && st.editing) ? `
      <div class="lt-prof-card" style="margin-bottom:12px; border-color:rgba(220,38,38,0.45);">
        <div class="lt-prof-card-title">Редактирование профиля и приватности</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">Имя или ник</label>
            <input id="ltEditNick" class="input-dark" value="${p.nick}" />
          </div>
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">Статус профиля</label>
            <input id="ltEditStatus" class="input-dark" value="${p.status}" />
          </div>
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">Дата рождения</label>
            <input id="ltEditBday" class="input-dark" value="${p.birthday}" />
          </div>
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">Город / Страна</label>
            <input id="ltEditCity" class="input-dark" value="${p.city}" />
          </div>
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">URL фото профиля (необязательно)</label>
            <input id="ltEditAvatarUrl" class="input-dark" value="${p.avatar}" placeholder="https://..." />
          </div>
          <div>
            <label style="font-size:0.78rem; color:#9ea4b0;">URL шапки профиля (необязательно)</label>
            <input id="ltEditCoverUrl" class="input-dark" value="${p.cover}" placeholder="https://..." />
          </div>
        </div>
        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:10px; font-size:0.84rem; color:#d1d5db;">
          <label><input type="checkbox" id="ltEditShowBday" ${p.showBirthday ? 'checked' : ''} /> Показывать дату рождения</label>
          <label><input type="checkbox" id="ltEditShowCity" ${p.showCity ? 'checked' : ''} /> Показывать город и страну</label>
        </div>
        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-primary" onclick="saveProfileSettings()">Сохранить изменения</button>
          <button class="btn-secondary" onclick="window._ltProfileState.editing=false; render();">Отмена</button>
          <button class="btn-secondary" onclick="openModal('accountModal')">Вход / Резервная копия (.json)</button>
        </div>
      </div>
    ` : '';

    ws.innerHTML = `
      <div class="lt-profile-shell">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.8rem; color:#9ea4b0;">Личная страница пользователя</span>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.78rem; ${isSelf ? 'border-color:#dc2626; color:#fff;' : ''}" onclick="openUserProfile('self')">Мой вид</button>
            <button class="btn-secondary" style="padding:4px 10px; font-size:0.78rem; ${!isSelf ? 'border-color:#dc2626; color:#fff;' : ''}" onclick="openUserProfile('guest')">Вид глазами гостя</button>
          </div>
        </div>

        <div class="lt-prof-header-box">
          <div class="lt-prof-cover" style="${coverStyle}">
            <div class="lt-prof-cover-badge">LINGVO TRAINER ID</div>
          </div>

          <div class="lt-prof-bar">
            <div class="lt-prof-avatar-box">${avatarHtml}</div>

            <div class="lt-prof-stats-row">
              <div class="lt-prof-stat">
                <div class="lt-prof-stat-val">${p.posts.length}</div>
                <div class="lt-prof-stat-lbl">записей</div>
              </div>
              <div class="lt-prof-stat" onclick="toggleProfileSubMenu('friends')" style="cursor:pointer;">
                <div class="lt-prof-stat-val">${p.friends.length}</div>
                <div class="lt-prof-stat-lbl">друзей</div>
              </div>
              <div class="lt-prof-stat">
                <div class="lt-prof-stat-val">${p.followers}</div>
                <div class="lt-prof-stat-lbl">подписчиков</div>
              </div>
              <div class="lt-prof-stat">
                <div class="lt-prof-stat-val">${learnedCount}</div>
                <div class="lt-prof-stat-lbl">слов изучено</div>
              </div>
              <div class="lt-prof-stat">
                <div class="lt-prof-stat-val">KO / EN</div>
                <div class="lt-prof-stat-lbl">языки</div>
              </div>
              <div class="lt-prof-stat">
                <div class="lt-prof-stat-val">#14 • ${p.streakDays}д</div>
                <div class="lt-prof-stat-lbl">рейтинг</div>
              </div>
                       </div>

            <div class="lt-prof-actions-row">
              <div class="lt-prof-dropdown-wrap">
                <button class="btn-secondary lt-prof-action-btn" onclick="toggleProfileSubMenu()">Разделы ▾</button>
                <div id="ltProfMoreDropdown" class="lt-prof-dropdown-menu">
                  <button onclick="toggleProfileSubMenu('notes')">Заметки и конспекты</button>
                  <button onclick="toggleProfileSubMenu('links')">Сохранённые ссылки</button>
                  <button onclick="toggleProfileSubMenu('media')">Видео и музыка</button>
                  <button onclick="toggleProfileSubMenu('friends')">Список друзей</button>
                  ` + (isSelf ? '<button onclick="window._ltProfileState.editing=true; toggleProfileSubMenu();">Настройки приватности</button>' : '') + `
                </div>
              </div>
              ` + rightActionHtml + `
            </div>
          </div>
        </div>

        ` + editPanelHtml + `
        ` + subPanelHtml + `

        <div class="lt-prof-grid">
          <div class="lt-prof-col-left">
            <div class="lt-prof-card">
              <div class="lt-prof-name">` + p.nick + `</div>
              <div class="lt-prof-handle">` + p.handle + `</div>
              ` + (p.status ? '<div class="lt-prof-status">' + p.status + '</div>' : '') + `
              <div class="lt-prof-info-list">
                <div><span>Адрес страницы:</span> <strong>` + p.handle + `</strong></div>
                ` + ((p.showBirthday && p.birthday) ? '<div><span>Дата рождения:</span> <strong>' + p.birthday + '</strong></div>' : '') + `
                ` + ((p.showCity && p.city) ? '<div><span>Город / Страна:</span> <strong>' + p.city + '</strong></div>' : '') + `
              </div>
            </div>

            <div class="lt-prof-card">
              <div class="lt-prof-card-title">Друзья <span style="color:#9ea4b0; font-weight:400;">(` + p.friends.length + `)</span></div>
              <div class="lt-prof-friends-grid">
                ` + p.friends.map(function (f) {
                  return '<div class="lt-prof-friend-item" title="' + f.name + ' — ' + f.lang + '">' +
                    '<div class="lt-mini-ava">' + f.name.at(0) + '</div>' +
                    '<div class="lt-prof-friend-name">' + f.name.split(' ').at(0) + '</div>' +
                  '</div>';
                }).join('') + `
              </div>
            </div>

            <div class="lt-prof-card">
              <div class="lt-prof-card-title">
                Альбомы фотографий
                ` + (isSelf ? '<span style="font-size:0.72rem; color:#9ea4b0; font-weight:400;">(клик — скрыть)</span>' : '') + `
              </div>
              <div class="lt-prof-photos-grid">
                ` + visiblePhotos.map(function (ph) {
                  return '<div class="lt-prof-photo-tile ' + (ph.hidden ? 'is-hidden' : '') + '"' +
                    ' style="background:' + ph.color + ';"' +
                    ' title="' + ph.title + (ph.hidden ? ' (скрыто от гостей)' : '') + '"' +
                    ' onclick="' + (isSelf ? "togglePhotoVisibility('" + ph.id + "')" : '') + '">' +
                    '<span>' + (ph.hidden ? 'Скрыто' : ph.title) + '</span>' +
                  '</div>';
                }).join('') + `
              </div>
            </div>
          </div>

          <div class="lt-prof-col-center">
            ` + (isSelf ? (
              '<div class="lt-prof-card" style="padding:10px 12px;">' +
                '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
                  '<button class="btn-primary" style="flex:1; min-width:170px;" onclick="window._ltProfileState.addingPost = !window._ltProfileState.addingPost; render();">Добавить запись на стену</button>' +
                  '<button class="btn-secondary" style="flex:1; min-width:170px;" onclick="publishProfilePost(true)">Закрепить слово дня</button>' +
                '</div>' +
                (st.addingPost ? (
                  '<div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">' +
                    '<textarea id="ltNewPostText" class="textarea-dark" rows="3" placeholder="Поделитесь прогрессом, правилом или заметкой..."></textarea>' +
                    '<div style="display:flex; gap:8px; margin-top:8px;">' +
                      '<button class="btn-primary" onclick="publishProfilePost(false)">Опубликовать</button>' +
                      '<button class="btn-secondary" onclick="publishProfilePost(true)">Опубликовать со словом</button>' +
                    '</div>' +
                  '</div>'
                ) : '') +
              '</div>'
            ) : '') + `

            ` + p.posts.map(function (post) {
              return '<div class="lt-prof-card lt-prof-post">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">' +
                  '<div style="display:flex; align-items:center; gap:10px;">' +
                    '<div class="lt-mini-ava">' + (post.authorName || 'U').at(0).toUpperCase() + '</div>' +
                    '<div>' +
                      '<div style="font-weight:700; color:#fff; font-size:0.93rem;">' + post.authorName + '</div>' +
                      '<div style="font-size:0.75rem; color:#9ea4b0;">' + post.time + '</div>' +
                    '</div>' +
                  '</div>' +
                  (isSelf ? '<button class="btn-secondary" style="padding:3px 8px; font-size:0.75rem; color:#ff8787;" onclick="deleteProfilePost(\'' + post.id + '\')">Удалить</button>' : '') +
                '</div>' +
                '<div style="margin-top:10px; color:#e5e7eb; font-size:0.92rem; line-height:1.5;">' + post.text + '</div>' +
                (post.wordTag ? '<div style="margin-top:8px; padding:7px 10px; background:rgba(10,11,15,0.8); border-left:2px solid #dc2626; color:#f87171; font-weight:600; font-size:0.86rem;">' + post.wordTag + '</div>' : '') +
              '</div>';
            }).join('') + `
          </div>

          <div class="lt-prof-col-right">
            <div class="lt-prof-card">
              <div class="lt-prof-card-title">Возможные друзья</div>
              ` + p.suggestedFriends.map(function (sf) {
                return '<div class="lt-prof-side-item">' +
                  '<div class="lt-mini-ava">' + sf.name.at(0) + '</div>' +
                  '<div style="flex:1; min-width:0;">' +
                    '<div style="color:#fff; font-weight:600; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + sf.name + '</div>' +
                    '<div style="color:#9ea4b0; font-size:0.75rem;">' + sf.lang + '</div>' +
                  '</div>' +
                '</div>';
              }).join('') + `
            </div>

            <div class="lt-prof-card">
              <div class="lt-prof-card-title">Сообщества по интересам</div>
              ` + p.communities.map(function (cm) {
                return '<div class="lt-prof-side-item">' +
                  '<div class="lt-mini-ava" style="border-color:rgba(220,38,38,0.45); color:#f87171;">#</div>' +
                  '<div style="flex:1; min-width:0;">' +
                    '<div style="color:#fff; font-weight:600; font-size:0.84rem;">' + cm.title + '</div>' +
                    '<div style="color:#9ea4b0; font-size:0.74rem;">' + cm.members + '</div>' +
                  '</div>' +
                '</div>';
              }).join('') + `
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const _prevRenderBeforeProfile = window.render;
  window.render = function () {
    if (window.curTab === 'profile') {
      document.body.classList.remove('is-home');
      const ws = document.getElementById('workspace');
      if (ws) {
        window.renderUserProfileView(ws);
        return;
      }
    }
    if (typeof _prevRenderBeforeProfile === 'function') {
      return _prevRenderBeforeProfile();
    }
  };
})();

