const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const chatRoutes = require('./chat');
const childRoutes = require('./childRoutes');
const childProfileRoutes = require('./childProfileRoutes');
const checkInRoutes = require('./checkInRoutes');
const conversationRoutes = require('./conversationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const eventRoutes = require('./eventRoutes');
const legacyActiveRoutes = require('./legacyActiveRoutes');
const messageRoutes = require('./messageRoutes');
const sessionAudioRoutes = require('./sessionAudioRoutes');
const summaryRoutes = require('./summaryRoutes');
const userRoutes = require('./userRoutes');
const workerRoutes = require('./workerRoutes');

const { startSession } = require('../controllers/startSessionController');
const { deleteCaseAssignment } = require('../controllers/legacyActiveController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.post('/session/start', authenticateToken, requireWorkerOrAdmin, startSession);
router.post('/session/start/:childId', authenticateToken, requireWorkerOrAdmin, startSession);
router.use('/session', sessionAudioRoutes);
router.use('/workers', dashboardRoutes);
router.use('/workers', workerRoutes);
router.use('/children', childProfileRoutes);
router.use('/child', childRoutes);
router.use('/sdq', checkInRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/summaries', summaryRoutes);
router.use('/events', eventRoutes);
router.use('/active', legacyActiveRoutes);
router.delete('/cans_case/:childId', authenticateToken, requireWorkerOrAdmin, deleteCaseAssignment);

module.exports = router;
