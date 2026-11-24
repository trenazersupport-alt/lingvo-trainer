/* === ЖИВОЙ ОБЛАЧНЫЙ РЕЙТИНГ (rating.page.js) === */
window.RatingPage = {
  async render(root) {
    root.innerHTML = '<div style="text-align:center; padding:40px; color:#9ca3af;">Загрузка облачного рейтинга...</div>';

    try {
      const snap = await db.collection('users').orderBy('xp', 'desc').limit(50).get();
      const users = [];
      snap.forEach(doc => users.push(doc.data()));

      if (!users.length) {
        root.innerHTML =
          '<div class="lt-glass-modal" style="max-width:520px; margin:20px auto; text-align:center;">' +
            '<h2 style="margin-bottom:8px;">Рейтинг пока пуст</h2>' +
            '<p class="lt-muted-text">Зарегистрируйтесь первым и начните изучать слова, чтобы занять 1-е место!</p>' +
            '<button class="lt-btn-primary" onclick="AuthUI.open()">Войти / Регистрация</button>' +
          '</div>';
        return;
      }

      const rowsHtml = users.map((u, i) => {
        const rank = getRankByXP(u.xp || 0);
        const isMe = AppState.user && AppState.user.uid === u.uid;
        return (
          '<div style="display:flex; align-items:center; justify-content:space-between; padding:13px 16px; ' +
            'background:' + (isMe ? 'rgba(220,38,38,0.18)' : 'rgba(16,18,26,0.78)') + '; ' +
            'border:1px solid ' + (i === 0 ? '#dc2626' : 'rgba(255,255,255,0.1)') + ';">' +
            '<div style="display:flex; align-items:center; gap:14px;">' +
              '<span style="font-weight:800; font-size:1.05rem; color:' + (i < 3 ? '#f87171' : '#9ca3af') + '; min-width:28px;">#' + (i + 1) + '</span>' +
              '<div>' +
                '<div style="font-weight:700; color:#fff;">' + (u.nick || 'Ученик') + (u.isAdmin ? ' <span style="color:#f87171; font-size:0.7rem;">[МОДЕРАТОР]</span>' : '') + '</div>' +
                '<div style="font-size:0.75rem; color:#9ca3af;">Лига: ' + rank.title + ' • Серия: ' + (u.streakDays || 1) + ' дн.</div>' +
              '</div>' +
            '</div>' +
            '<div style="font-weight:800; color:#fff; font-size:0.95rem;">' + (u.xp || 0) + ' XP</div>' +
          '</div>'
        );
      }).join('');

      root.innerHTML =
        '<div style="max-width:680px; margin:0 auto;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">' +
            '<div>' +
              '<h2 style="font-size:1.4rem;">Рейтинг учеников</h2>' +
              '<p style="font-size:0.82rem; color:#9ca3af;">0–499 Новичок • 500–2499 Исследователь • 2500–7499 Практик • 7500+ Мастер</p>' +
            '</div>' +
            '<button class="lt-btn-secondary" onclick="Router.go(\'home\')">На главную</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:8px;">' + rowsHtml + '</div>' +
        '</div>';
    } catch (e) {
      root.innerHTML = '<div class="lt-form-msg">Ошибка загрузки рейтинга: ' + e.message + '</div>';
    }
  }
};
