const { getRecentChildrenForWorker } = require("../models/dashboardModel");
const { getDashboardHeaderData } = require("../models/dashboardModel");
module.exports = {
  getRecentChildrenForWorker: async (req, res) => {
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
      return res
        .status(500)
        .json({ message: "Failed to load recent children" });
    }
  },

  getDashboardHeaderData: async (req, res) => {
    try {
      const workerId = req.user.workerId;
      const data = await getDashboardHeaderData(workerId);

      return res.status(200).json({
        success: true,
        data: dashboardSummary,
      });
    } catch (error) {
      console.error("Dashboard controller execution error:", error);
      return res.status(500).json({
        success: false,
        message:
          "Failed to compile caseworker dashboard metrics configuration parameters.",
      });
    }
  },
};
