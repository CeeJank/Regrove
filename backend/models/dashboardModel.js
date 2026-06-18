const mockRecentChildrenDb = [
  {
    childId: 1,
    workerId: 1,
    name: 'John Tan',
    age: 12,
    riskLevel: 'Medium',
    lastSessionDate: '2026-06-10',
    status: 'Needs follow-up',
  },
  {
    childId: 2,
    workerId: 1,
    name: 'Alicia Lim',
    age: 13,
    riskLevel: 'Low',
    lastSessionDate: '2026-06-09',
    status: 'Stable',
  },
  {
    childId: 3,
    workerId: 1,
    name: 'Ravi Kumar',
    age: 11,
    riskLevel: 'High',
    lastSessionDate: '2026-06-08',
    status: 'Priority review',
  },
];

// Model responsibility:
// Demo/mock data source for worker dashboard cards.
// Replace this with PostgreSQL queries when dashboard data is moved fully into the database.

// Returns up to five recent youth profiles assigned to one worker.
exports.getRecentChildrenForWorker = (workerId) => {
  return mockRecentChildrenDb.filter((item) => item.workerId === workerId).slice(0, 5);
};
