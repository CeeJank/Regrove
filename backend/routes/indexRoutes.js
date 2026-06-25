const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const childRoutes = require('./childRoutes');
const childProfileRoutes = require('./childProfileRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const sessionAudioRoutes = require('./sessionAudioRoutes');
const userRoutes = require('./userRoutes');

const { startSession } = require('../controllers/startSessionController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.post('/session/start', authenticateToken, requireWorkerOrAdmin, startSession);
router.use('/session', sessionAudioRoutes);
router.use('/workers', dashboardRoutes);
router.use('/children', childProfileRoutes);
router.use('/child', childRoutes);

module.exports = router;
