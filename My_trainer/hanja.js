const hanjaFullList = [
  {
    root: '학 (學)', meaning: 'Учиться, наука, школа',
    words: [
      { id: 'hj_1', word: '학생', translit: 'хаксэн', meaning: 'Ученик / Студент', cat: '학 (學) — Учёба' },
      { id: 'hj_2', word: '학교', translit: 'хаккё', meaning: 'Школа', cat: '학 (學) — Учёба' },
      { id: 'hj_3', word: '대학교', translit: 'тэхаккё', meaning: 'Университет', cat: '학 (學) — Учёба' },
      { id: 'hj_4', word: '학원', translit: 'хагвон', meaning: 'Учебные курсы / Академия', cat: '학 (學) — Учёба' },
      { id: 'hj_5', word: '과학', translit: 'квахак', meaning: 'Наука', cat: '학 (學) — Учёба' }
    ]
  },
  {
    root: '인 (人)', meaning: 'Человек, люди',
    words: [
      { id: 'hj_6', word: '인간', translit: 'инган', meaning: 'Человек / Человечество', cat: '인 (人) — Человек' },
      { id: 'hj_7', word: '인기', translit: 'инги', meaning: 'Популярность', cat: '인 (人) — Человек' },
      { id: 'hj_8', word: '한국인', translit: 'хангугин', meaning: 'Кореец', cat: '인 (人) — Человек' },
      { id: 'hj_9', word: '외국인', translit: 'вегугин', meaning: 'Иностранец', cat: '인 (人) — Человек' },
      { id: 'hj_10', word: '개인', translit: 'кэин', meaning: 'Личность / Индивид', cat: '인 (人) — Человек' }
    ]
  },
  {
    root: '국 (國)', meaning: 'Страна, государство',
    words: [
      { id: 'hj_11', word: '한국', translit: 'хангук', meaning: 'Корея', cat: '국 (國) — Страна' },
      { id: 'hj_12', word: '외국', translit: 'вегук', meaning: 'Заграница', cat: '국 (國) — Страна' },
      { id: 'hj_13', word: '국가', translit: 'кукка', meaning: 'Государство', cat: '국 (國) — Страна' },
      { id: 'hj_14', word: '국제', translit: 'кукче', meaning: 'Международный', cat: '국 (國) — Страна' },
      { id: 'hj_15', word: '전국', translit: 'чонгук', meaning: 'Вся страна', cat: '국 (國) — Страна' }
    ]
  },
  {
    root: '어 (語)', meaning: 'Язык, речь, слово',
    words: [
      { id: 'hj_16', word: '한국어', translit: 'хангуго', meaning: 'Корейский язык', cat: '어 (語) — Язык' },
      { id: 'hj_17', word: '영어', translit: 'ёно', meaning: 'Английский язык', cat: '어 (語) — Язык' },
      { id: 'hj_18', word: '외국어', translit: 'вегуго', meaning: 'Иностранный язык', cat: '어 (語) — Язык' },
      { id: 'hj_19', word: '단어', translit: 'тано', meaning: 'Слово', cat: '어 (語) — Язык' },
      { id: 'hj_20', word: '언어', translit: 'оно', meaning: 'Язык (как система)', cat: '어 (語) — Язык' }
    ]
  },
  {
    root: '대 (大)', meaning: 'Большой, великий',
    words: [
      { id: 'hj_21', word: '대학', translit: 'тэхак', meaning: 'Вуз / Университет', cat: '대 (大) — Большой' },
      { id: 'hj_22', word: '대통령', translit: 'тэтхоннён', meaning: 'Президент', cat: '대 (大) — Большой' },
      { id: 'hj_23', word: '대부분', translit: 'тэбубун', meaning: 'Большая часть', cat: '대 (大) — Большой' },
      { id: 'hj_24', word: '대회', translit: 'тэхве', meaning: 'Соревнование / Съезд', cat: '대 (大) — Большой' },
      { id: 'hj_25', word: '최대', translit: 'чхведэ', meaning: 'Максимум', cat: '대 (大) — Большой' }
    ]
  },
  {
    root: '생 (生)', meaning: 'Жизнь, рождение, ученик',
    words: [
      { id: 'hj_26', word: '생활', translit: 'сэнхваль', meaning: 'Жизнь / Быт', cat: '생 (生) — Жизнь' },
      { id: 'hj_27', word: '생일', translit: 'сэниль', meaning: 'День рождения', cat: '생 (生) — Жизнь' },
      { id: 'hj_28', word: '인생', translit: 'инсэн', meaning: 'Человеческая жизнь', cat: '생 (生) — Жизнь' },
      { id: 'hj_29', word: '선생님', translit: 'сонсэнним', meaning: 'Учитель', cat: '생 (生) — Жизнь' },
      { id: 'hj_30', word: '발생', translit: 'пальсэн', meaning: 'Возникновение', cat: '생 (生) — Жизнь' }
    ]
  },
  {
    root: '일 (日)', meaning: 'День, солнце, Япония',
    words: [
      { id: 'hj_31', word: '매일', translit: 'мэиль', meaning: 'Каждый день', cat: '일 (日) — День' },
      { id: 'hj_32', word: '휴일', translit: 'хюиль', meaning: 'Выходной день', cat: '일 (日) — День' },
      { id: 'hj_33', word: '일기', translit: 'ильги', meaning: 'Дневник / Погода', cat: '일 (日) — День' },
      { id: 'hj_34', word: '일본', translit: 'ильбон', meaning: 'Япония', cat: '일 (日) — День' },
      { id: 'hj_35', word: '일상', translit: 'ильсан', meaning: 'Повседневность', cat: '일 (日) — День' }
    ]
  },
  {
    root: '문 (文)', meaning: 'Письменность, культура, текст',
    words: [
      { id: 'hj_36', word: '문화', translit: 'мунхва', meaning: 'Культура', cat: '문 (文) — Культура' },
      { id: 'hj_37', word: '문법', translit: 'мунбоп', meaning: 'Грамматика', cat: '문 (文) — Культура' },
      { id: 'hj_38', word: '문자', translit: 'мунчча', meaning: 'Буква / СМС', cat: '문 (文) — Культура' },
      { id: 'hj_39', word: '문학', translit: 'мунхак', meaning: 'Литература', cat: '문 (文) — Культура' },
      { id: 'hj_40', word: '주문', translit: 'чумун', meaning: 'Заказ', cat: '문 (文) — Культура' }
    ]
  },
  {
    root: '식 (食)', meaning: 'Еда, пища, питание',
    words: [
      { id: 'hj_41', word: '음식', translit: 'ымсик', meaning: 'Еда / Пища', cat: '식 (食) — Еда' },
      { id: 'hj_42', word: '식당', translit: 'сиктан', meaning: 'Столовая / Ресторан', cat: '식 (食) — Еда' },
      { id: 'hj_43', word: '식사', translit: 'сикса', meaning: 'Приём пищи / Трапеза', cat: '식 (食) — Еда' },
      { id: 'hj_44', word: '간식', translit: 'кансик', meaning: 'Перекус / Снек', cat: '식 (食) — Еда' },
      { id: 'hj_45', word: '외식', translit: 'весик', meaning: 'Еда вне дома (в кафе)', cat: '식 (食) — Еда' }
    ]
  },
  {
    root: '수 (水)', meaning: 'Вода, жидкость',
    words: [
      { id: 'hj_46', word: '수영', translit: 'суён', meaning: 'Плавание', cat: '수 (水) — Вода' },
      { id: 'hj_47', word: '음료수', translit: 'ымнёсу', meaning: 'Напиток', cat: '수 (水) — Вода' },
      { id: 'hj_48', word: '수돗물', translit: 'судонмуль', meaning: 'Водопроводная вода', cat: '수 (水) — Вода' },
      { id: 'hj_49', word: '홍수', translit: 'хонсу', meaning: 'Наводнение', cat: '수 (水) — Вода' },
      { id: 'hj_50', word: '수분', translit: 'субун', meaning: 'Влага', cat: '수 (水) — Вода' }
    ]
  },
  {
    root: '심 (心)', meaning: 'Сердце, душа, разум',
    words: [
      { id: 'hj_51', word: '마음 / 심장', translit: 'симджан', meaning: 'Сердце (орган)', cat: '심 (心) — Душа' },
      { id: 'hj_52', word: '관심', translit: 'квансим', meaning: 'Интерес', cat: '심 (心) — Душа' },
      { id: 'hj_53', word: '중심', translit: 'чунсим', meaning: 'Центр', cat: '심 (心) — Душа' },
      { id: 'hj_54', word: '조심', translit: 'чосим', meaning: 'Осторожность', cat: '심 (心) — Душа' },
      { id: 'hj_55', word: '안심', translit: 'ансим', meaning: 'Спокойствие / Облегчение', cat: '심 (心) — Душа' }
    ]
  },
  {
    root: '전 (電)', meaning: 'Электричество, связь',
    words: [
      { id: 'hj_56', word: '전화', translit: 'чонхва', meaning: 'Телефон / Звонок', cat: '전 (電) — Связь' },
      { id: 'hj_57', word: '전기', translit: 'чонги', meaning: 'Электричество', cat: '전 (電) — Связь' },
      { id: 'hj_58', word: '지하철 / 전철', translit: 'чончхоль', meaning: 'Электричка / Метро', cat: '전 (電) — Связь' },
      { id: 'hj_59', word: '전자', translit: 'чонджа', meaning: 'Электроника', cat: '전 (電) — Связь' },
      { id: 'hj_60', word: '충전', translit: 'чхунджон', meaning: 'Зарядка (устройства)', cat: '전 (電) — Связь' }
    ]
  }
];
