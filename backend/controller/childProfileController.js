const { getChildProfileById } = require('../model/childProfileModel');

exports.getChildProfileById = (req, res) => {
  try {
    const childId = req.params.childId;

    if (!childId) {
      return res.status(400).json({ message: 'No child ID provided' });
    }

    const data = getChildProfileById(childId);

    if (!data) {
      return res.status(404).json({ message: 'Child profile not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load child profile' });
  }
};
