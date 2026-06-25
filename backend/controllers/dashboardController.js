<<<<<<< HEAD
const { getWorkerProfile, getCasesForWorker, getDashboardStats } = require("../models/dashboardModel");

module.exports = {
  // GET /api/workers/me
  // Returns the real worker name and specialization for the logged-in worker.
  getMe: async (req, res) => {
    try {
      const workerId = req.user.workerId;
      const profile = await getWorkerProfile(workerId);
      if (!profile) {
        return res.status(404).json({ message: "Worker profile not found" });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error("getMe error:", error);
      return res.status(500).json({ message: "Failed to load worker profile" });
    }
  },
=======
const { getRecentChildrenForWorker } = require('../models/dashboardModel');

exports.getRecentChildrenForWorker = (req, res) => {
  try {
    const workerId = req.user.workerId;

    const data = getRecentChildrenForWorker(workerId);
>>>>>>> 66f3cc2 (update imports)

  // GET /api/workers/dashboard
  // Returns stat card counts + full case list for the logged-in social worker.
  getDashboard: async (req, res) => {
    try {
      const workerId = req.user.workerId;
      const [stats, cases] = await Promise.all([
        getDashboardStats(workerId),
        getCasesForWorker(workerId),
      ]);
      return res.status(200).json({ stats, cases });
    } catch (error) {
      console.error("getDashboard error:", error);
      return res.status(500).json({ message: "Failed to load dashboard data" });
    }
  },
};
