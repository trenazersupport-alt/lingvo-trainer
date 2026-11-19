/* === LINGVO TRAINER: ЧАТЫ, ДРУЗЬЯ, УЧЕБНЫЕ ГРУППЫ И ИИ-ГИД === */

// 1. ПРОФИЛЬ УЧЕНИКА
let ltUserProfile = JSON.parse(localStorage.getItem('lt_user_profile') || 'null');
if (!ltUserProfile) {
  const randId = 'LT-' + Math.floor(1000 + Math.random() * 9000);
  ltUserProfile = {
    id: randId,
    name: 'Ученик #' + randId.split('-')[1],
    status: 'Изучаю базовую лексику'
  };
  localStorage.setItem('lt_user_profile', JSON.stringify(ltUserProfile));
} 
// 2. СОСТОЯНИЕ ВЫБРАННОГО ЧАТА И ИИ
let activeChatContext = JSON.parse(localStorage.getItem('lt_active_chat') || '{"type":"ai","id":"ai_guide"}');
let aiHistory = JSON.parse(localStorage.getItem('lt_ai_history') || '[]');
let aiMemory = JSON.parse(localStorage.getItem('lt_ai_memory') || '[]');
let geminiApiKey = localStorage.getItem('lt_gemini_key') || '';

// 3. СИСТЕМА МОДЕРАЦИИ (3 + 1: 3 предупреждения, 4-е = бан на 24 часа)
let chatWarnings = parseInt(localStorage.getItem('lt_chat_warnings') || '0', 10);
let chatBanUntil = parseInt(localStorage.getItem('lt_chat_ban_until') || '0', 10);

const BAD_WORDS_FILTER = ['дурак', 'идиот', 'тупой', 'спам', 'реклама', 'оскорбление', 'сука', 'блять', 'хуй', 'пизд'];

// 4. ДРУЗЬЯ И ЛИЧНЫЕ ПЕРЕПИСКИ
let ltFriends = JSON.parse(localStorage.getItem('lt_friends_list') || JSON.stringify([
  { id: 'LT-1042', name: 'Соён (Куратор KR)', status: 'Разбирает корни Ханча', online: true, unread: 1 },
  { id: 'LT-2088', name: 'Alex (Tutor EN)', status: 'Практикует грамматику', online: true, unread: 0 }
]));

let ltDirectMessages = JSON.parse(localStorage.getItem('lt_direct_msgs') || JSON.stringify({
  'LT-1042': [
    { senderId: 'LT-1042', senderName: 'Соён (Куратор KR)', text: 'Привет! Если возникнут вопросы по корейским словам или Ханче — пиши сюда, разберём вместе.', time: '10:00' }
  ],
  'LT-2088': [
    { senderId: 'LT-2088', senderName: 'Alex (Tutor EN)', text: 'Hello! Ready to practice English phrases whenever you need.', time: '10:05' }
  ]
}));

// 5. УЧЕБНЫЕ ГРУППЫ
let ltStudyGroups = JSON.parse(localStorage.getItem('lt_study_groups') || JSON.stringify([
  {
    id: 'grp_kr',
    title: 'Корейский клуб',
    lang: 'KR',
    desc: 'Практика корейской лексики, Ханчи и диалогов',
    ownerId: 'system',
    members: ['LT-1042', ltUserProfile.id],
    unread: 0,
    messages: [
      { senderId: 'LT-1042', senderName: 'Соён (Куратор KR)', text: 'Добро пожаловать в группу. Делитесь карточками слов и задавайте вопросы по урокам.', time: '10:10' }
    ]
  },
  {
    id: 'grp_en',
    title: 'Английский клуб',
    lang: 'EN',
    desc: 'Разговорная практика и разбор грамматики',
    ownerId: 'system',
    members: ['LT-2088', ltUserProfile.id],
    unread: 0,
    messages: [
      { senderId: 'LT-2088', senderName: 'Alex (Tutor EN)', text: 'Welcome to the English study room. Share any word card to discuss.', time: '10:12' }
    ]
  }
]));

