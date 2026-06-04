const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const {
  User, UserProfile, Enterprise, Vacancy, Tour, TourBooking, Application, AssessmentSession, AssessmentAnswer, MatchResult, AssessmentQuestion
} = require('../models');
const { ASSESSMENT_QUESTIONS } = require('../config/assessmentQuestions');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Сначала убедимся, что таблицы существуют (без force)
    await sequelize.sync();
    console.log('✓ Database synced');

    // Проверяем, есть ли уже данные в БД
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('✓ Database already seeded, skipping...');
      process.exit(0);
    }

    // Пересоздаём таблицы с force, т.к. данных нет
    await sequelize.sync({ force: true });
    console.log('✓ Database re-created');

    // Seed assessment questions
    const existingQuestions = await AssessmentQuestion.count();
    if (existingQuestions === 0) {
      const questionData = ASSESSMENT_QUESTIONS.map((q, index) => ({
        code: q.code,
        text: q.text,
        type: q.type,
        weight: q.weight,
        optionsJson: q.options || [],
        isActive: true,
        sortOrder: index,
      }));
      await AssessmentQuestion.bulkCreate(questionData);
      console.log('✓ Assessment questions seeded:', questionData.length);
    }

    // Сначала создаём предприятия (нужны для привязки HR)
    const enterprises = await Enterprise.bulkCreate([
      {
        name: 'АО «Северный машзавод»',
        slug: 'severny-mashzavod',
        industry: 'Машиностроение',
        region: 'Уральский федеральный округ',
        city: 'Екатеринбург',
        address: 'ул. Промышленная, 1',
        description: 'Крупнейшее машиностроительное предприятие Урала. Производство деталей и узлов для промышленности, включая нефтегазовое оборудование, элементы конструкций и запасные части.',
        laborConditions: 'Современное оборудование, соблюдение всех норм охраны труда, регулярные медосмотры, выдача СИЗ',
        safetyInfo: 'Обучение по охране труда при приёме, ежеквартальные инструктажи, аттестация рабочих мест',
        salaryCalcInfo: 'Оклад + премия (до 30%). Оплата сдельная и повременная. 13-я зарплата по итогам года.',
        medicalExamInfo: 'Предварительный медосмотр при трудоустройстве, периодические осмотры 1 раз в год',
        collectiveAgreementUrl: '/documents/collective-agreement-severny.pdf',
        logo: 'https://via.placeholder.com/150?text=СМЗ',
        moderationStatus: 'approved',
      },
      {
        name: 'ПАО «ВолгаМеталл»',
        slug: 'volgametall',
        industry: 'Металлургия',
        region: 'Приволжский федеральный округ',
        city: 'Нижний Новгород',
        address: 'пр. Металлургов, 15',
        description: 'Ведущий производитель металлопроката в Поволжье. Производство листового и сортового проката, труб, метизной продукции для строительства и машиностроения.',
        laborConditions: 'Цеха с повышенной температурой, обязательное использование СИЗ, душевые и комнаты отдыха',
        safetyInfo: 'Строгий контроль охраны труда, обучение промышленной безопасности, регулярные проверки',
        salaryCalcInfo: 'Оклад по разряду + районный коэффициент (15%) + северные надбавки. Оплата больничных и отпускных полная.',
        medicalExamInfo: 'Медосмотр при приёме, периодические осмотры с участием терапевта, невролога, офтальмолога',
        collectiveAgreementUrl: '/documents/collective-agreement-volga.pdf',
        logo: 'https://via.placeholder.com/150?text=ВМ',
        moderationStatus: 'approved',
      },
      {
        name: 'ООО «ХимПром Регион»',
        slug: 'himprom-region',
        industry: 'Химическая промышленность',
        region: 'Приволжский федеральный округ',
        city: 'Казань',
        address: 'Химический переулок, 7',
        description: 'Производство промышленных химических компонентов: кислоты, щёлочи, растворители, лаки, краски. Предприятие работает с 1995 года и поставляет продукцию по всей России.',
        laborConditions: 'Работа с химическими веществами, обязательное использование СИЗ, регулярный контроль воздуха рабочей зоны',
        safetyInfo: 'Инструктажи по химической безопасности, обучение работе с опасными веществами, регулярная проверка оборудования',
        salaryCalcInfo: 'Оклад + надбавка за вредность (15-25%) + премия за выполнение плана. Бесплатное питание в столовой.',
        medicalExamInfo: 'Предварительный и периодические медосмотры с участием токсиколога. Бесплатные путёвки в санаторий.',
        collectiveAgreementUrl: '/documents/collective-agreement-him.pdf',
        logo: 'https://via.placeholder.com/150?text=ХПР',
        moderationStatus: 'approved',
      },
      {
        name: 'ФГП "Ведомственная охрана железнодорожного транспорта России"',
        slug: 'fgp-vozhdt',
        industry: 'Охрана / Безопасность / Железнодорожный транспорт',
        region: 'Центральный федеральный округ',
        city: 'Москва',
        address: 'Россия, Москва (головной офис); филиалы по всей стране',
        description: `Федеральное государственное предприятие, осуществляющее ведомственную охрану объектов
железнодорожного транспорта с 1921 года. Основные виды деятельности: транспортная безопасность,
охрана объектов инфраструктуры, сопровождение и охрана грузов, обеспечение пожарной безопасности.
Предприятие отметило 100 лет защиты железных дорог России.`,
        laborConditions: `Сменный график работы (29/14 дней — для отдельных категорий, 5/2 — для офисных должностей).
Обязательное прохождение медицинского освидетельствования. Наличие формы и спецодежды.
Работа в условиях открытого воздуха, круглосуточный режим для постовых нарядов.
Ненормированный рабочий день для отдельных категорий. Доплата за ночные смены (22:00–06:00) — 40%.
Льготы за стаж, надбавки за сложность и напряжённость труда.`,
        safetyInfo: `Обязательный первичный и периодический медицинский осмотр. Допуск к огнестрельному оружию
при наличии разрешения ОВД. Инструктажи по охране труда и пожарной безопасности.
СИЗ (средства индивидуальной защиты) предоставляются работодателем.
Запрет на работу при наличии противопоказаний по состоянию здоровья.`,
        salaryCalcInfo: `Тарифные ставки устанавливаются в соответствии с разрядами ЕТС.
Минимальная тарифная ставка (1 разряд) — от 10 602 руб./мес., максимальная (10 разряд) — 1,775 коэффициента
к базовой ставке. Доплаты: ночные смены +40%, сверхурочные по ТК РФ,
надбавки за стаж (5–35% в зависимости от лет работы в ведомственной охране).
Районные коэффициенты и северные надбавки — по месту прохождения службы.`,
        medicalExamInfo: `Обязательный предварительный медицинский осмотр при трудоустройстве.
Периодические медосмотры согласно Приказу Минздрава. Психологическое освидетельствование.
Противопоказания: хронические заболевания, ограничивающие несение службы с оружием,
работу на высоте, физические нагрузки.`,
        collectiveAgreementUrl: '/uploads/enterprises/fgp-vozhdt/docs/kollektivny-dogovor-2024-2026.pdf',
        logo: '/uploads/enterprises/fgp-vozhdt/TransportBezop-8.jpg',
        moderationStatus: 'approved',
      },
    ]);
    console.log('✓ Enterprises created:', enterprises.length);

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      {
        email: 'seeker1@test.local',
        passwordHash,
        role: 'seeker',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'seeker2@test.local',
        passwordHash,
        role: 'seeker',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'student1@test.local',
        passwordHash,
        role: 'student',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'hr1@zavod.local',
        passwordHash,
        role: 'enterprise_user',
        status: 'active',
        emailVerified: true,
        enterpriseId: enterprises[0].id, // привязан к Северному машзаводу
      },
      {
        email: 'admin@test.local',
        passwordHash,
        role: 'superadmin',
        status: 'active',
        emailVerified: true,
      },
    ]);
    console.log('✓ Users created:', users.length);

    // Create user profiles
    const profiles = await UserProfile.bulkCreate([
      {
        userId: users[0].id,
        fullName: 'Алексей Смирнов',
        phone: '+79001234567',
        city: 'Екатеринбург',
        age: 28,
        relocationReady: false,
        desiredPosition: 'Оператор станков с ЧПУ',
        desiredSalaryFrom: 70000,
        desiredSalaryTo: 95000,
        preferredSchedule: 'Сменный график',
        experienceSummary: 'Опыт работы 5 лет на производстве',
        educationInfo: 'Среднее профессиональное образование',
      },
      {
        userId: users[1].id,
        fullName: 'Ирина Котова',
        phone: '+79001234568',
        city: 'Пермь',
        age: 35,
        relocationReady: true,
        desiredPosition: 'Электромонтер',
        desiredSalaryFrom: 65000,
        desiredSalaryTo: 85000,
        preferredSchedule: 'Пятидневка',
        experienceSummary: 'Опыт работы 10 лет в энергетике',
        educationInfo: 'Высшее техническое образование',
      },
      {
        userId: users[2].id,
        fullName: 'Марина Белова',
        phone: '+79001234569',
        city: 'Казань',
        age: 20,
        relocationReady: false,
        desiredPosition: 'Практикант',
        desiredSalaryFrom: 25000,
        desiredSalaryTo: 35000,
        preferredSchedule: 'Сменный график',
        experienceSummary: 'Студент 3 курса',
        studentInfoJson: {
          institution: 'Казанский колледж технологий',
          course: 3,
          specialty: 'Механообработка',
          format: 'practice',
        },
      },
      {
        userId: users[3].id,
        fullName: 'Ольга Власова',
        phone: '+79001234570',
        city: 'Екатеринбург',
        desiredPosition: 'HR-специалист',
      },
    ]);
    console.log('✓ Profiles created:', profiles.length);

    // Create vacancies
    const vacancies = await Vacancy.bulkCreate([
      {
        enterpriseId: enterprises[0].id,
        title: 'Оператор станков с ЧПУ',
        department: 'Механообрабатывающий цех',
        employmentType: 'full_time',
        salaryFrom: 70000,
        salaryTo: 95000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Среднее профессиональное образование, опыт работы от 1 года, умение читать чертежи',
        responsibilities: 'Наладка и обслуживание станков с ЧПУ, изготовление деталей по чертежам, контроль качества',
        benefits: 'Официальное трудоустройство, ДМС, бесплатная спецодежда, обучение за счёт предприятия',
        medicalRequirements: 'Отсутствие противопоказаний для работы на производстве',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[0].id,
        title: 'Практикант в механообработке',
        department: 'Механообрабатывающий цех',
        employmentType: 'practice',
        salaryFrom: 25000,
        salaryTo: 35000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Студент 3-4 курса технического вуза/колледжа',
        responsibilities: 'Помощь операторам станков, изучение производственных процессов',
        benefits: 'Оплачиваемая практика, возможность трудоустройства после окончания обучения',
        medicalRequirements: 'Медосмотр для допуска к производству',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Электромонтер',
        department: 'Энергетический цех',
        employmentType: 'shift',
        salaryFrom: 65000,
        salaryTo: 85000,
        schedule: 'Вахтовый метод (15/15)',
        requirements: 'Среднее профессиональное образование, группа допуска по электробезопасности не ниже III',
        responsibilities: 'Обслуживание электрооборудования, проведение ремонтных работ, монтаж электрических сетей',
        benefits: 'Вахтовые надбавки, оплата проезда, предоставление жилья на вахте',
        medicalRequirements: 'Отсутствие противопоказаний для работы на высоте и с электрооборудованием',
        isStudentAvailable: false,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Лаборант химического анализа',
        department: 'ОТК',
        employmentType: 'full_time',
        salaryFrom: 50000,
        salaryTo: 70000,
        schedule: 'Пятидневка',
        requirements: 'Среднее профессиональное или высшее химическое образование, опыт работы в лаборатории',
        responsibilities: 'Проведение химических анализов, отбор проб, ведение документации',
        benefits: 'Официальное трудоустройство, ДМС, частичная оплата питания',
        medicalRequirements: 'Отсутствие аллергии на химические вещества',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[2].id,
        title: 'Оператор химического производства',
        department: 'Основное производство',
        employmentType: 'full_time',
        salaryFrom: 60000,
        salaryTo: 80000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Среднее профессиональное образование, готовность к работе с химическими веществами',
        responsibilities: 'Ведение технологического процесса, контроль параметров производства, заполнение технологических карт',
        benefits: 'Надбавка за вредность, бесплатное питание, спецодежда, медосмотр за счёт предприятия',
        medicalRequirements: 'Отсутствие противопоказаний для работы с химическими веществами',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[3].id,
        title: 'Стрелок ВОХР',
        department: 'Служба охраны',
        employmentType: 'full_time',
        salaryFrom: 27000,
        salaryTo: 38000,
        schedule: 'Сменный график (29/14)',
        requirements: 'Медицинский осмотр, допуск к оружию (разрешение ОВД), отсутствие противопоказаний. Опыт не обязателен — обучение за счёт предприятия.',
        responsibilities: 'Охрана объектов железнодорожной инфраструктуры, патрулирование территории, контроль пропускного режима, работа с оружием (при наличии допуска).',
        benefits: 'Официальное трудоустройство, спецодежда, доплата за ночные смены (+40%), надбавки за стаж (5–35%), обучение за счёт предприятия.',
        medicalRequirements: 'Обязательный медосмотр, психологическое освидетельствование, отсутствие хронических заболеваний, ограничивающих несение службы с оружием.',
        isStudentAvailable: false,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[3].id,
        title: 'Контролёр КПП',
        department: 'Служба охраны',
        employmentType: 'full_time',
        salaryFrom: 21000,
        salaryTo: 30000,
        schedule: 'Сменный график (5/2)',
        requirements: 'Медицинский осмотр, ответственность, внимательность. Без оружия.',
        responsibilities: 'Контроль пропуска людей и транспорта на территорию предприятия, проверка документов, ведение журналов учёта.',
        benefits: 'Официальное трудоустройство, спецодежда, доплата за ночные смены, надбавки за стаж.',
        medicalRequirements: 'Обязательный медосмотр, отсутствие противопоказаний.',
        isStudentAvailable: false,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[3].id,
        title: 'Практикант — помощник инспектора',
        department: 'Служба охраны',
        employmentType: 'practice',
        salaryFrom: 0,
        salaryTo: 0,
        schedule: 'Сменный график',
        requirements: 'Студент профильного учебного заведения (юриспруденция, безопасность, железнодорожный транспорт).',
        responsibilities: 'Помощь инспектору службы охраны, изучение документации, ознакомление с работой постов охраны, участие в патрулировании.',
        benefits: 'Оплачиваемая практика (по договорённости), возможность трудоустройства, получение практического опыта в ведомственной охране.',
        medicalRequirements: 'Медосмотр для допуска к объектам железнодорожного транспорта.',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
    ]);
    console.log('✓ Vacancies created:', vacancies.length);

    // Create tours
    const tours = await Tour.bulkCreate([
      {
        enterpriseId: enterprises[0].id,
        title: 'Экскурсия по цеху металлообработки',
        format: 'offline',
        description: 'Посещение механообрабатывающего цеха, знакомство с оборудованием, встреча с сотрудниками',
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 15,
        status: 'open',
      },
      {
        enterpriseId: enterprises[0].id,
        title: 'Онлайн-экскурсия: Виртуальный тур по заводу',
        format: 'online',
        description: 'Виртуальная прогулка по территории завода, показ производственных линий, онлайн-встреча с HR',
        startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        capacity: 50,
        status: 'open',
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Экскурсия на производство металлопроката',
        format: 'offline',
        description: 'Посещение прокатного цеха, знакомство с технологическим процессом, встреча с руководством',
        startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
        endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 20,
        status: 'open',
      },
      {
        enterpriseId: enterprises[2].id,
        title: 'Онлайн-знакомство с ХимПром',
        format: 'online',
        description: 'Презентация предприятия, рассказ о вакансиях и условиях работы, ответы на вопросы',
        startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        capacity: 30,
        status: 'open',
      },
      {
        enterpriseId: enterprises[3].id,
        title: 'Экскурсия на железнодорожный пост охраны',
        format: 'offline',
        description: 'Знакомство с реальными условиями работы стрелка ВОХР: обход территории, работа с оборудованием, брифинг с действующим сотрудником. Маршрут: КПП → пост охраны → служебные помещения.',
        startAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        endAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 10,
        status: 'open',
      },
    ]);
    console.log('✓ Tours created:', tours.length);

    // Rest of the seeding...
    await AssessmentSession.create({
      userId: users[0].id,
      roleContext: 'seeker',
      status: 'completed',
      scoreJson: {
        schedule: 0.9, relocation: 0.9, careerGrowth: 0.7, healthLimitations: 1.0,
        salary: 0.9, practice: 0.3, security: 0, training: 1.0,
      },
      completedAt: new Date(),
    });
    console.log('✓ Assessment session created');

    await Application.bulkCreate([
      {
        userId: users[0].id, vacancyId: vacancies[0].id,
        type: 'job_application', coverNote: 'Готов к работе на производстве, есть опыт.', status: 'new',
      },
      {
        userId: users[2].id, vacancyId: vacancies[1].id,
        type: 'practice_application', coverNote: 'Хочу пройти практику.', status: 'viewed',
      },
    ]);
    console.log('✓ Applications created');

    await TourBooking.bulkCreate([
      { tourId: tours[0].id, userId: users[0].id, status: 'confirmed', comment: 'Хочу посмотреть производство' },
      { tourId: tours[1].id, userId: users[2].id, status: 'new', comment: 'Интересует виртуальный тур' },
    ]);
    console.log('✓ Tour bookings created');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('Test accounts (password: password123):');
    console.log('  - seeker1@test.local (Соискатель)');
    console.log('  - student1@test.local (Студент)');
    console.log('  - hr1@zavod.local (HR, привязан к Северному машзаводу)');
    console.log('  - admin@test.local (Админ)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();