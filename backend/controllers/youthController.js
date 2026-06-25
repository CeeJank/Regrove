// Import model functions — the controller never writes SQL directly;
// all database interaction is delegated to the model layer.
const { createYouthProfile, getAllYouth, getYouthById } = require('../models/youthModel');

// ─── createYouthProfile ───────────────────────────────────────────────────────
// Handles POST /api/youth
// Protected: requires authenticateToken + requireWorkerOrAdmin middleware
//
// Validates that full_name is present (the only required field), then delegates
// the INSERT to the model. All other fields are optional and default in the model.
exports.createYouthProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    // full_name is the only mandatory field — the DB requires it (NOT NULL)
    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'full_name is required' });
    }

    // Pass the full request body to the model; it picks out the fields it needs
    const youth = await createYouthProfile(req.body);
    return res.status(201).json({ success: true, data: youth });
  } catch (error) {
    console.error('createYouthProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create youth profile' });
  }
};

// ─── getAllYouth ──────────────────────────────────────────────────────────────
// Handles GET /api/youth
// Protected: requires authenticateToken + requireWorkerOrAdmin middleware
//
// Returns all youth profiles sorted newest-first so the catalogue always
// shows recently added profiles at the top.
exports.getAllYouth = async (req, res) => {
  try {
    const youth = await getAllYouth();
    return res.status(200).json({ success: true, data: youth });
  } catch (error) {
    console.error('getAllYouth error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve youth profiles' });
  }
};

// ─── getYouthById ─────────────────────────────────────────────────────────────
// Handles GET /api/youth/:id
// Protected: requires authenticateToken + requireWorkerOrAdmin middleware
//
// Returns a single youth profile. Responds 404 if the id doesn't exist
// rather than returning an empty body, so the client can distinguish
// "not found" from "server error".
exports.getYouthById = async (req, res) => {
  try {
    const { id } = req.params;
    const youth = await getYouthById(id);

    if (!youth) {
      return res.status(404).json({ success: false, message: 'Youth profile not found' });
    }

    return res.status(200).json({ success: true, data: youth });
  } catch (error) {
    console.error('getYouthById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve youth profile' });
  }
};
