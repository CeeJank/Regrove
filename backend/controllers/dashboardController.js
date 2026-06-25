<<<<<<< HEAD
<<<<<<< HEAD
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
=======
>>>>>>> c026cf3 (Refactor AI chat flow and complete handover lifecycle)
const { getRecentChildrenForWorker } = require('../models/dashboardModel');

// Controller responsibility:
// Return dashboard data for the authenticated worker.
// Data lookup is delegated to dashboardModel.
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
=======
const dashboardModel = require("../models/dashboardModel");

// 1. Handler for GET /api/workers/me
exports.getMe = async (req, res) => {
  try {
    const workerId = req.user.workerId; // Populated from your auth middleware
    const profile = await dashboardModel.getWorkerProfile(workerId);

    if (!profile) {
      return res.status(404).json({ message: "Worker profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error in getMe controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Handler for GET /api/workers/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const workerId = req.user.workerId;

    // Run both large metrics & case array selections concurrently to maximize performance
    const [stats, cases] = await Promise.all([
      dashboardModel.getDashboardStats(workerId),
      dashboardModel.getCasesForWorker(workerId),
    ]);

    return res.status(200).json({
      stats: stats || {
        totalCases: 0,
        criticalRisk: 0,
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
      },
      cases: cases || [],
    });
  } catch (error) {
    console.error("Error in getDashboard controller:", error);
    return res
      .status(500)
      .json({ message: "Failed to load dashboard dataset" });
  }
>>>>>>> abf4694 (debugs)
};
