const assessmentService = require('../services/assessmentService');

class AssessmentController {
  async startAssessment(req, res, next) {
    try {
      const userId = req.user.id;
      const { roleContext } = req.body;

      const result = await assessmentService.startAssessment(userId, roleContext);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async answerQuestion(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { questionCode, answer } = req.body;

      if (!questionCode || answer === undefined) {
        return res.status(400).json({ error: 'Question code and answer required' });
      }

      const result = await assessmentService.answerQuestion(sessionId, questionCode, answer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async completeAssessment(req, res, next) {
    try {
      const { sessionId } = req.params;

      const session = await assessmentService.completeAssessment(sessionId);
      res.json(session);
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req, res, next) {
    try {
      const questions = await assessmentService.getQuestions();
      res.json({ questions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
