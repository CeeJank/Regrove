const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const eventController = require("../controllers/eventController");

// Standard REST bindings for the Social Work Hub Feed
router.get("/hub", authenticate, eventController.getCalendarHubFeed);
router.get("/assigned-youth", authenticate, eventController.getAssignedYouthCaseload); // Mapped under /api/events
router.post("/", authenticate, eventController.createNewEvent);
router.delete("/:id", authenticate, eventController.removeEvent);
router.patch('/:id/status', eventController.modifyEventStatus);

module.exports = router;