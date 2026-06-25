const eventModel = require("../models/eventsModel");

exports.getCalendarHubFeed = async (req, res) => {
  try {
    if (req.user.role === 'youth') {
      if (!req.user.childId) {
        return res.status(403).json({ message: "Child profile not found for authenticated user" });
      }

      const feed = await eventModel.getCalendarEventsForChild(req.user.childId);
      return res.status(200).json(feed);
    }

    if (!req.user.workerId) {
      return res.status(403).json({ message: "Worker profile not found for authenticated user" });
    }

    const feed = await eventModel.getCalendarEventsForWorker(req.user.workerId);
    return res.status(200).json(feed);
  } catch (error) {
    console.error("Error fetching streamlined calendar feed:", error);
    return res.status(500).json({ message: "Failed to assemble calendar metrics" });
  }
};

exports.getAssignedYouthCaseload = async (req, res) => {
  try {
    const workerId = req.user.workerId;
    const caseload = await eventModel.getAssignedYouthList(workerId);
    return res.status(200).json(caseload);
  } catch (error) {
    console.error("Error processing caseload relationships:", error);
    return res.status(500).json({ message: "Failed to assemble assigned caseload records" });
  }
};

exports.createNewEvent = async (req, res) => {
  try {
    const organizerId = req.user.workerId;
    const { title, description, date, startTime, endTime, youthId, childIds } = req.body;
    const resolvedYouthId = youthId ?? childIds?.[0];

    if (!organizerId) {
      return res.status(403).json({ message: "Worker profile not found for authenticated user" });
    }

    if (!title || !date || !startTime || !endTime || !resolvedYouthId) {
      return res.status(400).json({ message: "Missing required appointment metrics" });
    }

    const eventId = await eventModel.createManualEvent({
      title,
        description,
        date,
        startTime,
        endTime,
        organizerId,
        youthId: resolvedYouthId,
      });

    const createdEvents = await eventModel.getCalendarEventsForWorker(organizerId);
    const createdEvent = createdEvents.find((event) => event.id === String(eventId));
    return res.status(201).json(createdEvent ?? { message: "Event scheduled successfully", eventId });
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
        message: "Unauthorized. Only the organizing social worker can delete this event.",
      });
    }

    return res.status(200).json({ message: "Appointment dropped successfully" });
  } catch (error) {
    console.error("Error deleting calendar appointment:", error);
    return res.status(500).json({ message: "Internal server error executing delete" });
  }
};

exports.respondToEventInvite = async (req, res) => {
  try {
    if (!req.user.childId) {
      return res.status(403).json({ message: "Child profile not found for authenticated user" });
    }

    const { status } = req.body;
    if (status !== 'accepted' && status !== 'declined') {
      return res.status(400).json({ message: "status must be accepted or declined" });
    }

    const updated = await eventModel.updateEventInviteStatus(
      req.params.id,
      req.user.childId,
      status
    );

    if (!updated) {
      return res.status(404).json({ message: "Event invite not found" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error responding to event invite:", error);
    return res.status(500).json({ message: "Failed to update event invite status" });
  }
};
