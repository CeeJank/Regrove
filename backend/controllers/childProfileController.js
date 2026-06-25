<<<<<<< HEAD
const { getChildProfileById } = require('../models/childProfileModel');
=======
const {
  getChildProfileById,
  updateRiskLevel,
  upsertWorkerNote,
  getLatestWorkerNote,
} = require("../models/childProfileModel");
>>>>>>> a61d0e1 (added dashboard and child profile routes along with child-profile frontend logic and related components)

const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

// GET /api/children/:childId
exports.getChildProfileById = async (req, res) => {
  try {
    const childId = parseInt(req.params.childId, 10);
    if (!childId) return res.status(400).json({ message: "Invalid child ID" });

    const data = await getChildProfileById(childId);
    if (!data) return res.status(404).json({ message: "Child profile not found" });

    return res.status(200).json(data);
  } catch (error) {
    console.error("getChildProfileById error:", error);
    return res.status(500).json({ message: "Failed to load child profile" });
  }
};

// PATCH /api/children/:childId/risk
// Body: { riskLevel: 'low' | 'medium' | 'high' | 'critical' }
// Updates youth_profiles.latest_risk_level for this youth.
exports.updateRiskLevel = async (req, res) => {
  try {
    const childId   = parseInt(req.params.childId, 10);
    const { riskLevel } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "Invalid child ID" });
    }
    if (!riskLevel || !VALID_RISK_LEVELS.includes(riskLevel.toLowerCase())) {
      return res.status(400).json({
        message: `riskLevel must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
      });
    }

    const updated = await updateRiskLevel(childId, riskLevel);
    if (!updated) return res.status(404).json({ message: "Youth not found" });

    return res.status(200).json({ childId, riskLevel: riskLevel.toLowerCase() });
  } catch (error) {
    console.error("updateRiskLevel error:", error);
    return res.status(500).json({ message: "Failed to update risk level" });
  }
};

// PATCH /api/children/:childId/notes
// Body: { notes: string }
// Inserts a new worker_notes row (append-only log).
// Returns the saved note so the frontend can confirm.
exports.saveNotes = async (req, res) => {
  try {
    const childId  = parseInt(req.params.childId, 10);
    const workerId = req.user.workerId;
    const { notes } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "Invalid child ID" });
    }
    if (typeof notes !== 'string' || notes.trim() === '') {
      return res.status(400).json({ message: "notes must be a non-empty string" });
    }

    const saved = await upsertWorkerNote(workerId, childId, notes.trim());
    return res.status(200).json({ childId, noteText: saved.noteText });
  } catch (error) {
    console.error("saveNotes error:", error);
    return res.status(500).json({ message: "Failed to save notes" });
  }
};
