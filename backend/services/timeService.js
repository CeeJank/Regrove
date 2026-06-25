function isAfterWorkingHours(date = new Date()) {
  // Convert the current time to Singapore time before checking the hour.
  const singaporeTime = new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    hour: "numeric",
    hour12: false,
  }).format(date);

  const singaporeHour = Number(singaporeTime);

  // Working hours are 9am up to, but not including, 6pm.
  return singaporeHour < 9 || singaporeHour >= 18;
}

module.exports = {
  isAfterWorkingHours,
};
