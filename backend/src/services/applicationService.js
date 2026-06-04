const { Application, Vacancy, Enterprise, User } = require('../models');
const { Op } = require('sequelize');

class ApplicationService {
  async create(userId, vacancyId, type = 'job_application', coverNote = null) {
    const vacancy = await Vacancy.findByPk(vacancyId, {
      include: [{ model: Enterprise }],
    });

    if (!vacancy) {
      throw { statusCode: 404, message: 'Vacancy not found' };
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: { userId, vacancyId, status: { [Op.ne]: 'rejected' } },
    });

    if (existingApplication) {
      throw { statusCode: 400, message: 'You have already applied to this vacancy' };
    }

    const application = await Application.create({
      userId,
      vacancyId,
      type,
      coverNote,
      status: 'new',
    });

    return application;
  }

  async getUserApplications(userId) {
    const applications = await Application.findAll({
      where: { userId },
      include: [{
        model: Vacancy,
        include: [{ model: Enterprise }],
      }],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async getVacancyApplications(vacancyId) {
    const applications = await Application.findAll({
      where: { vacancyId },
      include: [{
        model: User,
        attributes: ['id', 'email'],
        include: ['UserProfile'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async getEnterpriseApplications(enterpriseId) {
    const applications = await Application.findAll({
      include: [{
        model: Vacancy,
        where: { enterpriseId },
        required: true,
        include: [{ model: Enterprise }],
      },
      {
        model: User,
        attributes: ['id', 'email'],
      },
      ],
      order: [['createdAt', 'DESC']],
    });

    return applications;
  }

  async updateStatus(id, status) {
    const application = await Application.findByPk(id);
    if (!application) {
      throw { statusCode: 404, message: 'Application not found' };
    }

    const validStatuses = ['new', 'viewed', 'invited', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      throw { statusCode: 400, message: 'Invalid status' };
    }

    await application.update({ status });
    return application;
  }

  async getByEnterprise(enterpriseId) {
    return await Application.findAll({
      include: [{
        model: Vacancy,
        where: { enterpriseId },
        required: true,
        include: [{ model: Enterprise }],
      }, {
        model: User,
        attributes: ['id', 'email'],
        include: ['UserProfile'],
      }],
      order: [['createdAt', 'DESC']],
    });
  }

  async countByEnterprise(enterpriseId) {
    return await Application.count({
      include: [{ model: Vacancy, where: { enterpriseId }, required: true }],
    });
  }

  async delete(userId, applicationId) {
    const application = await Application.findOne({
      where: { id: applicationId, userId },
    });
    if (!application) {
      throw { statusCode: 404, message: 'Application not found or access denied' };
    }
    // Allow deletion only for 'new' or 'viewed' status
    if (!['new', 'viewed'].includes(application.status)) {
      throw { statusCode: 400, message: 'Cannot delete application in current status' };
    }
    await application.destroy();
    return { message: 'Application deleted' };
  }

  async updateStatusForEnterprise(applicationId, status, enterpriseId) {
    const application = await Application.findOne({
      include: [{ model: Vacancy, where: { enterpriseId }, required: true }],
      where: { id: applicationId },
    });
    if (!application) throw { statusCode: 404, message: 'Application not found or access denied' };
    if (!['new', 'viewed', 'invited', 'rejected', 'hired'].includes(status)) {
      throw { statusCode: 400, message: 'Invalid status' };
    }
    await application.update({ status });
    return application;
  }

  async getUsersByEnterprise(enterpriseId) {
    const applications = await Application.findAll({
      include: [{
        model: Vacancy,
        where: { enterpriseId },
        required: true,
      }, {
        model: User,
        attributes: ['id', 'email', 'role', 'status'],
        include: ['UserProfile'],
      }],
      order: [['createdAt', 'DESC']],
    });

    // Deduplicate by userId
    const seen = new Set();
    const users = [];
    for (const app of applications) {
      if (app.User && !seen.has(app.User.id)) {
        seen.add(app.User.id);
        users.push({
          id: app.User.id,
          email: app.User.email,
          role: app.User.role,
          status: app.User.status,
          profile: app.User.UserProfile || null,
        });
      }
    }

    return users;
  }

  async checkUserApplicationToEnterprise(userId, enterpriseId) {
    const count = await Application.count({
      include: [{ model: Vacancy, where: { enterpriseId }, required: true }],
      where: { userId },
    });
    return count > 0;
  }

}

module.exports = new ApplicationService();
