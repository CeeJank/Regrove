const { getRecentChildrenForWorker } = require('../models/dashboardModel');

// Controller responsibility:
// Return dashboard data for the authenticated worker.
// Data lookup is delegated to dashboardModel.
exports.getRecentChildrenForWorker = (req, res) => {
  try {
    const workerId = req.user.workerId;
    
    const data = getRecentChildrenForWorker(workerId);

    return res.status(200).json({
      workerId,
      items: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load recent children' });
  }
};
