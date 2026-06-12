const { getRecentChildrenForWorker } = require('../model/dashboardModel');

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
