// МОДУЛЬ «ЧАТЫ И ИИ-ПОМОЩНИК» (НАСТАВНИК С ПАМЯТЬЮ + КОМНАТЫ С ПРАВИЛАМИ 3+1)
let chatSubTab = 'ai'; // 'ai' или 'rooms'
let activeRoom = '🇰🇷 Корейский клуб';
let aiHistory = JSON.parse(localStorage.getItem('lt_ai_history') || '[]');
let aiMemory = JSON.parse(localStorage.getItem('lt_ai_memory') || '[]');
let geminiApiKey = localStorage.getItem('lt_gemini_key') || '';
let chatWarnings = parseInt(localStorage.getItem('lt_chat_warnings') || '0', 10);

let roomMessages = JSON.parse(localStorage.getItem('lt_room_msgs') || JSON.stringify({
  '🇰🇷 Корейский клуб': [
    { user: 'Соён (Куратор)', text: '안녕하세요! Добро пожаловать в корейский чат. Делитесь любимыми фразами из дорам!', time: '10:00' }
  ],
  '🇬🇧 Английский клуб': [
    { user: 'Alex (Tutor)', text: 'Hello everyone! Practice your daily English phrases right here.', time: '10:05' }
  ],
  '💡 Вопросы по учёбе': [
    { user: 'Модератор', text: 'Здесь можно задавать вопросы по грамматике, Ханче и работе тренажёра. Соблюдайте правила вежливости (система 3+1).', time: '10:10' }
  ]
}));

const BAD_WORDS_FILTER = ['дурак', 'идиот', 'тупой', 'спам', 'реклама', 'оскорбление', 'сука', 'блять'];

function saveAiState() {
  if (aiHistory.length > 40) aiHistory = aiHistory.slice(-40);
  localStorage.setItem('lt_ai_history', JSON.stringify(aiHistory));
  localStorage.setItem('lt_ai_memory', JSON.stringify(aiMemory));
}

function saveGeminiKey() {
  const inp = document.getElementById('geminiKeyInput');
  if (!inp) return;
  geminiApiKey = inp.value.trim();
  localStorage.setItem('lt_gemini_key', geminiApiKey);
  alert(geminiApiKey ? '✅ API-ключ сохранён в вашем браузере! Теперь доступны полный перевод текстов и поиск в интернете.' : 'Ключ очищен. Включён автономный режим наставника.');
  render();
}

function addMemoryFact() {
  const fact = prompt('🧠 Что ИИ-наставник должен запомнить о вас или ваших целях?\n(Например: «Я учу корейский для поездки в Сеул» или «Мне сложно даётся патчим»)');
  if (!fact || !fact.trim()) return;
  aiMemory.push(fact.trim());
  saveAiState();
  render();
}

function clearAiChat() {
  if (!confirm('Очистить историю переписки с ИИ-наставником?')) return;
  aiHistory = [];
  saveAiState();
  render();
}

function generateLocalAiReply(userText) {
  const q = userText.toLowerCase();
  const learnedCount = typeof learnedIds !== 'undefined' ? learnedIds.length : 0;
  const personalCount = typeof personalIds !== 'undefined' ? personalIds.length : 0;
  const lessonsCount = typeof completedLessons !== 'undefined' ? completedLessons.length : 0;

  if (q.startsWith('запомни')) {
    const note = userText.replace(/^запомни[:\s-]*/i, '').trim();
    if (note) {
      aiMemory.push(note);
      saveAiState();
      return `🧠 Запомнил: «${note}». Буду учитывать это в наших занятиях!`;
    }
  }

  if (q.includes('как пользоваться') || q.includes('где ') || q.includes('помощь') || q.includes('приложени')) {
    return `🧭 <b>Навигация по Lingvo Trainer:</b><br>
    • <b>Кнопка «» вверху слева</b> открывает меню всех разделов.<br>
    • В <b>Базе слов</b> слова разбиты на 7 разделов. Нажмите <b>⋮</b> справа от слова, чтобы добавить его в <b>Личный словарь</b> или отметить как выученное.<br>
    • В <b>Грамматике</b> вас ждут пошаговые уроки с теорией, проверкой голосом 🎙️ и мини-тестом.<br>
    • В <b>Ханче</b> собраны 12 базовых корней и 60 слов с ними.`;
  }

  if (q.includes('прогресс') || q.includes('мотивац') || q.includes('устал') || q.includes('сложно')) {
    const memHint = aiMemory.length ? `<br>Помню вашу цель: <i>«${aiMemory.at(-1)}»</i> — вы движетесь в верном направлении!` : '';
    return `🌟 Вы уже отличный молодец! Ваш текущий результат: выучено слов — <b>${learnedCount}</b>, в личном словаре — <b>${personalCount}</b>, пройдено уроков грамматики — <b>${lessonsCount}</b>. Даже 10 минут практики в день дают мощный результат!${memHint}`;
  }

  // Поиск перевода по встроенной базе слов
  const all = typeof getAllWords === 'function' ? getAllWords() : [];
  const found = all.find(w => w.word.toLowerCase() === q || w.meaning.toLowerCase() === q || q.includes(w.word.toLowerCase()));
  if (found) {
    return `📖 Нашёл в словаре тренажёра:<br><b>${found.word}</b> ${found.translit ? `(${found.translit})` : ''} — <b>${found.meaning}</b><br><span style="color:#aaa; font-size:0.88rem;">Раздел: ${found.cat || 'Общий'}</span>`;
  }

  if (q.includes('привет') || q.includes('안녕') || q.includes('hello')) {
    const goal = aiMemory.length ? ` Помню вашу заметку: «${aiMemory.at(-1)}».` : '';
    return `안녕하세요! Рад видеть вас на занятии! 😊${goal} Могу подсказать по разделам сайта, перевести слово из базы или поддержать беседу. (Чтобы я мог переводить большие тексты и искать информацию в интернете — вставьте бесплатный ключ Gemini в настройках выше).`;
  }

  return `Я рядом и готов помочь! 💡 В автономном режиме я умею:<br>
  1. Подсказывать по разделам тренажёра (спросите: <i>«Где найти Ханчу?»</i>).<br>
  2. Переводить слова из нашей базы (напишите слово на корейском, английском или русском).<br>
  3. Запоминать ваши цели (напишите: <i>«Запомни: я хочу выучить 50 глаголов»</i>).<br><br>
  <span style="color:#ffb84d;">Для свободного перевода любых личных текстов и поиска информации в интернете подключите бесплатный ключ Google Gemini в панели над чатом.</span>`;
}

