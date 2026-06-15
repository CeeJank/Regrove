const { getRecentChildrenForWorker } = require('../models/dashboardModel');

exports.getRecentChildrenForWorker = async (req, res) => {
  try {
    const workerId = req.user.workerId;
    // Await the database query results for recent children associated with the worker
    const data = await getRecentChildrenForWorker(workerId);

    return res.status(200).json({
      workerId,
      items: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load recent children' });
  }
};
