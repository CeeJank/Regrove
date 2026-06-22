const eventModel = require("../models/eventsModel");

exports.getCalendarHubFeed = async (req, res) => {
  try {
    const workerId = req.user.workerId;
    const feed = await eventModel.getCalendarHubFeed(workerId);
    return res.status(200).json(feed);
  } catch (error) {
    console.error("Error fetching streamlined calendar feed:", error);
    return res
      .status(500)
      .json({ message: "Failed to assemble calendar metrics" });
  }
};

exports.getAssignedYouthCaseload = async (req, res) => {
  try {
    const workerId = req.user.workerId;
    const caseload = await eventModel.getAssignedYouthList(workerId);
    return res.status(200).json(caseload);
  } catch (error) {
    console.error("Error processing caseload relationships:", error);
    return res
      .status(500)
      .json({ message: "Failed to assemble assigned caseload records" });
  }
};

exports.createNewEvent = async (req, res) => {
  try {
    const organizerId = req.user.workerId;
    const { title, description, date, startTime, endTime, youthId } = req.body;

    if (!title || !date || !startTime || !endTime || !youthId) {
      return res
        .status(400)
        .json({ message: "Missing required appointment metrics" });
    }

    const eventId = await eventModel.createManualEvent({
      title,
      description,
      date,
      startTime,
      endTime,
      organizerId,
      youthId,
    });

    return res
      .status(201)
      .json({ message: "Event scheduled successfully", eventId });
  } catch (error) {
    console.error("Error creating calendar timeline appointment:", error);
    return res.status(500).json({ message: "Failed to allocate appointment" });
  }
};

exports.removeEvent = async (req, res) => {
  try {
    const requesterId = req.user.workerId;
    const { id } = req.params;

    const isDeleted = await eventModel.deleteManualEvent(id, requesterId);
    if (!isDeleted) {
      return res.status(403).json({
        message:
          "Unauthorized. Only the organizing social worker can delete this event.",
      });
    }

    return res
      .status(200)
      .json({ message: "Appointment dropped successfully" });
  } catch (error) {
    console.error("Error deleting calendar appointment:", error);
    return res
      .status(500)
      .json({ message: "Internal server error executing delete" });
  }
};

exports.modifyEventStatus = async (req, res) => {
  const eventId = req.params.id;
  const { status } = req.body;

  // 1. Defensively validate incoming payload status
  if (!status) {
    return res.status(400).json({ error: "Missing required field: status" });
  }

  // FIX: Switch normalization to uppercase to satisfy the PostgreSQL CHECK constraint
  const normalizedStatus = status.toUpperCase(); 
  const allowedStatuses = ["PENDING", "CONFIRMED", "DECLINED"];

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      error: `Invalid status parameter. Must be one of: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    // 2. Instruct model layer to perform the update
    const updatedEvent = await eventModel.updateStatus(eventId, normalizedStatus);

    // 3. Handle resource-not-found edge cases safely
    if (!updatedEvent) {
      return res.status(404).json({ error: "Target appointment event record not found." });
    }

    // 4. Return successful execution structure
    return res.status(200).json({
      message: `Event status modified to ${normalizedStatus} successfully.`,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Database write exception in modifyEventStatus controller:", error);
    return res.status(500).json({ error: "Internal system failure updating event status." });
  }
};