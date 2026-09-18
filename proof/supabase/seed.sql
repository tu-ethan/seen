-- Insert Profiles
INSERT INTO profiles (id, auth_user_id, name, email, role, job_title, manager_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'auth0|manager', 'Jordan Lee', 'manager@proof.demo', 'MANAGER', 'Engineering Manager', NULL),
('a0000000-0000-0000-0000-000000000002', 'auth0|maya', 'Maya Chen', 'maya@proof.demo', 'EMPLOYEE', 'Senior Product Engineer', 'a0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000003', 'auth0|daniel', 'Daniel Park', 'daniel@proof.demo', 'EMPLOYEE', 'Software Engineer', 'a0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000004', 'auth0|alex', 'Alex Rivera', 'alex@proof.demo', 'EMPLOYEE', 'Product Manager', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert Teams
INSERT INTO teams (id, name, manager_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'Product Engineering', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert Team Members
INSERT INTO team_members (team_id, profile_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003'),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004')
ON CONFLICT (team_id, profile_id) DO NOTHING;

-- Insert Projects
INSERT INTO projects (id, name, description, status) VALUES
('c0000000-0000-0000-0000-000000000001', 'Project Nova', 'Customer Pricing Redesign', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000002', 'Project Atlas', 'Internal Onboarding Platform', 'ACTIVE'),
('c0000000-0000-0000-0000-000000000003', 'Project Orbit', 'Mobile Launch Initiative', 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

-- Insert Project Members
INSERT INTO project_members (project_id, profile_id, role) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Lead Engineer'),
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Engineer'),
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Product Manager'),

('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Engineer'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Lead Engineer'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Product Manager'),

('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Engineer'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Engineer'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Product Manager')
ON CONFLICT (project_id, profile_id) DO NOTHING;

-- Insert Meetings
INSERT INTO meetings (id, title, project_id, started_at, ended_at, created_by, status) VALUES
('m0000000-0000-0000-0000-000000000001', 'Project Nova Weekly Sync', 'c0000000-0000-0000-0000-000000000001', '2026-06-10 10:00:00+00', '2026-06-10 11:00:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE'),
('m0000000-0000-0000-0000-000000000002', 'Atlas Sprint Review', 'c0000000-0000-0000-0000-000000000002', '2026-06-25 14:00:00+00', '2026-06-25 15:00:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE'),
('m0000000-0000-0000-0000-000000000003', 'Orbit Launch Retro', 'c0000000-0000-0000-0000-000000000003', '2026-07-05 09:00:00+00', '2026-07-05 10:30:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE'),
('m0000000-0000-0000-0000-000000000004', 'Q3 Planning', NULL, '2026-07-15 13:00:00+00', '2026-07-15 15:00:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE'),
('m0000000-0000-0000-0000-000000000005', 'Onboarding Review', 'c0000000-0000-0000-0000-000000000002', '2026-08-12 11:00:00+00', '2026-08-12 12:00:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE'),
('m0000000-0000-0000-0000-000000000006', 'Pricing Research Readout', 'c0000000-0000-0000-0000-000000000001', '2026-09-02 16:00:00+00', '2026-09-02 17:00:00+00', 'a0000000-0000-0000-0000-000000000001', 'COMPLETE')
ON CONFLICT (id) DO NOTHING;

-- Insert Meeting Participants
INSERT INTO meeting_participants (meeting_id, profile_id, speaker_label) VALUES
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Speaker C'),

('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Speaker C'),

('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Speaker C'),

('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Speaker C'),

('m0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Speaker C'),

('m0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Speaker A'),
('m0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'Speaker B'),
('m0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Speaker C')
ON CONFLICT (meeting_id, profile_id) DO NOTHING;

-- Insert Transcript Segments
INSERT INTO transcript_segments (id, meeting_id, profile_id, speaker_label, text, start_ms, end_ms) VALUES
('t0000000-0000-0000-0000-000000000001', 'm0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I finished the onboarding prototype yesterday. The user flows are ready for testing.', 1000, 5000),
('t0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I also interviewed five customers last week about the pricing page. Most of them were confused about the tier differences.', 5500, 12000),
('t0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'Speaker B', 'I resolved the authentication bug that was blocking the beta deployment. The fix is in production now.', 12500, 18000),
('t0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Speaker C', 'I put together the product brief for the Q4 roadmap. Sharing it with everyone today.', 18500, 22000),
('t0000000-0000-0000-0000-000000000005', 'm0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I will redesign the pricing page based on my research and have a prototype ready by end of week.', 22500, 28000),
('t0000000-0000-0000-0000-000000000006', 'm0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Speaker B', 'I built the payment webhook integration successfully, and it handles retries now.', 3000, 8000),
('t0000000-0000-0000-0000-000000000007', 'm0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I led the user testing sessions for the new onboarding flow over the past two days.', 8500, 12000),
('t0000000-0000-0000-0000-000000000008', 'm0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'Speaker C', 'We coordinated the engineering and design sprint effectively this week.', 12500, 16000),
('t0000000-0000-0000-0000-000000000009', 'm0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I proposed we automate transaction categorization using a lightweight ML model, which really sped things up.', 4000, 10000),
('t0000000-0000-0000-0000-000000000010', 'm0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'Speaker B', 'I completely refactored the database queries, dropping latency by 40%.', 10500, 15000),
('t0000000-0000-0000-0000-000000000011', 'm0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I stepped in to help engineering debug the tricky authentication edge case on Atlas.', 5000, 9000),
('t0000000-0000-0000-0000-000000000012', 'm0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Speaker C', 'I finalized the product vision and authored the Q4 product roadmap brief.', 9500, 14000),
('t0000000-0000-0000-0000-000000000013', 'm0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I spent time this week mentoring the junior devs on our frontend architecture to unblock them.', 6000, 11000),
('t0000000-0000-0000-0000-000000000014', 'm0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'Speaker B', 'I reviewed Maya''s onboarding prototype architecture and it looks really solid.', 11500, 15000),
('t0000000-0000-0000-0000-000000000015', 'm0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Speaker C', 'I identified the major user activation bottleneck, which maps nicely to what Maya found.', 4000, 9000),
('t0000000-0000-0000-0000-000000000016', 'm0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Speaker A', 'I coordinated the pricing redesign across both our mobile and web teams to ensure consistency.', 9500, 14000)
ON CONFLICT (id) DO NOTHING;

-- Insert Contributions (Maya)
INSERT INTO contributions (id, profile_id, meeting_id, project_id, type, title, description, occurred_at, status) VALUES
('c1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'EXECUTION', 'Completed onboarding prototype', 'Finished the initial onboarding prototype with user flows ready for testing', '2026-06-10 10:05:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'RESEARCH', 'Conducted customer pricing research', 'Interviewed 5 customers about the pricing page tier differences', '2026-06-10 10:15:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'OWNERSHIP', 'Volunteered to own pricing page redesign', 'Committed to redesign the pricing page based on research findings', '2026-06-10 10:25:00+00', 'AI_EXTRACTED'),
('c1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'LEADERSHIP', 'Led user testing for new onboarding', 'Led multiple user testing sessions to gather feedback on the onboarding flow', '2026-06-25 14:10:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'IDEATION', 'Proposed automated transaction categorization', 'Suggested using a lightweight ML model for faster automated categorization', '2026-07-05 09:10:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'COLLABORATION', 'Helped engineering debug authentication flow', 'Stepped in to assist engineering with a complex authentication edge case', '2026-07-15 13:10:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'LEADERSHIP', 'Mentored junior engineer on frontend architecture', 'Spent time guiding junior developers on the new frontend architecture', '2026-08-12 11:10:00+00', 'VERIFIED'),
('c1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'LEADERSHIP', 'Coordinated pricing redesign across teams', 'Managed consistency of the pricing redesign across mobile and web teams', '2026-09-02 16:15:00+00', 'AI_EXTRACTED')
ON CONFLICT (id) DO NOTHING;

-- Insert Contributions (Daniel)
INSERT INTO contributions (id, profile_id, meeting_id, project_id, type, title, description, occurred_at, status) VALUES
('c2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'EXECUTION', 'Resolved authentication bug blocking beta', 'Fixed critical authentication bug unblocking the deployment to production', '2026-06-10 10:18:00+00', 'VERIFIED'),
('c2000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'EXECUTION', 'Built payment webhook integration', 'Successfully built payment webhook integration with retry mechanisms', '2026-06-25 14:08:00+00', 'VERIFIED'),
('c2000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'EXECUTION', 'Refactored database query performance', 'Refactored queries causing latency to drop by 40%', '2026-07-05 09:20:00+00', 'VERIFIED'),
('c2000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'COLLABORATION', 'Reviewed onboarding prototype architecture', 'Provided solid architectural review of Maya''s prototype', '2026-08-12 11:15:00+00', 'AI_EXTRACTED')
ON CONFLICT (id) DO NOTHING;

-- Insert Contributions (Alex)
INSERT INTO contributions (id, profile_id, meeting_id, project_id, type, title, description, occurred_at, status) VALUES
('c3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'EXECUTION', 'Authored Q4 product roadmap brief', 'Put together and distributed the product brief for the Q4 roadmap', '2026-06-10 10:22:00+00', 'VERIFIED'),
('c3000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'LEADERSHIP', 'Coordinated engineering and design sprint', 'Successfully managed the sprint coordination between engineering and design', '2026-06-25 14:15:00+00', 'VERIFIED'),
('c3000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001', 'RESEARCH', 'Identified user activation bottleneck', 'Found the major user activation dropoff which correlated with user research', '2026-09-02 16:10:00+00', 'AI_EXTRACTED')
ON CONFLICT (id) DO NOTHING;

-- Insert Contribution Evidence
INSERT INTO contribution_evidence (contribution_id, transcript_segment_id, evidence_text) VALUES
('c1000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'I finished the onboarding prototype yesterday. The user flows are ready for testing.'),
('c1000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000002', 'I also interviewed five customers last week about the pricing page. Most of them were confused about the tier differences.'),
('c1000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000005', 'I will redesign the pricing page based on my research and have a prototype ready by end of week.'),
('c1000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000007', 'I led the user testing sessions for the new onboarding flow over the past two days.'),
('c1000000-0000-0000-0000-000000000005', 't0000000-0000-0000-0000-000000000009', 'I proposed we automate transaction categorization using a lightweight ML model, which really sped things up.'),
('c1000000-0000-0000-0000-000000000006', 't0000000-0000-0000-0000-000000000011', 'I stepped in to help engineering debug the tricky authentication edge case on Atlas.'),
('c1000000-0000-0000-0000-000000000007', 't0000000-0000-0000-0000-000000000013', 'I spent time this week mentoring the junior devs on our frontend architecture to unblock them.'),
('c1000000-0000-0000-0000-000000000008', 't0000000-0000-0000-0000-000000000016', 'I coordinated the pricing redesign across both our mobile and web teams to ensure consistency.'),

('c2000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000003', 'I resolved the authentication bug that was blocking the beta deployment. The fix is in production now.'),
('c2000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000006', 'I built the payment webhook integration successfully, and it handles retries now.'),
('c2000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000010', 'I completely refactored the database queries, dropping latency by 40%.'),
('c2000000-0000-0000-0000-000000000004', 't0000000-0000-0000-0000-000000000014', 'I reviewed Maya''s onboarding prototype architecture and it looks really solid.'),

('c3000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000004', 'I put together the product brief for the Q4 roadmap. Sharing it with everyone today.'),
('c3000000-0000-0000-0000-000000000002', 't0000000-0000-0000-0000-000000000008', 'We coordinated the engineering and design sprint effectively this week.'),
('c3000000-0000-0000-0000-000000000003', 't0000000-0000-0000-0000-000000000015', 'I identified the major user activation bottleneck, which maps nicely to what Maya found.')
ON CONFLICT DO NOTHING;

-- Insert Skills
INSERT INTO skills (id, name) VALUES
('s0000000-0000-0000-0000-000000000001', 'Customer Research'),
('s0000000-0000-0000-0000-000000000002', 'User Research'),
('s0000000-0000-0000-0000-000000000003', 'Prototyping'),
('s0000000-0000-0000-0000-000000000004', 'React'),
('s0000000-0000-0000-0000-000000000005', 'Frontend Development'),
('s0000000-0000-0000-0000-000000000006', 'Cross-functional Collaboration'),
('s0000000-0000-0000-0000-000000000007', 'Project Coordination'),
('s0000000-0000-0000-0000-000000000008', 'Mentorship'),
('s0000000-0000-0000-0000-000000000009', 'Product Strategy'),
('s0000000-0000-0000-0000-000000000010', 'Data Analysis'),
('s0000000-0000-0000-0000-000000000011', 'Backend Development'),
('s0000000-0000-0000-0000-000000000012', 'API Integration'),
('s0000000-0000-0000-0000-000000000013', 'Technical Writing'),
('s0000000-0000-0000-0000-000000000014', 'User Testing')
ON CONFLICT (name) DO NOTHING;

-- Insert Employee Skills
INSERT INTO employee_skills (profile_id, skill_id, contribution_id) VALUES
('a0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000004'),
('a0000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000007'),

('a0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000011', 'c2000000-0000-0000-0000-000000000003'),
('a0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000012', 'c2000000-0000-0000-0000-000000000002'),

('a0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Insert Commitments
INSERT INTO commitments (id, profile_id, meeting_id, project_id, description, status) VALUES
('k0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Redesign pricing page and test it this week', 'COMPLETE'),
('k0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Share customer interview findings with team', 'COMPLETE'),
('k0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Deploy authentication fix to production', 'COMPLETE'),
('k0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'm0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Circulate product brief for review', 'COMPLETE')
ON CONFLICT (id) DO NOTHING;