async function sendAiMessage() {
  const inp = document.getElementById('aiUserInput');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;

  inp.value = '';
  aiHistory.push({ role: 'user', text });
  saveAiState();
  render();

  if (!geminiApiKey) {
    const reply = generateLocalAiReply(text);
    aiHistory.push({ role: 'ai', text: reply });
    saveAiState();
    render();
    return;
  }

  // Запрос к Google Gemini API с включённым поиском в интернете (Google Search Grounding)
  const learnedCount = typeof learnedIds !== 'undefined' ? learnedIds.length : 0;
  const lessonsCount = typeof completedLessons !== 'undefined' ? completedLessons.length : 0;
  const sysPrompt = `Ты — дружелюбный, ненавязчивый и мотивирующий ИИ-наставник в веб-приложении Lingvo Trainer (изучение корейского и английского языков).
  Прогресс ученика: выучено слов — ${learnedCount}, пройдено уроков — ${lessonsCount}.
  Запомненные факты об ученике: ${aiMemory.length ? aiMemory.join('; ') : 'пока нет'}.
  Помогай переводить личные тексты ученика, объясняй грамматику простыми словами, подсказывай по разделам сайта (База слов из 7 категорий, Личный словарь, Корни Ханча, Уроки грамматики, Тренировка голоса, Игра) и при необходимости ищи свежую информацию в интернете.`;

  try {
    const res = await fetch(`https://googleapis.com{encodeURIComponent(geminiApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sysPrompt }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        tools: [{ googleSearch: {} }]
      })
    });

    const data = await res.json();
    const aiText = data?.candidates?.at(0)?.content?.parts?.map(p => p.text).join('') || '⚠️ Не удалось получить ответ от ИИ. Проверьте правильность API-ключа.';
    aiHistory.push({ role: 'ai', text: aiText.replace(/\n/g, '<br>') });
  } catch (e) {
    aiHistory.push({ role: 'ai', text: '⚠️ Ошибка соединения с сервером ИИ. Проверьте интернет или API-ключ.' });
  }

  saveAiState();
  render();
}

function sendRoomMessage() {
  if (chatWarnings >= 3) {
    return alert('🚫 Доступ к чату заблокирован по системе правил 3+1 (получено 3 предупреждения за нарушение правил сообщества).');
  }
  const inp = document.getElementById('roomMsgInput');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;

  const lower = text.toLowerCase();
  const hasViolation = BAD_WORDS_FILTER.some(w => lower.includes(w));

  if (hasViolation) {
    chatWarnings += 1;
    localStorage.setItem('lt_chat_warnings', String(chatWarnings));
    inp.value = '';
    if (chatWarnings >= 3) {
      alert('⛔ Предупреждение 3 из 3! Вы достигли лимита нарушений по системе 3+1. Отправка сообщений в чаты заблокирована.');
    } else {
      alert(`⚠️ Автомодерация (Правило 3+1): Сообщение содержит недопустимую лексику и не опубликовано.\nВыдано предупреждение: ${chatWarnings} из 3.`);
    }
    render();
    return;
  }

  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  if (!roomMessages[activeRoom]) roomMessages[activeRoom] = [];
  roomMessages[activeRoom].push({ user: 'Вы (Ученик)', text, time: timeStr });
  localStorage.setItem('lt_room_msgs', JSON.stringify(roomMessages));
  inp.value = '';
  render();
}

const _origRenderForChat = render;
render = function() {
  if (curTab !== 'chat' && curTab !== 'chats') return _origRenderForChat();
  const ws = document.getElementById('workspace');

  ws.innerHTML = `
    <div class="section-header">
      <h2>💬 Чаты и ИИ-помощник</h2>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="${chatSubTab === 'ai' ? 'btn-primary' : 'btn-secondary'}" onclick="chatSubTab='ai'; render()">🤖 ИИ-наставник</button>
        <button class="${chatSubTab === 'rooms' ? 'btn-primary' : 'btn-secondary'}" onclick="chatSubTab='rooms'; render()">💬 Учебные комнаты (3+1)</button>
      </div>
    </div>

    ${chatSubTab === 'ai' ? `
      <div class="game-box" style="max-width:820px; text-align:left; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
          <div>
            <strong style="color:#fff;">🧠 Память наставника:</strong>
            <span style="color:#aaa; font-size:0.88rem;">${aiMemory.length ? aiMemory.join(' • ') : 'пока пусто (нажмите «+ Запомнить»)'}</span>
                    <div style="display:flex; gap:8px;">
            <button class="action-chip" onclick="addMemoryFact()">🧠 + Запомнить</button>
            <button class="action-chip" onclick="clearAiChat()">🗑️ Очистить чат</button>
          </div>
        </div>
        <details style="font-size:0.88rem; color:#bbb;">
          <summary style="cursor:pointer; color:#ff6b6b; font-weight:600;">⚙️ Подключить поиск в интернете и полный перевод текстов (Google Gemini API)</summary>
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <input id="geminiKeyInput" type="password" class="input-dark" style="flex:1; min-width:220px;" placeholder="Вставьте бесплатный ключ AIza..." value="${geminiApiKey}" />
            <button class="btn-primary" onclick="saveGeminiKey()">Сохранить ключ</button>
          </div>
          <p style="margin-top:6px; font-size:0.8rem; color:#888;">Ключ хранится только в вашем браузере. С ним ИИ сможет переводить любые ваши тексты и искать свежую информацию в Google.</p>
        </details>
      </div>

      <div class="game-box" style="max-width:820px; text-align:left;">
        <div id="aiChatBox" style="max-height:360px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; margin-bottom:14px; padding-right:6px;">
          ${!aiHistory.length ? `
            <div style="background:#1e1e2b; padding:12px 16px; border-radius:12px; color:#ddd; line-height:1.5;">
              👋 Привет! Я ваш персональный ИИ-наставник в <b>Lingvo Trainer</b>. Спросите меня о правилах, попросите перевести текст или расскажите о своих целях в изучении языка!
            </div>
          ` : aiHistory.map(m => `
            <div style="align-self:${m.role === 'user' ? 'flex-end' : 'flex-start'}; max-width:85%; background:${m.role === 'user' ? '#7a1c1c' : '#1e1e2b'}; border:1px solid ${m.role === 'user' ? '#ff4747' : '#2f2f40'}; padding:11px 15px; border-radius:12px; color:#fff; line-height:1.5;">
              <div style="font-size:0.75rem; color:#bbb; margin-bottom:4px;">${m.role === 'user' ? 'Вы' : '🤖 ИИ-наставник'}</div>
              <div>${m.text}</div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; gap:8px;">
          <input id="aiUserInput" type="text" class="input-dark" style="flex:1;" placeholder="Напишите вопрос, текст для перевода или «Запомни: ...»" onkeydown="if(event.key==='Enter') sendAiMessage()" />
          <button class="btn-primary" onclick="sendAiMessage()">Отправить</button>
        </div>
      </div>
    ` : `
      <div class="game-box" style="max-width:820px; text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${Object.keys(roomMessages).map(r => `
              <button class="action-chip" style="${activeRoom === r ? 'border-color:#ff4747; background:#3a1818; color:#fff;' : ''}" onclick="activeRoom='${r}'; render()">${r}</button>
            `).join('')}
          </div>
          <div style="font-size:0.85rem; color:${chatWarnings >= 3 ? '#ff4747' : '#ffb84d'}; font-weight:600;">
            🛡️ Правила 3+1: предупреждений ${chatWarnings} из 3
          </div>
        </div>

        <div style="max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; margin-bottom:14px; background:#12121a; padding:12px; border-radius:12px;">
          ${(roomMessages[activeRoom] || []).map(m => `
            <div style="background:#1c1c28; padding:10px 14px; border-radius:10px;">
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#ff6b6b; margin-bottom:4px;">
                <strong>${m.user}</strong>
                <span style="color:#777;">${m.time}</span>
              </div>
              <div style="color:#eee;">${m.text}</div>
            </div>
          `).join('')}
        </div>

        <div style="display:flex; gap:8px;">
          <input id="roomMsgInput" type="text" class="input-dark" style="flex:1;" placeholder="${chatWarnings >= 3 ? 'Чат заблокирован (3/3 предупреждений)' : 'Напишите сообщение в комнату...'}" ${chatWarnings >= 3 ? 'disabled' : ''} onkeydown="if(event.key==='Enter') sendRoomMessage()" />
          <button class="btn-primary" onclick="sendRoomMessage()" ${chatWarnings >= 3 ? 'disabled' : ''}>Отправить</button>
        </div>
      </div>
    `}
  `;
};


