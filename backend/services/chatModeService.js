const { isAfterWorkingHours } = require("./timeService");

function getChatMode(date = new Date()) {
  return isAfterWorkingHours(date) ? "ai" : "human";
}

module.exports = {
  getChatMode,
  isAfterWorkingHours,
};
