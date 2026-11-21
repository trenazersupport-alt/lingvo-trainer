/* === ЕДИНЫЙ ЧИСТЫЙ РЕНДЕР РАЗДЕЛОВ: БАЗА СЛОВ, ЛИЧНЫЙ СЛОВАРЬ, ХАНЧА === */
window.WORD_GROUPS_LIST = [
  { id: '1. Человек и общение', icon: '', desc: 'Семья, характер, эмоции, разговоры' },
  { id: '2. Дом и быт', icon: '', desc: 'Жильё, мебель, одежда, повседневные вещи' },
  { id: '3. Еда и покупки', icon: '', desc: 'Продукты, кафе, магазины, оплата' },
  { id: '4. Город и транспорт', icon: '', desc: 'Улицы, метро, путешествия, направления' },
  { id: '5. Работа и учёба', icon: '', desc: 'Профессии, офис, университет, навыки' },
  { id: '6. Природа и здоровье', icon: '', desc: 'Погода, животные, тело, медицина' },
  { id: '7. Культура и наука', icon: '', desc: 'Искусство, традиции, технологии, медиа' }
];
(function() {
  if (typeof setLang === 'function' && typeof curLang !== 'undefined') {
    setLang(curLang);
  }
})();

function renderPagedWordList(items, stateKey, pageSize) {
  const perPage = pageSize || 9;
  if (!window._ltPages) window._ltPages = {};
  if (!window._ltPages[stateKey]) window._ltPages[stateKey] = 1;

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  if (window._ltPages[stateKey] > totalPages) window._ltPages[stateKey] = 1;
  const curPage = window._ltPages[stateKey];

  const start = (curPage - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  const rowsHtml = slice.length
    ? slice.map(function(w) {
        return typeof renderWordRowCompact === 'function'
          ? renderWordRowCompact(w)
          : '<div class="word-row"><div><div class="word-row-orig">' + w.word + '</div><div class="word-row-mean">' + w.meaning + '</div></div></div>';
      }).join('')
    : '<p style="color:#9ea4b0; padding:12px 0;">В этом разделе пока нет слов.</p>';

  const pagerHtml = items.length > perPage
    ? '<div class="lt-pager-bar">' +
        '<span class="lt-pager-info">Страница ' + curPage + ' из ' + totalPages + '</span>' +
        '<div class="lt-pager-btns">' +
          '<button class="lt-pager-btn" onclick="window._ltPages[\'' + stateKey + '\']=Math.max(1,' + (curPage - 1) + '); window.render();" ' + (curPage <= 1 ? 'disabled' : '') + '>Назад</button>' +
          '<button class="lt-pager-btn" onclick="window._ltPages[\'' + stateKey + '\']=Math.min(' + totalPages + ',' + (curPage + 1) + '); window.render();" ' + (curPage >= totalPages ? 'disabled' : '') + '>Вперёд</button>' +
        '</div>' +
      '</div>'
    : '';

  return '<div class="word-list">' + rowsHtml + '</div>' + pagerHtml;
}

const _prevRenderBeforeViewsFix = window.render;
window.render = function() {
  const ws = document.getElementById('workspace');
  if (!ws) return;

  if (curTab === 'words') {
    document.body.classList.remove('is-home');
    const all = typeof getAllWords === 'function' ? getAllWords() : [];
    const groups = typeof WORD_GROUPS_LIST !== 'undefined' ? WORD_GROUPS_LIST : [];

    if (!selectedGroup && !searchQuery.trim()) {
      const tilesHtml = groups.map(function(g) {
        const cnt = all.filter(function(w) { return w.group === g.id || w.group === g.title; }).length;
        const safeId = String(g.id).replace(/'/g, "\\'");
        return '<div class="cat-tile" onclick="selectedGroup=\'' + safeId + '\'; selectedSubCat=\'all\'; window.render();">' +
          '<div style="font-size:1.5rem; margin-bottom:8px;">' + (g.icon || '') + '</div>' +
          '<div class="cat-tile-title">' + g.title + '</div>' +
          '<div class="cat-tile-sub">' + (g.desc || '') + '</div>' +
          '<div style="margin-top:12px; font-size:0.84rem; color:#ff6b6b; font-weight:600;">Слов в разделе: ' + cnt + ' →</div>' +
        '</div>';
      }).join('');

      ws.innerHTML =
        '<div class="section-header">' +
          '<h2>База слов (' + (curLang === 'ko' ? 'Корейский' : 'Английский') + ')</h2>' +
          '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
        '</div>' +
        '<div class="toolbar">' +
          '<input type="search" class="input-dark" placeholder="Быстрый поиск по всем разделам..." value="' + searchQuery + '" oninput="searchQuery=this.value; window.render();" />' +
        '</div>' +
        '<div class="cat-grid">' + tilesHtml + '</div>';
      return;
    }

    const grpObj = groups.find(function(g) { return g.id === selectedGroup || g.title === selectedGroup; });
    let list = selectedGroup
      ? all.filter(function(w) { return w.group === selectedGroup || (grpObj && (w.group === grpObj.id || w.group === grpObj.title)); })
      : all;

    const subCats = ['all'].concat(Array.from(new Set(list.map(function(w) { return w.cat; }).filter(Boolean))));
    if (selectedSubCat !== 'all') {
      list = list.filter(function(w) { return w.cat === selectedSubCat; });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(function(w) {
        return w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q));
      });
    }

    const subOpts = subCats.map(function(c) {
      return '<option value="' + c + '" ' + (c === selectedSubCat ? 'selected' : '') + '>' + (c === 'all' ? 'Все подкатегории' : c) + '</option>';
    }).join('');

    const key = 'w_' + curLang + '_' + selectedGroup + '_' + selectedSubCat + '_' + searchQuery;
    ws.innerHTML =
      '<div class="section-header">' +
        '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
          '<button class="btn-secondary" onclick="selectedGroup=null; selectedSubCat=\'all\'; searchQuery=\'\'; window.render();">← К разделам</button>' +
          '<h2>' + (grpObj ? grpObj.title : 'Поиск по базе') + ' (' + list.length + ')</h2>' +
        '</div>' +
        '<button class="btn-primary" onclick="openModal(\'addWordModal\')">+ Добавить слово</button>' +
      '</div>' +
      '<div class="toolbar">' +
        '<input type="search" class="input-dark" placeholder="Поиск в разделе..." value="' + searchQuery + '" oninput="searchQuery=this.value; window.render();" />' +
        '<select class="select-dark" onchange="selectedSubCat=this.value; window.render();">' + subOpts + '</select>' +
      '</div>' +
      renderPagedWordList(list, key, 9);
    return;
  }
  if (curTab === 'hanja') {
    document.body.classList.remove('is-home');
    if (curLang !== 'ko') {
      ws.innerHTML =
        '<div class="section-header"><h2>Корни слов (Ханча)</h2></div>' +
        '<div class="game-box" style="margin-top:16px;"><p style="color:#ccc;">Раздел Ханча доступен только для корейского языка. Переключите язык на <b>Корейский</b> в верхней панели.</p></div>';
      return;
    }

    const roots = typeof hanjaFullList !== 'undefined' ? hanjaFullList : [];
    if (!selectedHanjaRoot && !searchQuery.trim()) {
      const tilesHtml = roots.map(function(h) {
        const safeRoot = String(h.root).replace(/'/g, "\\'");
        return '<div class="cat-tile" onclick="selectedHanjaRoot=\'' + safeRoot + '\'; window.render();">' +
          '<div style="font-size:2rem; color:#ff6b6b; font-weight:700; margin-bottom:6px;">' + h.root + '</div>' +
          '<div class="cat-tile-title">' + h.meaning + '</div>' +
          '<div class="cat-tile-sub">Слов с корнем: ' + (h.words ? h.words.length : 0) + '</div>' +
        '</div>';
      }).join('');

      ws.innerHTML =
        '<div class="section-header"><h2>Ханча — выберите корень (' + roots.length + ')</h2></div>' +
        '<div class="toolbar"><input type="search" class="input-dark" placeholder="Поиск по корню или слову Ханча..." value="' + searchQuery + '" oninput="searchQuery=this.value; window.render();" /></div>' +
        '<div class="cat-grid">' + tilesHtml + '</div>';
      return;
    }

    let hWords = [];
    let hTitle = 'Поиск по Ханче';
    if (selectedHanjaRoot) {
      const rObj = roots.find(function(h) { return h.root === selectedHanjaRoot; });
      hWords = rObj && rObj.words ? rObj.words : [];
      hTitle = rObj ? (rObj.root + ' — ' + rObj.meaning) : 'Корень Ханча';
    } else {
      roots.forEach(function(h) { if (h.words) hWords = hWords.concat(h.words); });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      hWords = hWords.filter(function(w) {
        return w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q) || (w.translit && w.translit.toLowerCase().includes(q));
      });
    }

    const hKey = 'h_' + selectedHanjaRoot + '_' + searchQuery;
    ws.innerHTML =
      '<div class="section-header">' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<button class="btn-secondary" onclick="selectedHanjaRoot=\'\'; searchQuery=\'\'; window.render();">← К корням</button>' +
          '<h2>' + hTitle + ' (' + hWords.length + ')</h2>' +
        '</div>' +
      '</div>' +
      renderPagedWordList(hWords, hKey, 9);
    return;
  }

  if (typeof _prevRenderBeforeViewsFix === 'function') {
    return _prevRenderBeforeViewsFix();
  }
/* === ИСПРАВЛЕНИЕ ПРОВЕРКИ ПРОИЗНОШЕНИЯ (МИКРОФОНА) В КАРТОЧКАХ === */
window.checkSpeech = function(targetWord, btnEl, itemId) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert('Распознавание речи не поддерживается в этом браузере. Используйте Chrome или Edge.');
    return;
  }
  const legacyId = typeof btnEl === 'string' ? btnEl : itemId;
  const resBox = document.getElementById('speech_res_' + legacyId) || document.getElementById('speech_' + legacyId);
  const oldHtml = btnEl && btnEl.tagName ? btnEl.innerHTML : '';

  const rec = new SR();
  rec.lang = (typeof curLang !== 'undefined' && curLang === 'ko') ? 'ko-KR' : 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  if (btnEl && btnEl.tagName) {
    btnEl.style.borderColor = '#ef4444';
    btnEl.style.background = '#991b1b';
  }
  if (resBox) {
    resBox.style.color = '#ffb84d';
    resBox.textContent = 'Слушаю... говорите в микрофон';
  }

  rec.onresult = function(e) {
    const said = (e.results && e.results.item(0) && e.results.item(0).item(0)) ? e.results.item(0).item(0).transcript : '';
    const cleanSaid = said.toLowerCase().replace(/[.,!?…—\-]/g, '').trim();
    const cleanTgt = String(targetWord).toLowerCase().replace(/[.,!?…—\-]/g, '').trim();
    const isMatch = cleanSaid === cleanTgt || cleanSaid.includes(cleanTgt) || cleanTgt.includes(cleanSaid);
    if (resBox) {
      resBox.style.color = isMatch ? '#2ecc71' : '#ffb84d';
      resBox.textContent = isMatch
        ? 'Верно! Распознано: «' + said + '»'
        : 'Услышано: «' + said + '» (Эталон: ' + targetWord + ')';
    }
  };

  rec.onerror = function(ev) {
    if (resBox) {
      resBox.style.color = '#ff6b6b';
      resBox.textContent = 'Ошибка микрофона: ' + (ev.error || 'нет доступа');
    }
  };

  rec.onend = function() {
    if (btnEl && btnEl.tagName) {
      btnEl.style.borderColor = '';
      btnEl.style.background = '';
      if (oldHtml) btnEl.innerHTML = oldHtml;
    }
  };

  try {
    rec.start();
  } catch (e) {}
};

