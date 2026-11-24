/* === ЕДИНЫЕ МАТОВЫЕ КОМПОНЕНТЫ ИНТЕРФЕЙСА (ui.js) === */
window.GlassUI = {
  closeDropdown() {
    const old = document.getElementById('ltActiveGlassDropdown');
    if (old) old.remove();
  },

  toggleDropdown(anchorEl, items) {
    const existing = document.getElementById('ltActiveGlassDropdown');
    if (existing) {
      existing.remove();
      return;
    }
    const rect = anchorEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'ltActiveGlassDropdown';
    menu.className = 'lt-glass-dropdown';
    menu.style.top = (rect.bottom + 6) + 'px';
    menu.style.right = Math.max(12, window.innerWidth - rect.right) + 'px';

    items.forEach(function (it) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lt-glass-drop-item' + (it.danger ? ' danger' : '');
      btn.innerHTML =
        '<span class="lt-glass-drop-title">' + it.title + '</span>' +
        (it.sub ? '<span class="lt-glass-drop-sub">' + it.sub + '</span>' : '');
      btn.onclick = function (e) {
        e.stopPropagation();
        GlassUI.closeDropdown();
        it.onClick();
      };
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);
  }
};

document.addEventListener('click', function (e) {
  if (!e.target.closest('#ltActiveGlassDropdown') && !e.target.closest('#topAccountBtn')) {
    GlassUI.closeDropdown();
  }
});

window.AuthUI = {
  open() {
    document.getElementById('authModal').style.display = 'flex';
    this.showLogin();
  },
  close() {
    document.getElementById('authModal').style.display = 'none';
  },
  showLogin() {
    document.getElementById('authModalTitle').textContent = 'Вход и регистрация';
    document.getElementById('authLoginForm').style.display = 'block';
    document.getElementById('authResetForm').style.display = 'none';
  },
  showReset() {
    document.getElementById('authModalTitle').textContent = 'Сброс пароля';
    document.getElementById('authLoginForm').style.display = 'none';
    document.getElementById('authResetForm').style.display = 'block';
  },
  togglePassVis() {
    const inp = document.getElementById('authPassInp');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  },
  handleTopBtn(btn) {
    if (!AppState.user) {
      this.open();
      return;
    }
    GlassUI.toggleDropdown(btn, [
      { title: 'Мой профиль', sub: AppState.profile.email, onClick: () => Router.go('profile') },
      { title: 'Курсы (KR / GB)', sub: 'Слова, грамматика и тренировка', onClick: () => Router.go('courses') },
      { title: 'Настройки', sub: 'Профиль, видимость и безопасность', onClick: () => Router.go('settings') },
      { title: 'Выйти из аккаунта', danger: true, onClick: () => CloudAuth.signOut() }
    ]);
  }
};
