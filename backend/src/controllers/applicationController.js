const applicationService = require('../services/applicationService');

class ApplicationController {
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { vacancyId, type, coverNote } = req.body;

      if (!vacancyId) {
        return res.status(400).json({ error: 'vacancyId required' });
      }

      const application = await applicationService.create(
        userId,
        vacancyId,
        type || 'job_application',
        coverNote
      );
      res.status(201).json(application);
    } catch (error) {
      next(error);
    }
  }

  async getUserApplications(req, res, next) {
    try {
      const userId = req.user.id;
      const applications = await applicationService.getUserApplications(userId);
      res.json({
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEnterpriseApplications(req, res, next) {
    try {
      const enterpriseId = req.query.enterpriseId;
      const applications = await applicationService.getEnterpriseApplications(enterpriseId);
      res.json({
        count: applications.length,
        applications,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await applicationService.delete(userId, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'status required' });
      }

      const application = await applicationService.updateStatus(id, status);
      res.json(application);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
