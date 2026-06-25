const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload_audio_file');
const { transcribeAudio } = require('../controllers/sessionAudioController');
const { summarizeSession, logCase, receiveTranscript, getCansSummary } = require('../controllers/sessionWorkflowController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

router.post('/transcribe', upload.single('audio'), transcribeAudio);
router.get('/summarize/:childId', authenticateToken, requireWorkerOrAdmin, summarizeSession);
router.post('/logcase', authenticateToken, requireWorkerOrAdmin, logCase);

// Internal callback from the Python sidecar — no auth, only reachable inside the container network.
router.post('/transcript-callback', receiveTranscript);

// Polled by the SW frontend after audio upload to retrieve the CANS summary.
router.get('/cans-summary/:sessionId', authenticateToken, requireWorkerOrAdmin, getCansSummary);

module.exports = router;
