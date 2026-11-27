/* === АЛЬБОМЫ И ЕДИНЫЙ ПРОСМОТРЩИК ФОТО (albums.page.js) === */
window.AlbumsPage = {
  selectedAlbumId: null, // null = все фото, либо 'avatars' | 'wall' | 'saved' | 'covers' | customId
  albumOffset: 0,
  viewerList: [],
  viewerIndex: 0,

     defaultAlbums: [
    { id: 'avatars', title: 'Фото профиля', system: true },
    { id: 'wall', title: 'Фото со стены', system: true },
    { id: 'saved', title: 'Сохранённые фото', system: true },
    { id: 'covers', title: 'Обложки', system: true },
    { id: 'notes', title: 'Конспекты', system: false }
  ],

  async fetchUserPhotos(targetUid) {
    const [userSnap, postsSnap, photosSnap] = await Promise.all([
      window.fbDb.collection('users').doc(targetUid).get(),
      window.fbDb.collection('posts').where('authorUid', '==', targetUid).get(),
      window.fbDb.collection('photos').where('ownerUid', '==', targetUid).get()
    ]);

    const prof = userSnap.exists ? userSnap.data() : {};
    const allPhotos = [];

    // 1. Загруженные в коллекцию photos (аватары, обложки, сохранённые, пользовательские)
    photosSnap.forEach(d => {
      allPhotos.push({ id: d.id, source: 'photos', ...d.data() });
    });

    // Подстраховка: если текущий аватар/обложка ещё не в коллекции photos, добавляем их в автоальбом
    if (prof.avatarUrl && !allPhotos.some(p => p.albumId === 'avatars' && p.url === prof.avatarUrl)) {
      allPhotos.push({ id: 'cur_avatar', source: 'virtual', albumId: 'avatars', ownerUid: targetUid, ownerNick: prof.nick, url: prof.avatarUrl, caption: '', createdAtMs: 1 });
    }
    if (prof.coverUrl && !allPhotos.some(p => p.albumId === 'covers' && p.url === prof.coverUrl)) {
      allPhotos.push({ id: 'cur_cover', source: 'virtual', albumId: 'covers', ownerUid: targetUid, ownerNick: prof.nick, url: prof.coverUrl, caption: '', createdAtMs: 1 });
    }

    // 2. Автоальбом "Фото со стены" (только фото, загруженные самим владельцем)
    postsSnap.forEach(d => {
      const p = d.data();
      if (p.imageUrl) {
        allPhotos.push({
          id: 'post_' + d.id,
          postId: d.id,
          source: 'post',
          albumId: 'wall',
          ownerUid: targetUid,
          ownerNick: p.authorNick || prof.nick,
          url: p.imageUrl,
          caption: p.text || '',
          comments: p.comments || [],
          createdAtMs: p.createdAtMs || 0
        });
      }
    });

    allPhotos.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
    return { prof, allPhotos };
  },

  async render(root, params = {}) {
    if (!AppState.user && !params.uid) {
      root.innerHTML =
        '<div class="lt-glass-modal" style="max-width:440px; margin:30px auto; text-align:center;">' +
          '<h3 style="margin-bottom:10px;">Войдите в аккаунт</h3>' +
          '<p class="lt-muted-text">Раздел «Альбомы и фото» доступен авторизованным пользователям.</p>' +
          '<button class="lt-btn-primary" onclick="AuthUI.open()">Войти / Регистрация</button>' +
        '</div>';
      return;
    }

    const targetUid = params.uid || AppState.user.uid;
    const isOwner = AppState.user && AppState.user.uid === targetUid;

    if (params.album !== undefined) {
      this.selectedAlbumId = params.album || null;
    }

    root.innerHTML = '<div style="text-align:center; padding:40px; color:#9ca3af;">Загрузка альбомов...</div>';

    try {
      const { prof, allPhotos } = await this.fetchUserPhotos(targetUid);
      const customAlbums = prof.customAlbums || [];
      const albums = [...this.defaultAlbums, ...customAlbums];

      // Карусель по 3 альбома со стрелками « и »
      const maxOffset = Math.max(0, albums.length - 3);
      if (this.albumOffset > maxOffset) this.albumOffset = maxOffset;
      const visibleAlbums = albums.slice(this.albumOffset, this.albumOffset + 3);

      const albumsHtml = visibleAlbums.map(alb => {
        const albPhotos = allPhotos.filter(p => p.albumId === alb.id);
        const lastImg = albPhotos.length ? albPhotos.at(0).url : '';
        const isSelected = this.selectedAlbumId === alb.id;
        return (
          '<div class="lt-alb-card ' + (isSelected ? 'active' : '') + '" ' +
            (lastImg ? 'style="background-image:url(\'' + lastImg + '\');"' : '') +
            ' onclick="AlbumsPage.selectAlbum(\'' + alb.id + '\', \'' + targetUid + '\')">' +
            '<div class="lt-alb-overlay">' +
              '<div class="lt-alb-title">' + alb.title + '</div>' +
              '<div class="lt-alb-count">' + albPhotos.length + ' фото</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      // Фильтр фотографий для сетки (все или выбранный альбом)
      const shownPhotos = this.selectedAlbumId
        ? allPhotos.filter(p => p.albumId === this.selectedAlbumId)
        : allPhotos;

      this.viewerList = shownPhotos;

      const topRow = shownPhotos.slice(0, 3);
      const bottomRows = shownPhotos.slice(3);

      const activeAlbObj = albums.find(a => a.id === this.selectedAlbumId);
      const sectionHeading = activeAlbObj ? 'Альбом: ' + activeAlbObj.title : 'Все фотографии (' + shownPhotos.length + ')';

      const canUploadHere = isOwner && (!this.selectedAlbumId || !['avatars', 'wall', 'saved', 'covers'].includes(this.selectedAlbumId));

      root.innerHTML =
        '<div class="lt-alb-shell">' +
          /* ВЕРХНЯЯ ПАНЕЛЬ ОКНА АЛЬБОМОВ */
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
              '<h3 style="font-size:1.05rem;">' + sectionHeading + '</h3>' +
              (this.selectedAlbumId ? '<button class="lt-btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="AlbumsPage.selectAlbum(null, \'' + targetUid + '\')">Показать все фото</button>' : '') +
            '</div>' +
            '<div style="display:flex; gap:8px; align-items:center;">' +
              (isOwner ? '<button class="lt-btn-secondary" style="padding:6px 12px; font-size:0.78rem;" onclick="AlbumsPage.openCreateAlbumModal()">+ Создать альбом</button>' : '') +
              (canUploadHere ? '<button class="lt-btn-primary" style="padding:6px 12px; font-size:0.78rem;" onclick="AlbumsPage.uploadToAlbum(\'' + (this.selectedAlbumId || 'notes') + '\')">+ Добавить фото</button>' : '') +
              '<button class="lt-icon-btn" style="border-color:#dc2626; font-weight:800;" title="Вернуться в профиль" onclick="Router.go(\'profile\', { uid: \'' + targetUid + '\' })">✕</button>' +
            '</div>' +
          '</div>' +

          /* ВЕРХНИЙ РЯД АЛЬБОМОВ СО СТРЕЛКАМИ « И » ПО БОКАМ */
          '<div class="lt-alb-carousel">' +
            '<button class="lt-icon-btn" ' + (this.albumOffset === 0 ? 'disabled style="opacity:0.35;"' : '') + ' onclick="AlbumsPage.shiftAlbums(-1)">«</button>' +
            '<div class="lt-alb-row">' + albumsHtml + '</div>' +
            '<button class="lt-icon-btn" ' + (this.albumOffset >= maxOffset ? 'disabled style="opacity:0.35;"' : '') + ' onclick="AlbumsPage.shiftAlbums(1)">»</button>' +
          '</div>' +

          /* СЕТКА ФОТОГРАФИЙ (СВЕРХУ 3 КРУПНЫХ, НИЖЕ ПО 4 МЕНЬШЕ) */
          (shownPhotos.length
            ? '<div class="lt-photo-grid-top">' +
                topRow.map((ph, idx) =>
                  '<div class="lt-photo-tile-lg" style="background-image:url(\'' + ph.url + '\');" onclick="AlbumsPage.openViewer(' + idx + ')"></div>'
                ).join('') +
              '</div>' +
              (bottomRows.length
                ? '<div class="lt-photo-grid-sm">' +
                    bottomRows.map((ph, idx) =>
                      '<div class="lt-photo-tile-sm" style="background-image:url(\'' + ph.url + '\');" onclick="AlbumsPage.openViewer(' + (idx + 3) + ')"></div>'
                    ).join('') +
                  '</div>'
                : '')
            : '<div style="padding:36px; text-align:center; color:#9ca3af; font-size:0.86rem;">В этом разделе пока нет фотографий.</div>') +
        '</div>';
    } catch (e) {
      root.innerHTML = '<div class="lt-form-msg" style="text-align:center;">Ошибка загрузки альбомов: ' + e.message + '</div>';
    }
  },
  shiftAlbums(dir) {
    this.albumOffset = Math.max(0, this.albumOffset + dir);
    Router.renderCurrent();
  },

  selectAlbum(albId, targetUid) {
    this.selectedAlbumId = albId;
    Router.go('albums', { uid: targetUid, album: albId || '' }, true);
  },

  openCreateAlbumModal() {
    GlassUI.openModal(
      'Создать новый альбом',
      '<label class="lt-label">Название альбома</label>' +
      '<input type="text" id="newAlbTitleInp" class="lt-input" placeholder="Например: Конспекты или Путешествие в Сеул" />',
      '<button class="lt-btn-secondary" onclick="GlassUI.closeModal()">Отмена</button>' +
      '<button class="lt-btn-primary" onclick="AlbumsPage.createAlbum()">Создать</button>'
    );
  },

  async createAlbum() {
    if (!AppState.user) return;
    const title = (document.getElementById('newAlbTitleInp').value || '').trim();
    if (!title) return;

    const ref = window.fbDb.collection('users').doc(AppState.user.uid);
    const snap = await ref.get();
    const list = (snap.exists && snap.data().customAlbums) || [];
    const newId = 'alb_' + Date.now();
    list.push({ id: newId, title: title });

    await ref.update({ customAlbums: list });
    AppState.profile.customAlbums = list;
    GlassUI.closeModal();
    this.selectAlbum(newId, AppState.user.uid);
  },

  uploadToAlbum(albumId) {
    if (!AppState.user) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function (e) {
      const file = e.target.files && e.target.files.item(0);
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        const img = new Image();
        img.onload = async function () {
          const scale = Math.min(1, 1000 / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          await window.fbDb.collection('photos').add({
            ownerUid: AppState.user.uid,
            ownerNick: (AppState.profile && AppState.profile.nick) || 'Ученик',
            albumId: albumId,
            url: dataUrl,
            caption: '',
            comments: [],
            createdAtMs: Date.now()
          });
          Router.renderCurrent();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  },

  closeViewer() {
    const old = document.getElementById('ltPhotoViewerModal');
    if (old) old.remove();
  },

  openViewer(idx) {
    if (!this.viewerList || !this.viewerList.length) return;
    this.viewerIndex = (idx + this.viewerList.length) % this.viewerList.length;
    const ph = this.viewerList[this.viewerIndex];
    const isOwner = AppState.user && AppState.user.uid === ph.ownerUid;

    this.closeViewer();
    const overlay = document.createElement('div');
    overlay.id = 'ltPhotoViewerModal';
    overlay.className = 'lt-modal-overlay';
    overlay.onclick = function (e) { if (e.target === overlay) AlbumsPage.closeViewer(); };

    const ownerAvatar = (isOwner && AppState.profile && AppState.profile.avatarUrl)
      ? '<img src="' + AppState.profile.avatarUrl + '" style="width:32px; height:32px; object-fit:cover; border:1px solid rgba(255,255,255,0.16);" />'
      : '<div style="width:32px; height:32px; background:#1f222d; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; font-weight:800;">' + (ph.ownerNick || 'U').charAt(0).toUpperCase() + '</div>';

    const comments = ph.comments || [];
    const commentsHtml = comments.length
      ? comments.map((c, cIdx) => {
          const cLikes = c.likes || [];
          const cLiked = AppState.user && cLikes.includes(AppState.user.uid);
          return (
            '<div class="lt-comment-item" style="margin-bottom:6px;">' +
              '<div style="display:flex; justify-content:space-between; align-items:center;">' +
                '<strong style="font-size:0.78rem; color:#fff; cursor:pointer;" onclick="AlbumsPage.closeViewer(); Router.go(\'profile\', { uid: \'' + c.uid + '\' });">' + (c.nick || 'Ученик') + '</strong>' +
                '<div style="display:flex; gap:8px; align-items:center;">' +
                  '<button class="lt-mini-action" style="color:' + (cLiked ? '#ef4444' : '#9ca3af') + ';" onclick="AlbumsPage.togglePhotoCommentLike(' + cIdx + ')">♡ ' + cLikes.length + '</button>' +
                  '<button class="lt-arrow-toggle" style="padding:1px 7px; font-size:0.72rem;" onclick="AlbumsPage.openCommentMenu(this, ' + cIdx + ')"><span class="lt-arr">▾</span></button>' +
                '</div>' +
              '</div>' +
              '<div id="pvCommentBody_' + cIdx + '" style="font-size:0.8rem; color:#e5e7eb; margin-top:3px;">' + c.text + '</div>' +
              (c.attachNote ? '<div style="border-left:2px solid #dc2626; padding:3px 7px; margin-top:4px; font-size:0.74rem; color:#fca5a5;">' + c.attachNote + '</div>' : '') +
              (c.attachImg ? '<div style="margin-top:5px;"><img src="' + c.attachImg + '" style="max-width:140px; max-height:110px; border:1px solid rgba(255,255,255,0.14);" /></div>' : '') +
            '</div>'
          );
        }).join('')
      : '<div style="font-size:0.78rem; color:#9ca3af;">Комментариев пока нет.</div>';

    overlay.innerHTML =
      '<div class="lt-pv-wrap">' +
        '<button class="lt-icon-btn lt-pv-nav" onclick="AlbumsPage.openViewer(' + (this.viewerIndex - 1) + ')">«</button>' +

        '<div class="lt-pv-box lt-true-glass">' +
          '<div class="lt-pv-left">' +
            '<div class="lt-pv-img-stage"><img src="' + ph.url + '" /></div>' +
            '<div class="lt-pv-bottom-bar">' +
              '<span style="font-size:0.76rem; color:#9ca3af;">Фото ' + (this.viewerIndex + 1) + ' из ' + this.viewerList.length + '</span>' +
              '<button class="lt-arrow-toggle" style="padding:5px 11px;" title="Действия с фото" onclick="AlbumsPage.openPhotoActions(this)"><span class="lt-arr">▾</span></button>' +
            '</div>' +
          '</div>' +

          '<div class="lt-pv-right">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1);">' +
              '<div style="display:flex; align-items:center; gap:9px; cursor:pointer;" onclick="AlbumsPage.closeViewer(); Router.go(\'profile\', { uid: \'' + ph.ownerUid + '\' });">' +
                ownerAvatar +
                '<strong style="font-size:0.88rem; color:#fff;">' + (ph.ownerNick || 'Ученик') + '</strong>' +
              '</div>' +
              '<button class="lt-close-btn" onclick="AlbumsPage.closeViewer()">✕</button>' +
            '</div>' +

            '<div id="pvCaptionBox" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:0.84rem; color:#e5e7eb;">' +
              (ph.caption ? ph.caption : '<span style="color:#9ca3af;">Без описания</span>') +
            '</div>' +

            '<div style="flex:1; overflow-y:auto; padding:10px 0;">' + commentsHtml + '</div>' +

            (AppState.user
              ? '<div style="padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">' +
                  '<textarea id="pvCommentInp" class="lt-post-textarea" style="min-height:48px; margin-bottom:6px;" placeholder="Написать комментарий..."></textarea>' +
                  '<div id="pvCommentAttachPreview" style="display:none; font-size:0.74rem; color:#fca5a5; margin-bottom:6px;"></div>' +
                  '<div style="display:flex; justify-content:flex-end; gap:6px; align-items:center;">' +
                    '<button class="lt-arrow-toggle" style="padding:5px 9px;" title="Добавить вложение" onclick="AlbumsPage.openNewCommentAttach(this)"><span class="lt-arr">▾</span></button>' +
                    '<button class="lt-btn-primary" style="padding:5px 14px; font-size:0.78rem;" onclick="AlbumsPage.addPhotoComment()">Отправить</button>' +
                  '</div>' +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +

        '<button class="lt-icon-btn lt-pv-nav" onclick="AlbumsPage.openViewer(' + (this.viewerIndex + 1) + ')">»</button>' +
      '</div>';

    document.body.appendChild(overlay);
  },
          /* ЛЕВАЯ ЧАСТЬ: ФОТО + ВЫПАДАЮЩЕЕ МЕНЮ ПОД НИМ */
          '<div class="lt-pv-left">' +
            '<div class="lt-pv-img-stage"><img src="' + ph.url + '" /></div>' +
            '<div class="lt-pv-bottom-bar">' +
              '<span style="font-size:0.76rem; color:#9ca3af;">Фото ' + (this.viewerIndex + 1) + ' из ' + this.viewerList.length + '</span>' +
              '<button class="lt-arrow-toggle" onclick="AlbumsPage.openPhotoActions(this)">Действия <span class="lt-arr">▾</span></button>' +
            '</div>' +
          '</div>' +

          /* ПРАВАЯ ЧАСТЬ: ВЛАДЕЛЕЦ, ОПИСАНИЕ, КОММЕНТАРИИ */
          '<div class="lt-pv-right">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1);">' +
              '<div style="display:flex; align-items:center; gap:9px; cursor:pointer;" onclick="AlbumsPage.closeViewer(); Router.go(\'profile\', { uid: \'' + ph.ownerUid + '\' });">' +
                '<div style="width:32px; height:32px; background:#1f222d; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; font-weight:800;">' + (ph.ownerNick || 'U').charAt(0).toUpperCase() + '</div>' +
                '<strong style="font-size:0.88rem; color:#fff;">' + (ph.ownerNick || 'Ученик') + '</strong>' +
              '</div>' +
              '<button class="lt-close-btn" onclick="AlbumsPage.closeViewer()">✕</button>' +
            '</div>' +

            '<div id="pvCaptionBox" style="padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:0.84rem; color:#e5e7eb;">' +
              (ph.caption ? ph.caption : '<span style="color:#9ca3af;">Без описания</span>') +
              (canEditCaption ? ' <button class="lt-link-btn" style="margin-left:6px; font-size:0.74rem;" onclick="AlbumsPage.editCaption()">Изменить</button>' : '') +
            '</div>' +

            '<div style="flex:1; overflow-y:auto; padding:10px 0;">' + commentsHtml + '</div>' +

            (AppState.user
              ? '<div style="padding-top:8px; border-top:1px solid rgba(255,255,255,0.1);">' +
                  '<textarea id="pvCommentInp" class="lt-post-textarea" style="min-height:48px; margin-bottom:6px;" placeholder="Написать комментарий..."></textarea>' +
                  '<div style="display:flex; justify-content:flex-end;">' +
                    '<button class="lt-btn-primary" style="padding:5px 12px; font-size:0.76rem;" onclick="AlbumsPage.addPhotoComment()">Отправить</button>' +
                  '</div>' +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +

        '<button class="lt-icon-btn lt-pv-nav" onclick="AlbumsPage.openViewer(' + (this.viewerIndex + 1) + ')">»</button>' +
      '</div>';

    document.body.appendChild(overlay);
  },

  openPhotoActions(btn) {
    const ph = this.viewerList[this.viewerIndex];
    const isOwner = AppState.user && AppState.user.uid === ph.ownerUid;
    const canDelete = isOwner || AppState.isAdmin;
    const items = [];

    if (AppState.user && ph.albumId !== 'saved') {
      items.push({
        title: 'Сохранить в «Сохранённые фото»',
        sub: 'Добавить снимок в свой альбом',
        onClick: async () => {
          await window.fbDb.collection('photos').add({
            ownerUid: AppState.user.uid,
            ownerNick: (AppState.profile && AppState.profile.nick) || 'Ученик',
            albumId: 'saved',
            url: ph.url,
            caption: ph.caption || '',
            comments: [],
            createdAtMs: Date.now()
          });
          GlassUI.openModal('Сохранено', '<p class="lt-muted-text">Фотография добавлена в ваш альбом <strong>«Сохранённые фото»</strong>.</p>', '<button class="lt-btn-primary" onclick="GlassUI.closeModal()">Отлично</button>');
        }
      });
    }

    items.push({
      title: 'Пожаловаться на фото',
      sub: 'Отправить на проверку модератору',
      onClick: () => GlassUI.openModal('Жалоба отправлена', '<p class="lt-muted-text">Обращение передано модератору платформы.</p>', '<button class="lt-btn-primary" onclick="GlassUI.closeModal()">Закрыть</button>')
    });

    if (canDelete && ph.source === 'photos') {
      items.push({
        title: 'Удалить фотографию',
        danger: true,
        onClick: async () => {
          await window.fbDb.collection('photos').doc(ph.id).delete();
          this.closeViewer();
          Router.renderCurrent();
        }
      });
    }

    GlassUI.toggleDropdown(btn, items);
  },

  editCaption() {
    const ph = this.viewerList[this.viewerIndex];
    const box = document.getElementById('pvCaptionBox');
    if (!box) return;
    box.innerHTML =
      '<input type="text" id="pvCapInp" class="lt-input" style="margin-bottom:6px;" value="' + (ph.caption || '') + '" />' +
      '<button class="lt-btn-primary" style="padding:4px 10px; font-size:0.75rem;" onclick="AlbumsPage.saveCaption()">Сохранить</button>';
  },

  async saveCaption() {
    const ph = this.viewerList[this.viewerIndex];
    const val = (document.getElementById('pvCapInp').value || '').trim();
    ph.caption = val;
    if (ph.source === 'photos') {
      await window.fbDb.collection('photos').doc(ph.id).update({ caption: val });
    } else if (ph.source === 'post' && ph.postId) {
      await window.fbDb.collection('posts').doc(ph.postId).update({ text: val });
    }
    this.openViewer(this.viewerIndex);
  },

  async addPhotoComment() {
    const ph = this.viewerList[this.viewerIndex];
    const inp = document.getElementById('pvCommentInp');
    const text = (inp.value || '').trim();
    if (!text) return;

    const comments = ph.comments || [];
    comments.push({ uid: AppState.user.uid, nick: (AppState.profile && AppState.profile.nick) || 'Ученик', text: text });
    ph.comments = comments;

    if (ph.source === 'photos') {
      await window.fbDb.collection('photos').doc(ph.id).update({ comments });
    } else if (ph.source === 'post' && ph.postId) {
      await window.fbDb.collection('posts').doc(ph.postId).update({ comments });
    }
    this.openViewer(this.viewerIndex);
  },

  async deletePhotoComment(idx) {
    const ph = this.viewerList[this.viewerIndex];
    const comments = ph.comments || [];
    comments.splice(idx, 1);
    ph.comments = comments;

    if (ph.source === 'photos') {
      await window.fbDb.collection('photos').doc(ph.id).update({ comments });
    } else if (ph.source === 'post' && ph.postId) {
      await window.fbDb.collection('posts').doc(ph.postId).update({ comments });
    }
    this.openViewer(this.viewerIndex);
  }
};
