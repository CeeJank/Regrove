const { getCasesForWorker, getDashboardStats, getChildrenForWorker, getAllWorkers, removeCaseAssignment } = require('../models/dashboardModel');

const normaliseRisk = (raw) => {
  const value = String(raw || 'LOW').toUpperCase();
  if (value === 'CRITICAL') return 'critical';
  if (value === 'HIGH') return 'high';
  if (value === 'MEDIUM') return 'medium';
  return 'low';
};

const mapCase = (row) => ({
  id: String(row.childId),
  childId: String(row.childId),
  workerId: '',
  name: row.name,
  age: row.age ?? null,
  school: row.school ?? null,
  category: row.category ?? null,
  riskLevel: normaliseRisk(row.riskLevel),
  notes: row.latestNote ?? '',
  aiSummary: row.aiSummary ?? 'No AI summary available yet.',
  lastUpdated: row.lastUpdated ?? new Date().toISOString(),
  checkIns: (row.checkInsJSON ?? []).map((ci) => ({
    id: String(ci.id),
    childId: String(row.childId),
    mood: ci.mood,
    events: ci.events,
    timestamp: ci.timestamp,
  })),
  notesHistory: (row.notesHistoryJSON ?? []).map((note) => ({
    id: String(note.id),
    noteText: note.noteText,
    createdAt: note.createdAt,
  })),
});

exports.getActiveCasesPayload = async (req, res) => {
  try {
    if (!req.user.workerId) {
      return res.status(403).json({ message: 'Worker profile not found for authenticated user' });
    }

    const [caseRows, stats, childrenRows, workersRows] = await Promise.all([
      getCasesForWorker(req.user.workerId),
      getDashboardStats(req.user.workerId),
      getChildrenForWorker(req.user.workerId),
      getAllWorkers(),
    ]);

    const children = {};
    for (const row of childrenRows) {
      const value = {
        profileId: row.id,
        userId: row.userId ?? '',
        name: row.name,
        email: row.email ?? '',
        username: row.username ?? '',
        dateOfBirth: '',
      };
      children[row.id] = value;
      if (row.userId) {
        children[row.userId] = value;
      }
    }

    const workers = {};
    for (const row of workersRows) {
      const value = {
        profileId: row.id,
        userId: row.userId ?? '',
        name: row.name,
        email: row.email ?? '',
      };
      if (row.userId) {
        workers[row.userId] = value;
      }
    }

    return res.status(200).json({
      cases: caseRows.map(mapCase),
      children,
      workers,
      stats,
    });
  } catch (error) {
    console.error('getActiveCasesPayload error:', error);
    return res.status(500).json({ message: 'Failed to load active cases' });
  }
};

exports.deleteCaseAssignment = async (req, res) => {
  try {
    const childId = parseInt(req.params.childId, 10);

    if (!req.user.workerId) {
      return res.status(403).json({ message: 'Worker profile not found for authenticated user' });
    }
    if (!childId) {
      return res.status(400).json({ message: 'Invalid child ID' });
    }

    await removeCaseAssignment(req.user.workerId, childId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('deleteCaseAssignment error:', error);
    return res.status(500).json({ message: 'Failed to remove case assignment' });
  }
};
