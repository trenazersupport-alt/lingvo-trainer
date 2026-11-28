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

  // Главную страницу рисуем сразу
  if (targetPage === 'home') {
    Router.go('home', targetParams);
    return;
  }

  // Запоминаем целевой маршрут для Firebase
  Router.currentRoute = { page: targetPage, params: targetParams };
  Router.historyStack = [{ page: targetPage, params: targetParams }];
  Router.historyIndex = 0;
  if (typeof Router.updateNavButtons === 'function') {
    Router.updateNavButtons();
  }

  const root = document.getElementById('appRoot');
  const cacheKey = 'lt_html_cache_' + targetPage + '_' + JSON.stringify(targetParams);
  const cachedHtml = sessionStorage.getItem(cacheKey);

  if (root) {
    if (cachedHtml) {
      // МГНОВЕННО восстанавливаем картинку страницы без чёрного экрана!
      root.innerHTML = cachedHtml;
    } else {
      // Если открыли впервые и кэша ещё нет — показываем плавную загрузку
      root.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; min-height:50vh; color:#888; font-size:15px;">Загрузка...</div>';
    }

    // Фоново сохраняем актуальный HTML страницы, когда Firebase её догрузит
    const observer = new MutationObserver(() => {
      const html = root.innerHTML;
      if (html && !html.includes('Загрузка') && !html.includes('Войдите в аккаунт') && html.length > 200) {
        sessionStorage.setItem(cacheKey, html);
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }
});


