/* === НАВИГАЦИЯ И ИСТОРИЯ ПЕРЕХОДОВ (router.js) === */
window.Router = {
   historyStack: [],
  historyIndex: -1,
  currentRoute: { page: 'home', params: {} },

  go(page, params = {}, skipPush = false) {
    this.currentRoute = { page, params };
    sessionStorage.setItem('lt_saved_route', JSON.stringify(this.currentRoute));

    if (!skipPush) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      this.historyStack.push({ page, params });
      this.historyIndex = this.historyStack.length - 1;
    }
    this.updateNavButtons();
    this.renderCurrent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  back() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const item = this.historyStack[this.historyIndex];
      this.go(item.page, item.params, true);
    } else {
      this.go('home', {}, true);
    }
  },

  forward() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      const item = this.historyStack[this.historyIndex];
      this.go(item.page, item.params, true);
    }
  },

  selectCourseLang(lang) {
    AppState.selectedLang = lang;
    document.querySelectorAll('.lt-lang-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    this.go('courses', { lang });
  },

  updateNavButtons() {
    const bBack = document.getElementById('btnNavBack');
    const bFwd = document.getElementById('btnNavForward');
    if (bBack) bBack.style.opacity = this.historyIndex > 0 ? '1' : '0.45';
    if (bFwd) bFwd.style.opacity = this.historyIndex < this.historyStack.length - 1 ? '1' : '0.45';
  },

  renderCurrent() {
    const root = document.getElementById('appRoot');
    if (!root) return;
    const { page, params } = this.currentRoute;

    if (page === 'home' && window.HomePage) return HomePage.render(root);
    if (page === 'courses' && window.HomePage) return HomePage.renderCourseHub(root, params.lang || AppState.selectedLang || 'ko');
    if (page === 'rating' && window.RatingPage) return RatingPage.render(root);
    if (page === 'support' && window.SupportPage) return SupportPage.render(root, params);
    if (page === 'profile' && window.ProfilePage) return ProfilePage.render(root, params);
    if (page === 'friends' && window.FriendsPage) return FriendsPage.render(root, params);
        if (page === 'albums' && window.AlbumsPage) return AlbumsPage.render(root, params);

    root.innerHTML =
      '<div class="lt-glass-modal" style="max-width:560px; margin:20px auto;">' +
        '<h2 style="margin-bottom:10px;">Раздел «' + page + '» готов к подключению</h2>' +
        '<p class="lt-muted-text">Базовый облачный каркас уже работает! Следующим шагом подключим этот модуль.</p>' +
        '<button class="lt-btn-primary" onclick="Router.go(\'home\')">На главную витрину</button>' +
      '</div>';
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('lt_saved_route');
  let targetPage = 'home';
  let targetParams = {};

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      targetPage = parsed.page || 'home';
      targetParams = parsed.params || {};
    } catch (e) {}
  }

  // Если открываем главную — грузим сразу без ожидания базы
  if (targetPage === 'home') {
    Router.go('home', targetParams);
    return;
  }

  // Показываем аккуратную загрузку, пока подключается Firebase (db и auth)
  const container = document.getElementById('app-root') || document.querySelector('main') || document.body;
  if (container && container !== document.body) {
    container.innerHTML = '<div style="text-align:center; padding: 80px 20px; color: #aaa; font-size: 16px;">Загрузка данных...</div>';
  }

  // Ждём готовности базы данных (db) и авторизации (максимум 4 секунды)
  let attempts = 0;
  const waitFirebase = setInterval(() => {
    attempts++;
    const isDbReady = typeof window.db !== 'undefined' && window.db !== null;
    const isAuthReady = typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser !== null;

    // Запускаем страницу, как только база и юзер готовы (или через 1.5 сек, если юзер не залогинен)
    if ((isDbReady && isAuthReady) || (isDbReady && attempts >= 15) || attempts >= 40) {
      clearInterval(waitFirebase);
      Router.go(targetPage, targetParams);
    }
  }, 100);
});
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('lt_saved_route');
  let targetPage = 'home';
  let targetParams = {};

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      targetPage = parsed.page || 'home';
      targetParams = parsed.params || {};
    } catch (e) {}
  }

  // Если целевая страница — главная, открываем сразу
  if (targetPage === 'home') {
    Router.go('home', targetParams);
    return;
  }

  // Прячем мелькание и показываем спокойную загрузку в #appRoot
  const root = document.getElementById('appRoot');
  if (root) {
    root.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; min-height:50vh; color:#888; font-size:15px;">Загрузка...</div>';
  }

  // Ждём подключения базы данных и авторизации (проверяем каждые 50 мс)
  let attempts = 0;
  const waitReady = setInterval(() => {
    attempts++;
    const hasDb = (typeof db !== 'undefined' && db !== null) || (typeof window.db !== 'undefined' && window.db !== null);
    const hasAuth = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser !== null);

    // Запускаем целевую страницу сразу, как только всё готово (макс. 2.5 сек)
    if ((hasDb && hasAuth) || (hasDb && attempts >= 20) || attempts >= 50) {
      clearInterval(waitReady);
      Router.go(targetPage, targetParams);
    }
  }, 50);
});
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('lt_saved_route');
  let targetPage = 'home';
  let targetParams = {};

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      targetPage = parsed.page || 'home';
      targetParams = parsed.params || {};
    } catch (e) {}
  }

  // Главную страницу рисуем мгновенно
  if (targetPage === 'home') {
    Router.go('home', targetParams);
    return;
  }

  // Запоминаем целевую страницу для Firebase, но пока не рендерим её без данных
  Router.currentRoute = { page: targetPage, params: targetParams };
  Router.historyStack = [{ page: targetPage, params: targetParams }];
  Router.historyIndex = 0;
  if (typeof Router.updateNavButtons === 'function') {
    Router.updateNavButtons();
  }

  // Показываем чистую заглушку загрузки, пока Firebase не вызовет Router.renderCurrent()
  const root = document.getElementById('appRoot');
  if (root) {
    root.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; min-height:50vh; color:#888; font-size:15px;">Загрузка...</div>';
  }
});


