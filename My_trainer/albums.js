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
    const accBtn = document.getElementById('topAccountBtn');
    const parent = accBtn ? accBtn.parentElement : document.querySelector('header');
    if (!parent) return;
    parent.style.marginLeft = 'auto';
    parent.style.display = 'flex';
    parent.style.alignItems = 'center';
    parent.style.gap = '8px';
    const wrap = document.createElement('div');
    wrap.id = 'ltHistNavWrap';
    wrap.className = 'lt-hist-nav-wrap';
    wrap.innerHTML =
      '<button id="ltHistBackBtn" class="lt-hist-btn" title="Назад" onclick="ltHistoryBack()">«</button>' +
      '<button id="ltHistFwdBtn" class="lt-hist-btn" title="Вперёд" onclick="ltHistoryForward()">»</button>';
    parent.appendChild(wrap);
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
    data.albums.unshift({ id: 'alb_' + Date.now(), title: inp.value.trim(), privacy: 'public' });
    saveAlbumsData(data);
    window._ltAlbumsState.activeModal = null;
    if (typeof render === 'function') render();
  };

  window.openAlbumContextMenu = function (e, albumId) {
    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    if (!isSelf) return;
    e.preventDefault();
    e.stopPropagation();
    closePhotoContextMenu();

    const data = loadAlbumsData();
    const alb = data.albums.find(x => x.id === albumId);
    if (!alb) return;

    const menu = document.createElement('div');
    menu.id = 'ltPhotoCtxMenu';
    menu.className = 'lt-ctx-menu';
    menu.innerHTML =
      '<button onclick="ltAlbumAction(\'hidden\', \'' + albumId + '\')">' + (alb.privacy === 'hidden' ? '✓ Скрыт (сделать публичным)' : 'Скрыть') + '</button>' +
      '<button onclick="ltAlbumAction(\'friends\', \'' + albumId + '\')">' + (alb.privacy === 'friends' ? '✓ Только для друзей (снять)' : 'Только для друзей') + '</button>' +
      '<button style="color:#ff8787;" onclick="ltAlbumAction(\'delete\', \'' + albumId + '\')">Удалить альбом</button>';

    document.body.appendChild(menu);
    const maxX = window.innerWidth - 220;
    const maxY = window.innerHeight - 160;
    menu.style.left = Math.max(8, Math.min(e.clientX, maxX)) + 'px';
    menu.style.top = Math.max(8, Math.min(e.clientY, maxY)) + 'px';
  };

  window.ltAlbumAction = function (action, albumId) {
    closePhotoContextMenu();
    const data = loadAlbumsData();
    const alb = data.albums.find(x => x.id === albumId);
    if (!alb) return;

    if (action === 'hidden') {
      alb.privacy = alb.privacy === 'hidden' ? 'public' : 'hidden';
      saveAlbumsData(data);
      if (typeof render === 'function') render();
      return;
    }

    if (action === 'friends') {
      alb.privacy = alb.privacy === 'friends' ? 'public' : 'friends';
      saveAlbumsData(data);
      if (typeof render === 'function') render();
      return;
    }

    if (action === 'delete') {
      if (!confirm('Удалить альбом «' + alb.title + '» и все фотографии внутри него?')) return;
      data.albums = data.albums.filter(x => x.id !== albumId);
      data.photos = data.photos.filter(p => p.albumId !== albumId);
      if (window._ltAlbumsState.selectedAlbumId === albumId) {
        window._ltAlbumsState.selectedAlbumId = 'all';
      }
      saveAlbumsData(data);
      if (typeof render === 'function') render();
    }
  };

  function compressImageDataUrl(dataUrl, callback) {
    const img = new Image();
    img.onload = function () {
      const maxSide = 900;
      let w = img.width;
      let h = img.height;
      if (w > maxSide || h > maxSide) {
        if (w > h) { h = Math.round(h * maxSide / w); w = maxSide; }
        else { w = Math.round(w * maxSide / h); h = maxSide; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = function () { callback(dataUrl); };
    img.src = dataUrl;
  }

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

    const pickedFile = (fileInp && fileInp.files && fileInp.files.length > 0) ? fileInp.files.item(0) : null;
    if (pickedFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        compressImageDataUrl(ev.target.result, finishSave);
      };
      reader.readAsDataURL(pickedFile);
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

      const visibleAlbums = data.albums.filter(function (alb) {
      if (isSelf) return true;
      if (alb.privacy === 'hidden') return false;
      if (alb.privacy === 'friends') {
        return window._ltProfileState && window._ltProfileState.guestFriendStatus === 'friend';
      }
      return true;
    });

    const maxOffset = Math.max(0, visibleAlbums.length - 4);
    if (st.carouselOffset > maxOffset) st.carouselOffset = maxOffset;
    if (st.carouselOffset < 0) st.carouselOffset = 0;
    const shownAlbums = visibleAlbums.slice(st.carouselOffset, st.carouselOffset + 4);

    const topRowPhotos = visiblePhotos.slice(0, 3);
    const bottomRowPhotos = visiblePhotos.slice(3);

    function renderPhotoTile(ph, extraClass) {
      const bgStyle = ph.image
        ? 'background-image:url(\'' + ph.image + '\'); background-size:cover; background-position:center;'
        : 'background:' + ph.color + ';';
      return '<div class="lt-alb-photo-item ' + extraClass + (ph.hidden ? ' is-hidden' : '') + '"' +
        ' style="' + bgStyle + '"' +
        ' oncontextmenu="openPhotoContextMenu(event, \'' + ph.id + '\')"' +
             ' onclick="ltOpenPhotoViewerById(\'' + ph.id + '\', window._ltAlbumsState.selectedAlbumId)"' +
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
              const privBadge = (isSelf && alb.privacy === 'hidden')
                ? '<span style="color:#f87171; font-size:0.68rem;">[Скрыт]</span>'
                : ((isSelf && alb.privacy === 'friends') ? '<span style="color:#fbbf24; font-size:0.68rem;">[Друзья]</span>' : '');

              return '<div class="lt-alb-card ' + (isSelected ? 'is-active' : '') + '"' +
                ' style="' + coverBg + '"' +
                ' oncontextmenu="openAlbumContextMenu(event, \'' + alb.id + '\')"' +
                ' onclick="window._ltAlbumsState.selectedAlbumId = (window._ltAlbumsState.selectedAlbumId === \'' + alb.id + '\' ? \'all\' : \'' + alb.id + '\'); render();">' +
                '<div class="lt-alb-card-footer">' +
                  '<span class="lt-alb-card-title">' + alb.title + ' ' + privBadge + '</span>' +
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
               const avaBox = document.querySelector('.lt-prof-avatar-box');
    if (avaBox) {
      avaBox.style.cursor = 'pointer';
      avaBox.title = 'Нажмите, чтобы открыть фотографии профиля';
      avaBox.onclick = function (e) {
        if (e.target && e.target.closest('.lt-ava-upload-bar')) return;
        if (typeof window.ltOpenAvatarViewer === 'function') window.ltOpenAvatarViewer(0);
      };
      if (isSelf && !avaBox.querySelector('.lt-ava-upload-bar')) {
        const bar = document.createElement('div');
        bar.className = 'lt-ava-upload-bar';
        bar.textContent = 'Загрузить фото';
        bar.title = 'Загрузить новое фото профиля';
        bar.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.ltTriggerAvatarUpload === 'function') window.ltTriggerAvatarUpload(e);
        };
        avaBox.appendChild(bar);
      }
    }
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
  /* === АВТОАЛЬБОМ «ФОТОГРАФИИ ПРОФИЛЯ» И СМЕНА АВАТАРА === */
  window.ltTriggerAvatarUpload = function () {
    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    if (!isSelf) return;

    let inp = document.getElementById('ltDirectAvatarFileInput');
    if (!inp) {
      inp = document.createElement('input');
      inp.type = 'file';
      inp.id = 'ltDirectAvatarFileInput';
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
            const maxSide = 600;
            let w = img.width;
            let h = img.height;
            if (w > maxSide || h > maxSide) {
              if (w > h) { h = Math.round(h * maxSide / w); w = maxSide; }
              else { w = Math.round(w * maxSide / h); h = maxSide; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            window.ltApplyNewProfileAvatar(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = function () { window.ltApplyNewProfileAvatar(ev.target.result); };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        inp.value = '';
      });
    }
    inp.click();
  };

  window.ltApplyNewProfileAvatar = function (imageUrl) {
    if (!imageUrl) return;
    // 1. Обновляем текущий аватар в профиле
    try {
      const pRaw = localStorage.getItem('lt_user_profile_v1');
      const p = pRaw ? JSON.parse(pRaw) : {};
      p.avatar = imageUrl;
      localStorage.setItem('lt_user_profile_v1', JSON.stringify(p));
    } catch (e) {}

    // 2. Создаём (если ещё нет) альбом «Фотографии профиля» и добавляем фото в начало ленты
    let data = { albums: [], photos: [] };
try { const r = localStorage.getItem('lt_user_albums_v1'); if (r) data = JSON.parse(r); } catch (e) {}
    let avatarAlbum = data.albums.find(a => a.id === 'alb_avatars');
    if (!avatarAlbum) {
      avatarAlbum = { id: 'alb_avatars', title: 'Фотографии профиля', privacy: 'public' };
      data.albums.unshift(avatarAlbum);
    }

    data.photos.unshift({
      id: 'ph_' + Date.now(),
      albumId: 'alb_avatars',
      title: 'Фотография профиля',
      image: imageUrl,
      color: 'linear-gradient(135deg,#2d1216,#14161f)',
      hidden: false,
      createdAt: Date.now()
    });
    try { localStorage.setItem('lt_user_albums_v1', JSON.stringify(data)); } catch (e) {}
    if (typeof render === 'function') render();
  };
/* === ЕДИНЫЙ ПРОСМОТРЩИК ФОТОГРАФИЙ ПО МАКЕТУ === */
(function () {
  const ALB_KEY = 'lt_user_albums_v1';
  const PROF_KEY = 'lt_user_profile_v1';

  function getAlbumsSafe() {
    try {
      const raw = localStorage.getItem(ALB_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (Array.isArray(p.albums) && Array.isArray(p.photos)) return p;
      }
    } catch (e) {}
    return { albums: [], photos: [] };
  }

  function setAlbumsSafe(data) {
    try { localStorage.setItem(ALB_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function getAuthorNick() {
    try {
      const p = JSON.parse(localStorage.getItem(PROF_KEY) || '{}');
      if (p.nick) return p.nick;
    } catch (e) {}
    return 'ekstshafor';
  }

  window._ltPhotoModalState = {
    list: [],
    idx: 0,
    editingDesc: false,
    descMenuOpen: false,
    stickerPickerOpen: false
  };

  window.ltOpenPhotoViewerById = function (photoId, albumFilter) {
    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    const data = getAlbumsSafe();
    const list = data.photos
      .filter(function (ph) {
        if (!isSelf && ph.hidden) return false;
        if (albumFilter && albumFilter !== 'all' && ph.albumId !== albumFilter) return false;
        return true;
      })
      .sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

    if (!list.length) return;
    let foundIdx = list.findIndex(function (x) { return x.id === photoId; });
    if (foundIdx < 0) foundIdx = 0;

    window._ltPhotoModalState.list = list;
    window._ltPhotoModalState.idx = foundIdx;
    window._ltPhotoModalState.editingDesc = false;
    window._ltPhotoModalState.descMenuOpen = false;
    window._ltPhotoModalState.stickerPickerOpen = false;
    renderPhotoViewerModal();
  };

   window.ltOpenAvatarViewer = function (startIdx) {
    let curAvatar = '';
    try { curAvatar = JSON.parse(localStorage.getItem(PROF_KEY) || '{}').avatar || ''; } catch (e) {}

    const data = getAlbumsSafe();
    let avatarAlbum = data.albums.find(function (a) { return a.id === 'alb_avatars'; });
    let avaPhotos = data.photos.filter(function (x) { return x.albumId === 'alb_avatars'; });

    if (curAvatar && !avaPhotos.some(function (x) { return x.image === curAvatar; })) {
      if (!avatarAlbum) {
        avatarAlbum = { id: 'alb_avatars', title: 'Фотографии профиля', privacy: 'public' };
        data.albums.unshift(avatarAlbum);
      }
      data.photos.unshift({
        id: 'ph_' + Date.now(),
        albumId: 'alb_avatars',
        title: 'Фотография профиля',
        image: curAvatar,
        color: 'linear-gradient(135deg,#2d1216,#14161f)',
        hidden: false,
        createdAt: Date.now()
      });
      setAlbumsSafe(data);
      avaPhotos = data.photos.filter(function (x) { return x.albumId === 'alb_avatars'; });
    }

    if (!avaPhotos.length) {
      alert('В альбоме «Фотографии профиля» пока нет загруженных фотографий. Нажмите «Загрузить фото» внизу аватара.');
      return;
    }

    const firstAva = avaPhotos.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); }).at(0);
    window.ltOpenPhotoViewerById(firstAva.id, 'alb_avatars');
  };

  window.ltViewerStep = function (delta) {
    const st = window._ltPhotoModalState;
    if (!st.list.length) return;
    st.idx = (st.idx + delta + st.list.length) % st.list.length;
    st.editingDesc = false;
    st.descMenuOpen = false;
    st.stickerPickerOpen = false;
    renderPhotoViewerModal();
  };

  window.ltViewerSaveDesc = function () {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    const inp = document.getElementById('ltViewerDescTextarea');
    if (!cur || !inp) return;
    const data = getAlbumsSafe();
    const real = data.photos.find(function (x) { return x.id === cur.id; });
    if (real) {
      real.description = inp.value.trim();
      cur.description = real.description;
      setAlbumsSafe(data);
    }
    st.editingDesc = false;
    renderPhotoViewerModal();
  };

  window.ltViewerDeleteDesc = function () {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    if (!cur) return;
    const data = getAlbumsSafe();
    const real = data.photos.find(function (x) { return x.id === cur.id; });
    if (real) {
      real.description = '';
      cur.description = '';
      setAlbumsSafe(data);
    }
    st.descMenuOpen = false;
    st.editingDesc = false;
    renderPhotoViewerModal();
  };

  window.ltViewerToggleComments = function () {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    if (!cur) return;
    const data = getAlbumsSafe();
    const real = data.photos.find(function (x) { return x.id === cur.id; });
    if (real) {
      real.commentsEnabled = real.commentsEnabled === false ? true : false;
      cur.commentsEnabled = real.commentsEnabled;
      setAlbumsSafe(data);
    }
    renderPhotoViewerModal();
  };

  window.ltViewerAddComment = function (stickerText) {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    const inp = document.getElementById('ltViewerCommentInput');
    const text = stickerText || (inp ? inp.value.trim() : '');
    if (!cur || !text) return;

    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const newComment = {
      id: 'c_' + Date.now(),
      author: getAuthorNick(),
      time: 'Сегодня в ' + timeStr,
      text: text
    };

    const data = getAlbumsSafe();
    const real = data.photos.find(function (x) { return x.id === cur.id; });
    if (real) {
      if (!Array.isArray(real.comments)) real.comments = [];
      real.comments.push(newComment);
      cur.comments = real.comments;
      setAlbumsSafe(data);
    } else {
      if (!Array.isArray(cur.comments)) cur.comments = [];
      cur.comments.push(newComment);
    }
    st.stickerPickerOpen = false;
    renderPhotoViewerModal();
  };

  window.ltViewerDeleteComment = function (commentId) {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    if (!cur) return;
    const data = getAlbumsSafe();
    const real = data.photos.find(function (x) { return x.id === cur.id; });
    if (real && Array.isArray(real.comments)) {
      real.comments = real.comments.filter(function (c) { return c.id !== commentId; });
      cur.comments = real.comments;
      setAlbumsSafe(data);
    }
    renderPhotoViewerModal();
  };
  window.ltViewerSetMainAvatar = function (photoId) {
    const data = getAlbumsSafe();
    const ph = data.photos.find(function (x) { return x.id === photoId; });
    if (!ph || !ph.image) return;
    try {
      const pRaw = localStorage.getItem(PROF_KEY);
      const p = pRaw ? JSON.parse(pRaw) : {};
      p.avatar = ph.image;
      localStorage.setItem(PROF_KEY, JSON.stringify(p));
    } catch (e) {}
    const m = document.getElementById('ltPhotoViewerOverlay');
    if (m) m.remove();
    if (typeof render === 'function') render();
  };

  window.ltViewerDeleteCurrentPhoto = function (photoId) {
    const data = getAlbumsSafe();
    data.photos = data.photos.filter(function (x) { return x.id !== photoId; });
    setAlbumsSafe(data);
    const st = window._ltPhotoModalState;
    st.list = st.list.filter(function (x) { return x.id !== photoId; });
    if (!st.list.length) {
      const m = document.getElementById('ltPhotoViewerOverlay');
      if (m) m.remove();
      if (typeof render === 'function') render();
      return;
    }
    if (st.idx >= st.list.length) st.idx = 0;
    renderPhotoViewerModal();
    if (typeof render === 'function') render();
  };

  window.renderPhotoViewerModal = function () {
    const st = window._ltPhotoModalState;
    const cur = st.list.at(st.idx);
    if (!cur) return;

    const isSelf = !window._ltProfileState || window._ltProfileState.viewMode === 'self';
    const isAvatarAlbum = cur.albumId === 'alb_avatars';
    const authorName = getAuthorNick();
    const commentsOn = cur.commentsEnabled !== false;
    const comments = Array.isArray(cur.comments) ? cur.comments : [];

    let overlay = document.getElementById('ltPhotoViewerOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ltPhotoViewerOverlay';
      overlay.className = 'lt-pv-overlay';
      overlay.onclick = function () { overlay.remove(); };
      document.body.appendChild(overlay);
    }

    const mediaHtml = cur.image
      ? '<img src="' + cur.image + '" alt="' + (cur.title || 'Фото') + '" />'
      : '<div class="lt-pv-color-stub" style="background:' + (cur.color || '#181a24') + ';">' + (cur.title || '') + '</div>';

    // Кнопки под фотографией (зелёный контур по макету)
    let bottomBtnsHtml = '';
    if (isSelf) {
      bottomBtnsHtml =
        (isAvatarAlbum && cur.image
          ? '<button class="lt-pv-under-btn" onclick="ltViewerSetMainAvatar(\'' + cur.id + '\')">Сделать фото профиля</button>'
          : '') +
        '<button class="lt-pv-under-btn" onclick="document.getElementById(\'ltPhotoViewerOverlay\').remove(); ltPhotoAction(\'share\', \'' + cur.id + '\');">Поделиться</button>' +
        '<button class="lt-pv-under-btn is-danger" onclick="ltViewerDeleteCurrentPhoto(\'' + cur.id + '\')">Удалить</button>';
    } else {
      bottomBtnsHtml =
        '<button class="lt-pv-under-btn" onclick="document.getElementById(\'ltPhotoViewerOverlay\').remove(); ltPhotoAction(\'share\', \'' + cur.id + '\');">Поделиться</button>' +
        '<button class="lt-pv-under-btn is-danger" onclick="document.getElementById(\'ltPhotoViewerOverlay\').remove(); ltPhotoAction(\'report\', \'' + cur.id + '\');">Пожаловаться</button>';
    }

    // Блок описания (для всех фото, кроме альбома «Фотографии профиля»)
    let descBlockHtml = '';
    if (!isAvatarAlbum) {
      const descText = cur.description || '';
      descBlockHtml =
        '<div class="lt-pv-desc-box">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">' +
            '<div style="font-size:0.84rem; color:' + (descText ? '#e5e7eb' : '#9ea4b0') + '; line-height:1.45; flex:1;">' +
              (descText || (isSelf ? 'Нет описания фотографии' : '')) +
            '</div>' +
            (isSelf ? (
              '<div style="position:relative;">' +
                '<button class="lt-pv-mini-btn" title="Действия с описанием" onclick="window._ltPhotoModalState.descMenuOpen = !window._ltPhotoModalState.descMenuOpen; renderPhotoViewerModal();">▾</button>' +
                (st.descMenuOpen ? (
                  '<div class="lt-prof-dropdown-menu open" style="min-width:155px;">' +
                    '<button onclick="window._ltPhotoModalState.editingDesc=true; window._ltPhotoModalState.descMenuOpen=false; renderPhotoViewerModal();">Редактировать</button>' +
                    '<button style="color:#ff8787;" onclick="ltViewerDeleteDesc()">Удалить</button>' +
                  '</div>'
                ) : '') +
              '</div>'
            ) : '') +
          '</div>' +
          (st.editingDesc ? (
            '<div style="margin-top:8px;">' +
              '<textarea id="ltViewerDescTextarea" class="textarea-dark" rows="2" placeholder="Введите описание фотографии...">' + descText + '</textarea>' +
              '<div style="display:flex; gap:6px; margin-top:6px;">' +
                '<button class="btn-primary" style="padding:4px 10px; font-size:0.78rem;" onclick="ltViewerSaveDesc()">Сохранить</button>' +
                '<button class="btn-secondary" style="padding:4px 10px; font-size:0.78rem;" onclick="window._ltPhotoModalState.editingDesc=false; renderPhotoViewerModal();">Отмена</button>' +
              '</div>' +
            '</div>'
          ) : '') +
        '</div>';
    }

    const stickers = ['잘했어요! (Отлично!)', '화이팅! (Удачи!)', '감사합니다 (Спасибо)', '멋져요! (Круто!)', '공부 중 (Учу слова)'];

    overlay.innerHTML =
           '<div class="lt-pv-stage-wrap" onclick="event.stopPropagation();">' +
        '<button class="lt-pv-close-outer" onclick="document.getElementById(\'ltPhotoViewerOverlay\').remove();" title="Закрыть">✕</button>' +
        '<button class="lt-pv-side-arrow" ' + (st.list.length <= 1 ? 'disabled' : '') + ' onclick="ltViewerStep(-1)" title="Предыдущее фото">«</button>' +

        '<div class="lt-pv-window">' +
          '<div class="lt-pv-left">' +
            '<div class="lt-pv-media">' + mediaHtml + '</div>' +
            '<div class="lt-pv-under-bar">' + bottomBtnsHtml + '</div>' +
          '</div>' +

          '<div class="lt-pv-right">' +
            '<div class="lt-pv-header">' +
              '<div>' +
                '<div style="font-weight:700; color:#fff; font-size:0.98rem;">' + authorName + '</div>' +
                '<div style="font-size:0.75rem; color:#9ea4b0;">Фото ' + (st.idx + 1) + ' из ' + st.list.length + '</div>' +
              '</div>' +
              '<div>' +
                (isSelf ? '<button class="lt-pv-mini-btn" title="Включить или отключить комментарии" onclick="ltViewerToggleComments()">' + (commentsOn ? 'Комм: вкл' : 'Комм: выкл') + '</button>' : '') +
              '</div>' +
            '</div>' +
            descBlockHtml +

            '<div class="lt-pv-comments-list">' +
              (!commentsOn
                ? '<div style="color:#9ea4b0; font-size:0.82rem; text-align:center; margin-top:20px;">Автор отключил комментарии к этой фотографии.</div>'
                : (comments.length
                    ? comments.map(function (c) {
                        return '<div class="lt-pv-comment-item">' +
                          '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">' +
                            '<span style="font-weight:600; color:#fff; font-size:0.82rem;">' + c.author + '</span>' +
                            '<span style="font-size:0.7rem; color:#9ea4b0;">' + c.time +
                              (isSelf ? ' <span style="color:#ff8787; cursor:pointer; margin-left:4px;" onclick="ltViewerDeleteComment(\'' + c.id + '\')">✕</span>' : '') +
                            '</span>' +
                          '</div>' +
                          '<div style="color:#e5e7eb; font-size:0.84rem; margin-top:3px; line-height:1.4;">' + c.text + '</div>' +
                        '</div>';
                      }).join('')
                    : '<div style="color:#9ea4b0; font-size:0.82rem; text-align:center; margin-top:20px;">Комментариев пока нет.</div>')) +
            '</div>' +

            (commentsOn ? (
              '<div class="lt-pv-composer">' +
                (st.stickerPickerOpen ? (
                  '<div class="lt-pv-sticker-bar">' +
                    stickers.map(function (s) {
                      return '<button class="btn-secondary" style="padding:3px 7px; font-size:0.74rem;" onclick="ltViewerAddComment(\'' + s + '\')">' + s + '</button>';
                    }).join('') +
                  '</div>'
                ) : '') +
                '<div class="lt-pv-composer-row">' +
                  '<textarea id="ltViewerCommentInput" class="textarea-dark" rows="2" placeholder="Написать комментарий..." onkeydown="if(event.key===\'Enter\' && !event.shiftKey){ event.preventDefault(); ltViewerAddComment(); }"></textarea>' +
                  '<div class="lt-pv-composer-btns">' +
                    '<button class="btn-primary" style="padding:5px 9px; font-size:0.78rem;" title="Отправить комментарий" onclick="ltViewerAddComment()">➤</button>' +
                    '<button class="btn-secondary" style="padding:5px 9px; font-size:0.78rem;" title="Быстрые стикеры / фразы" onclick="window._ltPhotoModalState.stickerPickerOpen = !window._ltPhotoModalState.stickerPickerOpen; renderPhotoViewerModal();">+</button>' +
                  '</div>' +
                '</div>' +
              '</div>'
            ) : '') +
          '</div>' +
        '</div>' +

        '<button class="lt-pv-side-arrow" ' + (st.list.length <= 1 ? 'disabled' : '') + ' onclick="ltViewerStep(1)" title="Следующее фото">»</button>' +
      '</div>';
  };

  document.addEventListener('keydown', function (e) {
    const ov = document.getElementById('ltPhotoViewerOverlay');
    if (!ov) return;
    if (e.key === 'Escape') ov.remove();
    if (e.key === 'ArrowLeft') window.ltViewerStep(-1);
    if (e.key === 'ArrowRight') window.ltViewerStep(1);
  });
})();

