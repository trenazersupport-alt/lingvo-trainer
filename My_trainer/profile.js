/* === МОДУЛЬ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ И АДМИНИСТРАТОРА (profile.js) === */
(function () {
  const ADMIN_EMAIL = 'trenazer.support@gmail.com';
  const PROFILE_STORAGE_PREFIX = 'lt_user_profile_v2_';

  function getCurrentAuthEmail() {
    const emailEl = document.getElementById('userEmailLabel');
    const txt = emailEl ? emailEl.textContent.trim().toLowerCase() : '';
    if (txt && txt.includes('@')) return txt;
    try {
      const saved = (localStorage.getItem('lt_auth_email') || localStorage.getItem('userEmail') || '').trim().toLowerCase();
      if (saved && saved.includes('@')) return saved;
    } catch (e) {}
    return '';
  }

  window.isPlatformAdmin = function () {
    return getCurrentAuthEmail() === ADMIN_EMAIL;
  };

  function getProfileStorageKey() {
    const email = getCurrentAuthEmail();
    return email ? (PROFILE_STORAGE_PREFIX + email) : (PROFILE_STORAGE_PREFIX + 'guest');
  }

  function getDefaultProfile() {
    const rawEmail = getCurrentAuthEmail();
    const isAdmin = rawEmail === ADMIN_EMAIL;
    const baseNick = isAdmin
      ? 'Администратор'
      : (rawEmail && rawEmail.includes('@') ? rawEmail.split('@').at(0) : 'Ученик');

    return {
      email: rawEmail,
      isAdmin: isAdmin,
      nick: baseNick,
      handle: '@' + (isAdmin ? 'admin_lingvo' : baseNick.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'),
      status: isAdmin ? 'Официальный аккаунт администрации Lingvo Trainer' : 'Изучаю корейский и английский каждый день',
      birthday: isAdmin ? '' : '14 мая 1998',
      showBirthday: !isAdmin,
      city: 'Владимир, Россия',
      showCity: true,
      avatar: '',
      cover: '',
      coverPosY: 50,
      followers: 0,
      streakDays: 1,
      friends: [],
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
      photos: [],
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
          time: 'Сегодня',
          text: isAdmin
            ? 'Добро пожаловать на платформу Lingvo Trainer! По вопросам работы сайта: trenazer.support@gmail.com'
            : 'Начал обучение на платформе Lingvo Trainer!',
          wordTag: '사랑 (саран) — любовь'
        }
      ]
    };
  }

  function loadProfile() {
    const key = getProfileStorageKey();
    const email = getCurrentAuthEmail();
    const isAdmin = email === ADMIN_EMAIL;
    try {
      const raw = localStorage.getItem(key);
           if (!raw) {
        let def = getDefaultProfile();
        try {
          const legacyRaw = localStorage.getItem('lt_user_profile_v1');
          if (legacyRaw) {
            const legacy = JSON.parse(legacyRaw);
            def = Object.assign(def, legacy, { email: email, isAdmin: isAdmin });
          }
        } catch (e) {}
        saveProfile(def);
        return def;
      }
      const parsed = Object.assign(getDefaultProfile(), JSON.parse(raw));
      if (!parsed.avatar || !parsed.cover) {
        try {
          const legacyRaw = localStorage.getItem('lt_user_profile_v1');
          if (legacyRaw) {
            const legacy = JSON.parse(legacyRaw);
            if (!parsed.avatar && legacy.avatar) parsed.avatar = legacy.avatar;
            if (!parsed.cover && legacy.cover) {
              parsed.cover = legacy.cover;
              if (typeof legacy.coverPosY === 'number') parsed.coverPosY = legacy.coverPosY;
            }
          }
        } catch (e) {}
      }
      parsed.email = email;
      parsed.isAdmin = isAdmin;
      return parsed;
    } catch (e) {
      return getDefaultProfile();
    }
  }

  function saveProfile(data) {
    try {
      localStorage.setItem(getProfileStorageKey(), JSON.stringify(data));
    } catch (e) {}
  }

  window._ltProfileState = {
    viewMode: 'self',
    guestFriendStatus: 'none',
    activeSubPanel: null,
    editing: false,
    addingPost: false,
    adminPanelOpen: false
  };

  window.openUserProfile = function (mode) {
    const email = getCurrentAuthEmail();
    // Если пользователь НЕ вошёл в аккаунт — открываем окно Входа / Регистрации вместо профиля!
    if (!email) {
      if (typeof openModal === 'function') {
        openModal('accountModal');
      } else {
        const accModal = document.getElementById('accountModal');
        if (accModal) accModal.style.display = 'flex';
      }
      return;
    }

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
    if (avatarEl && avatarEl.value.trim() && typeof window.ltApplyNewProfileAvatar === 'function') {
  window.ltApplyNewProfileAvatar(avatarEl.value.trim());
}
   const accBtn = document.getElementById('topAccountBtn');
    if (accBtn) accBtn.textContent = p.nick;

    saveProfile(p);
    window._ltProfileState.editing = false;
    window._ltProfileState.activeSubPanel = null;
    render();
  };
  /* === УПРАВЛЕНИЕ ОБЛОЖКОЙ ПРОФИЛЯ И КАДРИРОВАНИЕ === */
  window.toggleCoverMenu = function (e) {
    if (e) e.stopPropagation();
    const m = document.getElementById('ltCoverDropdownMenu');
    if (m) m.classList.toggle('open');
  };

  window.triggerCoverUpload = function () {
    const m = document.getElementById('ltCoverDropdownMenu');
    if (m) m.classList.remove('open');
    let inp = document.getElementById('ltDirectCoverFileInput');
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'file';
      inp.id = 'ltDirectCoverFileInput';
      inp.accept = 'image/*';
      inp.style.display = 'none';
      document.body.appendChild(inp);

      inp.addEventListener('change', function () {
        const file = inp.files && inp.files.length > 0 ? inp.files.item(0) : null;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) {
          const img = new Image();
          img.onload = function () {
            const maxW = 1280;
            let w = img.width;
            let h = img.height;
            if (w > maxW) {
              h = Math.round(h * maxW / w);
              w = maxW;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            window.openCoverCropperModal(compressed, 50);
          };
          img.onerror = function () { window.openCoverCropperModal(ev.target.result, 50); };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        inp.value = '';
      });
    }
    inp.click();
  };

  window.openCoverCropperModal = function (imageSrc, initialY) {
    const p = loadProfile();
    const src = imageSrc || p.cover;
    if (!src) {
      alert('Сначала загрузите изображение для обложки.');
      return;
    }
    const posY = typeof initialY === 'number' ? initialY : (typeof p.coverPosY === 'number' ? p.coverPosY : 50);

    let modal = document.getElementById('ltCoverCropperModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ltCoverCropperModal';
      modal.className = 'lt-alb-modal-backdrop';
      modal.onclick = function () { modal.remove(); };
      document.body.appendChild(modal);
    }

    modal.innerHTML =
      '<div class="lt-alb-modal-box" style="max-width:680px;" onclick="event.stopPropagation();">' +
        '<div class="lt-prof-card-title">' +
          '<span>Выбор видимой области обложки</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="document.getElementById(\'ltCoverCropperModal\').remove();">✕</button>' +
        '</div>' +
        '<div style="font-size:0.8rem; color:#9ea4b0; margin-bottom:8px;">Передвигайте ползунок, чтобы выбрать, какая часть фотографии будет отображаться в шапке профиля:</div>' +
        '<div id="ltCoverPreviewBox" style="width:100%; height:165px; border:1px solid #dc2626; background-image:url(\'' + src + '\'); background-size:cover; background-position:center ' + posY + '%; margin-bottom:12px;"></div>' +
        '<div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">' +
          '<span style="font-size:0.78rem; color:#9ea4b0;">Верх</span>' +
          '<input id="ltCoverPosRange" type="range" min="0" max="100" value="' + posY + '" style="flex:1; accent-color:#dc2626;" oninput="document.getElementById(\'ltCoverPreviewBox\').style.backgroundPosition = \'center \' + this.value + \'%\';" />' +
          '<span style="font-size:0.78rem; color:#9ea4b0;">Низ</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:flex-end; gap:8px;">' +
          '<button class="btn-secondary" onclick="document.getElementById(\'ltCoverCropperModal\').remove();">Отмена</button>' +
          '<button class="btn-primary" id="ltSaveCoverCropBtn">Применить обложку</button>' +
        '</div>' +
      '</div>';

    document.getElementById('ltSaveCoverCropBtn').onclick = function () {
      const range = document.getElementById('ltCoverPosRange');
      const finalY = range ? Number(range.value) : 50;
      const prof = loadProfile();
      prof.cover = src;
      prof.coverPosY = finalY;
      saveProfile(prof);
      modal.remove();
      render();
    };
  };

  window.removeProfileCover = function () {
    const m = document.getElementById('ltCoverDropdownMenu');
    if (m) m.classList.remove('open');
    const p = loadProfile();
    p.cover = '';
    p.coverPosY = 50;
    saveProfile(p);
    render();
  };
  window.scrollToProfileWall = function () {
    window._ltProfileState.activeSubPanel = null;
    const wall = document.querySelector('.lt-prof-col-center');
    if (wall) wall.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
    window.ltOpenLanguageCourse = function (langCode) {
    if (typeof setLang === 'function') setLang(langCode);
    const headerLangBtn = document.querySelector('[data-lang="' + langCode + '"], #langBtn_' + langCode);
    if (headerLangBtn) headerLangBtn.click();

    if (typeof switchTab === 'function') {
      switchTab('home');
    } else {
      window.curTab = 'home';
      if (typeof render === 'function') render();
    }

    setTimeout(function () {
      // 1. Автоматически раскрываем боковую шторку меню слева
      const collapsedDrawer = document.querySelector('.sidebar.collapsed, .drawer.collapsed, aside.collapsed, [class*="sidebar"][class*="collaps"]');
      if (collapsedDrawer) {
        collapsedDrawer.classList.remove('collapsed', 'is-collapsed', 'closed', 'hidden');
      }
      const openDrawerBtn = document.querySelector('.sidebar-toggle, .drawer-toggle, #sidebarToggle, [aria-label*="меню"], [title*="Меню"], [title*="Открыть"]');
      if (openDrawerBtn && !openDrawerBtn.closest('#ltHistNavWrap')) {
        openDrawerBtn.click();
      }

      // 2. Показываем вертикальное меню разделов выбранного курса
      const ws = document.getElementById('workspace');
      if (ws && (ws.textContent.includes('Раздел в разработке') || ws.querySelector('.lt-course-hub'))) {
        const isKo = langCode === 'ko';
        const items = [
          { tab: 'words', title: 'База слов', desc: 'Изучение лексики по темам с озвучкой и карточками', primary: true },
          { tab: 'vocab', title: 'Личный словарь', desc: 'Повторение сохранённых и изученных слов' },
          ...(isKo ? [{ tab: 'hanja', title: 'Корни слов (Ханча)', desc: 'Разбор иероглифических корней и однокоренных слов' }] : []),
          { tab: 'grammar', title: 'Грамматика', desc: 'Правила, конструкции и примеры использования' },
          { tab: 'voice', title: 'Тренировка голоса', desc: 'Практика произношения и аудирования' },
          { tab: 'quiz', title: 'Игра: Вопрос-Ответ', desc: 'Быстрая проверка знаний в игровом формате' }
        ];

        ws.innerHTML =
          '<div class="lt-soc-shell lt-course-hub" style="max-width:640px;">' +
            '<div class="lt-prof-card-title" style="margin-bottom:10px;">' +
              '<span>' + (isKo ? 'Курс корейского языка (KO)' : 'Курс английского языка (EN)') + '</span>' +
              '<span class="tag">' + (isKo ? 'Основной курс' : 'Дополнительный курс') + '</span>' +
            '</div>' +
            '<div style="color:#b8bec9; font-size:0.86rem; margin-bottom:14px;">Выберите учебный раздел для старта:</div>' +
            '<div style="display:flex; flex-direction:column; gap:9px;">' +
              items.map(function (it) {
                return '<button class="' + (it.primary ? 'btn-primary' : 'btn-secondary') + '" ' +
                  'style="width:100%; text-align:left; padding:11px 14px; display:flex; justify-content:space-between; align-items:center; gap:12px;" ' +
                  'onclick="if(typeof switchTab===\'function\') switchTab(\'' + it.tab + '\');">' +
                  '<div>' +
                    '<div style="font-weight:700; font-size:0.92rem; color:#fff;">' + it.title + '</div>' +
                    '<div style="font-size:0.78rem; color:' + (it.primary ? 'rgba(255,255,255,0.85)' : '#9ea4b0') + '; margin-top:2px;">' + it.desc + '</div>' +
                  '</div>' +
                  '<span style="font-size:0.95rem; font-weight:700;">→</span>' +
                '</button>';
              }).join('') +
            '</div>' +
          '</div>';
      }
    }, 60);
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

  window.deleteProfileNote = function (id) {
    const p = loadProfile();
    p.notes = p.notes.filter(x => x.id !== id);
    saveProfile(p);
    render();
  };

  window.addProfileLink = function () {
    const t = document.getElementById('ltNewLinkTitle');
    const u = document.getElementById('ltNewLinkUrl');
    if (!t || !u || !t.value.trim() || !u.value.trim()) return;
    let url = u.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    const p = loadProfile();
    p.savedLinks.unshift({ id: 'l_' + Date.now(), title: t.value.trim(), url: url });
    saveProfile(p);
    render();
  };

  window.deleteProfileLink = function (id) {
    const p = loadProfile();
    p.savedLinks = p.savedLinks.filter(x => x.id !== id);
    saveProfile(p);
    render();
  };

  window.addProfileMedia = function () {
    const typeEl = document.getElementById('ltNewMediaType');
    const t = document.getElementById('ltNewMediaTitle');
    const u = document.getElementById('ltNewMediaUrl');
    if (!t || !u || !t.value.trim() || !u.value.trim()) return;
    let url = u.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    const p = loadProfile();
    if (!Array.isArray(p.mediaItems)) p.mediaItems = [];
    p.mediaItems.unshift({
      id: 'm_' + Date.now(),
      kind: typeEl ? typeEl.value : 'Видео',
      title: t.value.trim(),
      url: url
    });
    saveProfile(p);
    render();
  };

  window.deleteProfileMedia = function (id) {
    const p = loadProfile();
    p.mediaItems = (p.mediaItems || []).filter(x => x.id !== id);
    saveProfile(p);
    render();
  };

  window.acceptSuggestedFriend = function (id) {
    const p = loadProfile();
    const idx = p.suggestedFriends.findIndex(x => x.id === id);
    if (idx === -1) return;
    const person = p.suggestedFriends.splice(idx, 1).at(0);
    p.friends.unshift({
      id: person.id,
      name: person.name,
      handle: person.handle,
      lang: person.lang,
      isFriend: true
    });
    saveProfile(p);
    render();
  };

  window.removeFriendFromProfile = function (id) {
    const p = loadProfile();
    p.friends = p.friends.filter(x => x.id !== id);
    saveProfile(p);
    render();
  };

  window.toggleJoinCommunity = function (id) {
    const p = loadProfile();
    const cm = p.communities.find(x => x.id === id);
    if (cm) cm.joined = !cm.joined;
    saveProfile(p);
    render();
  };
  window.renderUserProfileView = function (ws) {
     if (!getCurrentAuthEmail()) {
   window.curTab = 'home';
   if (typeof openModal === 'function') openModal('accountModal');
   return;
 }
    const p = loadProfile();
    const st = window._ltProfileState;
    const isSelf = st.viewMode === 'self';
    const isAdminUser = isSelf && (p.isAdmin || window.isPlatformAdmin());
    const learnedCount = typeof learnedIds !== 'undefined' ? learnedIds.length : 0;
    const visiblePhotos = isSelf ? p.photos : p.photos.filter(ph => !ph.hidden);
         const coverPosY = typeof p.coverPosY === 'number' ? p.coverPosY : 50;
 const coverStyle = p.cover
   ? 'background-image:url(\'' + p.cover + '\'); background-size:cover; background-position:center ' + coverPosY + '%;'
   : 'background:linear-gradient(120deg, #181a22 0%, #2d1216 55%, #121318 100%);';
    const avatarHtml = p.avatar
      ? '<img src="' + p.avatar + '" alt="' + p.nick + '" style="width:100%; height:100%; object-fit:cover;" />'
      : '<div class="lt-prof-avatar-placeholder">' + (p.nick || 'U').at(0).toUpperCase() + '</div>';
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
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Личные заметки и конспекты</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'notes\')">Закрыть</button>' +
        '</div>' +
        (isSelf ? (
          '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">' +
            '<input id="ltNewNoteTitle" class="input-dark" placeholder="Заголовок заметки" style="flex:1; min-width:170px;" />' +
            '<input id="ltNewNoteBody" class="input-dark" placeholder="Текст правила или примера..." style="flex:2; min-width:210px;" />' +
            '<button class="btn-primary" onclick="addProfileNote()">Сохранить</button>' +
          '</div>'
        ) : '') +
        (p.notes.length ? p.notes.map(function (n) {
          return '<div style="padding:8px 10px; background:rgba(10,11,15,0.75); border-left:2px solid #dc2626; margin-bottom:6px; display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">' +
            '<div>' +
              '<div style="font-weight:700; color:#fff; font-size:0.9rem;">' + n.title + '</div>' +
              '<div style="color:#b8bec9; font-size:0.84rem; margin-top:3px;">' + n.text + '</div>' +
            '</div>' +
            (isSelf ? '<button class="btn-secondary" style="padding:2px 7px; font-size:0.72rem; color:#ff8787;" onclick="deleteProfileNote(\'' + n.id + '\')">Удалить</button>' : '') +
          '</div>';
        }).join('') : '<div style="color:#9ea4b0; font-size:0.84rem;">Заметок пока нет.</div>') +
      '</div>';
    } else if (st.activeSubPanel === 'links') {
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Сохранённые ссылки и материалы</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'links\')">Закрыть</button>' +
        '</div>' +
        (isSelf ? (
          '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">' +
            '<input id="ltNewLinkTitle" class="input-dark" placeholder="Название ресурса" style="flex:1; min-width:170px;" />' +
            '<input id="ltNewLinkUrl" class="input-dark" placeholder="https://..." style="flex:2; min-width:210px;" />' +
            '<button class="btn-primary" onclick="addProfileLink()">Добавить</button>' +
          '</div>'
        ) : '') +
        (p.savedLinks.length ? p.savedLinks.map(function (l) {
          return '<div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.08); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:10px;">' +
            '<a href="' + l.url + '" target="_blank" style="color:#f87171; font-weight:600; text-decoration:none; font-size:0.88rem;">' + l.title + ' ↗</a>' +
            (isSelf ? '<button class="btn-secondary" style="padding:2px 7px; font-size:0.72rem; color:#ff8787;" onclick="deleteProfileLink(\'' + l.id + '\')">Удалить</button>' : '') +
          '</div>';
        }).join('') : '<div style="color:#9ea4b0; font-size:0.84rem;">Сохранённых ссылок пока нет.</div>') +
      '</div>';
    } else if (st.activeSubPanel === 'media') {
      const mediaList = Array.isArray(p.mediaItems) ? p.mediaItems : [
        { id: 'm_def1', kind: 'Видео', title: 'Разбор корейских диалогов (TOPIK I)', url: 'https://youtube.com' },
        { id: 'm_def2', kind: 'Аудио', title: 'Подкаст для тренировки произношения', url: 'https://youtube.com' }
      ];
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Видео и музыка для обучения</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'media\')">Закрыть</button>' +
        '</div>' +
        (isSelf ? (
          '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">' +
            '<select id="ltNewMediaType" class="input-dark" style="width:110px;"><option value="Видео">Видео</option><option value="Аудио">Аудио</option></select>' +
            '<input id="ltNewMediaTitle" class="input-dark" placeholder="Название видео или трека" style="flex:1; min-width:160px;" />' +
            '<input id="ltNewMediaUrl" class="input-dark" placeholder="Ссылка (YouTube / аудио)" style="flex:2; min-width:200px;" />' +
            '<button class="btn-primary" onclick="addProfileMedia()">Добавить</button>' +
          '</div>'
        ) : '') +
        mediaList.map(function (m) {
          return '<div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.08); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:10px;">' +
            '<div>' +
              '<span class="tag" style="font-size:0.7rem; padding:2px 6px; margin-right:6px;">' + m.kind + '</span>' +
              '<a href="' + m.url + '" target="_blank" style="color:#fff; font-weight:600; text-decoration:none; font-size:0.88rem;">' + m.title + ' ↗</a>' +
            '</div>' +
            (isSelf ? '<button class="btn-secondary" style="padding:2px 7px; font-size:0.72rem; color:#ff8787;" onclick="deleteProfileMedia(\'' + m.id + '\')">Удалить</button>' : '') +
          '</div>';
        }).join('') +
      '</div>';
    } else if (st.activeSubPanel === 'friends') {
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Все друзья (' + p.friends.length + ')</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'friends\')">Закрыть</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:8px;">' +
          p.friends.map(function (f) {
            return '<div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-between; gap:8px;">' +
              '<div style="display:flex; align-items:center; gap:10px; min-width:0;">' +
                '<div class="lt-mini-ava">' + f.name.at(0) + '</div>' +
                '<div style="min-width:0;">' +
                  '<div style="color:#fff; font-weight:600; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + f.name + '</div>' +
                  '<div style="color:#9ea4b0; font-size:0.76rem;">' + f.lang + '</div>' +
                '</div>' +
              '</div>' +
              (isSelf ? '<button class="btn-secondary" style="padding:2px 7px; font-size:0.72rem; color:#ff8787;" onclick="removeFriendFromProfile(\'' + f.id + '\')">Удалить</button>' : '') +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
        } else if (st.activeSubPanel === 'followers') {
      const followersList = [
        { name: 'Хана Чхве', handle: '@hana_seoul', lang: 'Корейский (носитель)' },
        { name: 'Дмитрий Л.', handle: '@dima_learn', lang: 'Корейский A2' },
        { name: 'Алина М.', handle: '@alina_en', lang: 'Английский B2' },
        { name: 'Тэмин Кан', handle: '@taemin_k', lang: 'Корейский (носитель)' }
      ];
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Подписчики профиля (' + p.followers + ')</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'followers\')">Закрыть</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:8px;">' +
          followersList.map(function (fl) {
            return '<div style="padding:8px 10px; background:rgba(10,11,15,0.75); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">' +
              '<div class="lt-mini-ava">' + fl.name.at(0) + '</div>' +
              '<div>' +
                '<div style="color:#fff; font-weight:600; font-size:0.86rem;">' + fl.name + '</div>' +
                '<div style="color:#9ea4b0; font-size:0.75rem;">' + fl.lang + '</div>' +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
       } else if (st.activeSubPanel === 'langs') {
      const curLangCode = (typeof curLang !== 'undefined' && curLang) ? curLang : 'ko';
      subPanelHtml = '<div class="lt-prof-card" style="margin-bottom:12px;">' +
        '<div class="lt-prof-card-title"><span>Изучаемые языки и прогресс</span>' +
          '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="toggleProfileSubMenu(\'langs\')">Закрыть</button>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px;">' +
          '<div style="padding:10px 12px; background:rgba(10,11,15,0.75); border-left:2px solid ' + (curLangCode === 'ko' ? '#dc2626' : 'rgba(255,255,255,0.2)') + '; display:flex; justify-content:space-between; align-items:center;">' +
            '<div><div style="color:#fff; font-weight:700; font-size:0.9rem;">Корейский язык (KO)</div><div style="color:#9ea4b0; font-size:0.78rem;">Основной курс • Уровень A2–B1</div></div>' +
            '<button class="' + (curLangCode === 'ko' ? 'btn-primary' : 'btn-secondary') + '" style="padding:5px 10px; font-size:0.78rem;" onclick="ltOpenLanguageCourse(\'ko\')">Открыть</button>' +
          '</div>' +
          '<div style="padding:10px 12px; background:rgba(10,11,15,0.75); border-left:2px solid ' + (curLangCode === 'en' ? '#dc2626' : 'rgba(255,255,255,0.2)') + '; display:flex; justify-content:space-between; align-items:center;">' +
            '<div><div style="color:#fff; font-weight:700; font-size:0.9rem;">Английский язык (EN)</div><div style="color:#9ea4b0; font-size:0.78rem;">Дополнительный курс • Уровень B2</div></div>' +
            '<button class="' + (curLangCode === 'en' ? 'btn-primary' : 'btn-secondary') + '" style="padding:5px 10px; font-size:0.78rem;" onclick="ltOpenLanguageCourse(\'en\')">Открыть</button>' +
          '</div>' +
        '</div>' +
      '</div>';
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
          <button class="btn-secondary" onclick="openUserProfile('guest')">Посмотреть профиль глазами гостя</button>
          <button class="btn-secondary" onclick="openModal('accountModal')">Вход / Резервная копия (.json)</button>
        </div>
      </div>
    ` : '';
    ws.innerHTML = `
      <div class="lt-profile-shell">
        ${!isSelf ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:8px 12px; background:rgba(14,15,20,0.9); border:1px solid rgba(220,38,38,0.45); gap:8px; flex-wrap:wrap;">
          <span style="font-size:0.82rem; color:#e5e7eb;">Режим предпросмотра: так ваш профиль видят другие пользователи</span>
          <button class="btn-primary" style="padding:5px 12px; font-size:0.8rem;" onclick="openUserProfile('self')">Вернуться в мой профиль</button>
        </div>` : ''}
            <div class="lt-prof-header-box">
       <div class="lt-prof-cover" style="${coverStyle}">
         ${isSelf ? `
           <div class="lt-prof-cover-menu-wrap">
             <button class="lt-prof-cover-arrow-btn" onclick="toggleCoverMenu(event)" title="Настройки обложки">▾</button>
             <div id="ltCoverDropdownMenu" class="lt-prof-dropdown-menu" style="right:0; top:36px;">
               <button onclick="triggerCoverUpload()">Загрузить обложку с ПК</button>
               ${p.cover ? `<button onclick="document.getElementById('ltCoverDropdownMenu').classList.remove('open'); openCoverCropperModal();">Изменить видимую область</button>` : ''}
               ${p.cover ? `<button style="color:#ff8787;" onclick="removeProfileCover()">Удалить обложку</button>` : ''}
             </div>
           </div>
         ` : ''}
       </div>

       <div class="lt-prof-bar">
         <div class="lt-prof-avatar-box">${avatarHtml}</div>

         <div class="lt-prof-stats-row">
           <div class="lt-prof-stat lt-prof-stat-btn" onclick="scrollToProfileWall()" title="Перейти к записям на стене">
             <div class="lt-prof-stat-val">${p.posts.length}</div>
             <div class="lt-prof-stat-lbl">записей</div>
           </div>
                     <div class="lt-prof-stat lt-prof-stat-btn" onclick="openSocialListPage('friends', 'all')" title="Открыть страницу друзей">
             <div class="lt-prof-stat-val">${p.friends.length}</div>
             <div class="lt-prof-stat-lbl">друзей</div>
           </div>
           <div class="lt-prof-stat lt-prof-stat-btn" onclick="openSocialListPage('followers', 'all')" title="Открыть страницу подписчиков">
             <div class="lt-prof-stat-val">${p.followers}</div>
             <div class="lt-prof-stat-lbl">подписчиков</div>
           </div>
           <div class="lt-prof-stat lt-prof-stat-btn" onclick="openLearnedSummaryPage()" title="Открыть сводный словарь изученных слов">
             <div class="lt-prof-stat-val">${learnedCount}</div>
             <div class="lt-prof-stat-lbl">слов изучено</div>
           </div>
           <div class="lt-prof-stat lt-prof-stat-btn" onclick="toggleProfileSubMenu('langs')" title="Изучаемые языки">
             <div class="lt-prof-stat-val">KO / EN</div>
             <div class="lt-prof-stat-lbl">языки</div>
           </div>
           <div class="lt-prof-stat lt-prof-stat-btn" onclick="if(typeof switchTab==='function') switchTab('rating');" title="Перейти в рейтинг">
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
                     ` + rightActionHtml +
           (isAdminUser ? '<button class="btn-primary lt-prof-action-btn" onclick="window._ltProfileState.adminPanelOpen = !window._ltProfileState.adminPanelOpen; render();">Панель администратора</button>' : '') +
           (isSelf ? '<button class="btn-secondary lt-prof-action-btn" onclick="if(typeof openModal===\'function\') openModal(\'accountModal\');">Аккаунт / Выход</button>' : '') + `
            </div>
          </div>
        </div>

        ` + editPanelHtml + `
        ` + subPanelHtml + `
     ` + (isAdminUser && st.adminPanelOpen ? (
       '<div class="lt-prof-card" style="margin-bottom:12px; border-color:rgba(220,38,38,0.65);">' +
         '<div class="lt-prof-card-title"><span>Панель главного администратора (trenazer.support@gmail.com)</span>' +
           '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="window._ltProfileState.adminPanelOpen=false; render();">Закрыть</button>' +
         '</div>' +
         '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
           '<button class="btn-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="if(typeof openModal===\'function\') openModal(\'addWordModal\');">+ Добавить слово в общую базу</button>' +
           '<button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="openCommunitiesPage(\'all\')">Управление сообществами</button>' +
           '<button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="if(typeof openModal===\'function\') openModal(\'rulesModal\')">Правила и модерация (3+1)</button>' +
         '</div>' +
       '</div>'
     ) : '') + `
        <div class="lt-prof-grid">
          <div class="lt-prof-col-left">
            <div class="lt-prof-card">
             <div class="lt-prof-name">` + p.nick + (isAdminUser ? ' <span class="tag" style="background:rgba(220,38,38,0.22); border-color:#dc2626; color:#ff8787; font-size:0.68rem; vertical-align:middle; margin-left:6px;">АДМИНИСТРАТОР</span>' : '') + `</div>
              <div class="lt-prof-handle">` + p.handle + `</div>
              ` + (p.status ? '<div class="lt-prof-status">' + p.status + '</div>' : '') + `
              <div class="lt-prof-info-list">
                <div><span>Адрес страницы:</span> <strong>` + p.handle + `</strong></div>
                ` + ((p.showBirthday && p.birthday) ? '<div><span>Дата рождения:</span> <strong>' + p.birthday + '</strong></div>' : '') + `
                ` + ((p.showCity && p.city) ? '<div><span>Город / Страна:</span> <strong>' + p.city + '</strong></div>' : '') + `
              </div>
            </div>

            <div class="lt-prof-card">
                  <div class="lt-prof-card-title" style="cursor:pointer;" onclick="openSocialListPage('friends', 'all')" title="Открыть страницу друзей">Друзья <span style="color:#9ea4b0; font-weight:400;">(${p.friends.length})</span></div>
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
              <div class="lt-prof-card-title" style="cursor:pointer;" onclick="openSuggestedFriendsPage()" title="Открыть все рекомендации друзей">Возможные друзья</div>
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
                    <div class="lt-prof-card-title" style="cursor:pointer;" onclick="openCommunitiesPage('all')" title="Открыть каталог сообществ">Сообщества по интересам</div>
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
   if (typeof curTab !== 'undefined' && curTab === 'profile') {
            document.body.classList.add('is-home');
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

