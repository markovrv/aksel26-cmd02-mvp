const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { AssessmentSession, MatchResult, Enterprise, UserProfile, LlmConfig } = require('../models');
const env = require('../config/env');
const llmLogger = require('./llmLogger');

const LLM_RAW_LOG_DIR = path.join(__dirname, '..', '..', 'logs', 'llm-raw');

class MatchingService {
  async generateRecommendations(sessionId, _filters) {
    const session = await AssessmentSession.findByPk(sessionId, {
      include: ['AssessmentAnswers', 'User'],
    });

    if (!session) {
      throw { statusCode: 404, message: 'Session not found' };
    }

    if (session.status !== 'completed') {
      throw { statusCode: 400, message: 'Assessment not completed' };
    }

    const userProfile = await UserProfile.findOne({ where: { userId: session.userId } });

    const enterprises = await Enterprise.findAll({
      where: { moderationStatus: 'approved' },
      include: ['Vacancies'],
    });

    let recommendations = [];
    let activeConfig = null;
    try {
      activeConfig = await LlmConfig.findOne({ where: { isActive: true } });

      recommendations = await this.callExternalEvaluationAPI(
        session, userProfile, enterprises, activeConfig
      );

      const { valid, invalidCount, totalCount } = this.validateRecommendations(recommendations, enterprises);
      if (invalidCount > 0) {
        console.warn(`LLM recommendations: ${invalidCount}/${totalCount} invalid, ${valid.length} valid`);
      }
      if (totalCount > 0 && invalidCount / totalCount > 0.3) {
        console.warn(`More than 30% (${invalidCount}/${totalCount}) of LLM recommendations are invalid. Falling back to basic scoring.`);
        throw new Error('Too many invalid recommendations from LLM');
      }
      recommendations = valid;
    } catch (error) {
      console.error('External API error:', error.message);

      if (error.message === 'Too many invalid recommendations from LLM') {
        await llmLogger.log({
          configName: activeConfig?.name || 'env-config',
          request: null, response: null, durationMs: 0,
          success: false, error: error.message,
        });
      }

      recommendations = await this.basicScoring(session, userProfile, enterprises);
    }

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      await MatchResult.create({
        sessionId,
        enterpriseId: rec.enterpriseId,
        vacancyId: rec.vacancyId,
        matchScore: rec.matchScore,
        explanation: rec.explanation,
        factors: rec.factors || [],
        rankOrder: i,
      });
    }

