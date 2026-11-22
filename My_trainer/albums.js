/* === МОДУЛЬ АЛЬБОМОВ, КОНТЕКСТНОГО МЕНЮ И НАВИГАЦИИ НАЗАД/ВПЕРЁД (albums.js) === */
(function () {
  const ALBUMS_KEY = 'lt_user_albums_v1';
  const DIALOGS_KEY = 'lt_user_dialogs_v1';

  function getDefaultAlbumsData() {
    return {
      albums: [
        { id: 'alb_notes', title: 'Конспекты и грамматика' },
        { id: 'alb_cards', title: 'Карточки TOPIK' },
        { id: 'alb_hanja', title: 'Ханча и корни слов' },
        { id: 'alb_practice', title: 'Вечерняя практика' },
        { id: 'alb_saved', title: 'Сохранённое' }
      ],
      photos: [
        { id: 'ph_1', albumId: 'alb_notes', title: 'Конспект по ханче', image: '', color: 'linear-gradient(135deg,#2d1216,#12131a)', hidden: false, createdAt: 17000007 },
        { id: 'ph_2', albumId: 'alb_cards', title: 'Карточки TOPIK I', image: '', color: 'linear-gradient(135deg,#1b1e2b,#361419)', hidden: false, createdAt: 17000006 },
        { id: 'ph_3', albumId: 'alb_practice', title: 'Вечерняя практика', image: '', color: 'linear-gradient(135deg,#241418,#161822)', hidden: false, createdAt: 17000005 },
        { id: 'ph_4', albumId: 'alb_hanja', title: 'Словарь глаголов', image: '', color: 'linear-gradient(135deg,#191c26,#331418)', hidden: false, createdAt: 17000004 },
        { id: 'ph_5', albumId: 'alb_notes', title: 'Частицы 은/는 и 이/가', image: '', color: 'linear-gradient(135deg,#281317,#141720)', hidden: false, createdAt: 17000003 },
        { id: 'ph_6', albumId: 'alb_cards', title: 'Базовые приветствия', image: '', color: 'linear-gradient(135deg,#161923,#2b1317)', hidden: false, createdAt: 17000002 },
        { id: 'ph_7', albumId: 'alb_saved', title: 'Цитата дня на корейском', image: '', color: 'linear-gradient(135deg,#221216,#12141c)', hidden: false, createdAt: 17000001 }
      ]
    };
  }

  function loadAlbumsData() {
    try {
      const raw = localStorage.getItem(ALBUMS_KEY);
      if (!raw) return getDefaultAlbumsData();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.albums) || !Array.isArray(parsed.photos)) return getDefaultAlbumsData();
      return parsed;
    } catch (e) {
      return getDefaultAlbumsData();
    }
  }

  function saveAlbumsData(data) {
    try {
      localStorage.setItem(ALBUMS_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadDialogs() {
    try {
      const raw = localStorage.getItem(DIALOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      { id: 'u_mina', name: 'Мина Пак', handle: '@minapak', lastMsg: 'Привет! Как продвигается подготовка к TOPIK?' },
      { id: 'u_alex', name: 'Алексей К.', handle: '@alex_kr', lastMsg: 'Скинул тебе подборку глаголов движения' }
    ];
  }

  function saveDialogs(list) {
    try {
      localStorage.setItem(DIALOGS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getFriendsForShare() {
    try {
      const pRaw = localStorage.getItem('lt_user_profile_v1');
      if (pRaw) {
        const p = JSON.parse(pRaw);
        if (Array.isArray(p.friends)) return p.friends;
      }
    } catch (e) {}
    return [
      { id: 'u_mina', name: 'Мина Пак', handle: '@minapak' },
      { id: 'u_alex', name: 'Алексей К.', handle: '@alex_kr' },
      { id: 'u_soyeon', name: 'Соён Ким', handle: '@soyeon_seoul' },
      { id: 'u_kate', name: 'Екатерина В.', handle: '@kate_en' }
    ];
  }

  window._ltAlbumsState = {
    carouselOffset: 0,
    selectedAlbumId: 'all',
    activeModal: null, // null | 'share' | 'move' | 'copyToAlbum' | 'upload' | 'createAlbum'
    targetPhotoId: null,
    shareSearch: ''
  };

  /* === ГЛОБАЛЬНАЯ ИСТОРИЯ ПЕРЕХОДОВ « » ПОД ЛОГОТИПОМ === */
  const _navHistory = { stack: ['home'], idx: 0, lock: false };

  function updateNavArrowsUI() {
    const backBtn = document.getElementById('ltHistBackBtn');
    const fwdBtn = document.getElementById('ltHistFwdBtn');
    if (backBtn) backBtn.disabled = _navHistory.idx <= 0;
    if (fwdBtn) fwdBtn.disabled = _navHistory.idx >= _navHistory.stack.length - 1;
  }

  function ensureHistoryButtons() {
    if (document.getElementById('ltHistNavWrap')) return;
    const brand = document.querySelector('.brand, .logo, header .left, .topbar .left') || document.querySelector('header');
    if (!brand) return;
    const wrap = document.createElement('div');
    wrap.id = 'ltHistNavWrap';
    wrap.className = 'lt-hist-nav-wrap';
    wrap.innerHTML =
      '<button id="ltHistBackBtn" class="lt-hist-btn" title="Назад" onclick="ltHistoryBack()">«</button>' +
      '<button id="ltHistFwdBtn" class="lt-hist-btn" title="Вперёд" onclick="ltHistoryForward()">»</button>';
    brand.appendChild(wrap);
    updateNavArrowsUI();
  }

  window.ltHistoryBack = function () {
    if (_navHistory.idx <= 0) return;
    _navHistory.idx--;
    _navHistory.lock = true;
    const target = _navHistory.stack.at(_navHistory.idx);
    if (typeof switchTab === 'function') switchTab(target);
    _navHistory.lock = false;
    updateNavArrowsUI();
  };

  window.ltHistoryForward = function () {
    if (_navHistory.idx >= _navHistory.stack.length - 1) return;
    _navHistory.idx++;
    _navHistory.lock = true;
    const target = _navHistory.stack.at(_navHistory.idx);
    if (typeof switchTab === 'function') switchTab(target);
    _navHistory.lock = false;
    updateNavArrowsUI();
  };

  const _origSwitchTab = window.switchTab;
  window.switchTab = function (tabName) {
    if (!_navHistory.lock && tabName) {
      const current = _navHistory.stack.at(_navHistory.idx);
      if (current !== tabName) {
        _navHistory.stack = _navHistory.stack.slice(0, _navHistory.idx + 1);
        _navHistory.stack.push(tabName);
        _navHistory.idx = _navHistory.stack.length - 1;
      }
    }
    if (typeof _origSwitchTab === 'function') {
      _origSwitchTab(tabName);
    } else {
      window.curTab = tabName;
      if (typeof render === 'function') render();
    }
    updateNavArrowsUI();
  };

  window.openUserAlbumsPage = function (albumId) {
    window._ltAlbumsState.selectedAlbumId = albumId || 'all';
    window._ltAlbumsState.activeModal = null;
    if (typeof switchTab === 'function') {
      switchTab('albums');
    } else {
      window.curTab = 'albums';
      if (typeof render === 'function') render();
    }
  };
  /* === КОНТЕКСТНОЕ МЕНЮ ПО ПРАВОЙ КНОПКЕ МЫШИ НА ФОТО === */
  function closePhotoContextMenu() {
    const existing = document.getElementById('ltPhotoCtxMenu');
    if (existing) existing.remove();
  }

  document.addEventListener('click', closePhotoContextMenu);
  window.addEventListener('scroll', closePhotoContextMenu, true);

  window.openPhotoContextMenu = function (e, photoId) {
    e.preventDefault();
    e.stopPropagation();
    closePhotoContextMenu();

    const data = loadAlbumsData();
    const photo = data.photos.find(x => x.id === photoId);
    if (!photo) return;

    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    const menu = document.createElement('div');
    menu.id = 'ltPhotoCtxMenu';
    menu.className = 'lt-ctx-menu';

    if (isSelf) {
      menu.innerHTML =
        '<button onclick="ltPhotoAction(\'toggleHide\', \'' + photoId + '\')">' + (photo.hidden ? 'Показать гостям' : 'Скрыть') + '</button>' +
        '<button onclick="ltPhotoAction(\'move\', \'' + photoId + '\')">Переместить</button>' +
        '<button onclick="ltPhotoAction(\'share\', \'' + photoId + '\')">Поделиться</button>' +
        '<button style="color:#ff8787;" onclick="ltPhotoAction(\'delete\', \'' + photoId + '\')">Удалить</button>';
    } else {
      menu.innerHTML =
        '<button onclick="ltPhotoAction(\'share\', \'' + photoId + '\')">Поделиться</button>' +
        '<button onclick="ltPhotoAction(\'copyToAlbum\', \'' + photoId + '\')">Добавить в альбом</button>' +
        '<button onclick="ltPhotoAction(\'repost\', \'' + photoId + '\')">Репост себе на стену</button>' +
        '<button style="color:#ff8787;" onclick="ltPhotoAction(\'report\', \'' + photoId + '\')">Пожаловаться</button>';
    }

    document.body.appendChild(menu);
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 190;
    menu.style.left = Math.max(8, Math.min(e.clientX, maxX)) + 'px';
    menu.style.top = Math.max(8, Math.min(e.clientY, maxY)) + 'px';
  };

  window.ltPhotoAction = function (action, photoId) {
    closePhotoContextMenu();
    const data = loadAlbumsData();
    const photo = data.photos.find(x => x.id === photoId);
    if (!photo) return;

    if (action === 'toggleHide') {
      photo.hidden = !photo.hidden;
      saveAlbumsData(data);
      if (typeof render === 'function') render();
      return;
    }

    if (action === 'delete') {
      data.photos = data.photos.filter(x => x.id !== photoId);
      saveAlbumsData(data);
      if (typeof render === 'function') render();
      return;
    }

    if (action === 'move' || action === 'copyToAlbum' || action === 'share') {
      window._ltAlbumsState.targetPhotoId = photoId;
      window._ltAlbumsState.activeModal = action;
      window._ltAlbumsState.shareSearch = '';
      if (typeof render === 'function') render();
      return;
    }

    if (action === 'repost') {
      try {
        const pRaw = localStorage.getItem('lt_user_profile_v1');
        const p = pRaw ? JSON.parse(pRaw) : { nick: 'ekstshafor', posts: [] };
        if (!Array.isArray(p.posts)) p.posts = [];
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        p.posts.unshift({
          id: 'post_' + Date.now(),
          authorName: p.nick || 'ekstshafor',
          time: 'Сегодня в ' + hh + ':' + mm,
          text: 'Репост фотографии из альбома:',
          wordTag: 'Фото: ' + photo.title
        });
        localStorage.setItem('lt_user_profile_v1', JSON.stringify(p));
        alert('Фотография «' + photo.title + '» опубликована у вас на стене!');
      } catch (e) {}
      return;
    }

    if (action === 'report') {
      if (typeof openReportModal === 'function') {
        openReportModal('Жалоба на фотографию: ' + photo.title);
      }
    }
  };

  window.ltConfirmMoveOrCopy = function (albumId) {
    const st = window._ltAlbumsState;
    const data = loadAlbumsData();
    const photo = data.photos.find(x => x.id === st.targetPhotoId);
    if (!photo) return;

    if (st.activeModal === 'move') {
      photo.albumId = albumId;
    } else if (st.activeModal === 'copyToAlbum') {
      data.photos.unshift({
        id: 'ph_' + Date.now(),
        albumId: albumId,
        title: photo.title,
        image: photo.image || '',
        color: photo.color,
        hidden: false,
        createdAt: Date.now()
      });
    }
    saveAlbumsData(data);
    st.activeModal = null;
    st.targetPhotoId = null;
    if (typeof render === 'function') render();
  };

  window.ltSharePhotoToUser = function (userId, userName, userHandle) {
    const st = window._ltAlbumsState;
    const data = loadAlbumsData();
    const photo = data.photos.find(x => x.id === st.targetPhotoId);
    if (!photo) return;

    const dialogs = loadDialogs();
    let dlg = dialogs.find(d => d.id === userId);
    const msgText = 'Отправлена фотография: «' + photo.title + '»';
    if (dlg) {
      dlg.lastMsg = msgText;
    } else {
      dialogs.unshift({ id: userId, name: userName, handle: userHandle || '', lastMsg: msgText });
    }
    saveDialogs(dialogs);
    st.activeModal = null;
    st.targetPhotoId = null;
    if (typeof render === 'function') render();
    alert('Фотография «' + photo.title + '» отправлена в диалог с ' + userName + '!');
  };

  window.ltCreateNewAlbum = function () {
    const inp = document.getElementById('ltNewAlbumTitleInput');
    if (!inp || !inp.value.trim()) return;
    const data = loadAlbumsData();
    data.albums.unshift({ id: 'alb_' + Date.now(), title: inp.value.trim() });
    saveAlbumsData(data);
    window._ltAlbumsState.activeModal = null;
    if (typeof render === 'function') render();
  };

  window.ltUploadNewPhoto = function () {
    const titleInp = document.getElementById('ltUploadPhotoTitle');
    const albumSel = document.getElementById('ltUploadPhotoAlbum');
    const urlInp = document.getElementById('ltUploadPhotoUrl');
    const fileInp = document.getElementById('ltUploadPhotoFile');

    const title = titleInp && titleInp.value.trim() ? titleInp.value.trim() : 'Новая фотография';
    const albumId = albumSel ? albumSel.value : 'alb_notes';

    function finishSave(imgData) {
      const data = loadAlbumsData();
      data.photos.unshift({
        id: 'ph_' + Date.now(),
        albumId: albumId,
        title: title,
        image: imgData || '',
        color: 'linear-gradient(135deg,#2d1216,#14161f)',
        hidden: false,
        createdAt: Date.now()
      });
      saveAlbumsData(data);
      window._ltAlbumsState.activeModal = null;
      if (typeof render === 'function') render();
    }

    if (fileInp && fileInp.files && fileInp.files.at(0)) {
      const reader = new FileReader();
      reader.onload = function (ev) { finishSave(ev.target.result); };
      reader.readAsDataURL(fileInp.files.at(0));
    } else {
      finishSave(urlInp ? urlInp.value.trim() : '');
    }
  };
  /* === МОДАЛЬНЫЕ ОКНА (ПОДЕЛИТЬСЯ, ПЕРЕМЕСТИТЬ, ДОБАВИТЬ В АЛЬБОМ, ЗАГРУЗКА) === */
  function buildAlbumsModalHtml(data) {
    const st = window._ltAlbumsState;
    if (!st.activeModal) return '';

    if (st.activeModal === 'move' || st.activeModal === 'copyToAlbum') {
      const heading = st.activeModal === 'move' ? 'Переместить в альбом' : 'Добавить в свой альбом';
      return '<div class="lt-alb-modal-backdrop" onclick="window._ltAlbumsState.activeModal=null; render();">' +
        '<div class="lt-alb-modal-box" onclick="event.stopPropagation();">' +
          '<div class="lt-prof-card-title"><span>' + heading + '</span>' +
            '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="window._ltAlbumsState.activeModal=null; render();">✕</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:6px;">' +
            data.albums.map(function (alb) {
              return '<button class="btn-secondary" style="text-align:left; justify-content:space-between; display:flex;" onclick="ltConfirmMoveOrCopy(\'' + alb.id + '\')">' +
                '<span>' + alb.title + '</span>' +
                '<span style="color:#9ea4b0; font-size:0.76rem;">Выбрать →</span>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (st.activeModal === 'share') {
      const dialogs = loadDialogs();
      const friends = getFriendsForShare();
      const q = (st.shareSearch || '').toLowerCase().trim();
      const filteredFriends = friends.filter(function (f) {
        return !q || (f.name && f.name.toLowerCase().includes(q)) || (f.handle && f.handle.toLowerCase().includes(q));
      });

      return '<div class="lt-alb-modal-backdrop" onclick="window._ltAlbumsState.activeModal=null; render();">' +
        '<div class="lt-alb-modal-box" onclick="event.stopPropagation();">' +
          '<div class="lt-prof-card-title"><span>Поделиться в сообщениях</span>' +
            '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="window._ltAlbumsState.activeModal=null; render();">✕</button>' +
          '</div>' +
          '<div style="font-size:0.78rem; color:#9ea4b0; margin-bottom:6px;">Активные диалоги</div>' +
          '<div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">' +
            dialogs.map(function (d) {
              return '<div style="padding:7px 10px; background:rgba(10,11,15,0.8); border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
                '<div style="min-width:0;">' +
                  '<div style="color:#fff; font-weight:600; font-size:0.86rem;">' + d.name + '</div>' +
                  '<div style="color:#9ea4b0; font-size:0.74rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + d.lastMsg + '</div>' +
                '</div>' +
                '<button class="btn-primary" style="padding:4px 10px; font-size:0.76rem;" onclick="ltSharePhotoToUser(\'' + d.id + '\', \'' + d.name.replace(/'/g, "\\'") + '\', \'' + (d.handle || '') + '\')">Отправить</button>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div style="font-size:0.78rem; color:#9ea4b0; margin-bottom:6px;">Найти друга (новый диалог)</div>' +
          '<input id="ltShareFriendSearch" class="input-dark" placeholder="Поиск по имени или @нику друга..." value="' + (st.shareSearch || '') + '" oninput="window._ltAlbumsState.shareSearch=this.value; render();" style="margin-bottom:8px;" />' +
          '<div style="display:flex; flex-direction:column; gap:5px; max-height:150px; overflow-y:auto;">' +
            (filteredFriends.length ? filteredFriends.map(function (f) {
              return '<div style="padding:6px 10px; background:rgba(10,11,15,0.65); border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center; gap:8px;">' +
                '<span style="color:#e5e7eb; font-size:0.84rem;">' + f.name + ' <span style="color:#9ea4b0;">' + (f.handle || '') + '</span></span>' +
                '<button class="btn-secondary" style="padding:3px 9px; font-size:0.75rem;" onclick="ltSharePhotoToUser(\'' + f.id + '\', \'' + f.name.replace(/'/g, "\\'") + '\', \'' + (f.handle || '') + '\')">Написать</button>' +
              '</div>';
            }).join('') : '<div style="color:#9ea4b0; font-size:0.8rem;">Друзья не найдены</div>') +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (st.activeModal === 'createAlbum') {
      return '<div class="lt-alb-modal-backdrop" onclick="window._ltAlbumsState.activeModal=null; render();">' +
        '<div class="lt-alb-modal-box" onclick="event.stopPropagation();">' +
          '<div class="lt-prof-card-title"><span>Создать новый альбом</span>' +
            '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="window._ltAlbumsState.activeModal=null; render();">✕</button>' +
          '</div>' +
          '<input id="ltNewAlbumTitleInput" class="input-dark" placeholder="Название альбома (например: Диалоги из дорам)" style="margin-bottom:10px;" />' +
          '<button class="btn-primary" style="width:100%;" onclick="ltCreateNewAlbum()">Создать альбом</button>' +
        '</div>' +
      '</div>';
    }

    if (st.activeModal === 'upload') {
      return '<div class="lt-alb-modal-backdrop" onclick="window._ltAlbumsState.activeModal=null; render();">' +
        '<div class="lt-alb-modal-box" onclick="event.stopPropagation();">' +
          '<div class="lt-prof-card-title"><span>Загрузить фотографию</span>' +
            '<button class="btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="window._ltAlbumsState.activeModal=null; render();">✕</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:8px;">' +
            '<input id="ltUploadPhotoTitle" class="input-dark" placeholder="Подпись к фото" />' +
            '<select id="ltUploadPhotoAlbum" class="input-dark">' +
              data.albums.map(function (a) { return '<option value="' + a.id + '">' + a.title + '</option>'; }).join('') +
            '</select>' +
            '<label style="font-size:0.78rem; color:#9ea4b0;">Выбрать файл с компьютера:</label>' +
            '<input id="ltUploadPhotoFile" type="file" accept="image/*" style="color:#e5e7eb; font-size:0.82rem;" />' +
            '<input id="ltUploadPhotoUrl" class="input-dark" placeholder="Или вставьте прямую ссылку https://..." />' +
            '<button class="btn-primary" onclick="ltUploadNewPhoto()">Добавить в альбом</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    return '';
  }

  /* === СТРАНИЦА «АЛЬБОМЫ» ПО МАКЕТУ === */
  window.renderUserAlbumsView = function (ws) {
    const data = loadAlbumsData();
    const st = window._ltAlbumsState;
    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';

    const visiblePhotos = data.photos
      .filter(function (ph) {
        if (!isSelf && ph.hidden) return false;
        if (st.selectedAlbumId !== 'all' && ph.albumId !== st.selectedAlbumId) return false;
        return true;
      })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

    const maxOffset = Math.max(0, data.albums.length - 4);
    if (st.carouselOffset > maxOffset) st.carouselOffset = maxOffset;
    if (st.carouselOffset < 0) st.carouselOffset = 0;
    const shownAlbums = data.albums.slice(st.carouselOffset, st.carouselOffset + 4);

    const topRowPhotos = visiblePhotos.slice(0, 3);
    const bottomRowPhotos = visiblePhotos.slice(3);

    function renderPhotoTile(ph, extraClass) {
      const bgStyle = ph.image
        ? 'background-image:url(\'' + ph.image + '\'); background-size:cover; background-position:center;'
        : 'background:' + ph.color + ';';
      return '<div class="lt-alb-photo-item ' + extraClass + (ph.hidden ? ' is-hidden' : '') + '"' +
        ' style="' + bgStyle + '"' +
        ' oncontextmenu="openPhotoContextMenu(event, \'' + ph.id + '\')"' +
        ' title="Правый клик — меню действий">' +
        '<div class="lt-alb-photo-caption">' +
          '<span>' + ph.title + '</span>' +
          (ph.hidden ? '<span style="color:#f87171; font-size:0.7rem;">Скрыто</span>' : '') +
        '</div>' +
      '</div>';
    }

    ws.innerHTML =
      '<div class="lt-albums-shell">' +
        '<div class="lt-albums-topbar">' +
          '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">' +
            '<h2 style="margin:0; font-size:1.15rem; color:#fff;">Альбомы</h2>' +
            (st.selectedAlbumId !== 'all'
              ? '<button class="btn-secondary" style="padding:4px 10px; font-size:0.78rem;" onclick="window._ltAlbumsState.selectedAlbumId=\'all\'; render();">Показать все фото</button>'
              : '') +
          '</div>' +
          (isSelf ? (
            '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
              '<button class="btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="window._ltAlbumsState.activeModal=\'createAlbum\'; render();">+ Создать альбом</button>' +
              '<button class="btn-primary" style="padding:6px 12px; font-size:0.8rem;" onclick="window._ltAlbumsState.activeModal=\'upload\'; render();">+ Загрузить фото</button>' +
            '</div>'
          ) : '') +
        '</div>' +

        '<div class="lt-alb-carousel-row">' +
          '<button class="lt-alb-arrow-btn" ' + (st.carouselOffset <= 0 ? 'disabled' : '') +
            ' onclick="window._ltAlbumsState.carouselOffset--; render();">«</button>' +
          '<div class="lt-alb-cards-grid">' +
            shownAlbums.map(function (alb) {
                            const albumPhotos = data.photos
                .filter(function (x) { return x.albumId === alb.id && (isSelf || !x.hidden); })
                .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
              const lastPh = albumPhotos.at(0);
              const coverBg = lastPh
                ? (lastPh.image ? 'background-image:url(\'' + lastPh.image + '\'); background-size:cover; background-position:center;' : 'background:' + lastPh.color + ';')
                : 'background:linear-gradient(135deg,#181a24,#261216);';
              const isSelected = st.selectedAlbumId === alb.id;

              return '<div class="lt-alb-card ' + (isSelected ? 'is-active' : '') + '"' +
                ' style="' + coverBg + '"' +
                ' onclick="window._ltAlbumsState.selectedAlbumId = (window._ltAlbumsState.selectedAlbumId === \'' + alb.id + '\' ? \'all\' : \'' + alb.id + '\'); render();">' +
                '<div class="lt-alb-card-footer">' +
                  '<span class="lt-alb-card-title">' + alb.title + '</span>' +
                  '<span class="lt-alb-card-count">' + albumPhotos.length + '</span>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<button class="lt-alb-arrow-btn" ' + (st.carouselOffset >= maxOffset ? 'disabled' : '') +
            ' onclick="window._ltAlbumsState.carouselOffset++; render();">»</button>' +
        '</div>' +

        '<div class="lt-alb-photos-section">' +
          (topRowPhotos.length ? (
            '<div class="lt-alb-grid-top">' +
              topRowPhotos.map(function (ph) { return renderPhotoTile(ph, 'is-large'); }).join('') +
            '</div>'
          ) : '<div style="color:#9ea4b0; font-size:0.88rem; padding:16px;">В этом альбоме пока нет фотографий.</div>') +

          (bottomRowPhotos.length ? (
            '<div class="lt-alb-grid-bottom">' +
              bottomRowPhotos.map(function (ph) { return renderPhotoTile(ph, 'is-small'); }).join('') +
            '</div>'
          ) : '') +
        '</div>' +

        buildAlbumsModalHtml(data) +
      '</div>';
  };

  /* === СИНХРОНИЗАЦИЯ БЛОКА «АЛЬБОМЫ» В ПРОФИЛЕ И ПОДКЛЮЧЕНИЕ В RENDER === */
  function syncProfileAlbumsWidget() {
    if (typeof curTab === 'undefined' || curTab !== 'profile') return;
    const data = loadAlbumsData();
    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    const latest4 = data.photos
      .filter(function (ph) { return isSelf || !ph.hidden; })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); })
      .slice(0, 4);

    const grid = document.querySelector('.lt-prof-photos-grid');
    if (!grid) return;

    const card = grid.closest('.lt-prof-card');
    if (card) {
      const titleEl = card.querySelector('.lt-prof-card-title');
      if (titleEl) {
        titleEl.innerHTML = '<span style="cursor:pointer; color:#fff;" onclick="openUserAlbumsPage(\'all\')" title="Открыть все альбомы">Альбомы</span>';
      }
    }

    grid.innerHTML = latest4.map(function (ph) {
      const bgStyle = ph.image
        ? 'background-image:url(\'' + ph.image + '\'); background-size:cover; background-position:center;'
        : 'background:' + ph.color + ';';
      return '<div class="lt-prof-photo-tile ' + (ph.hidden ? 'is-hidden' : '') + '"' +
        ' style="' + bgStyle + '"' +
        ' title="' + ph.title + ' (правый клик — меню)"' +
        ' onclick="openUserAlbumsPage(\'' + ph.albumId + '\')"' +
        ' oncontextmenu="openPhotoContextMenu(event, \'' + ph.id + '\')">' +
        '<span>' + (ph.hidden ? 'Скрыто' : ph.title) + '</span>' +
      '</div>';
    }).join('');

    const shell = document.querySelector('.lt-profile-shell');
    if (shell && window._ltAlbumsState.activeModal) {
      let holder = document.getElementById('ltProfileAlbumsModalHolder');
      if (!holder) {
        holder = document.createElement('div');
        holder.id = 'ltProfileAlbumsModalHolder';
        shell.appendChild(holder);
      }
      holder.innerHTML = buildAlbumsModalHtml(data);
    }
  }

  const _prevRenderBeforeAlbums = window.render;
  window.render = function () {
    ensureHistoryButtons();
    if (typeof curTab !== 'undefined' && curTab === 'albums') {
      document.body.classList.add('is-home');
      const ws = document.getElementById('workspace');
      if (ws) {
        window.renderUserAlbumsView(ws);
        return;
      }
    }
    const res = typeof _prevRenderBeforeAlbums === 'function' ? _prevRenderBeforeAlbums() : undefined;
    syncProfileAlbumsWidget();
    return res;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureHistoryButtons);
  } else {
    ensureHistoryButtons();
  }
})();

