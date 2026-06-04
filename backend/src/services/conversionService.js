const { Op } = require('sequelize');
const { TourBooking, Tour, Application, Vacancy } = require('../models');

class ConversionService {
  /**
   * Рассчитать воронку конверсии для предприятия
   * @param {string} enterpriseId
   * @returns {Object} conversionFunnel
   */
  async calculateFunnel(enterpriseId) {
    // 1. Все туры предприятия с бронированиями
    const tours = await Tour.findAll({
      where: { enterpriseId },
      include: [{
        model: TourBooking,
        required: true,
        attributes: ['id', 'userId', 'status', 'createdAt'],
      }],
      attributes: ['id', 'title', 'startAt'],
    });

    // Разворачиваем в плоский массив бронирований
    const allBookings = tours.flatMap(t =>
      (t.TourBookings || []).map(b => ({
        ...b.toJSON(),
        Tour: { id: t.id, title: t.title, startAt: t.startAt },
      }))
    );

    const toursTotal = allBookings.length;
    const toursVisited = allBookings.filter(b => b.status === 'visited').length;

    // 2. Получаем все ID вакансий предприятия
    const vacancies = await Vacancy.findAll({
      where: { enterpriseId },
      attributes: ['id'],
    });
    const vacancyIds = vacancies.map(v => v.id);

    // 3. Посещённые экскурсии — проверяем, подавал ли пользователь отклик после экскурсии
    const visitedBookings = allBookings.filter(b => b.status === 'visited');
    let applicationsAfterTour = 0;
    let hired = 0;

    for (const booking of visitedBookings) {
      const app = await Application.findOne({
        where: {
          userId: booking.userId,
          vacancyId: { [Op.in]: vacancyIds },
          createdAt: { [Op.gte]: booking.Tour?.startAt || booking.createdAt },
        },
      });
      if (app) {
        applicationsAfterTour++;
        if (app.status === 'hired') {
          hired++;
        }
      }
    }

    // 4. Конверсия
    const conversionRate = toursVisited > 0
      ? Math.round((hired / toursVisited) * 100) + '%'
      : '0%';

    return {
      toursTotal,
      toursVisited,
      applicationsAfterTour,
      hired,
      conversionRate,
    };
  }
}

module.exports = new ConversionService();