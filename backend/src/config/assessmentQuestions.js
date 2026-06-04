const ASSESSMENT_QUESTIONS = [
  {
    code: 'q1',
    text: 'Кто вы?',
    type: 'single',
    weight: 1.0,
    options: [
      { value: 'seeker', label: 'Соискатель (ищу работу)' },
      { value: 'student', label: 'Студент (ищу практику/стажировку)' },
    ],
  },
  {
    code: 'q2',
    text: 'Какая сфера вам интересна? (можно выбрать несколько)',
    type: 'multi',
    weight: 1.5,
    options: [
      { value: 'industry', label: 'Промышленное производство / завод' },
      { value: 'logistics', label: 'Логистика / транспорт / РЖД' },
      { value: 'engineering', label: 'Машиностроение' },
      { value: 'light_industry', label: 'Лёгкая промышленность' },
      { value: 'security', label: 'Охрана / безопасность' },
      { value: 'other', label: 'Другое', freeText: true },
    ],
  },
  {
    code: 'q3',
    text: 'С какими условиями труда вы НЕ готовы работать?',
    type: 'multi',
    weight: 2.0,
    options: [
      { value: 'chemicals', label: 'Химические производства (кислоты, токсины)' },
      { value: 'cold', label: 'Холодильные установки / работа на холоде' },
      { value: 'heat', label: 'Высокая температура / горячие цеха' },
      { value: 'fumes', label: 'Вредные испарения, пыль, газ' },
      { value: 'noise', label: 'Шум выше нормы / вибрация' },
      { value: 'heights', label: 'Работа на высоте' },
      { value: 'heavy', label: 'Тяжёлый физический труд' },
      { value: 'none', label: 'Нет таких ограничений' },
    ],
  },
  {
    code: 'q4',
    text: 'Что для вас важнее всего при выборе работы?',
    type: 'single',
    weight: 1.5,
    options: [
      { value: 'salary', label: 'Заработная плата' },
      { value: 'conditions', label: 'Условия труда (безопасность, чистота)' },
      { value: 'career', label: 'Карьерный рост и обучение' },
      { value: 'location', label: 'Удобное расположение (рядом с домом)' },
      { value: 'stability', label: 'Стабильность и соцпакет' },
    ],
  },
  {
    code: 'q5',
    text: 'Готовы ли вы к переезду в другой город?',
    type: 'single',
    weight: 1.2,
    options: [
      { value: 'yes', label: 'Да, готов(а)' },
      { value: 'no', label: 'Нет, только в своём городе' },
      { value: 'maybe', label: 'Рассмотрю при хороших условиях' },
    ],
  },
  {
    code: 'q6',
    text: 'Какой график вам подходит?',
    type: 'single',
    weight: 1.3,
    options: [
      { value: 'full_day', label: 'Полный день (5/2)' },
      { value: 'shift', label: 'Сменный график (2/2, 3/3, 29/14)' },
      { value: 'flexible', label: 'Гибкий график' },
      { value: 'any', label: 'По договорённости' },
    ],
  },
  {
    code: 'q7',
    text: 'Есть ли у вас медицинские ограничения для работы?',
    type: 'single',
    weight: 1.8,
    options: [
      { value: 'none', label: 'Нет, ограничений нет' },
      { value: 'yes', label: 'Да (укажу подробнее в анкете)' },
    ],
  },
  {
    code: 'q8',
    text: 'Какой опыт работы у вас есть?',
    type: 'single',
    weight: 1.0,
    options: [
      { value: 'none', label: 'Нет опыта / только учёба' },
      { value: 'less1', label: 'Менее 1 года' },
      { value: '1to3', label: '1–3 года' },
      { value: 'more3', label: 'Более 3 лет' },
    ],
  },
  {
    code: 'q9',
    text: 'Хотели бы вы посмотреть на рабочее место до трудоустройства?',
    type: 'single',
    weight: 1.0,
    options: [
      { value: '3d_or_offline', label: 'Да, обязательно — через 3D-тур или офлайн' },
      { value: '3d_only', label: 'Да, через 3D-тур' },
      { value: 'text_only', label: 'Мне достаточно текстового описания' },
    ],
  },
  {
    code: 'q10',
    text: 'Готовы ли вы пройти короткое обучение/стажировку перед выходом на работу?',
    type: 'single',
    weight: 0.8,
    options: [
      { value: 'yes', label: 'Да, готов(а)' },
      { value: 'no', label: 'Нет, хочу сразу приступить к работе' },
      { value: 'depends', label: 'Зависит от длительности' },
    ],
  },
];

module.exports = { ASSESSMENT_QUESTIONS };