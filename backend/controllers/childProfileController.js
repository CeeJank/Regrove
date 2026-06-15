const { getChildProfileById } = require("../models/childProfileModel");

exports.getChildProfileById = async (req, res) => {
  try {
    const childId = req.params.childId;

    if (!childId) {
      return res.status(400).json({ message: "No child ID provided" });
    }

    // Await the database aggregation execution
    const data = await getChildProfileById(childId);

    if (!data) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    // Returns the data matching the frontend's expected format
    return res.status(200).json(data);
  } catch (error) {
    console.error("Controller Error in getChildProfileById:", error);
    return res
      .status(500)
      .json({ message: "Failed to load child profile due to a server error" });
  }
};
