const { getCasesForWorker, getDashboardStats } = require("../models/dashboardModel");

module.exports = {
  /**
   * GET /api/workers/dashboard
   *
   * Returns everything the social worker dashboard page needs in one call:
   *   - stats: { totalCases, highRisk, mediumRisk, lowRisk }
   *   - cases: [{ childId, name, riskLevel, status, lastUpdated, aiSummary }]
   */
  getDashboard: async (req, res) => {
    try {
      const workerId = req.user.workerId;

      // Run both queries at the same time — no reason to wait on one before the other
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
