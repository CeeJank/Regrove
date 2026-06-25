const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload_audio_file');
const { transcribeAudio } = require('../controllers/sessionAudioController');
const { summarizeSession, logCase } = require('../controllers/sessionWorkflowController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

router.post('/transcribe', upload.single('audio'), transcribeAudio);
router.get('/summarize/:childId', authenticateToken, requireWorkerOrAdmin, summarizeSession);
router.post('/logcase', authenticateToken, requireWorkerOrAdmin, logCase);

module.exports = router;
