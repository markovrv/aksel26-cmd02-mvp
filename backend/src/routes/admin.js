const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Все маршруты требуют аутентификации и роли superadmin
router.use(authMiddleware);
router.use(roleCheck('superadmin'));

// LLM Config management
router.get('/llm-config', adminController.getLlmConfigs);
router.post('/llm-config', adminController.createLlmConfig);
router.put('/llm-config/:id', adminController.updateLlmConfig);
router.delete('/llm-config/:id', adminController.deleteLlmConfig);
router.patch('/llm-config/:id/activate', adminController.activateLlmConfig);
router.post('/llm-config/:id/test', adminController.testLlmConfig);

// Assessment Questions management
router.get('/assessment-questions', adminController.getAssessmentQuestions);
router.post('/assessment-questions', adminController.createAssessmentQuestion);
router.put('/assessment-questions/:id', adminController.updateAssessmentQuestion);
router.delete('/assessment-questions/:id', adminController.deleteAssessmentQuestion);
router.patch('/assessment-questions/:id/toggle', adminController.toggleAssessmentQuestion);
router.post('/assessment-questions/reorder', adminController.reorderAssessmentQuestions);

// LLM Request Log
router.get('/llm-log', adminController.getLlmLogs);
router.delete('/llm-log', adminController.clearLlmLogs);

module.exports = router;
