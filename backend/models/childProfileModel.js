const mockChildProfilesDb = [
  {
    childId: 1,
    name: 'John Tan',
    age: 12,
    riskLevel: 'Medium',
    status: 'Needs follow-up',
    analytics: {
      riskScore: 65,
      sessionCount: 14,
      moodBreakdown: {
        positive: 45,
        neutral: 35,
        negative: 20,
      },
    },
    recentSessions: [
      { sessionId: 101, date: '2026-06-10', summary: 'Discussed school stress' },
      { sessionId: 102, date: '2026-06-07', summary: 'Reviewed attendance and goals' },
    ],
  },
  {
    childId: 2,
    name: 'Alicia Lim',
    age: 13,
    riskLevel: 'Low',
    status: 'Stable',
    analytics: {
      riskScore: 28,
      sessionCount: 9,
      moodBreakdown: {
        positive: 60,
        neutral: 25,
        negative: 15,
      },
    },
    recentSessions: [
      { sessionId: 201, date: '2026-06-09', summary: 'Checked motivation and hobbies' },
    ],
  },
];

exports.getChildProfileById = (childId) => {
  const numericId = Number(childId);
  return mockChildProfilesDb.find((item) => item.childId === numericId) || null;
};
