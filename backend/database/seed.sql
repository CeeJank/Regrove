-- 1. Wipe all existing rows, reset sequence ID counters, and bypass foreign key locks
TRUNCATE public.users, 
         public.worker_profiles, 
         public.youth_profiles, 
         public.worker_youth_assignments, 
         public.sessions, 
         public.messages, 
         public.ai_summaries, 
         public.risk_assessments, 
         public.escalations, 
         public.worker_notes, 
         public.handover_reports 
RESTART IDENTITY CASCADE;

-- ==========================================
-- 2. SEED SYSTEM ACCOUNT CREDENTIALS (users)
-- ==========================================
INSERT INTO public.users (id, email, password_hash, role) VALUES
(1, 'worker.jane@scs.org.sg', 'hashed_password_123', 'worker'),
(2, 'admin.superuser@scs.org.sg', 'hashed_password_admin', 'admin'),
(3, 'john.tan@student.edu.sg', 'hashed_password_john', 'youth'),
(4, 'alicia.lim@student.edu.sg', 'hashed_password_alicia', 'youth'),
(5, 'ravi.kumar@student.edu.sg', 'hashed_password_ravi', 'youth');

-- ==========================================
-- 3. SEED WORKER PROFILES
-- ==========================================
INSERT INTO public.worker_profiles (id, user_id, full_name, specialization, bio) VALUES
(1, 1, 'Jane Doe', 'Youth Clinical Trauma Support', 'Dedicated caseworker with over 6 years supporting academic transition adjustments.');

-- ==========================================
-- 4. SEED YOUTH PROFILES
-- ==========================================
-- Note: Sarah Cheng (ID 4) has no associated system login (user_id = NULL), 
-- allowing us to test a clean, non-authenticated/freshly imported offline profile.
INSERT INTO public.youth_profiles (id, user_id, full_name, status, age, school, interests, category, latest_risk_level) VALUES
(1, 3, 'John Tan', 'Needs follow-up', 12, 'Orchard Secondary School', 'Gaming, Digital Illustration', 'Academic stress path', 'MEDIUM'),
(2, 4, 'Alicia Lim', 'Stable', 13, 'Victoria Girls School', 'Track and Field, Acoustic Guitar', 'General wellness path', 'LOW'),
(3, 5, 'Ravi Kumar', 'Priority review', 11, 'Serangoon Primary School', 'Robotics, Chess', 'Social anxiety baseline', 'HIGH'),
(4, NULL, 'Sarah Cheng', 'Stable', 14, 'Bedok Green Secondary', 'Baking, Badminton', 'Preventative track', 'LOW');

-- ==========================================
-- 5. SEED CASE ASSIGNMENTS
-- ==========================================
INSERT INTO public.worker_youth_assignments (worker_id, youth_id) VALUES
(1, 1), -- Jane Doe assigned to John Tan
(1, 2), -- Jane Doe assigned to Alicia Lim
(1, 3), -- Jane Doe assigned to Ravi Kumar
(1, 4); -- Jane Doe assigned to Sarah Cheng (Zero active history profile)

-- ==========================================
-- 6. SEED INTERACTION TIMELINES (sessions)
-- ==========================================
INSERT INTO public.sessions (id, youth_id, worker_id, session_type, status, started_at, ended_at) VALUES
(101, 1, 1, 'WORKER_CHAT', 'COMPLETED', '2026-06-05 14:00:00', '2026-06-05 15:00:00'),
(201, 2, 1, 'WORKER_CHAT', 'COMPLETED', '2026-06-09 10:00:00', '2026-06-09 11:00:00'),
(102, 1, 1, 'WORKER_CHAT', 'COMPLETED', '2026-06-10 16:00:00', '2026-06-10 17:00:00'),
(301, 3, NULL, 'AI_AFTER_HOURS', 'ESCALATED', '2026-06-14 23:15:00', '2026-06-14 23:45:00');

-- ==========================================
-- 7. SEED SIMULATED CHAT TRANSCRIPTS (messages)
-- ==========================================
INSERT INTO public.messages (session_id, sender_type, message_text) VALUES
(101, 'WORKER', 'Hi John, how have things been since our last check-in?'),
(101, 'YOUTH', 'Hey, ok I guess. School is getting kinda hard with the new project deadlines.'),
(101, 'WORKER', 'I understand, workloads can feel overwhelming. Let''s map out a plan together.'),
(301, 'YOUTH', 'I am completely stuck and feeling super alone right now... nobody is listening.'),
(301, 'AI', 'I am here listening to you. Your feelings are completely valid. Please tell me more about what is causing you pain.');

-- ==========================================
-- 8. SEED COMPLETIONS SUMMARIES (ai_summaries)
-- ==========================================
INSERT INTO public.ai_summaries (session_id, summary_text) VALUES
(101, 'Reviewed initial academic adjustment challenges. Discussed secondary school workload stressors and baseline family structural routines.'),
(201, 'Checked motivation parameters, personal coping strategies, and hobbies. Displaying high baseline resilience and active structural supports.'),
(102, 'Follow-up session regarding active peer conflicts and testing anxieties. Progressing slowly but requiring close systemic tracking.');

-- ==========================================
-- 9. SEED RISK & SENTIMENT METRICS (risk_assessments)
-- ==========================================
INSERT INTO public.risk_assessments (session_id, risk_level, risk_score, reasoning, sentiment_positive, sentiment_neutral, sentiment_negative) VALUES
(101, 'LOW', 35.00, 'Baseline session metrics demonstrate standard structural adjustment stresses.', 50, 30, 20),
(201, 'LOW', 28.00, 'Strong situational framework with robust supportive networks.', 60, 25, 15),
(102, 'MEDIUM', 65.50, 'Escalated testing anxiety compounding with perceived peer structural friction.', 45, 35, 20),
(301, 'HIGH', 82.00, 'Critical language distress indicators flagged automatically during late night triage chat.', 10, 40, 50);

-- ==========================================
-- 10. SEED CRITICAL ALERT INCIDENTS (escalations)
-- ==========================================
INSERT INTO public.escalations (session_id, youth_id, escalation_type, description, status) VALUES
(301, 3, 'Late-Night Distress Trigger', 'System flagged critical language markers regarding severe isolation and distress during an after-hours chatbot interaction.', 'PENDING');

-- ==========================================
-- 11. SEED MANUAL CASE WORK NOTES (worker_notes)
-- ==========================================
INSERT INTO public.worker_notes (worker_id, youth_id, session_id, note_text) VALUES
(1, 1, 101, 'John noted that he feels comfortable talking about timelines, but gets protective when discussing peer groupings. Keep an eye on group project dynamic details.');

-- ==========================================
-- 12. SEED DUTY TRANSITIONS (handover_reports)
-- ==========================================
INSERT INTO public.handover_reports (youth_id, session_id, summary, recommended_action, reviewed) VALUES
(3, 301, 'High distress escalation occurred during after-hours interaction.', 'Conduct an emergency face-to-face evaluation immediately upon student arrival.', false);