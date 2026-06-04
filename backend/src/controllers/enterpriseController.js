const enterpriseService = require('../services/enterpriseService');
const vacancyService = require('../services/vacancyService');
const applicationService = require('../services/applicationService');
const tourService = require('../services/tourService');
const conversionService = require('../services/conversionService');
class EnterpriseController {
  async getAll(req, res, next) {
    try {
      const enterprises = await enterpriseService.getAll(req.query);
      res.json({
        count: enterprises.length,
        enterprises,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const enterprise = await enterpriseService.getBySlug(slug);
      res.json(enterprise);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const enterprise = await enterpriseService.create(req.body);
      res.status(201).json(enterprise);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const enterprise = await enterpriseService.update(id, req.body);
      res.json(enterprise);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const vacanciesCount = await vacancyService.countByEnterprise(enterpriseId);
      const applicationsCount = await applicationService.countByEnterprise(enterpriseId);
      const toursCount = await tourService.countByEnterprise(enterpriseId);
      const conversionFunnel = await conversionService.calculateFunnel(enterpriseId);
      res.json({ vacanciesCount, applicationsCount, toursCount, conversionFunnel });
    } catch (error) { next(error); }
  }

  async getMyVacancies(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const vacancies = await vacancyService.getByEnterprise(enterpriseId);
      res.json({ vacancies });
    } catch (error) { next(error); }
  }

  async createVacancy(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const vacancy = await vacancyService.create(enterpriseId, req.body);
      res.status(201).json(vacancy);
    } catch (error) { next(error); }
  }

  async updateVacancy(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      const vacancy = await vacancyService.update(id, req.body, enterpriseId);
      res.json(vacancy);
    } catch (error) { next(error); }
  }

  async deleteVacancy(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      await vacancyService.archive(id, enterpriseId);
      res.status(204).send();
    } catch (error) { next(error); }
  }

  async getEnterpriseApplications(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const applications = await applicationService.getByEnterprise(enterpriseId);
      res.json({ applications });
    } catch (error) { next(error); }
  }

  async updateApplicationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const enterpriseId = req.user.enterpriseId;
      const application = await applicationService.updateStatusForEnterprise(id, status, enterpriseId);
      res.json(application);
    } catch (error) { next(error); }
  }

  async getMyTours(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const tours = await tourService.getByEnterprise(enterpriseId);
      res.json({ tours });
    } catch (error) { next(error); }
  }

  async createTour(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const tour = await tourService.create(enterpriseId, req.body);
      res.status(201).json(tour);
    } catch (error) { next(error); }
  }

  async updateTour(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      const tour = await tourService.update(id, req.body, enterpriseId);
      res.json(tour);
    } catch (error) { next(error); }
  }

  async getTourBookings(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      const bookings = await tourService.getBookingsByTour(id, enterpriseId);
      res.json({ bookings });
    } catch (error) { next(error); }
  }

  async getEnterpriseProfile(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const profile = await enterpriseService.getById(enterpriseId);
      res.json(profile);
    } catch (error) { next(error); }
  }

  async updateEnterpriseProfile(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const profile = await enterpriseService.update(enterpriseId, req.body);
      res.json(profile);
    } catch (error) { next(error); }
  }


  async getTour(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      const tour = await tourService.getTourByIdForEnterprise(id, enterpriseId);
      res.json(tour);
    } catch (error) {
      next(error);
    }
  }

  async deleteTour(req, res, next) {
    try {
      const { id } = req.params;
      const enterpriseId = req.user.enterpriseId;
      await tourService.deleteTour(id, enterpriseId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async updateTourBookingStatus(req, res, next) {
    try {
      const { tourId, bookingId } = req.params;
      const { status } = req.body;
      const enterpriseId = req.user.enterpriseId;
      const booking = await tourService.updateBookingStatus(tourId, bookingId, status, enterpriseId);
      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async getAllTourBookings(req, res, next) {
    try {
      const enterpriseId = req.user.enterpriseId;
      const bookings = await tourService.getAllEnterpriseBookings(enterpriseId);
      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new EnterpriseController();
