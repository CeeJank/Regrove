const { getChildSessionSummary, logCompletedSession } = require('../models/sessionWorkflowModel');
const { generateCansSummary } = require('../services/aiSummaryService');

// In-memory store for CANS summaries produced from audio transcripts.
// Keyed by sessionId (string from startSession).
const cansSummaries = new Map();

exports.summarizeSession = async (req, res) => {
  try {
    const childId = parseInt(req.params.childId, 10);

    if (!childId) {
      return res.status(400).json({ message: 'Invalid child ID' });
    }

    const row = await getChildSessionSummary(childId);
    if (!row) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const summary = row.summary_text
      || row.note_text
      || `${row.full_name} completed a session. Current risk level is ${String(row.latest_risk_level || 'LOW').toLowerCase()}.`;

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('summarizeSession error:', error);
    return res.status(500).json({ message: 'Failed to summarize session' });
  }
};

// POST /api/session/transcript-callback — called internally by the Python sidecar after Whisper finishes.
// Responds immediately so Python is not blocked, then generates the CANS summary in the background.
exports.receiveTranscript = async (req, res) => {
  const { session_id, transcription } = req.body;

  if (!session_id || !transcription) {
    return res.status(400).json({ message: 'session_id and transcription are required' });
  }

  res.status(202).json({ message: 'Transcript received, generating CANS summary' });

  try {
    const summary = await generateCansSummary(transcription);
    cansSummaries.set(session_id, { summary, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('CANS summary generation error:', err);
  }
};

// GET /api/session/cans-summary/:sessionId — polled by the frontend after audio upload.
// Returns 404 while the summary is still being generated.
exports.getCansSummary = (req, res) => {
  const result = cansSummaries.get(req.params.sessionId);

  if (!result) {
    return res.status(404).json({ message: 'Summary not ready yet' });
  }

  return res.status(200).json(result);
};

exports.logCase = async (req, res) => {
  try {
    const childId = parseInt(req.body.childId, 10);
    const { summary = '', duration = 0 } = req.body;
    const workerId = req.user?.workerId;

    if (!workerId) {
      return res.status(403).json({ message: 'Worker profile not found for authenticated user' });
    }
    if (!childId) {
      return res.status(400).json({ message: 'childId is required' });
    }

    const sessionId = await logCompletedSession({ childId, workerId, duration, summary });

    return res.status(201).json({ success: true, sessionId });
  } catch (error) {
    console.error('logCase error:', error);
    return res.status(500).json({ message: 'Failed to log case' });
  }
};
