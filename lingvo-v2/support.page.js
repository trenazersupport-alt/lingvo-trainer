/* === ЦЕНТР ПОДДЕРЖКИ И ПРАВИЛ (support.page.js) === */
window.SupportPage = {
  render(root, params = {}) {
    root.innerHTML =
      '<div style="max-width:680px; margin:0 auto;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">' +
          '<h2>Поддержка и правила сообщества</h2>' +
          '<button class="lt-btn-secondary" onclick="Router.go(\'home\')">На главную</button>' +
        '</div>' +

        '<div style="background:rgba(16,18,26,0.8); border:1px solid rgba(255,255,255,0.12); padding:18px; margin-bottom:16px;">' +
          '<h3 style="font-size:1rem; margin-bottom:8px;">Связаться с администрацией</h3>' +
          '<p class="lt-muted-text">По вопросам работы платформы, предложениям и модерации: <strong style="color:#fff;">trenazer.support@gmail.com</strong></p>' +
          '<a href="mailto:trenazer.support@gmail.com" class="lt-btn-primary" style="display:inline-block; text-decoration:none;">Написать на почту</a>' +
        '</div>' +

        '<div style="background:rgba(16,18,26,0.8); border:1px solid rgba(255,255,255,0.12); padding:18px;">' +
          '<h3 style="font-size:1rem; margin-bottom:10px;">Базовые правила платформы</h3>' +
          '<ul style="color:#d1d5db; font-size:0.88rem; line-height:1.65; padding-left:18px;">' +
            '<li>Уважительное общение при языковом обмене и в комментариях.</li>' +
            '<li>Запрещён спам, оскорбления и публикация нецензурного контента.</li>' +
            '<li>Аккаунт администрации (trenazer.support@gmail.com) осуществляет модерацию материалов и словарной базы.</li>' +
          '</ul>' +
        '</div>' +
      '</div>';
  }
};
