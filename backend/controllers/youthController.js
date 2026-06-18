const { createYouthProfile, getAllYouth, getYouthById } = require('../models/youthModel');

exports.createYouthProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'full_name is required' });
    }

    const youth = await createYouthProfile(req.body);
    return res.status(201).json({ success: true, data: youth });
  } catch (error) {
    console.error('createYouthProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create youth profile' });
  }
};

exports.getAllYouth = async (req, res) => {
  try {
    const youth = await getAllYouth();
    return res.status(200).json({ success: true, data: youth });
  } catch (error) {
    console.error('getAllYouth error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve youth profiles' });
  }
};

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
