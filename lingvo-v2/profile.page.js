/* === ГЛАВНАЯ СТРАНИЦА ПРОФИЛЯ (profile.page.js) === */
window.ProfilePage = {
  viewingUid: null,
  cachedUsersMap: {},

  async render(root, params = {}) {
    if (!AppState.user && !params.uid) {
      root.innerHTML =
        '<div class="lt-glass-modal" style="max-width:440px; margin:30px auto; text-align:center;">' +
          '<h3 style="margin-bottom:10px;">Войдите в аккаунт</h3>' +
          '<p class="lt-muted-text">Чтобы открыть свой профиль, стену и список друзей, выполните вход.</p>' +
          '<button class="lt-btn-primary" onclick="AuthUI.open()">Войти / Регистрация</button>' +
        '</div>';
      return;
    }

    const targetUid = params.uid || AppState.user.uid;
    this.viewingUid = targetUid;
    const isOwner = AppState.user && AppState.user.uid === targetUid;

    root.innerHTML = '<div style="text-align:center; padding:40px; color:#9ca3af;">Загрузка профиля...</div>';

    try {
      let prof = isOwner ? AppState.profile : null;
      if (!prof) {
        const snap = await window.fbDb.collection('users').doc(targetUid).get();
        if (!snap.exists) {
          root.innerHTML = '<div class="lt-form-msg" style="text-align:center;">Профиль не найден.</div>';
          return;
        }
        prof = snap.data();
      }

      const [postsSnap, usersSnap] = await Promise.all([
        window.fbDb.collection('posts').where('authorUid', '==', targetUid).get(),
        window.fbDb.collection('users').limit(30).get()
      ]);

      const posts = [];
      postsSnap.forEach(d => posts.push({ id: d.id, ...d.data() }));
      posts.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));

      const allUsers = [];
      this.cachedUsersMap = {};
      usersSnap.forEach(d => {
        const u = d.data();
        allUsers.push(u);
        this.cachedUsersMap[u.uid] = u;
      });

      const sortedByXp = [...allUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const rankPos = Math.max(1, sortedByXp.findIndex(u => u.uid === targetUid) + 1);

      const myFriends = prof.friends || [];
      const suggested = allUsers.filter(u => u.uid !== targetUid && !myFriends.includes(u.uid)).slice(0, 4);
      const priv = prof.privacy || { showBirthday: true, showCity: true, showEmail: true, allowComments: true };

      const avatarHtml = prof.avatarUrl
        ? '<img src="' + prof.avatarUrl + '" style="width:100%; height:100%; object-fit:cover;" />'
        : '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:2.4rem; font-weight:800; color:#fff; background:#181a22;">' + (prof.nick || 'U').charAt(0).toUpperCase() + '</div>';

      const coverStyle = prof.coverUrl
        ? 'background-image:url(\'' + prof.coverUrl + '\'); background-size:cover; background-position:center;'
        : 'background: linear-gradient(120deg, #1a1216 0%, #3b0d11 50%, #11131a 100%);';

      const postsHtml = posts.length
        ? posts.map(p => this.renderPostCard(p, isOwner, priv)).join('')
        : '<div class="lt-prof-box" style="text-align:center; color:#9ca3af; font-size:0.86rem;">На стене пока нет записей.</div>';

      const suggestedHtml = suggested.length
        ? suggested.map(u =>
            '<div style="display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.06);">' +
              '<div style="display:flex; align-items:center; gap:9px; cursor:pointer;" onclick="Router.go(\'profile\', { uid: \'' + u.uid + '\' })">' +
                '<div style="width:28px; height:28px; background:#1f222d; border:1px solid rgba(255,255,255,0.14); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.78rem;">' + (u.nick || 'U').charAt(0).toUpperCase() + '</div>' +
                '<div>' +
                  '<div style="font-size:0.82rem; font-weight:700; color:#fff;">' + (u.nick || 'Ученик') + '</div>' +
                  '<div style="font-size:0.7rem; color:#9ca3af;">' + (u.xp || 0) + ' XP</div>' +
                '</div>' +
              '</div>' +
              (isOwner ? '<button class="lt-icon-btn" style="padding:3px 8px; font-size:0.75rem;" title="Добавить в друзья" onclick="ProfilePage.addFriend(\'' + u.uid + '\')">+</button>' : '') +
            '</div>'
          ).join('')
        : '<div style="font-size:0.78rem; color:#9ca3af;">Новых рекомендаций пока нет</div>';

      root.innerHTML =
        '<div class="lt-prof-wrap">' +
          /* ШАПКА ПРОФИЛЯ */
          '<div class="lt-prof-header-card">' +
            '<div class="lt-prof-cover" style="' + coverStyle + '">' +
              (isOwner ? '<button class="lt-arrow-toggle lt-cover-menu-btn" onclick="ProfilePage.openCoverMenu(this)">▾</button>' : '') +
            '</div>' +
            '<div class="lt-prof-bar">' +
              '<div class="lt-prof-avatar-box">' +
                avatarHtml +
                (isOwner ? '<button class="lt-avatar-upload-btn" onclick="ProfilePage.changePhoto(\'avatar\')">Загрузить фото</button>' : '') +
              '</div>' +
              '<div class="lt-prof-stats">' +
                '<div class="lt-stat-cell"><strong>' + posts.length + '</strong><span>записей</span></div>' +
                '<div class="lt-stat-cell is-link" onclick="Router.go(\'friends\', { tab: \'friends\', uid: \'' + targetUid + '\' })"><strong>' + myFriends.length + '</strong><span>друзей</span></div>' +
                '<div class="lt-stat-cell is-link" onclick="Router.go(\'friends\', { tab: \'followers\', uid: \'' + targetUid + '\' })"><strong>0</strong><span>подписчиков</span></div>' +
                '<div class="lt-stat-cell is-link" onclick="ProfilePage.openLearnedModal(\'' + targetUid + '\', ' + isOwner + ')"><strong>' + (prof.learnedCount || 0) + '</strong><span>слов изучено</span></div>' +
                '<div class="lt-stat-cell"><strong>KO / EN</strong><span>языки</span></div>' +
                '<div class="lt-stat-cell is-link" onclick="Router.go(\'rating\')"><strong>#' + rankPos + ' • ' + (prof.streakDays || 1) + 'д</strong><span>рейтинг</span></div>' +
              '</div>' +
              '<div class="lt-prof-actions">' +
                '<button class="lt-arrow-toggle" style="padding:6px 12px;" onclick="ProfilePage.openSectionsMenu(this)">Разделы <span class="lt-arr">▾</span></button>' +
              '</div>' +
            '</div>' +
          '</div>' +

          /* ТРЁХКОЛОНОЧНАЯ СЕТКА */
          '<div class="lt-prof-grid">' +
            /* ЛЕВАЯ КОЛОНКА */
            '<div class="lt-prof-col">' +
              '<div class="lt-prof-box">' +
                '<div style="font-size:1.15rem; font-weight:800; color:#fff;">' + (prof.nick || 'Ученик') + (prof.isAdmin ? ' <span style="color:#f87171; font-size:0.72rem;">[МОДЕРАТОР]</span>' : '') + '</div>' +
                '<div style="font-size:0.78rem; color:#9ca3af; margin-bottom:10px;">' + (prof.handle || '@user') + '</div>' +
                '<div style="border-left:2px solid #dc2626; padding-left:9px; font-size:0.82rem; color:#e5e7eb; margin-bottom:12px;">' + (prof.status || 'Изучаю корейский и английский каждый день') + '</div>' +
                '<div style="font-size:0.76rem; color:#9ca3af; line-height:1.65;">' +
                  '<div>Адрес страницы: <span style="color:#d1d5db;">' + (prof.handle || '@user') + '</span></div>' +
                  ((isOwner || priv.showBirthday !== false) ? '<div>Дата рождения: <span style="color:#d1d5db;">' + (prof.birthday || 'не указана') + '</span></div>' : '') +
                  ((isOwner || priv.showCity !== false) ? '<div>Город проживания: <span style="color:#d1d5db;">' + (prof.city || 'не указан') + '</span></div>' : '') +
                  ((isOwner || priv.showEmail !== false) ? '<div>Почта: <span style="color:#d1d5db;">' + (prof.email || '') + '</span></div>' : '') +
                '</div>' +
              '</div>' +

              '<div class="lt-prof-box">' +
                '<div class="lt-box-title is-link" onclick="Router.go(\'friends\', { tab: \'friends\', uid: \'' + targetUid + '\' })"><span>Друзья</span><span style="color:#9ca3af;">(' + myFriends.length + ')</span></div>' +
                '<div style="font-size:0.78rem; color:#9ca3af;">' + (myFriends.length ? 'Друзей в списке: ' + myFriends.length : 'Список друзей пока пуст') + '</div>' +
              '</div>' +

              '<div class="lt-prof-box">' +
                '<div class="lt-box-title is-link" onclick="Router.go(\'albums\', { uid: \'' + targetUid + '\' })"><span>Альбомы</span><span style="color:#9ca3af;">→</span></div>' +
                '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">' +
                  '<div class="lt-album-mini" onclick="Router.go(\'albums\', { uid: \'' + targetUid + '\', album: \'avatars\' })">Фото профиля</div>' +
                  '<div class="lt-album-mini" onclick="Router.go(\'albums\', { uid: \'' + targetUid + '\', album: \'covers\' })">Обложки</div>' +
                  '<div class="lt-album-mini" onclick="Router.go(\'albums\', { uid: \'' + targetUid + '\', album: \'notes\' })">Конспекты</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            /* ЦЕНТРАЛЬНАЯ КОЛОНКА (СТЕНА) */
            '<div class="lt-prof-col">' +
              (isOwner ?
                '<div class="lt-prof-box">' +
                  '<textarea id="newPostText" class="lt-post-textarea" placeholder="Поделитесь прогрессом, новой фразой или заметкой..."></textarea>' +
                  '<div id="postWordAttachBox" style="display:none; margin-bottom:8px; padding:7px 10px; background:rgba(220,38,38,0.14); border-left:2px solid #dc2626; font-size:0.8rem;"></div>' +
                  '<div style="display:flex; justify-content:flex-end; gap:6px; align-items:center;">' +
                    '<button class="lt-btn-primary" style="padding:7px 14px; font-size:0.8rem;" onclick="ProfilePage.publishPost()">Добавить запись на стену</button>' +
                    '<button class="lt-arrow-toggle" style="padding:7px 10px;" title="Прикрепить" onclick="ProfilePage.openAttachMenu(this)"><span class="lt-arr">▾</span></button>' +
                  '</div>' +
                '</div>' : '') +
              '<div style="display:flex; flex-direction:column; gap:10px;">' + postsHtml + '</div>' +
            '</div>' +

            /* ПРАВАЯ КОЛОНКА */
            '<div class="lt-prof-col">' +
              '<div class="lt-prof-box">' +
                '<div class="lt-box-title is-link" onclick="Router.go(\'friends\', { tab: \'suggested\' })"><span>Возможные друзья</span><span style="color:#9ca3af;">Все</span></div>' +
                suggestedHtml +
              '</div>' +

              '<div class="lt-prof-box">' +
                '<div class="lt-box-title"><span>Сообщества по интересам</span></div>' +
                '<div style="display:flex; flex-direction:column; gap:7px; font-size:0.8rem;">' +
                  '<div class="lt-club-row"><span class="lt-club-hash">#</span><span>Корейский язык • TOPIK</span></div>' +
                  '<div class="lt-club-row"><span class="lt-club-hash">#</span><span>Английский на каждый день</span></div>' +
                  '<div class="lt-club-row"><span class="lt-club-hash">#</span><span>Иероглифы Ханча и лексика</span></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    } catch (e) {
      root.innerHTML = '<div class="lt-form-msg" style="text-align:center;">Ошибка загрузки профиля: ' + e.message + '</div>';
    }
  },
  renderPostCard(p, isOwner, priv) {
    const canManage = isOwner || AppState.isAdmin;
    const likes = p.likes || [];
    const comments = p.comments || [];
    const isLiked = AppState.user && likes.includes(AppState.user.uid);
    const allowComments = priv.allowComments !== false;
    const dateStr = p.createdAtMs
      ? new Date(p.createdAtMs).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Сегодня';

    const likersListHtml = likes.length
      ? likes.map(uid => {
          const u = this.cachedUsersMap[uid];
          const name = u ? u.nick : 'Ученик';
          return '<div class="lt-popover-user" onclick="Router.go(\'profile\', { uid: \'' + uid + '\' })">' + name + '</div>';
        }).join('')
      : '<div style="font-size:0.74rem; color:#9ca3af;">Пока никто не оценил</div>';

    const commentsHtml = comments.map((c, idx) => {
      const cLikes = c.likes || [];
      const cLiked = AppState.user && cLikes.includes(AppState.user.uid);
      const canDelComment = isOwner || AppState.isAdmin || (AppState.user && AppState.user.uid === c.uid);
      return (
        '<div class="lt-comment-item">' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<strong style="font-size:0.78rem; color:#fff; cursor:pointer;" onclick="Router.go(\'profile\', { uid: \'' + c.uid + '\' })">' + (c.nick || 'Ученик') + '</strong>' +
            '<div style="display:flex; gap:8px; align-items:center;">' +
              '<button class="lt-mini-action" style="color:' + (cLiked ? '#ef4444' : '#9ca3af') + ';" onclick="ProfilePage.toggleCommentLike(\'' + p.id + '\', ' + idx + ')">♡ ' + cLikes.length + '</button>' +
              '<button class="lt-mini-action" title="Пожаловаться" onclick="alert(\'Жалоба отправлена модератору trenazer.support@gmail.com\')">!</button>' +
              (canDelComment ? '<button class="lt-mini-action" title="Удалить" onclick="ProfilePage.deleteComment(\'' + p.id + '\', ' + idx + ')">✕</button>' : '') +
            '</div>' +
          '</div>' +
          '<div style="font-size:0.8rem; color:#e5e7eb; margin-top:3px;">' + c.text + '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="lt-prof-box" id="postCard_' + p.id + '">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
          '<div style="display:flex; align-items:center; gap:9px;">' +
            '<div style="width:32px; height:32px; background:#1f222d; border:1px solid rgba(255,255,255,0.14); display:flex; align-items:center; justify-content:center; font-weight:800;">' + (p.authorNick || 'U').charAt(0).toUpperCase() + '</div>' +
            '<div>' +
              '<div style="font-size:0.85rem; font-weight:700; color:#fff;">' + (p.authorNick || 'Ученик') + '</div>' +
              '<div style="font-size:0.7rem; color:#9ca3af;">' + dateStr + '</div>' +
            '</div>' +
          '</div>' +
          '<button class="lt-arrow-toggle" style="padding:2px 8px;" onclick="ProfilePage.openPostMenu(this, \'' + p.id + '\', ' + canManage + ')"><span class="lt-arr">▾</span></button>' +
        '</div>' +

        '<div id="postText_' + p.id + '" style="font-size:0.88rem; color:#f3f4f6; line-height:1.45; margin-bottom:10px; white-space:pre-wrap;">' + (p.text || '') + '</div>' +
        (p.wordNote ? '<div style="border-left:2px solid #dc2626; padding:5px 10px; background:rgba(220,38,38,0.1); font-size:0.82rem; color:#fca5a5; margin-bottom:10px;">' + p.wordNote + '</div>' : '') +

        '<div style="display:flex; justify-content:flex-end; gap:16px; border-top:1px solid rgba(255,255,255,0.06); padding-top:8px; position:relative;">' +
          '<div class="lt-like-hover-wrap">' +
            '<button class="lt-link-btn" style="text-decoration:none; color:' + (isLiked ? '#ef4444' : '#9ca3af') + '; font-weight:700;" onclick="ProfilePage.toggleLike(\'' + p.id + '\')">♡ ' + likes.length + '</button>' +
            '<div class="lt-glass-popover">' +
              '<div style="font-size:0.7rem; color:#f87171; font-weight:700; margin-bottom:4px;">Оценили запись:</div>' +
              likersListHtml +
            '</div>' +
          '</div>' +

          '<button class="lt-link-btn" style="text-decoration:none; color:#9ca3af; font-weight:700;" onclick="ProfilePage.toggleCommentsDrawer(\'' + p.id + '\')">💬 ' + comments.length + '</button>' +
        '</div>' +

        '<div id="commentsDrawer_' + p.id + '" style="display:none; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.08);">' +
          '<div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">' +
            (commentsHtml || '<div style="font-size:0.76rem; color:#9ca3af;">Комментариев пока нет.</div>') +
          '</div>' +
          (allowComments
            ? '<textarea id="commentInp_' + p.id + '" class="lt-post-textarea" style="min-height:54px; margin-bottom:6px;" placeholder="Написать комментарий..."></textarea>' +
              '<div style="display:flex; justify-content:flex-end; gap:6px;">' +
                '<button class="lt-btn-primary" style="padding:5px 12px; font-size:0.76rem;" onclick="ProfilePage.addComment(\'' + p.id + '\')">Добавить комментарий</button>' +
                '<button class="lt-arrow-toggle" style="padding:5px 9px;" onclick="ProfilePage.openAttachMenu(this)"><span class="lt-arr">▾</span></button>' +
              '</div>'
            : '<div style="font-size:0.75rem; color:#9ca3af;">Владелец страницы ограничил комментирование.</div>') +
        '</div>' +
      '</div>'
    );
  },

  toggleCommentsDrawer(postId) {
    const el = document.getElementById('commentsDrawer_' + postId);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  },

  async addComment(postId) {
    if (!AppState.user) return AuthUI.open();
    const inp = document.getElementById('commentInp_' + postId);
    const text = (inp.value || '').trim();
    if (!text) return;

    const ref = window.fbDb.collection('posts').doc(postId);
    const snap = await ref.get();
    if (!snap.exists) return;
    const comments = snap.data().comments || [];
    comments.push({
      uid: AppState.user.uid,
      nick: (AppState.profile && AppState.profile.nick) || 'Ученик',
      text: text,
      likes: [],
      createdAtMs: Date.now()
    });
    await ref.update({ comments });
    await Router.renderCurrent();
    const drawer = document.getElementById('commentsDrawer_' + postId);
    if (drawer) drawer.style.display = 'block';
  },

  async toggleCommentLike(postId, idx) {
    if (!AppState.user) return AuthUI.open();
    const ref = window.fbDb.collection('posts').doc(postId);
    const snap = await ref.get();
    if (!snap.exists) return;
    const comments = snap.data().comments || [];
    if (!comments[idx]) return;
    const likes = comments[idx].likes || [];
    const uid = AppState.user.uid;
    comments[idx].likes = likes.includes(uid) ? likes.filter(id => id !== uid) : [...likes, uid];
    await ref.update({ comments });
    await Router.renderCurrent();
    const drawer = document.getElementById('commentsDrawer_' + postId);
    if (drawer) drawer.style.display = 'block';
  },

  async deleteComment(postId, idx) {
    const ref = window.fbDb.collection('posts').doc(postId);
    const snap = await ref.get();
    if (!snap.exists) return;
    const comments = snap.data().comments || [];
    comments.splice(idx, 1);
    await ref.update({ comments });
    await Router.renderCurrent();
    const drawer = document.getElementById('commentsDrawer_' + postId);
    if (drawer) drawer.style.display = 'block';
  },

  openPostMenu(btn, postId, canManage) {
    const items = [
      { title: 'Поделиться', sub: 'Отправить другу или в диалог', onClick: () => alert('Выбор получателя из списка друзей откроется в модуле Чаты!') }
    ];
    if (canManage) {
      items.unshift({
        title: 'Редактировать запись',
        onClick: async () => {
          const el = document.getElementById('postText_' + postId);
          const next = prompt('Редактировать текст записи:', el ? el.textContent : '');
          if (next !== null && next.trim()) {
            await window.fbDb.collection('posts').doc(postId).update({ text: next.trim() });
            Router.renderCurrent();
          }
        }
      });
      items.push({
        title: 'Удалить запись',
        danger: true,
        onClick: () => this.deletePost(postId)
      });
    }
    GlassUI.toggleDropdown(btn, items);
  },

  async publishPost() {
    if (!AppState.user) return;
    const inp = document.getElementById('newPostText');
    const text = (inp.value || '').trim();
    const wordNote = inp.dataset.wordNote || '';
    if (!text && !wordNote) return;

    await window.fbDb.collection('posts').add({
      authorUid: AppState.user.uid,
      authorNick: AppState.profile.nick || 'Ученик',
      text: text,
      wordNote: wordNote,
      likes: [],
      comments: [],
      createdAtMs: Date.now()
    });
    Router.renderCurrent();
  },

  async deletePost(postId) {
    await window.fbDb.collection('posts').doc(postId).delete();
    Router.renderCurrent();
  },

  async toggleLike(postId) {
    if (!AppState.user) return AuthUI.open();
    const ref = window.fbDb.collection('posts').doc(postId);
    const snap = await ref.get();
    if (!snap.exists) return;
    const likes = snap.data().likes || [];
    const uid = AppState.user.uid;
    const next = likes.includes(uid) ? likes.filter(id => id !== uid) : [...likes, uid];
    await ref.update({ likes: next });
    Router.renderCurrent();
  },

   async addFriend(targetUid) {
    if (!AppState.user) return;
    const myRef = window.fbDb.collection('users').doc(AppState.user.uid);
    const current = AppState.profile.friends || [];
    if (!current.includes(targetUid)) {
      const updated = [...current, targetUid];
      await myRef.update({ friends: updated });
      AppState.profile.friends = updated;
      Router.renderCurrent();
    }
  },

  openAttachMenu(btn) {
    GlassUI.toggleDropdown(btn, [
      {
        title: 'Карточка слова (KO / EN)',
        sub: 'Прикрепить слово с переводом к посту',
        onClick: () => {
          const phrase = prompt('Введите слово и перевод (например: 사랑 (саран) — любовь):');
          if (phrase && phrase.trim()) {
            const inp = document.getElementById('newPostText');
            const box = document.getElementById('postWordAttachBox');
            inp.dataset.wordNote = phrase.trim();
            box.style.display = 'block';
            box.textContent = 'Прикреплённое слово: ' + phrase.trim();
          }
        }
      },
      { title: 'Картинка или видео', sub: 'Доступно после подключения альбомов', onClick: () => alert('Прикрепление фото и видео заработает после подключения модуля Альбомы!') }
    ]);
  },
  openSectionsMenu(btn) {
    GlassUI.toggleDropdown(btn, [
      { title: 'Курсы (KR / GB)', sub: 'Слова, грамматика и практика', onClick: () => Router.go('courses') },
      { title: 'Друзья и подписчики', sub: 'Управление кругом общения', onClick: () => Router.go('friends') },
      { title: 'Альбомы и фото', sub: 'Фото профиля, обложки и конспекты', onClick: () => Router.go('albums') },
      { title: 'Рейтинг учеников', sub: 'Общая таблица лидеров', onClick: () => Router.go('rating') },
      { title: 'Настройки профиля', sub: 'Редактирование данных и приватность', onClick: () => Router.go('settings') }
    ]);
  },

  openCoverMenu(btn) {
    GlassUI.toggleDropdown(btn, [
      { title: 'Изменить обложку по ссылке', sub: 'Вставьте URL изображения', onClick: () => this.changePhoto('cover') }
    ]);
  },

  async changePhoto(type) {
    if (!AppState.user) return;
    const url = prompt(type === 'avatar' ? 'Вставьте прямую ссылку на фото аватара (https://...):' : 'Вставьте прямую ссылку на обложку (https://...):');
    if (!url || !url.trim()) return;
    const field = type === 'avatar' ? 'avatarUrl' : 'coverUrl';
    await window.fbDb.collection('users').doc(AppState.user.uid).update({ [field]: url.trim() });
    AppState.profile[field] = url.trim();
    Router.renderCurrent();
  },

  openLearnedModal(targetUid, isOwner) {
    if (isOwner) {
      alert('Сводный словарь изученных слов откроется сразу после подключения учебного модуля courses.page.js!');
    } else {
      alert('Окно просмотра изученных слов гостя (озвучка, микрофон, забрать слово себе) подключим вместе с учебным модулем!');
    }
  }
};

