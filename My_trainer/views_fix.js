/* === ЕДИНЫЙ ЧИСТЫЙ РЕНДЕР РАЗДЕЛОВ: БАЗА СЛОВ, ЛИЧНЫЙ СЛОВАРЬ, ХАНЧА === */

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

vRenderBeforeViewsFix === 'function') {
    return _prevRenderBeforeViewsFix();
  }
};
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
/* === ЧИСТЫЙ РАЗДЕЛ «ТРЕНИРОВКА ГОЛОСА» === */
const _prevRenderBeforeVoice = window.render;
window.render = function() {
  if (curTab === 'voice') {
    const ws = document.getElementById('workspace');
    if (!ws) return;
    document.body.classList.remove('is-home');
    const all = typeof getAllWords === 'function' ? getAllWords() : [];
    if (!all.length) {
      ws.innerHTML = '<div class="section-header"><h2>Тренировка произношения</h2></div><p style="color:#ccc;">Словарь пуст.</p>';
      return;
    }
    if (!window._ltVoiceWordId || !all.some(function(w) { return w.id === window._ltVoiceWordId; })) {
      window._ltVoiceWordId = all[Math.floor(Math.random() * all.length)].id;
    }
    const w = all.find(function(item) { return item.id === window._ltVoiceWordId; }) || all;
    const isLearned = typeof learnedIds !== 'undefined' && learnedIds.includes(w.id);
    const isPersonal = typeof personalIds !== 'undefined' && personalIds.includes(w.id);
    const isHard = typeof hardIds !== 'undefined' && hardIds.includes(w.id);
    const safeWord = String(w.word || '').replace(/'/g, "\\'");
    const exText = w.example || w.ex || '';
    const exTr = w.exampleTr || w.exTr || '';
    const safeEx = String(exText).replace(/'/g, "\\'");

    ws.innerHTML =
      '<div class="section-header">' +
        '<h2>Тренировка произношения</h2>' +
        '<button class="btn-primary" onclick="window._ltVoiceWordId=null; window.render();">Следующее слово</button>' +
      '</div>' +
      '<div class="game-box" style="max-width:none; text-align:left; background:rgba(14,15,20,0.86); border:1px solid rgba(255,255,255,0.14);">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">' +
          '<div>' +
            '<div style="font-size:1.7rem; font-weight:700; color:#fff;">' + w.word + '</div>' +
            (w.translit ? '<div style="color:#f87171; font-size:0.95rem; margin-top:2px;">' + w.translit + '</div>' : '') +
            '<div style="color:#e4e6eb; font-size:1.1rem; margin-top:8px;">' + w.meaning + '</div>' +
          '</div>' +
          '<button class="btn-secondary" onclick="speakText(\'' + safeWord + '\')">Озвучить слово</button>' +
        '</div>' +
        (exText ? '<div style="margin-top:16px; padding:12px 14px; background:rgba(10,11,15,0.75); border-left:2px solid #dc2626;">' +
          '<div style="color:#fff; font-weight:600;">' + exText + '</div>' +
          (exTr ? '<div style="color:#9ea4b0; font-size:0.88rem; margin-top:4px;">' + exTr + '</div>' : '') +
        '</div>' : '') +
        '<div id="speech_res_' + w.id + '" style="margin-top:14px; min-height:22px; font-weight:600; font-size:0.92rem;"></div>' +
        '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.1);">' +
          '<button class="btn-primary" onclick="window.checkSpeech(\'' + safeWord + '\', this, \'' + w.id + '\')">Произнести слово</button>' +
          (exText ? '<button class="btn-secondary" onclick="speakText(\'' + safeEx + '\')">Озвучить фразу</button>' : '') +
          (exText ? '<button class="btn-secondary" onclick="window.checkSpeech(\'' + safeEx + '\', this, \'' + w.id + '\')">Произнести фразу</button>' : '') +
          '<button class="btn-secondary" onclick="toggleLearned(\'' + w.id + '\'); window.render();">' + (isLearned ? 'Выучено' : 'Отметить выученным') + '</button>' +
          '<button class="btn-secondary" onclick="toggleHard(\'' + w.id + '\'); window.render();">' + (isHard ? 'Убрать из повтора' : 'Повторить позже') + '</button>' +
          '<button class="btn-secondary" onclick="togglePersonal(\'' + w.id + '\'); window.render();">' + (isPersonal ? 'В личном словаре' : '+ В личный словарь') + '</button>' +
          '<button class="btn-secondary" style="color:#ff8787;" onclick="openReport(\'' + safeWord + '\')">Ошибка</button>' +
        '</div>' +
      '</div>';
    return;
  }
  if (typeof _prevRenderBeforeVoice === 'function') {
    return _prevRenderBeforeVoice();
  }
};
