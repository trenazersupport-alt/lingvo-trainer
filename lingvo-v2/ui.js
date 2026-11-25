/* === ЕДИНЫЕ МАТОВЫЕ КОМПОНЕНТЫ ИНТЕРФЕЙСА (ui.js) === */
window.AppState = window.AppState || {
  user: null,
  profile: null,
  isAdmin: false,
  selectedLang: null
};

window.GlassUI = {
  activeAnchor: null,

  closeDropdown() {
    const old = document.getElementById('ltActiveGlassDropdown');
    if (old) old.remove();
    if (this.activeAnchor) {
      this.activeAnchor.classList.remove('is-open');
      this.activeAnchor = null;
    }
  },

  toggleDropdown(anchorEl, items) {
    const wasSame = this.activeAnchor === anchorEl && document.getElementById('ltActiveGlassDropdown');
    this.closeDropdown();
    if (wasSame) return;

    this.activeAnchor = anchorEl;
    anchorEl.classList.add('is-open');

    const rect = anchorEl.getBoundingClientRect();
    const menu = document.createElement('div');
    menu.id = 'ltActiveGlassDropdown';
    menu.className = 'lt-glass-dropdown';
    menu.style.top = (rect.bottom + 5) + 'px';
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
  if (!e.target.closest('#ltActiveGlassDropdown') && !e.target.closest('.lt-arrow-toggle') && !e.target.closest('#topAccountBtn')) {
    GlassUI.closeDropdown();
  }
});

window.AuthUI = {
  open() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      this.showLogin();
    }
  },
  close() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  },
  showLogin() {
    const t = document.getElementById('authModalTitle');
    const l = document.getElementById('authLoginForm');
    const r = document.getElementById('authResetForm');
    if (t) t.textContent = 'Вход и регистрация';
    if (l) l.style.display = 'block';
    if (r) r.style.display = 'none';
  },
  showReset() {
    const t = document.getElementById('authModalTitle');
    const l = document.getElementById('authLoginForm');
    const r = document.getElementById('authResetForm');
    if (t) t.textContent = 'Сброс пароля';
    if (l) l.style.display = 'none';
    if (r) r.style.display = 'block';
  },
  togglePassVis() {
    const inp = document.getElementById('authPassInp');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  },
  handleTopBtn(btn) {
    if (!window.AppState || !AppState.user) {
      this.open();
      return;
    }
    const emailSub = (AppState.profile && AppState.profile.email) || AppState.user.email || '';
    GlassUI.toggleDropdown(btn, [
      { title: 'Мой профиль', sub: emailSub, onClick: () => Router.go('profile') },
      { title: 'Курсы (KR / GB)', sub: 'Слова, грамматика и тренировка', onClick: () => Router.go('courses') },
      { title: 'Рейтинг учеников', sub: 'Общая лига и прогресс XP', onClick: () => Router.go('rating') },
      { title: 'Настройки', sub: 'Профиль, видимость и безопасность', onClick: () => Router.go('settings') },
      { title: 'Выйти из аккаунта', danger: true, onClick: () => { if (window.CloudAuth) CloudAuth.signOut(); } }
    ]);
  }
};

