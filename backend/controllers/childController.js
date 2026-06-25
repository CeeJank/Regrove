const { createChildProfileRecord, getAllChildProfiles, getChildProfileRecordById } = require('../models/childModel');

exports.createChildProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'full_name is required' });
    }

    const child = await createChildProfileRecord(req.body);
    return res.status(201).json({ success: true, data: child });
  } catch (error) {
    console.error('createChildProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create child profile' });
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