function saveSocialState() {
  if (aiHistory.length > 40) aiHistory = aiHistory.slice(-40);
  localStorage.setItem('lt_user_profile', JSON.stringify(ltUserProfile));
  localStorage.setItem('lt_active_chat', JSON.stringify(activeChatContext));
  localStorage.setItem('lt_ai_history', JSON.stringify(aiHistory));
  localStorage.setItem('lt_ai_memory', JSON.stringify(aiMemory));
  localStorage.setItem('lt_friends_list', JSON.stringify(ltFriends));
  localStorage.setItem('lt_direct_msgs', JSON.stringify(ltDirectMessages));
  localStorage.setItem('lt_study_groups', JSON.stringify(ltStudyGroups));
}

function getInitials(name) {
  return (name || 'U').replace(/[^a-zA-Zа-яА-ЯёЁ0-9 ]/g, '').trim().slice(0, 2).toUpperCase() || 'LT';
}

function getNowTime() {
  const now = new Date();
  return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

// === ВЫПАДАЮЩЕЕ МЕНЮ В ШТОРКЕ ===
function toggleChatsPopover(event) {
  if (event) event.stopPropagation();
  const pop = document.getElementById('chatsPopoverMenu');
  if (!pop) {
    if (typeof switchTab === 'function') switchTab('chats');
    return;
  }
  const willOpen = !pop.classList.contains('open');
  renderChatsPopover();
  pop.classList.toggle('open', willOpen);
}

function closeChatsPopover() {
  const pop = document.getElementById('chatsPopoverMenu');
  if (pop) pop.classList.remove('open');
}

document.addEventListener('click', function(e) {
  const wrapper = document.getElementById('navChatWrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeChatsPopover();
  }
});

function updateGlobalUnreadDot() {
  const badge = document.getElementById('navChatUnreadBadge');
  if (!badge) return;
  const hasUnreadFriends = ltFriends.some(f => f.unread > 0);
  const hasUnreadGroups = ltStudyGroups.some(g => g.unread > 0);
  badge.style.display = (hasUnreadFriends || hasUnreadGroups) ? 'inline-block' : 'none';
}

function selectChatFromPopover(type, id) {
  activeChatContext = { type, id };
  if (type === 'friend') {
    const f = ltFriends.find(item => item.id === id);
    if (f) f.unread = 0;
  } else if (type === 'group') {
    const g = ltStudyGroups.find(item => item.id === id);
    if (g) g.unread = 0;
  }
  saveSocialState();
  updateGlobalUnreadDot();
  closeChatsPopover();

  // Закрываем мобильную/выдвижную шторку, если открыта
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  if (typeof switchTab === 'function') {
    switchTab('chats');
  } else {
    curTab = 'chats';
    render();
  }
}

function renderChatsPopover() {
  const pop = document.getElementById('chatsPopoverMenu');
  if (!pop) return;

  const isAiActive = curTab === 'chats' && activeChatContext.type === 'ai';

  pop.innerHTML = `
    <div class="pop-section-label">
      <span>Навигатор и помощь</span>
      <span class="pop-badge accent">AI</span>
    </div>
    <button class="pop-chat-item ai-pinned ${isAiActive ? 'active' : ''}" onclick="selectChatFromPopover('ai', 'ai_guide')">
      <div class="pop-chat-meta">
        <div class="pop-chat-title">ИИ-гид и наставник</div>
        <div class="pop-chat-sub">Помощь по сайту, перевод, разбор</div>
      </div>
      <span class="pop-badge">ONLINE</span>
    </button>

    <div class="pop-section-label">
      <span>Друзья (${ltFriends.length})</span>
      <button class="pop-mini-btn" onclick="event.stopPropagation(); promptAddFriend()">+ Найти</button>
    </div>
    ${ltFriends.length ? ltFriends.map(f => {
      const active = curTab === 'chats' && activeChatContext.type === 'friend' && activeChatContext.id === f.id;
      return `
        <button class="pop-chat-item ${active ? 'active' : ''}" onclick="selectChatFromPopover('friend', '${f.id}')">
          <div class="pop-chat-meta">
            <div class="pop-chat-title">${f.name}</div>
            <div class="pop-chat-sub">${f.status || 'В сети'}</div>
          </div>
          ${f.unread > 0 ? `<span class="pop-badge accent">+${f.unread}</span>` : `<span class="pop-badge">${f.id}</span>`}
        </button>
      `;
    }).join('') : `<div style="font-size:0.76rem; color:#7c818d; padding:4px 6px;">Список друзей пуст</div>`}

    <div class="pop-section-label">
      <span>Учебные группы (${ltStudyGroups.length})</span>
      <button class="pop-mini-btn" onclick="event.stopPropagation(); promptCreateGroup()">+ Создать</button>
    </div>
    ${ltStudyGroups.map(g => {
      const active = curTab === 'chats' && activeChatContext.type === 'group' && activeChatContext.id === g.id;
      return `
        <button class="pop-chat-item ${active ? 'active' : ''}" onclick="selectChatFromPopover('group', '${g.id}')">
          <div class="pop-chat-meta">
            <div class="pop-chat-title">${g.title}</div>
            <div class="pop-chat-sub">${g.members.length} участн. • ${g.desc}</div>
          </div>
          <span class="pop-badge">${g.lang || 'ALL'}</span>
        </button>
      `;
    }).join('')}
  `;
}

// === ДЕЙСТВИЯ ПРОФИЛЯ, ДРУЗЕЙ И ГРУПП ===
function editUserProfile() {
  const newName = prompt('Введите ваше имя или никнейм в учебном пространстве:', ltUserProfile.name);
  if (newName && newName.trim()) {
    ltUserProfile.name = newName.trim().slice(0, 28);
  }
  const newStatus = prompt('Ваш текущий статус учёбы (виден друзьям):', ltUserProfile.status);
  if (newStatus !== null && newStatus.trim()) {
    ltUserProfile.status = newStatus.trim().slice(0, 48);
  }
  saveSocialState();
  render();
}

function copyUserId() {
  const text = `${ltUserProfile.name} (${ltUserProfile.id})`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(ltUserProfile.id);
    alert(`Ваш код ученика скопирован: ${ltUserProfile.id}\nОтправьте его другу, чтобы он добавил вас.`);
  } else {
    prompt('Скопируйте ваш код ученика:', text);
  }
}

