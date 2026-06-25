const { findChildAndWorkerByUserId, submitCheckInRecord } = require('../models/checkInModel');

const moodToRisk = (mood) => {
  if (mood >= 5) return { level: 'CRITICAL', score: 8.0 };
  if (mood === 4) return { level: 'HIGH', score: 6.0 };
  if (mood === 3) return { level: 'MEDIUM', score: 4.0 };
  return { level: 'LOW', score: 2.0 };
};

exports.submitCheckIn = async (req, res) => {
  try {
    const childUserId = parseInt(req.params.userId, 10);
    const {
      mood,
      events,
      q1_sleep = '',
      q2_safe = '',
      q3_support = '',
      q4_worry = '',
      q5_proud = '',
    } = req.body;

    if (!childUserId || !mood) {
      return res.status(400).json({ message: 'userId and mood are required' });
    }

    const child = await findChildAndWorkerByUserId(childUserId);
    if (!child?.child_id) {
      return res.status(404).json({ message: 'Child profile not found' });
    }

    const { level, score } = moodToRisk(Number(mood));
    const noteText = [
      events?.trim() ? `Child check-in: ${events.trim()}` : null,
      q1_sleep ? `Sleep: ${q1_sleep}` : null,
      q2_safe ? `Safety: ${q2_safe}` : null,
      q3_support ? `Support: ${q3_support}` : null,
      q4_worry ? `Worry: ${q4_worry}` : null,
      q5_proud ? `Proud: ${q5_proud}` : null,
    ].filter(Boolean).join('\n');

    const sessionId = await submitCheckInRecord({
      child_id: child.child_id,
      worker_id: child.worker_id,
      risk_level: level,
      risk_score: score,
      noteText,
    });

    return res.status(201).json({ success: true, sessionId, riskLevel: level });
  } catch (error) {
    console.error('submitCheckIn error:', error);
    return res.status(500).json({ message: 'Failed to submit check-in' });
  }
};
