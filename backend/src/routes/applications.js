const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, applicationController.create);
router.get('/me', authMiddleware, applicationController.getUserApplications);
router.get('/enterprise', authMiddleware, applicationController.getEnterpriseApplications);
router.delete('/:id', authMiddleware, applicationController.delete);
router.patch('/:id/status', authMiddleware, applicationController.updateStatus);

module.exports = router;