function promptAddFriend() {
  const input = prompt('Введите имя или код ученика (например: LT-3490 или Минхо):');
  if (!input || !input.trim()) return;
  const clean = input.trim();
  const codeMatch = clean.match(/LT-\d{4}/i);
  const friendId = codeMatch ? codeMatch[0].toUpperCase() : 'LT-' + Math.floor(1000 + Math.random() * 9000);
  const friendName = codeMatch ? `Ученик ${friendId}` : clean.slice(0, 26);

  if (ltFriends.some(f => f.id === friendId)) {
    alert('Этот пользователь уже есть в вашем списке друзей.');
    return;
  }

  ltFriends.push({
    id: friendId,
    name: friendName,
    status: 'Добавлен в друзья',
    online: true,
    unread: 0
  });
  if (!ltDirectMessages[friendId]) {
    ltDirectMessages[friendId] = [
      { senderId: 'system', senderName: 'Система', text: `Вы добавили ${friendName} (${friendId}) в друзья. Начните совместную подготовку.`, time: getNowTime() }
    ];
  }
  saveSocialState();
  renderChatsPopover();
  selectChatFromPopover('friend', friendId);
}

function promptCreateGroup() {
  const title = prompt('Название новой учебной группы (например: Подготовка к TOPIK I):');
  if (!title || !title.trim()) return;
const langRaw = prompt('Язык группы (введите KR, EN или ALL):', 'KR');
const lang = (langRaw || 'ALL').trim().toUpperCase().slice(0, 5);
const desc = prompt('Краткая цель группы:', 'Совместная практика и обмен словами') || 'Учебная группа';
const newGroup = {
id: 'grp_' + Date.now(),
title: title.trim().slice(0, 32),
lang: lang || 'ALL',
desc: desc.trim().slice(0, 60),
ownerId: ltUserProfile.id,
members: [ltUserProfile.id],
unread: 0,
messages: [
{ senderId: 'system', senderName: 'Система', text: 'Группа «' + title.trim() + '» создана. Действуют правила вежливости 3+1.', time: getNowTime() }
]
};
ltStudyGroups.push(newGroup);
saveSocialState();
renderChatsPopover();
selectChatFromPopover('group', newGroup.id);
}
function inviteFriendToGroup(groupId) {
const group = ltStudyGroups.find(g => g.id === groupId);
if (!group) return;
const available = ltFriends.filter(f => !group.members.includes(f.id));
if (!available.length) {
alert('Все ваши друзья уже в группе.\nКод приглашения в группу: ' + group.id.toUpperCase());
return;
}
const listText = available.map((f, idx) => ${idx + 1}. ${f.name} (${f.id})).join('\n');
const choice = prompt(Кого пригласить в группу «${group.title}»?\nВведите номер:\n${listText});
const idx = parseInt(choice, 10) - 1;
if (isNaN(idx) || !available[idx]) return;
const invited = available[idx];
group.members.push(invited.id);
group.messages.push({
senderId: 'system',
senderName: 'Система',
text: ${ltUserProfile.name} пригласил(а) участника ${invited.name} в учебную группу.,
time: getNowTime()
});
saveSocialState();
render();
}
function deleteOrLeaveGroup(groupId) {
const idx = ltStudyGroups.findIndex(g => g.id === groupId);
if (idx === -1) return;
const grp = ltStudyGroups[idx];
const isOwner = grp.ownerId === ltUserProfile.id;
if (!confirm(isOwner ? Удалить группу «${grp.title}»? : Покинуть группу «${grp.title}»?)) return;
ltStudyGroups.splice(idx, 1);
saveSocialState();
selectChatFromPopover('ai', 'ai_guide');
}
// === ИИ-ГИД И НАСТАВНИК ===
function saveGeminiKey() {
const inp = document.getElementById('geminiKeyInput');
if (!inp) return;
geminiApiKey = inp.value.trim();
localStorage.setItem('lt_gemini_key', geminiApiKey);
alert(geminiApiKey ? 'API-ключ сохранен. Включен полный перевод и поиск Google.' : 'Ключ удален. Включен автономный режим гида.');
render();
}
function addMemoryFact() {
const fact = prompt('Что ИИ-наставник должен запомнить о ваших целях?\n(Например: «Готовлюсь к поездке в Сеул» или «Повторяю неправильные глаголы»)');
if (!fact || !fact.trim()) return;
aiMemory.push(fact.trim());
saveSocialState();
render();
}
function clearAiChat() {
if (!confirm('Очистить историю диалога с ИИ-гидом?')) return;
aiHistory = [];
saveSocialState();
render();
}
function sendQuickPrompt(text) {
const inp = document.getElementById('ltChatInput');
if (!inp) return;
inp.value = text;
handleChatSubmit();
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
saveSocialState();
return Заметка сохранена в память: «${note}». Буду учитывать её в рекомендациях.;
}
}
if (q.includes('ханча') || q.includes('корн')) {
return В разделе <b>Корни слов (Ханча)</b> собраны 12 базовых иероглифических корней и 60 производных слов. Нажмите на плитку корня, чтобы увидеть его значение, а через меню карточки добавьте нужные слова в Личный словарь.<br> <button class="lt-nav-jump-btn" onclick="switchTab('hanja')">Перейти в раздел Ханча</button>;
}
if (q.includes('грамматик') || q.includes('урок') || q.includes('правил')) {
return Раздел <b>Грамматика</b> построен пошагово: сначала краткая теория, затем тренировка произношения через микрофон и закрепляющий мини-тест.<br> <button class="lt-nav-jump-btn" onclick="switchTab('grammar')">Открыть уроки грамматики</button>;
}
if (q.includes('словар') || q.includes('слов') || q.includes('где ')) {
return <b>Навигация по словарям Lingvo Trainer:</b><br> 1. <b>База слов</b> — более 280 слов, разбитых на 7 тематических разделов и 31 подкатегорию.<br> 2. <b>Личный словарь</b> — сюда попадают слова, которые вы отметили через меню карточки, а также ваши собственные слова.<br> <button class="lt-nav-jump-btn" onclick="switchTab('words')">База слов</button> <button class="lt-nav-jump-btn" onclick="switchTab('myDict')">Личный словарь</button>;
}
if (q.includes('голос') || q.includes('произнош') || q.includes('микрофон')) {
return Для практики речи используйте <b>Тренировку голоса</b> или режим <b>Повторение голосом</b>. Нажмите на иконку микрофона и чётко произнесите фразу — система сравнит распознанный текст с эталоном.<br> <button class="lt-nav-jump-btn" onclick="switchTab('voice')">Тренировка голоса</button>;
}
if (q.includes('друз') || q.includes('групп') || q.includes('чат') || q.includes('как пользоваться')) {
return <b>Как устроено учебное пространство:</b><br> • Откройте <b>Чаты и ИИ-помощник</b> в боковом меню, чтобы увидеть выпадающий список диалогов.<br> • Нажмите <b>+ Найти</b> рядом со списком друзей, чтобы добавить собеседника по его коду (ваш код: <b>${ltUserProfile.id}</b>).<br> • Нажмите <b>+ Создать</b> в блоке групп, чтобы открыть собственную учебную комнату и делиться карточками слов через кнопку <b>+ Слово</b>.;
}
if (q.includes('прогресс') || q.includes('повторить') || q.includes('статистик')) {
const memHint = aiMemory.length ? <br>Актуальная цель: <i>«${aiMemory.at(-1)}»</i>. : '';
return <b>Текущая сводка прогресса:</b><br> • Выучено слов: <b>${learnedCount}</b><br> • В личном словаре: <b>${personalCount}</b><br> • Пройдено уроков грамматики: <b>${lessonsCount}</b>${memHint}<br> <button class="lt-nav-jump-btn" onclick="switchTab('repeatGame')">Повторить слова голосом</button>;
}
// Поиск по встроенному словарю
const all = typeof getAllWords === 'function' ? getAllWords() : [];
const found = all.find(w => w.word.toLowerCase() === q || w.meaning.toLowerCase() === q || (q.length > 2 && w.word.toLowerCase().includes(q)));
if (found) {
return Найдено в словаре тренажёра:<br><b>${found.word}</b> ${found.translit ? (${found.translit}) : ''} — <b>${found.meaning}</b><br><span style="color:#7c818d; font-size:0.82rem;">Категория: ${found.cat || 'Общая'}</span>;
}
return Я ваш навигатор и наставник по <b>Lingvo Trainer</b>. Могу подсказать, как устроен любой раздел сайта, показать ваш прогресс, найти слово в базе или запомнить учебную цель (напишите: <i>«Запомни: ...»</i>).<br><span style="color:#9ea4b0; font-size:0.84rem;">Для свободного перевода любых текстов и поиска информации в интернете подключите ключ Google Gemini в верхней панели настроек.</span>;
}
// === ОТПРАВКА СООБЩЕНИЙ И КАРТОЧЕК СЛОВ ===
function checkModeration(text) {
const now = Date.now();
if (chatBanUntil > now) {
const minsLeft = Math.ceil((chatBanUntil - now) / 60000);
alert(Доступ к чатам временно ограничен по системе 3+1. Осталось примерно ${minsLeft} мин.);
return false;
}
const lower = text.toLowerCase();
const hasViolation = BAD_WORDS_FILTER.some(w => lower.includes(w));
if (!hasViolation) return true;
chatWarnings += 1;
localStorage.setItem('lt_chat_warnings', String(chatWarnings));
if (chatWarnings >= 4) {
chatBanUntil = now + 24 * 60 * 60 * 1000;
chatWarnings = 0;
localStorage.setItem('lt_chat_ban_until', String(chatBanUntil));
localStorage.setItem('lt_chat_warnings', '0');
alert('Система модерации (3+1): зафиксировано 4-е нарушение. Доступ к отправке сообщений заблокирован на 24 часа.');
} else {
alert(Автомодерация (Правило 3+1): сообщение отклонено.\nВыдано предупреждение: ${chatWarnings} из 3 (4-е нарушение блокирует чат на 24 часа).);
}
render();
return false;
}
function attachWordCardPrompt() {
const all = typeof getAllWords === 'function' ? getAllWords() : [];
if (!all.length) {
alert('База слов пока не загружена.');
return;
}
const query = prompt('Введите слово (на русском, корейском или английском), чтобы отправить его карточку в чат:');
if (!query || !query.trim()) return;
const q = query.trim().toLowerCase();
const found = all.find(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q));
if (!found) {
alert('Слово не найдено в базе тренажёра. Попробуйте другое слово.');
return;
}
const cardPayload = {
word: found.word,
translit: found.translit || '',
meaning: found.meaning,
cat: found.cat || 'Словарь'
};
pushSocialMessage(Карточка слова: ${found.word}, cardPayload);
}
function pushSocialMessage(text, wordCard = null) {
if (!checkModeration(text)) return;
const msgObj = {
senderId: ltUserProfile.id,
senderName: ltUserProfile.name,
text,
wordCard,
time: getNowTime()
};
if (activeChatContext.type === 'friend') {
const fId = activeChatContext.id;
if (!ltDirectMessages[fId]) ltDirectMessages[fId] = [];
ltDirectMessages[fId].push(msgObj);
} else if (activeChatContext.type === 'group') {
const grp = ltStudyGroups.find(g => g.id === activeChatContext.id);
if (grp) grp.messages.push(msgObj);
}
saveSocialState();
render();
}
async function handleChatSubmit() {
const inp = document.getElementById('ltChatInput');
if (!inp) return;
const text = inp.value.trim();
if (!text) return;
// Ветка 1: ИИ-гид
if (activeChatContext.type === 'ai') {
inp.value = '';
aiHistory.push({ role: 'user', text });
saveSocialState();
render();
if (!geminiApiKey) {
const reply = generateLocalAiReply(text);
aiHistory.push({ role: 'ai', text: reply });
saveSocialState();
render();
return;
}
const learnedCount = typeof learnedIds !== 'undefined' ? learnedIds.length : 0;
const lessonsCount = typeof completedLessons !== 'undefined' ? completedLessons.length : 0;
const sysPrompt = Ты — строгий, вежливый и точный ИИ-гид и наставник в веб-приложении Lingvo Trainer (изучение корейского и английского языков). Не используй эмодзи и смайлики. Структура сайта: База слов (7 разделов), Личный словарь, Корни слов (Ханча — 12 корней и 60 слов), Грамматика (пошаговые уроки с микрофоном и тестами), Тренировка голоса, Игра Вопрос-Ответ, Повторение голосом, Чаты и учебные группы с системой модерации 3+1. Прогресс ученика: выучено слов — ${learnedCount}, пройдено уроков — ${lessonsCount}. Запомненные цели: ${aiMemory.length ? aiMemory.join('; ') : 'нет'}.;
try {
const res = await fetch(https://googleapis.com{encodeURIComponent(geminiApiKey)}, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
systemInstruction: { parts: [{ text: sysPrompt }] },
contents: [{ role: 'user', parts: [{ text }] }],
tools: [{ googleSearch: {} }]
})
});
const data = await res.json();
const aiText = data?.candidates?.at(0)?.content?.parts?.map(p => p.text).join('') || 'Не удалось получить ответ от сервера. Проверьте API-ключ.';
aiHistory.push({ role: 'ai', text: aiText.replace(/\n/g, '
') });
} catch (e) {
aiHistory.push({ role: 'ai', text: 'Ошибка соединения с сервером ИИ. Проверьте подключение к интернету.' });
}
saveSocialState();
render();
return;
}
// Ветка 2: Личный чат или учебная группа
inp.value = '';
pushSocialMessage(text, null);
}
// === ОТРИСОВКА ГЛАВНОГО ОКНА ЧАТА ===
const _origRenderForChat = render;
render = function() {
updateGlobalUnreadDot();
if (curTab !== 'chat' && curTab !== 'chats') return _origRenderForChat();
const ws = document.getElementById('workspace');
const isBanned = chatBanUntil > Date.now();
// Панель профиля ученика (сверху)
const profileStripHtml = <div style="max-width:960px; margin:0 auto 14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:12px 18px; background:#14151a; border:1px solid rgba(255,255,255,0.08); border-radius:14px;"> <div style="display:flex; align-items:center; gap:12px;"> <div class="lt-avatar">${getInitials(ltUserProfile.name)}</div> <div style="text-align:left;"> <div style="color:#f1f3f5; font-weight:600; font-size:0.95rem;"> ${ltUserProfile.name} <span class="pop-badge" style="margin-left:6px;">${ltUserProfile.id}</span> </div> <div style="color:#7c818d; font-size:0.8rem; margin-top:2px;">Статус: ${ltUserProfile.status}</div> </div> </div> <div style="display:flex; gap:8px; flex-wrap:wrap;"> <button class="lt-pill-btn" onclick="copyUserId()">Скопировать ID</button> <button class="lt-pill-btn" onclick="editUserProfile()">Профиль и статус</button> <button class="lt-pill-btn" onclick="toggleChatsPopover(event)">Все чаты</button> </div> </div>;
// РЕЖИМ 1: ИИ-ГИД И НАСТАВНИК
if (activeChatContext.type === 'ai') {
ws.innerHTML = `
${profileStripHtml}



AI

ИИ-гид и наставник
Навигация по платформе, разбор слов и перевод



+ Заметка в память
Настройки API
Очистить

Память наставника: ${aiMemory.length ? aiMemory.join(' • ') : 'пока нет записей'}
${geminiApiKey ? 'Gemini API подключен' : 'Автономный режим'}
Сохранить ключ

Ключ хранится локально в браузере и открывает полный перевод текстов и поиск в Google.
${!aiHistory.length ? <div class="lt-msg-row other"> <div class="lt-msg-meta"><span>ИИ-гид Lingvo Trainer</span></div> <div class="lt-msg-bubble"> Добро пожаловать. Я помогу сориентироваться в разделах тренажёра, покажу статистику вашего прогресса, найду перевод слова из базы или запомню ваши цели обучения. Выберите быстрый вопрос ниже или напишите свой запрос. </div> </div> : aiHistory.map(m => <div class="lt-msg-row ${m.role === 'user' ? 'own' : 'other'}"> <div class="lt-msg-meta"><span>${m.role === 'user' ? ltUserProfile.name : 'ИИ-гид'}</span></div> <div class="lt-msg-bubble">${m.text}</div> </div>).join('')}
Как устроены чаты
Где Ханча
Мой прогресс
Уроки грамматики
Отправить


`;
const cfg = document.getElementById('geminiConfigBox');
if (cfg) {
const origToggle = cfg.classList.toggle.bind(cfg.classList);
cfg.classList.toggle = function(cls) {
origToggle(cls);
cfg.style.display = cfg.classList.contains('hidden-box') ? 'none' : 'block';
};
}
return;
}
// РЕЖИМ 2: ЛИЧНЫЙ ЧАТ С ДРУГОМ
if (activeChatContext.type === 'friend') {
const friend = ltFriends.find(f => f.id === activeChatContext.id) || { id: activeChatContext.id, name: 'Собеседник', status: 'В сети' };
const msgs = ltDirectMessages[friend.id] || [];
ws.innerHTML = `
${profileStripHtml}



${getInitials(friend.name)}

${friend.name} ${friend.id}
${friend.status}



Правила 3+1 • Предупреждений: ${chatWarnings}/3

${msgs.map(m => {
const isOwn = m.senderId === ltUserProfile.id;
return <div class="lt-msg-row ${isOwn ? 'own' : 'other'}"> <div class="lt-msg-meta"> <span>${isOwn ? 'Вы' : m.senderName}</span> <span>${m.time}</span> </div> <div class="lt-msg-bubble"> <div>${m.text}</div> ${m.wordCard ?

${m.wordCard.word} ${m.wordCard.translit}
${m.wordCard.meaning}
Раздел: ${m.wordCard.cat}

: ''} </div> </div>;
}).join('')}
<button class="lt-pill-btn" onclick="attachWordCardPrompt()" ${isBanned ? 'disabled' : ''}>+ Слово
<input id="ltChatInput" type="text" placeholder="${isBanned ? 'Отправка временно заблокирована (система 3+1)' : 'Напишите личное сообщение...'}" ${isBanned ? 'disabled' : ''} onkeydown="if(event.key==='Enter') handleChatSubmit()" />
<button class="btn-primary" onclick="handleChatSubmit()" ${isBanned ? 'disabled' : ''}>Отправить


`;
return;
}
// РЕЖИМ 3: УЧЕБНАЯ ГРУППА
if (activeChatContext.type === 'group') {
const group = ltStudyGroups.find(g => g.id === activeChatContext.id) || ltStudyGroups[0];
if (!group) {
selectChatFromPopover('ai', 'ai_guide');
return;
}
ws.innerHTML = ${profileStripHtml} <div class="lt-chat-shell"> <div class="lt-chat-topbar"> <div class="lt-chat-title-group"> <div class="lt-avatar">${group.lang || 'GR'}</div> <div> <div style="color:#f8f9fa; font-weight:600; font-size:1rem;">${group.title} <span class="pop-badge">${group.members.length} участн.</span></div> <div style="color:#7c818d; font-size:0.8rem;">${group.desc}</div> </div> </div> <div class="lt-chat-actions"> <span class="pop-badge">3+1 (${chatWarnings}/3)</span> <button class="lt-pill-btn" onclick="inviteFriendToGroup('${group.id}')">+ Пригласить</button> ${group.ownerId !== 'system' ?Удалить группу` : ''}

${group.messages.map(m => {
const isOwn = m.senderId === ltUserProfile.id;
return <div class="lt-msg-row ${isOwn ? 'own' : 'other'}"> <div class="lt-msg-meta"> <span>${isOwn ? 'Вы' : m.senderName}</span> <span>${m.time}</span> </div> <div class="lt-msg-bubble"> <div>${m.text}</div> ${m.wordCard ?

${m.wordCard.word} ${m.wordCard.translit}
${m.wordCard.meaning}
Раздел: ${m.wordCard.cat}

: ''} </div> </div>;
}).join('')}
<button class="lt-pill-btn" onclick="attachWordCardPrompt()" ${isBanned ? 'disabled' : ''}>+ Слово
<input id="ltChatInput" type="text" placeholder="${isBanned ? 'Отправка временно заблокирована (система 3+1)' : 'Сообщение в учебную группу...'}" ${isBanned ? 'disabled' : ''} onkeydown="if(event.key==='Enter') handleChatSubmit()" />
<button class="btn-primary" onclick="handleChatSubmit()" ${isBanned ? 'disabled' : ''}>Отправить


`;
}
};
