const { createChildProfileRecord, getAllChildProfiles, getChildProfileRecordById, assignChildToWorker } = require('../models/childModel');

exports.createChildProfile = async (req, res) => {
  try {
    const { full_name, fullName } = req.body;
    const resolvedFullName = full_name ?? fullName;

    if (!resolvedFullName || resolvedFullName.trim() === '') {
      return res.status(400).json({ success: false, message: 'full_name is required' });
    }

    const child = await createChildProfileRecord({ ...req.body, full_name: resolvedFullName });

    if (req.user?.workerId) {
      await assignChildToWorker(req.user.workerId, child.id);
    }

    return res.status(201).json({ success: true, data: child });
  } catch (error) {
    console.error('createChildProfile error:', error);
    const status = error.message === 'An account with that email already exists' ? 409 : 500;
    return res.status(status).json({ success: false, message: error.message || 'Failed to create child profile' });
  }
};

exports.getAllChildren = async (req, res) => {
  try {
    const children = await getAllChildProfiles();
    return res.status(200).json({ success: true, data: children });
  } catch (error) {
    console.error('getAllChildren error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve child profiles' });
  }
};

exports.getChildById = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await getChildProfileRecordById(id);

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child profile not found' });
    }

    return res.status(200).json({ success: true, data: child });
  } catch (error) {
    console.error('getChildById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve child profile' });
  }
};