    return recommendations.slice(0, 10);
  }

  async callExternalEvaluationAPI(session, userProfile, enterprises, llmConfig) {
    const answersText = session.AssessmentAnswers
      .map(a => `Вопрос ${a.questionCode}: ${JSON.stringify(a.answerValue)}`)
      .join('\n');

    const enterprisesText = enterprises.map(e => {
      const vacText = (e.Vacancies || [])
        .map(v => ` - ${v.title} (ID: ${v.id}, зарплата: ${v.salaryFrom || '?'}-${v.salaryTo || '?'} руб., график: ${v.schedule || '?'})`)
        .join('\n');
      return `Предприятие: ${e.name} (ID: ${e.id}, город: ${e.city}, отрасль: ${e.industry})\nВакансии:\n${vacText}`;
    }).join('\n\n');

    const systemPrompt = llmConfig?.systemPrompt || `
Ты — система профориентации и подбора вакансий. Проанализируй данные пользователя и список предприятий с вакансиями.
Верни JSON-массив в формате:
[
  {
    "enterpriseId": "uuid",
    "vacancyId": "uuid",
    "matchScore": число от 0 до 100,
    "explanation": "текстовое пояснение",
    "factors": [{ "name": "factor_name", "weight": 0.0-1.0, "value": "описание" }]
  }
]
ВЕРНИ ТОЛЬКО JSON, БЕЗ РАССУЖДЕНИЙ. Без markdown-блоков. Просто массив JSON.
`.trim();

    const userMessage = `
Пользователь: ${userProfile?.fullName || 'Не указан'}
Город: ${userProfile?.city || 'Не указан'}
Возраст: ${userProfile?.age || 'Не указан'}
Желаемая должность: ${userProfile?.desiredPosition || 'Не указана'}
Зарплатные ожидания: от ${userProfile?.desiredSalaryFrom || '?'} руб.
Готовность к переезду: ${userProfile?.relocationReady ? 'Да' : 'Нет'}
Ограничения по здоровью: ${userProfile?.healthLimitations || 'Нет'}

Ответы на вопросы ассессмента:
${answersText}

Доступные предприятия и вакансии:
${enterprisesText}

Определи наиболее подходящие вакансии для этого пользователя и верни JSON с рекомендациями.
Ответь ТОЛЬКО JSON-массивом, без рассуждений, без markdown.
`.trim();

    let url, headers, requestBody;

    if (llmConfig) {
      url = `${llmConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`;
      headers = {
        'Authorization': `Bearer ${llmConfig.apiToken}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        model: llmConfig.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      };
    } else {
      url = env.externalEval.apiUrl;
      headers = {
        'Authorization': `Bearer ${env.externalEval.apiKey}`,
        'Content-Type': 'application/json',
      };
      requestBody = {
        userId: session.userId,
        userProfile: {
          city: userProfile?.city,
          age: userProfile?.age,
          desiredPosition: userProfile?.desiredPosition,
          relocationReady: userProfile?.relocationReady,
          desiredSalary: userProfile?.desiredSalaryFrom,
          healthLimitations: userProfile?.healthLimitations ? [userProfile.healthLimitations] : [],
        },
        assessmentAnswers: session.AssessmentAnswers.map(a => ({
          questionCode: a.questionCode, answer: a.answerValue,
        })),
        enterpriseIds: enterprises.map(e => e.id),
        vacancyIds: enterprises.flatMap(e => e.Vacancies.map(v => v.id)),
      };
    }

    const configName = llmConfig?.name || 'env-config';
    const startTime = Date.now();

    try {
      const response = await axios.post(url, requestBody, { headers, timeout: 60000 });
      const durationMs = Date.now() - startTime;

      // Сохраняем сырой ответ
      try {
        await fs.promises.mkdir(LLM_RAW_LOG_DIR, { recursive: true });
        const rawLogFile = path.join(LLM_RAW_LOG_DIR, `llm-${Date.now()}-${session.id}.json`);
        await fs.promises.writeFile(rawLogFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          configName, url,
          request: requestBody,
          responseStatus: response.status,
          responseData: response.data,
        }, null, 2), 'utf8');
        console.log('=== RAW LLM response saved to:', rawLogFile);
      } catch (logErr) {
        console.error('=== Failed to save raw LLM response:', logErr.message);
      }

      console.log('=== LLM Response Status:', response.status, response.statusText);

      // Извлечение контента из ответа (content, reasoning_content, или оба)
      const choice = response.data?.choices?.[0]?.message;
      const contentRaw = choice?.content || '';
      const reasoningContent = choice?.reasoning_content || '';
      
      console.log('=== LLM: content length:', contentRaw.length, 'reasoning length:', reasoningContent.length);
      console.log('=== LLM: finish_reason:', response.data?.choices?.[0]?.finish_reason);
      console.log('=== LLM: usage:', JSON.stringify(response.data?.usage));

      let actualContent = (contentRaw && contentRaw.trim()) ? contentRaw.trim() : reasoningContent.trim();

      if (!actualContent) {
        console.error('=== LLM EMPTY RESPONSE: both content and reasoning_content are empty');
        await llmLogger.log({
          configName, request: requestBody, response: response.data,
          durationMs, success: true,
        });
        throw new Error('Empty response from LLM');
      }

      console.log('=== LLM actualContent first 500 chars:', actualContent.substring(0, 500));

      // Логируем успешный запрос
      await llmLogger.log({
        configName, request: requestBody, response: response.data,
        durationMs, success: true,
      });

      // Парсинг: извлекаем JSON из контента
      let parsedRecommendations = null;

      // 1) Markdown блок ```json ... ```
      const markdownMatch = actualContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (markdownMatch) {
        try {
          const parsed = JSON.parse(markdownMatch[1].trim());
          console.log('=== LLM: parsed from markdown block, keys:', Object.keys(parsed));
          parsedRecommendations = Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed);
        } catch (e) { console.warn('=== LLM: markdown parse failed:', e.message); }
      }

      // 2) Regex: JSON-массив
      if (!parsedRecommendations || parsedRecommendations.length === 0) {
        const arrayMatch = actualContent.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          try {
            const parsed = JSON.parse(arrayMatch[0]);
            console.log('=== LLM: parsed array from regex, items:', Array.isArray(parsed) ? parsed.length : 'object');
            parsedRecommendations = Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed);
          } catch (e) { console.warn('=== LLM: array parse failed:', e.message); }
        }
      }

      // 3) Regex: JSON-объект
      if (!parsedRecommendations || parsedRecommendations.length === 0) {
        const objMatch = actualContent.match(/\{[\s\S]*\}/);
        if (objMatch) {
          try {
            const parsed = JSON.parse(objMatch[0]);
            console.log('=== LLM: parsed object from regex, keys:', Object.keys(parsed));
            parsedRecommendations = parsed.recommendations || parsed;
          } catch (e) { console.warn('=== LLM: object parse failed:', e.message); }
        }
      }

      // 4) Весь контент как JSON
      if (!parsedRecommendations || parsedRecommendations.length === 0) {
        try {
          const parsed = JSON.parse(actualContent);
          console.log('=== LLM: parsed full content, keys:', Object.keys(parsed));
          parsedRecommendations = Array.isArray(parsed) ? parsed : (parsed.recommendations || parsed);
        } catch (e) {
          console.error('=== LLM PARSE ERROR: all methods failed. First 2000 chars:', actualContent.substring(0, 2000));
          throw new Error('Failed to parse LLM response as JSON');
        }
      }

      if (Array.isArray(parsedRecommendations)) {
        return parsedRecommendations;
      }
      throw new Error('Parsed result is not an array');

    } catch (error) {
      const durationMs = Date.now() - startTime;
      await llmLogger.log({
        configName, request: requestBody, response: null,
        durationMs, success: false, error: error.message,
      });
      throw error;
    }
  }

  async basicScoring(session, userProfile, enterprises) {
    const answers = session.AssessmentAnswers;
    const recommendations = [];
    for (const enterprise of enterprises) {
      for (const vacancy of enterprise.Vacancies || []) {
        const score = this.calculateMatchScore(answers, userProfile, enterprise, vacancy);
        if (score.score > 30) {
          recommendations.push({
            enterpriseId: enterprise.id, vacancyId: vacancy.id,
            matchScore: score.score, explanation: score.explanation, factors: score.factors,
          });
        }
      }
    }
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations;
  }

  calculateMatchScore(answers, userProfile, enterprise, vacancy) {
    let score = 0;
    const factors = [];
    const answerMap = {};
    answers.forEach(a => answerMap[a.questionCode] = a.answerValue);

    const roleAnswer = answerMap.q1;
    if (roleAnswer === 'student' && vacancy.isStudentAvailable) {
      score += 15; factors.push({ name: 'student', weight: 0.7, value: 'Студент — подходит для практики' });
    }
    const sphereAnswer = answerMap.q2;
    const spheres = Array.isArray(sphereAnswer) ? sphereAnswer : [sphereAnswer];
    const enterpriseIndustry = (enterprise.industry || '').toLowerCase();
    const industryMap = [
      { spheres: ['industry', 'engineering', 'light_industry'], keywords: ['производство', 'машиностроение', 'промышленность', 'металлургия', 'химическая'] },
      { spheres: ['logistics', 'security'], keywords: ['охрана', 'безопасность', 'транспорт', 'логистика', 'железнодорожный'] },
    ];
    let sphereMatched = false;
    for (const mapping of industryMap) {
      if (spheres.some(s => mapping.spheres.includes(s)) && mapping.keywords.some(k => enterpriseIndustry.includes(k))) {
        sphereMatched = true; score += 15;
        factors.push({ name: 'sphere', weight: 0.8, value: `Сфера "${spheres.join(', ')}" совпадает с профилем предприятия` });
        break;
      }
    }
    if (!sphereMatched && spheres.length > 0 && spheres[0] !== undefined) {
      score += 5; factors.push({ name: 'sphere', weight: 0.3, value: 'Сфера не указана явно' });
    }
    const limitations = Array.isArray(answerMap.q3) ? answerMap.q3 : [];
    if (!limitations.includes('none') && limitations.length > 0) {
      const laborConditions = (enterprise.laborConditions || '').toLowerCase();
      const limitationsMap = [
        { value: 'chemicals', keywords: ['химическ', 'токсин', 'кислот'] },
        { value: 'cold', keywords: ['холод', 'холодильн'] }, { value: 'heat', keywords: ['высок температур', 'горяч цех', 'жар'] },
        { value: 'fumes', keywords: ['вредн испарен', 'пыл', 'газ'] }, { value: 'noise', keywords: ['шум', 'вибраци'] },
        { value: 'heights', keywords: ['высот'] }, { value: 'heavy', keywords: ['тяжел физическ', 'тяжёл физическ'] },
      ];
      let conflictFound = false;
      for (const lim of limitations) {
        const mapping = limitationsMap.find(m => m.value === lim);
        if (mapping && mapping.keywords.some(k => laborConditions.includes(k))) { conflictFound = true; score -= 20; factors.push({ name: 'conflict_conditions', weight: 0.9, value: `Конфликт условий: ${lim}` }); break; }
      }
      if (!conflictFound) { score += 10; factors.push({ name: 'conditions_ok', weight: 0.6, value: 'Условия труда подходят' }); }
    } else { score += 10; factors.push({ name: 'conditions_ok', weight: 0.5, value: 'Нет ограничений по условиям труда' }); }
    const relocationAnswer = answerMap.q5;
    if (relocationAnswer === 'yes') { score += 10; factors.push({ name: 'relocation', weight: 0.6, value: 'Готов к переезду' }); }
    else if (relocationAnswer === 'maybe' && userProfile?.city !== enterprise.city) { score += 5; factors.push({ name: 'relocation', weight: 0.3, value: 'Рассмотрит переезд при хороших условиях' }); }
    else if (relocationAnswer === 'no' && userProfile?.city === enterprise.city) { score += 10; factors.push({ name: 'relocation', weight: 0.7, value: 'Город совпадает, переезд не нужен' }); }
    const scheduleAnswer = answerMap.q6;
    if (scheduleAnswer && vacancy.schedule) {
      const scheduleNorm = vacancy.schedule.toLowerCase();
      if (scheduleAnswer === 'shift' && (scheduleNorm.includes('смен') || scheduleNorm.includes('29/14') || scheduleNorm.includes('2/2'))) { score += 15; factors.push({ name: 'schedule', weight: 0.8, value: 'График сменный — подходит' }); }
      else if (scheduleAnswer === 'full_day' && (scheduleNorm.includes('5/2') || scheduleNorm.includes('пятиднев') || scheduleNorm.includes('полн день'))) { score += 15; factors.push({ name: 'schedule', weight: 0.8, value: 'График полный день — подходит' }); }
      else if (scheduleAnswer === 'any' || scheduleAnswer === 'flexible') { score += 10; factors.push({ name: 'schedule', weight: 0.5, value: 'Гибкое отношение к графику' }); }
      else { score += 5; factors.push({ name: 'schedule', weight: 0.3, value: 'График не совпадает' }); }
    } else { score += 5; }
    const healthAnswer = answerMap.q7;
    if (healthAnswer === 'none') { score += 15; factors.push({ name: 'health', weight: 0.7, value: 'Нет медицинских ограничений' }); }
    else if (healthAnswer === 'yes') {
      const medReq = (vacancy.medicalRequirements || '').toLowerCase();
      if (medReq.includes('противопоказан') || medReq.includes('хроническ')) { score -= 10; factors.push({ name: 'health', weight: 0.5, value: 'Есть медицинские ограничения — требуется уточнение' }); }
      else { score += 5; factors.push({ name: 'health', weight: 0.3, value: 'Медицинские ограничения указаны, но вакансия, возможно, подходит' }); }
    }
    const experienceAnswer = answerMap.q8;
    if ((experienceAnswer === 'none' || experienceAnswer === 'less1') && vacancy.isStudentAvailable) { score += 10; factors.push({ name: 'experience', weight: 0.5, value: 'Без опыта — подходит для обучения' }); }
    else if (experienceAnswer === 'more3' || experienceAnswer === '1to3') { score += 10; factors.push({ name: 'experience', weight: 0.6, value: 'Есть опыт работы' }); }
    const trainingAnswer = answerMap.q10;
    if (trainingAnswer === 'yes' && vacancy.benefits && vacancy.benefits.toLowerCase().includes('обучен')) { score += 10; factors.push({ name: 'training', weight: 0.5, value: 'Готов к обучению — есть обучение на предприятии' }); }
    if (userProfile?.desiredSalaryFrom && vacancy.salaryTo) {
      if (userProfile.desiredSalaryFrom <= vacancy.salaryTo) { score += 10; factors.push({ name: 'salary', weight: 0.7, value: `Зарплата до ${vacancy.salaryTo} руб. подходит` }); }
      else { score += 3; factors.push({ name: 'salary', weight: 0.3, value: 'Зарплата может не соответствовать ожиданиям' }); }
    } else { score += 5; }
    if (userProfile?.city && enterprise.city) {
      if (userProfile.city === enterprise.city) { score += 10; factors.push({ name: 'location', weight: 0.7, value: `Город ${enterprise.city} совпадает` }); }
      else { score += 2; }
    }
    score = Math.min(100, Math.max(0, score));
    const explanation = factors.length > 0 ? factors.map(f => f.value).join('. ') : 'Нет явных совпадений, но вакансия может быть интересна';
    return { score, explanation, factors };
  }

  validateRecommendations(recommendations, enterprises) {
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return { valid: [], invalidCount: 0, totalCount: 0 };
    }
    const enterpriseIds = new Set(enterprises.map(e => e.id));
    const vacancyIdsByEnterprise = {};
    for (const e of enterprises) { vacancyIdsByEnterprise[e.id] = new Set((e.Vacancies || []).map(v => v.id)); }
    const valid = []; let invalidCount = 0;
    for (const rec of recommendations) {
      let isValid = true; const errors = [];
      if (!rec.enterpriseId) { errors.push('Missing enterpriseId'); isValid = false; }
      else if (!enterpriseIds.has(rec.enterpriseId)) { errors.push(`enterpriseId "${rec.enterpriseId}" not found`); isValid = false; }
      if (rec.vacancyId) {
        const vacs = vacancyIdsByEnterprise[rec.enterpriseId];
        if (!vacs || !vacs.has(rec.vacancyId)) { errors.push(`vacancyId "${rec.vacancyId}" not found`); isValid = false; }
      }
      if (rec.matchScore === undefined || rec.matchScore === null) { errors.push('Missing matchScore'); isValid = false; }
      else if (typeof rec.matchScore !== 'number' || rec.matchScore < 0 || rec.matchScore > 100) { errors.push(`Invalid matchScore: ${rec.matchScore}`); isValid = false; }
      if (!rec.explanation || typeof rec.explanation !== 'string' || rec.explanation.trim().length === 0) { errors.push('Missing explanation'); isValid = false; }
      if (!isValid) { invalidCount++; console.warn(`Invalid recommendation: ${errors.join(', ')}`, JSON.stringify(rec)); }
      else { valid.push({ ...rec, matchScore: Math.round(rec.matchScore), factors: Array.isArray(rec.factors) ? rec.factors : [] }); }
    }
    return { valid, invalidCount, totalCount: recommendations.length };
  }

  async getRecommendations(sessionId) {
    return MatchResult.findAll({
      where: { sessionId },
      include: ['Enterprise', 'Vacancy'],
      order: [['rankOrder', 'ASC']],
    });
  }
}

module.exports = new MatchingService();