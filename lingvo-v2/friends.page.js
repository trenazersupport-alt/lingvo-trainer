/* === РАЗДЕЛ ДРУЗЬЯ, ОНЛАЙН И ЗАЯВКИ (friends.page.js) === */
window.FriendsPage = {
  activeTab: 'all', // 'all' | 'online' | 'requests'
  pageIndex: 0,
  pageSize: 10,
  expandedSuggested: false,
  searchQuery: '',

  async render(root, params = {}) {
    if (!AppState.user) {
      root.innerHTML =
        '<div class="lt-glass-modal" style="max-width:440px; margin:30px auto; text-align:center;">' +
          '<h3 style="margin-bottom:10px;">Войдите в аккаунт</h3>' +
          '<p class="lt-muted-text">Раздел «Друзья» доступен авторизованным пользователям.</p>' +
          '<button class="lt-btn-primary" onclick="AuthUI.open()">Войти / Регистрация</button>' +
        '</div>';
      return;
    }
    if (!params._keepSearch) {
      this.searchQuery = '';
    }
    root.innerHTML = '<div style="text-align:center; padding:40px; color:#9ca3af;">Загрузка списка пользователей...</div>';

    try {
      const [meSnap, usersSnap] = await Promise.all([
        window.fbDb.collection('users').doc(AppState.user.uid).get(),
        window.fbDb.collection('users').limit(100).get()
      ]);

      const me = meSnap.exists ? meSnap.data() : AppState.profile;
      AppState.profile = me;

      const allUsers = [];
      const usersMap = {};
      usersSnap.forEach(d => {
        const u = d.data();
        allUsers.push(u);
        usersMap[u.uid] = u;
      });

      const myFriends = me.friends || [];
      const incomingReqs = me.friendRequests || [];
      const outgoingReqs = me.outgoingRequests || [];

          if (params.tab && params.tab !== 'friends') {
        this.activeTab = params.tab;
        this.pageIndex = 0;
      } else if (incomingReqs.length > 0 && !this._manualTab) {
        this.activeTab = 'requests';
      } else if (params.tab === 'friends') {
        this.activeTab = 'all';
      }
      // Формируем список для левой колонки в зависимости от вкладки
      let listUsers = [];
      if (this.activeTab === 'all') {
        listUsers = myFriends.map(uid => usersMap[uid]).filter(Boolean);
      } else if (this.activeTab === 'online') {
        const now = Date.now();
        listUsers = myFriends
          .map(uid => usersMap[uid])
          .filter(u => u && u.lastSeenMs && (now - u.lastSeenMs < 10 * 60 * 1000));
      } else if (this.activeTab === 'requests') {
        listUsers = incomingReqs.map(uid => usersMap[uid]).filter(Boolean);
      }

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        listUsers = listUsers.filter(u =>
          (u.nick || '').toLowerCase().includes(q) || (u.handle || '').toLowerCase().includes(q)
        );
      }

      const totalPages = Math.max(1, Math.ceil(listUsers.length / this.pageSize));
      if (this.pageIndex >= totalPages) this.pageIndex = totalPages - 1;
      const pagedUsers = listUsers.slice(this.pageIndex * this.pageSize, (this.pageIndex + 1) * this.pageSize);

      // Возможные друзья (правая колонка)
      const excludeSet = new Set([AppState.user.uid, ...myFriends, ...incomingReqs, ...outgoingReqs]);
      const suggestedAll = allUsers.filter(u => !excludeSet.has(u.uid));
      const suggestedShown = this.expandedSuggested ? suggestedAll : suggestedAll.slice(0, 6);

      const rowsHtml = pagedUsers.length
        ? pagedUsers.map(u => this.renderUserRow(u, this.activeTab)).join('')
        : '<div style="padding:28px; text-align:center; color:#9ca3af; font-size:0.86rem;">' +
            (this.activeTab === 'requests'
              ? 'Входящих заявок в друзья пока нет.'
              : this.activeTab === 'online'
                ? 'Сейчас никого из друзей нет в сети.'
                : 'Список друзей пока пуст. Добавьте учеников из блока «Возможные друзья» справа!') +
          '</div>';

      const suggestedHtml = suggestedShown.length
        ? suggestedShown.map(u =>
            '<div class="lt-fr-sugg-row">' +
              '<div style="display:flex; align-items:center; gap:9px; cursor:pointer;" onclick="Router.go(\'profile\', { uid: \'' + u.uid + '\' })">' +
                this.renderMiniAvatar(u, 32) +
                '<div>' +
                  '<div style="font-size:0.82rem; font-weight:700; color:#fff;">' + (u.nick || 'Ученик') + '</div>' +
                  '<div style="font-size:0.7rem; color:#9ca3af;">' + (u.xp || 0) + ' XP</div>' +
                '</div>' +
              '</div>' +
              '<button class="lt-icon-btn" style="padding:4px 9px; font-size:0.75rem;" title="Отправить заявку в друзья" onclick="FriendsPage.sendRequest(\'' + u.uid + '\')">+ В друзья</button>' +
            '</div>'
          ).join('')
        : '<div style="font-size:0.8rem; color:#9ca3af; padding:10px 0;">Новых рекомендаций пока нет</div>';

      root.innerHTML =
        '<div class="lt-fr-shell">' +
          /* ВЕРХНЯЯ ПАНЕЛЬ ОКНА: 3 ВКЛАДКИ СЛЕВА + КРЕСТИК ЗАКРЫТИЯ СПРАВА */
          '<div class="lt-fr-top">' +
            '<div class="lt-fr-tabs">' +
              '<button class="lt-fr-tab ' + (this.activeTab === 'all' ? 'active' : '') + '" onclick="FriendsPage.switchTab(\'all\')">Все друзья (' + myFriends.length + ')</button>' +
              '<button class="lt-fr-tab ' + (this.activeTab === 'online' ? 'active' : '') + '" onclick="FriendsPage.switchTab(\'online\')">Онлайн</button>' +
              '<button class="lt-fr-tab ' + (this.activeTab === 'requests' ? 'active' : '') + '" onclick="FriendsPage.switchTab(\'requests\')">Заявки в друзья' +
                (incomingReqs.length ? ' <span class="lt-fr-badge">' + incomingReqs.length + '</span>' : '') +
              '</button>' +
            '</div>' +
            '<button class="lt-icon-btn" style="border-color:#dc2626; font-weight:800;" title="Закрыть и вернуться в профиль" onclick="Router.go(\'profile\')">✕</button>' +
          '</div>' +

          /* ДВУХКОЛОНОЧНОЕ ТЕЛО ПО СХЕМЕ */
          '<div class="lt-fr-body">' +
            /* ЛЕВАЯ ШИРОКАЯ КОЛОНКА: СПИСОК + ПАГИНАЦИЯ « » */
            '<div class="lt-fr-left">' +
             '<input type="search" name="lt_friend_filter" autocomplete="new-password" class="lt-input" style="margin-bottom:10px;" placeholder="Поиск по имени или @нику..." value="' + this.searchQuery + '" oninput="FriendsPage.onSearch(this.value)" />' +
              '<div class="lt-fr-list">' + rowsHtml + '</div>' +
              '<div class="lt-fr-pager">' +
                '<button class="lt-icon-btn" ' + (this.pageIndex === 0 ? 'disabled style="opacity:0.4;"' : '') + ' onclick="FriendsPage.prevPage()">«</button>' +
                '<span style="font-size:0.78rem; color:#9ca3af;">Страница ' + (this.pageIndex + 1) + ' из ' + totalPages + '</span>' +
                '<button class="lt-icon-btn" ' + (this.pageIndex >= totalPages - 1 ? 'disabled style="opacity:0.4;"' : '') + ' onclick="FriendsPage.nextPage(' + totalPages + ')">»</button>' +
              '</div>' +
            '</div>' +

            /* ПРАВАЯ КОЛОНКА: ВОЗМОЖНЫЕ ДРУЗЬЯ + РАЗВЕРНУТЬ */
            '<div class="lt-fr-right">' +
              '<div class="lt-box-title"><span>Возможные друзья</span><span style="color:#9ca3af;">(' + suggestedAll.length + ')</span></div>' +
              '<div style="flex:1; display:flex; flex-direction:column; gap:4px;">' + suggestedHtml + '</div>' +
              (suggestedAll.length > 6
                ? '<div style="text-align:right; margin-top:12px;"><button class="lt-btn-secondary" style="padding:5px 12px; font-size:0.76rem;" onclick="FriendsPage.toggleExpand()">' + (this.expandedSuggested ? 'Свернуть' : 'Развернуть') + '</button></div>'
                : '') +
            '</div>' +
          '</div>' +
        '</div>';
    } catch (e) {
      root.innerHTML = '<div class="lt-form-msg" style="text-align:center;">Ошибка загрузки раздела Друзья: ' + e.message + '</div>';
    }
  },

  renderMiniAvatar(u, size) {
    if (u.avatarUrl) {
      return '<img src="' + u.avatarUrl + '" style="width:' + size + 'px; height:' + size + 'px; object-fit:cover; border:1px solid rgba(255,255,255,0.16);" />';
    }
    return '<div style="width:' + size + 'px; height:' + size + 'px; background:#1f222d; border:1px solid rgba(255,255,255,0.16); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; color:#fff;">' + (u.nick || 'U').charAt(0).toUpperCase() + '</div>';
  },

  renderUserRow(u, tab) {
    const actionsHtml = tab === 'requests'
      ? '<button class="lt-btn-primary" style="padding:5px 11px; font-size:0.76rem;" onclick="FriendsPage.acceptRequest(\'' + u.uid + '\')">Принять</button>' +
        '<button class="lt-btn-secondary" style="padding:5px 10px; font-size:0.76rem;" onclick="FriendsPage.declineRequest(\'' + u.uid + '\')">Отклонить</button>'
      : '<button class="lt-btn-secondary" style="padding:5px 10px; font-size:0.76rem;" onclick="Router.go(\'profile\', { uid: \'' + u.uid + '\' })">Профиль</button>' +
        '<button class="lt-icon-btn" style="padding:5px 9px; font-size:0.76rem;" title="Удалить из друзей" onclick="FriendsPage.removeFriend(\'' + u.uid + '\')">✕</button>';

    return (
      '<div class="lt-fr-row">' +
        '<div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="Router.go(\'profile\', { uid: \'' + u.uid + '\' })">' +
          this.renderMiniAvatar(u, 38) +
          '<div>' +
            '<div style="font-size:0.88rem; font-weight:700; color:#fff;">' + (u.nick || 'Ученик') + ' <span style="font-size:0.72rem; color:#9ca3af; font-weight:400;">' + (u.handle || '') + '</span></div>' +
            '<div style="font-size:0.74rem; color:#9ca3af;">' + (u.status || 'Изучаю языки на Lingvo Trainer') + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex; gap:6px; align-items:center;">' + actionsHtml + '</div>' +
      '</div>'
    );
  },

  switchTab(tab) { this._manualTab = true; this.activeTab = tab; this.pageIndex = 0; Router.renderCurrent(); },
  onSearch(val) { this.searchQuery = val; this.pageIndex = 0; Router.renderCurrent(); },
  prevPage() { if (this.pageIndex > 0) { this.pageIndex--; Router.renderCurrent(); } },
  nextPage(max) { if (this.pageIndex < max - 1) { this.pageIndex++; Router.renderCurrent(); } },
  toggleExpand() { this.expandedSuggested = !this.expandedSuggested; Router.renderCurrent(); },
  async sendRequest(targetUid) {
    if (!AppState.user) return;
    const myUid = AppState.user.uid;
    const myRef = window.fbDb.collection('users').doc(myUid);
    const targetRef = window.fbDb.collection('users').doc(targetUid);

    const [mySnap, targetSnap] = await Promise.all([myRef.get(), targetRef.get()]);
    if (!targetSnap.exists) return;

    const myOut = mySnap.data().outgoingRequests || [];
    const targetIn = targetSnap.data().friendRequests || [];

    if (!myOut.includes(targetUid)) myOut.push(targetUid);
    if (!targetIn.includes(myUid)) targetIn.push(myUid);

    await Promise.all([
      myRef.update({ outgoingRequests: myOut }),
      targetRef.update({ friendRequests: targetIn })
    ]);
    AppState.profile.outgoingRequests = myOut;
    Router.renderCurrent();
  },

  const myFriends = Array.from(new Set([...(myData.friends || []), fromUid]));
 const myIn = (myData.friendRequests || []).filter(id => id !== fromUid);
 const myOut = (myData.outgoingRequests || []).filter(id => id !== fromUid);

 const fromFriends = Array.from(new Set([...(fromData.friends || []), myUid]));
 const fromOut = (fromData.outgoingRequests || []).filter(id => id !== myUid);
 const fromIn = (fromData.friendRequests || []).filter(id => id !== myUid);

 await Promise.all([
   myRef.update({ friends: myFriends, friendRequests: myIn, outgoingRequests: myOut }),
   fromRef.update({ friends: fromFriends, outgoingRequests: fromOut, friendRequests: fromIn })
 ]);
    AppState.profile.friends = myFriends;
    AppState.profile.friendRequests = myIn;
    Router.renderCurrent();
  },

  async declineRequest(fromUid) {
    if (!AppState.user) return;
    const myUid = AppState.user.uid;
    const myRef = window.fbDb.collection('users').doc(myUid);
    const fromRef = window.fbDb.collection('users').doc(fromUid);

    const [mySnap, fromSnap] = await Promise.all([myRef.get(), fromRef.get()]);
    const myIn = (mySnap.data().friendRequests || []).filter(id => id !== fromUid);
    const fromOut = fromSnap.exists ? (fromSnap.data().outgoingRequests || []).filter(id => id !== myUid) : [];

    await Promise.all([
      myRef.update({ friendRequests: myIn }),
      fromRef.update({ outgoingRequests: fromOut })
    ]);
    AppState.profile.friendRequests = myIn;
    Router.renderCurrent();
  },

  async removeFriend(targetUid) {
    if (!AppState.user) return;
    const myUid = AppState.user.uid;
    const myRef = window.fbDb.collection('users').doc(myUid);
    const targetRef = window.fbDb.collection('users').doc(targetUid);

    const [mySnap, targetSnap] = await Promise.all([myRef.get(), targetRef.get()]);
    const myFriends = (mySnap.data().friends || []).filter(id => id !== targetUid);
    const targetFriends = targetSnap.exists ? (targetSnap.data().friends || []).filter(id => id !== myUid) : [];

    await Promise.all([
      myRef.update({ friends: myFriends }),
      targetRef.update({ friends: targetFriends })
    ]);
    AppState.profile.friends = myFriends;
    Router.renderCurrent();
  }
};

