const express = require('express');
const router = express.Router();
const { authMiddleware, requireEnterpriseRole, checkEnterpriseOwnership } = require('../middleware/auth');
const enterpriseController = require('../controllers/enterpriseController');

// Все маршруты требуют авторизации и роли enterprise_user
router.use(authMiddleware, requireEnterpriseRole, checkEnterpriseOwnership);

// Дашборд / статистика
router.get('/dashboard', enterpriseController.getDashboard);

// Управление вакансиями
router.get('/vacancies', enterpriseController.getMyVacancies);
router.post('/vacancies', enterpriseController.createVacancy);
router.put('/vacancies/:id', enterpriseController.updateVacancy);
router.delete('/vacancies/:id', enterpriseController.deleteVacancy);

// Отклики на вакансии предприятия
router.get('/applications', enterpriseController.getEnterpriseApplications);
router.patch('/applications/:id/status', enterpriseController.updateApplicationStatus);

// Управление экскурсиями
router.get('/tours', enterpriseController.getMyTours);
router.post('/tours', enterpriseController.createTour);
router.get('/tours/bookings', enterpriseController.getAllTourBookings);
router.get('/tours/:id/bookings', enterpriseController.getTourBookings);
router.put('/tours/:id', enterpriseController.updateTour);
router.get('/tours/:id', enterpriseController.getTour);
router.delete('/tours/:id', enterpriseController.deleteTour);
router.patch('/tours/:tourId/bookings/:bookingId/status', enterpriseController.updateTourBookingStatus);

// Профиль предприятия
router.get('/profile', enterpriseController.getEnterpriseProfile);
router.patch('/profile', enterpriseController.updateEnterpriseProfile);

// User management for HR
router.get('/users', enterpriseController.getApplicationUsers);
router.patch('/users/:userId/profile', enterpriseController.updateApplicationUserProfile);

module.exports = router;
