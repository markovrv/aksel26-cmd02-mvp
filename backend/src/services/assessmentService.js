const { AssessmentSession, AssessmentAnswer, AssessmentQuestion } = require('../models');
const { ASSESSMENT_QUESTIONS } = require('../config/assessmentQuestions');

class AssessmentService {
  async startAssessment(userId, roleContext = 'seeker') {
    const session = await AssessmentSession.create({
      userId,
      roleContext,
      status: 'in_progress',
    });

    return {
      sessionId: session.id,
      questions: ASSESSMENT_QUESTIONS,
    };
  }

  async answerQuestion(sessionId, questionCode, answerValue) {
    const session = await AssessmentSession.findByPk(sessionId);
    if (!session) {
      throw { statusCode: 404, message: 'Assessment session not found' };
    }

    const question = ASSESSMENT_QUESTIONS.find(q => q.code === questionCode);
    if (!question) {
      throw { statusCode: 400, message: 'Invalid question code' };
    }

    const answer = await AssessmentAnswer.create({
      sessionId,
      questionCode,
      answerValue,
      weight: 1.0,
    });

    return answer;
  }

  async completeAssessment(sessionId) {
    const session = await AssessmentSession.findByPk(sessionId, {
      include: ['AssessmentAnswers'],
    });

    if (!session) {
      throw { statusCode: 404, message: 'Assessment session not found' };
    }

    // Calculate basic score based on answers
    const scoreJson = this.calculateScore(session.AssessmentAnswers);

    session.status = 'completed';
    session.scoreJson = scoreJson;
    session.completedAt = new Date();
    await session.save();

    return session;
  }

  calculateScore(answers) {
    const score = {
      schedule: 0,
      relocation: 0,
      careerGrowth: 0,
      healthLimitations: 0,
      salary: 0,
      practice: 0,
      security: 0,
      training: 0,
    };

    answers.forEach(answer => {
      switch (answer.questionCode) {
        case 'q1': {
          // seeker vs student
          score.practice = answer.answerValue === 'student' ? 1.0 : 0.3;
          break;
        }
        case 'q2': {
          // Сфера интересов (multi)
          const values = Array.isArray(answer.answerValue) ? answer.answerValue : [answer.answerValue];
          if (values.includes('logistics') || values.includes('security')) {
            score.security = 0.9;
          }
          if (values.includes('industry') || values.includes('engineering')) {
            score.careerGrowth = 0.7;
          }
          break;
        }
        case 'q3': {
          // Условия труда, с которыми НЕ готов работать (multi)
          const limitations = Array.isArray(answer.answerValue) ? answer.answerValue : [];
          if (limitations.length === 0 || limitations.includes('none')) {
            score.healthLimitations = 1.0;
          } else {
            score.healthLimitations = 0.3;
          }
          break;
        }
        case 'q4': {
          // Что важнее всего
          const priority = answer.answerValue;
          if (priority === 'salary') score.salary = 0.9;
          else if (priority === 'career') score.careerGrowth = 0.9;
          else if (priority === 'conditions' || priority === 'stability') score.healthLimitations = 0.8;
          break;
        }
        case 'q5': {
          // Готовность к переезду
          if (answer.answerValue === 'yes') score.relocation = 0.9;
          else if (answer.answerValue === 'maybe') score.relocation = 0.5;
          else score.relocation = 0.1;
          break;
        }
        case 'q6': {
          // График
          const schedule = answer.answerValue;
          if (schedule === 'shift') score.schedule = 0.9;
          else if (schedule === 'full_day') score.schedule = 0.6;
          else score.schedule = 0.5;
          break;
        }
        case 'q7': {
          // Медицинские ограничения
          score.healthLimitations = answer.answerValue === 'none' ? 1.0 : 0.3;
          break;
        }
        case 'q8': {
          // Опыт работы
          if (answer.answerValue === 'none') score.practice = Math.max(score.practice, 0.5);
          else if (answer.answerValue === 'more3') score.careerGrowth = Math.max(score.careerGrowth, 0.8);
          break;
        }
        case 'q9': {
          // 3D-тур
          score.training = answer.answerValue !== 'text_only' ? 0.8 : 0.3;
          break;
        }
        case 'q10': {
          // Обучение/стажировка
          score.training = answer.answerValue === 'yes' ? 1.0 : answer.answerValue === 'depends' ? 0.5 : 0.2;
          break;
        }
      }
    });

    return score;
  }

  async getQuestions() {
    // Пробуем загрузить вопросы из БД (активные, отсортированные по sortOrder)
    try {
      const dbQuestions = await AssessmentQuestion.findAll({
        where: { isActive: true },
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      });

      if (dbQuestions && dbQuestions.length > 0) {
        // Преобразуем в формат, ожидаемый фронтендом
        return dbQuestions.map(q => ({
          code: q.code,
          text: q.text,
          type: q.type,
          weight: parseFloat(q.weight),
          options: q.optionsJson || [],
        }));
      }
    } catch (err) {
      console.warn('Failed to load questions from DB, using fallback:', err.message);
    }

    // Fallback на конфиг-файл, если БД пуста или ошибка
    return ASSESSMENT_QUESTIONS;
  }
}

module.exports = new AssessmentService();
