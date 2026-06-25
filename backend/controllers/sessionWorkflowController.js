const { getChildSessionSummary, logCompletedSession } = require('../models/sessionWorkflowModel');

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
