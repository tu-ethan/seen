import type { Contribution, EmployeeProfile, Meeting, Person, Project, SpeakerAwareTranscript, WorkspaceState } from '@/types'

export const JORDAN: Person = { id: 'jordan-lee', name: 'Jordan Lee', initials: 'JL', title: 'Firmware Engineering Manager' }

export const MAYA: EmployeeProfile = {
  id: 'maya-chen', name: 'Maya Chen', initials: 'MC', title: 'Firmware Engineer', managerId: JORDAN.id,
  projectIds: ['sample-collection', 'habitat-life-support', 'surface-power', 'surface-logistics', 'surface-comms'], location: 'Pasadena, CA', accent: 'lilac',
  summary: 'Builds reliable embedded controls for habitat sensors, sample handling, power protection, and communications hardware.',
  reviewSummary: 'Maya has improved the reliability of mission-critical firmware, paired deep debugging with repeatable hardware testing, and increasingly coordinated integrated work across engineering teams.',
}

export const DANIEL: EmployeeProfile = {
  id: 'daniel-park', name: 'Daniel Park', initials: 'DP', title: 'Embedded Systems Engineer', managerId: JORDAN.id,
  projectIds: ['sample-collection', 'habitat-life-support'], location: 'Houston, TX', accent: 'green',
  summary: 'Integrates sample-handling and life-support controllers with flight hardware, sensors, and recovery systems.',
  reviewSummary: 'Daniel made the sample-caching controller and backup air-quality hardware easier to validate, with strong ownership of interfaces, recovery behavior, and bench testing.',
}

export const PRIYA: EmployeeProfile = {
  id: 'priya-nair', name: 'Priya Nair', initials: 'PN', title: 'Robotics Software Engineer', managerId: JORDAN.id,
  projectIds: ['sample-collection', 'surface-logistics'], location: 'Pasadena, CA', accent: 'blue',
  summary: 'Develops robotic-arm and autonomous rover software for collecting, documenting, and transporting Mars samples.',
  reviewSummary: 'Priya improved the precision and recovery behavior of robotic sample collection while turning field-test findings into safer autonomous routines.',
}

export const ELENA: EmployeeProfile = {
  id: 'elena-morales', name: 'Elena Morales', initials: 'EM', title: 'Power Systems Engineer', managerId: JORDAN.id,
  projectIds: ['surface-power', 'habitat-life-support'], location: 'Houston, TX', accent: 'sand',
  summary: 'Plans and validates the solar, battery, and load-management system that keeps the surface habitat operating.',
  reviewSummary: 'Elena strengthened the team’s cold-weather battery protection and dust-storm power plans, grounding design decisions in clear test evidence and operational limits.',
}

export const ALEX: EmployeeProfile = {
  id: 'alex-rivera', name: 'Alex Rivera', initials: 'AR', title: 'Mission Systems Lead', managerId: JORDAN.id,
  projectIds: ['sample-collection', 'surface-logistics', 'surface-comms'], location: 'Pasadena, CA', accent: 'rust',
  summary: 'Coordinates interfaces and integrated tests across sample collection, surface mobility, and Mars communications.',
  reviewSummary: 'Alex connected project-level decisions to mission operations, removing cross-team ambiguity around sample custody, communications outages, and integrated test readiness.',
}

export const TEAM_MEMBERS: EmployeeProfile[] = [MAYA, DANIEL, PRIYA, ELENA, ALEX]

export const PROJECTS: Project[] = [
  {
    id: 'sample-collection', name: 'Mars Sample Collection', shortName: 'Sample Acquisition and Caching',
    purpose: 'Collects scientifically valuable rock and soil, seals each sample in a clean tube, and records where it came from for eventual return to Earth.',
    mayaRole: 'Builds firmware for sample-tube sensors, sealing checks, temperature monitoring, and status telemetry.',
    status: 'Field testing', latestProgress: 'The robotic arm placed and sealed twelve test tubes without losing sample-location data.', accent: 'rust',
  },
  {
    id: 'habitat-life-support', name: 'Habitat Life Support', shortName: 'Environmental Control and Life Support',
    purpose: 'Keeps the crew habitat safe by monitoring oxygen, carbon dioxide, temperature, humidity, and cabin pressure.',
    mayaRole: 'Builds sensor, alarm, backup-reading, and safe-recovery firmware for the habitat controller.',
    status: 'Field testing', latestProgress: 'The backup air-quality controller recovered cleanly during the latest integrated test.', accent: 'green',
  },
  {
    id: 'surface-power', name: 'Surface Power System', shortName: 'Solar Power and Energy Storage',
    purpose: 'Balances solar generation and batteries so life support, communications, and science equipment stay online through cold nights and dust storms.',
    mayaRole: 'Maintains battery safeguards, temperature limits, and low-power recovery firmware.',
    status: 'Active', latestProgress: 'Cold-weather battery protection now keeps life-support loads above the reserve threshold.', accent: 'sand',
  },
  {
    id: 'surface-logistics', name: 'Autonomous Surface Logistics', shortName: 'Cargo and Sample Transport Rover',
    purpose: 'Moves tools, supplies, and sealed samples between the landing site, field teams, and the crew habitat without a driver.',
    mayaRole: 'Supports motor controls, wheel sensors, telemetry, and automatic recovery from common rover faults.',
    status: 'Active', latestProgress: 'A wheel-sensor fallback completed a full cargo route without stopping the rover.', accent: 'lilac',
  },
  {
    id: 'surface-comms', name: 'Mars Surface Communications', shortName: 'Surface-to-Orbit Communications Network',
    purpose: 'Stores and forwards mission updates so crew, rover, and science data survive delays and temporary connection losses.',
    mayaRole: 'Owns message-storage checks, connection recovery, and health telemetry on the terminal controller.',
    status: 'Planning', latestProgress: 'The team selected a recovery strategy for interrupted habitat and sample-status uploads.', accent: 'blue',
  },
]

export const SCHEDULED_MEETING: Meeting = {
  id: 'mars-habitat-weekly-2026-09-18', title: 'Mars Habitat Systems Weekly', projectId: 'habitat-life-support',
  platform: 'Google Meet', scheduledAt: '2026-09-18T10:00:00-04:00', displayTime: 'Today at 10:00 AM',
  participants: [MAYA, DANIEL, ALEX], recurring: true, captureEnabled: true,
}

const MAYA_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'sample-temperature-checks', employeeId: MAYA.id, meetingId: 'sample-caching-review-2026-09-05', projectId: 'sample-collection', category: 'SHIPPED',
    title: 'Added temperature checks for cached sample tubes',
    description: 'Maya added controller checks that flag sample tubes exposed to temperatures outside the science team’s safe range.',
    date: '2026-09-05', skills: ['Embedded C++', 'Sensor Integration', 'Telemetry'], status: 'VERIFIED',
    evidence: [{ quote: 'Each tube now carries the temperature range it experienced from collection through caching, and the controller flags anything outside the science limit.', timestamp: '21:18', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'habitat-pressure-fallback', employeeId: MAYA.id, meetingId: 'habitat-integration-2026-08-28', projectId: 'habitat-life-support', category: 'SHIPPED',
    title: 'Added a safe fallback for cabin pressure readings',
    description: 'Maya added a backup reading path so the habitat controller can keep evaluating cabin pressure when the primary sensor briefly drops out.',
    date: '2026-08-28', skills: ['Embedded C++', 'Sensor Integration', 'Fault Detection'], status: 'VERIFIED',
    evidence: [{ quote: 'The controller now switches to the backup pressure channel, marks the primary reading unavailable, and keeps the alarm logic running.', timestamp: '18:42', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'power-cold-battery', employeeId: MAYA.id, meetingId: 'surface-power-weekly-2026-08-14', projectId: 'surface-power', category: 'IMPROVED',
    title: 'Protected habitat batteries during cold startup',
    description: 'Maya adjusted the startup sequence so heaters stabilize the battery pack before nonessential equipment begins drawing power.',
    date: '2026-08-14', skills: ['Power Management', 'Embedded C++', 'Hardware-in-the-loop Testing'], status: 'VERIFIED',
    evidence: [{ quote: 'I moved the heater check ahead of the auxiliary loads. In the chamber run, the pack stayed inside its safe temperature range.', timestamp: '09:17', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'logistics-wheel-recovery', employeeId: MAYA.id, meetingId: 'rover-systems-review-2026-07-31', projectId: 'surface-logistics', category: 'UNBLOCKED',
    title: 'Recovered rover navigation after a wheel-sensor dropout',
    description: 'Maya traced a stalled route to one noisy wheel sensor and added a fallback that lets the rover return to a safe stop.',
    date: '2026-07-31', skills: ['Debugging', 'Telemetry', 'Fault Detection'], status: 'VERIFIED',
    evidence: [{ quote: 'The telemetry showed the front-left encoder was flickering. The fallback now uses the other wheels long enough to reach the safe-stop point.', timestamp: '24:08', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'comms-message-recovery', employeeId: MAYA.id, meetingId: 'communications-design-review-2026-06-19', projectId: 'surface-comms', category: 'RESEARCHED',
    title: 'Compared recovery options for interrupted Mars messages',
    description: 'Maya tested two ways to resume delayed transmissions and recommended the approach that preserves message order after a reconnect.',
    date: '2026-06-19', skills: ['Telemetry', 'Embedded C++', 'Cross-team Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'Checkpointing each message costs a little storage, but it is the only option that kept the sequence intact after three forced disconnects.', timestamp: '31:26', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'habitat-test-mentoring', employeeId: MAYA.id, meetingId: 'firmware-working-session-2026-05-22', projectId: 'habitat-life-support', category: 'MENTORED',
    title: 'Created a repeatable sensor test checklist',
    description: 'Maya documented the habitat sensor test sequence and walked a new engineer through reproducing pressure and air-quality faults.',
    date: '2026-05-22', skills: ['Mentorship', 'Hardware-in-the-loop Testing', 'Cross-team Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'I put the expected readings beside every test step, so anyone can tell whether the controller is recovering correctly.', timestamp: '12:04', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'power-dust-mode', employeeId: MAYA.id, meetingId: 'surface-power-weekly-2026-04-10', projectId: 'surface-power', category: 'LED',
    title: 'Defined the controller handoff for dust-storm mode',
    description: 'Maya aligned power and habitat teams on which systems stay active when solar generation drops for several days.',
    date: '2026-04-10', skills: ['Technical Leadership', 'Power Management', 'Cross-team Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'Life support, thermal control, and the emergency terminal stay on the protected bus. Everything else steps down in two phases.', timestamp: '27:51', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'logistics-telemetry-review', employeeId: MAYA.id, meetingId: 'rover-systems-review-2026-03-13', projectId: 'surface-logistics', category: 'IMPROVED',
    title: 'Made rover fault reports easier to diagnose',
    description: 'Maya added the sensor state and recovery reason to each rover fault report, reducing guesswork during test reviews.',
    date: '2026-03-13', skills: ['Telemetry', 'Debugging', 'Embedded C++'], status: 'VERIFIED',
    evidence: [{ quote: 'The next report includes the sensor state before and after recovery, plus the exact rule that put the rover into safe stop.', timestamp: '15:33', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'comms-buffer-note', employeeId: MAYA.id, meetingId: 'communications-design-review-2026-02-06', projectId: 'surface-comms', category: 'RESEARCHED',
    title: 'Documented a message-buffer recovery edge case',
    description: 'Maya documented how the message queue behaves when it fills during a reconnect and added the scenario to the next communications test.',
    date: '2026-02-06', skills: ['Telemetry'], status: 'VERIFIED',
    evidence: [{ quote: 'I added the full-queue reconnect case to the test plan so we can verify message order and recovery before the next field run.', timestamp: '38:12', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
]

const TEAM_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'daniel-tube-seal-check', employeeId: DANIEL.id, meetingId: 'sample-caching-review-2026-09-12', projectId: 'sample-collection', category: 'SHIPPED',
    title: 'Validated the sample-tube sealing sequence', description: 'Daniel connected the seal motor, force sensor, and tube-presence switch into one repeatable controller test.',
    date: '2026-09-12', skills: ['Hardware Testing', 'Sensor Integration', 'Systems Integration'], status: 'VERIFIED',
    evidence: [{ quote: 'The controller now refuses to mark a tube sealed unless force, motor travel, and tube presence all agree.', timestamp: '14:05', speaker: 'Daniel Park' }], sharedWithManager: true,
  },
  {
    id: 'daniel-air-quality-restart', employeeId: DANIEL.id, meetingId: 'habitat-controller-review-2026-08-21', projectId: 'habitat-life-support', category: 'UNBLOCKED',
    title: 'Fixed an intermittent air-quality controller restart', description: 'Daniel isolated a startup timing conflict and added a recovery path for the backup controller.',
    date: '2026-08-21', skills: ['Embedded C++', 'Debugging', 'Hardware Testing'], status: 'VERIFIED',
    evidence: [{ quote: 'The sensor switch was arriving during memory checks. Delaying that handoff by forty milliseconds removed the restart in every bench run.', timestamp: '19:44', speaker: 'Daniel Park' }], sharedWithManager: true,
  },
  {
    id: 'daniel-sample-bus-diagnostics', employeeId: DANIEL.id, meetingId: 'sample-instrument-review-2026-07-17', projectId: 'sample-collection', category: 'IMPROVED',
    title: 'Added diagnostics for sample instrument connections', description: 'Daniel made connection faults visible before a collection sequence begins, preventing incomplete sample records.',
    date: '2026-07-17', skills: ['Telemetry', 'Fault Detection', 'Systems Integration'], status: 'VERIFIED',
    evidence: [{ quote: 'We now identify the missing instrument before the arm moves, and the fault report names the exact connection that failed.', timestamp: '11:32', speaker: 'Daniel Park' }], sharedWithManager: true,
  },
  {
    id: 'priya-arm-positioning', employeeId: PRIYA.id, meetingId: 'sample-robotics-review-2026-09-10', projectId: 'sample-collection', category: 'IMPROVED',
    title: 'Improved robotic-arm placement for sample tubes', description: 'Priya reduced positioning drift so the arm can place sealed tubes into the cache without a second attempt.',
    date: '2026-09-10', skills: ['Robotic Manipulation', 'Motion Planning', 'Hardware Testing'], status: 'VERIFIED',
    evidence: [{ quote: 'After calibration, all twelve tubes landed inside the cache tolerance on the first placement.', timestamp: '22:19', speaker: 'Priya Nair' }], sharedWithManager: true,
  },
  {
    id: 'priya-slope-recovery', employeeId: PRIYA.id, meetingId: 'surface-mobility-review-2026-08-07', projectId: 'surface-logistics', category: 'SHIPPED',
    title: 'Added a safe rover response for loose slopes', description: 'Priya added a recovery routine that backs the logistics rover out when wheel slip exceeds its safe limit.',
    date: '2026-08-07', skills: ['Motion Planning', 'Fault Detection', 'Autonomous Systems'], status: 'VERIFIED',
    evidence: [{ quote: 'The rover now stops the climb, reverses along its recorded path, and requests a new route before the wheels dig in.', timestamp: '26:41', speaker: 'Priya Nair' }], sharedWithManager: true,
  },
  {
    id: 'priya-sample-route-rehearsal', employeeId: PRIYA.id, meetingId: 'sample-field-rehearsal-2026-06-26', projectId: 'sample-collection', category: 'LED',
    title: 'Led the first end-to-end sample collection rehearsal', description: 'Priya coordinated rover navigation, robotic pickup, imaging, tube sealing, and cache placement in one field test.',
    date: '2026-06-26', skills: ['Technical Leadership', 'Test Planning', 'Cross-team Coordination'], status: 'VERIFIED',
    evidence: [{ quote: 'We completed collection through caching in one run, and every handoff kept the same sample identifier.', timestamp: '33:07', speaker: 'Priya Nair' }], sharedWithManager: true,
  },
  {
    id: 'elena-battery-heater-plan', employeeId: ELENA.id, meetingId: 'surface-power-review-2026-09-08', projectId: 'surface-power', category: 'IMPROVED',
    title: 'Reduced battery-heater demand before sunrise', description: 'Elena revised the overnight heating plan to protect battery temperature without consuming the crew’s morning reserve.',
    date: '2026-09-08', skills: ['Power Management', 'Thermal Systems', 'Power Budgeting'], status: 'VERIFIED',
    evidence: [{ quote: 'Staggering the heater zones kept every module above its cold limit and saved nine percent of the sunrise reserve.', timestamp: '17:36', speaker: 'Elena Morales' }], sharedWithManager: true,
  },
  {
    id: 'elena-dust-storm-reserve', employeeId: ELENA.id, meetingId: 'mission-energy-review-2026-08-04', projectId: 'surface-power', category: 'RESEARCHED',
    title: 'Defined a five-day dust-storm power reserve', description: 'Elena modeled a low-solar scenario and documented which science loads can pause while life support remains protected.',
    date: '2026-08-04', skills: ['Power Budgeting', 'Systems Analysis', 'Cross-team Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'With science loads paused after day two, the habitat can hold its protected reserve through five low-generation days.', timestamp: '29:50', speaker: 'Elena Morales' }], sharedWithManager: true,
  },
  {
    id: 'elena-habitat-heater-load', employeeId: ELENA.id, meetingId: 'habitat-power-interface-2026-07-10', projectId: 'habitat-life-support', category: 'UNBLOCKED',
    title: 'Resolved a habitat heater load conflict', description: 'Elena found that two heater banks were starting together and worked with firmware to stagger their demand.',
    date: '2026-07-10', skills: ['Systems Integration', 'Power Management', 'Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'The load spike disappears when the air-loop heater starts thirty seconds after the water-loop heater.', timestamp: '13:58', speaker: 'Elena Morales' }], sharedWithManager: true,
  },
  {
    id: 'alex-sample-custody', employeeId: ALEX.id, meetingId: 'sample-operations-review-2026-09-11', projectId: 'sample-collection', category: 'LED',
    title: 'Aligned teams on sample custody from collection to cache', description: 'Alex defined who owns the sample identifier, imagery, seal confirmation, and location record at every handoff.',
    date: '2026-09-11', skills: ['Mission Planning', 'Cross-team Coordination', 'Requirements Coordination'], status: 'VERIFIED',
    evidence: [{ quote: 'One identifier now follows the sample from the science target through the sealed tube and its final cache position.', timestamp: '20:12', speaker: 'Alex Rivera' }], sharedWithManager: true,
  },
  {
    id: 'alex-comms-outage-test', employeeId: ALEX.id, meetingId: 'surface-comms-exercise-2026-08-18', projectId: 'surface-comms', category: 'SHIPPED',
    title: 'Coordinated a surface communications outage exercise', description: 'Alex ran an integrated test showing that rover and habitat updates are stored, prioritized, and forwarded after reconnection.',
    date: '2026-08-18', skills: ['Test Planning', 'Mission Operations', 'Cross-team Coordination'], status: 'VERIFIED',
    evidence: [{ quote: 'After the twenty-minute blackout, emergency status moved first, then sample records, then routine rover telemetry.', timestamp: '34:29', speaker: 'Alex Rivera' }], sharedWithManager: true,
  },
  {
    id: 'alex-rover-handoff', employeeId: ALEX.id, meetingId: 'surface-logistics-review-2026-07-24', projectId: 'surface-logistics', category: 'UNBLOCKED',
    title: 'Clarified the rover handoff at the habitat airlock', description: 'Alex resolved ownership of cargo verification and rover release before autonomous return to the landing site.',
    date: '2026-07-24', skills: ['Mission Operations', 'Requirements Coordination', 'Collaboration'], status: 'VERIFIED',
    evidence: [{ quote: 'The habitat crew confirms cargo removal; the rover controller verifies the empty deck before it accepts the return route.', timestamp: '16:03', speaker: 'Alex Rivera' }], sharedWithManager: true,
  },
]

export const SEEDED_CONTRIBUTIONS: Contribution[] = [...MAYA_CONTRIBUTIONS, ...TEAM_CONTRIBUTIONS]

export const MEETING_RESULT_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'habitat-false-leak-alarms', employeeId: MAYA.id, meetingId: SCHEDULED_MEETING.id, projectId: 'habitat-life-support', category: 'IMPROVED',
    title: 'Reduced false habitat leak alarms', description: 'Maya adjusted pressure-sensor filtering after tests showed harmless spikes were triggering warnings.',
    date: '2026-09-18', skills: ['Sensor Integration', 'Embedded C++', 'Fault Detection'], status: 'AI_CAPTURED',
    evidence: [{ quote: 'The pressure spikes were lasting less than a second, so I updated the filter to ignore those while still catching a sustained drop that could mean a leak.', timestamp: '08:14', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'habitat-backup-air-controller', employeeId: MAYA.id, meetingId: SCHEDULED_MEETING.id, projectId: 'habitat-life-support', category: 'UNBLOCKED',
    title: 'Helped validate the backup air-quality controller', description: 'Maya helped Daniel reproduce an intermittent controller restart and confirmed the recovery fix.',
    date: '2026-09-18', skills: ['Hardware Testing', 'Debugging', 'Collaboration'], status: 'AI_CAPTURED',
    evidence: [{ quote: 'Daniel and I reproduced the restart by switching sensors during startup. His recovery patch passed all twelve runs on the backup controller.', timestamp: '16:47', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
  {
    id: 'habitat-next-alarm-test', employeeId: MAYA.id, meetingId: SCHEDULED_MEETING.id, projectId: 'habitat-life-support', category: 'LED',
    title: 'Coordinated the next habitat alarm test', description: 'Maya aligned firmware, electrical, and environmental-control engineers on the next integrated test.',
    date: '2026-09-18', skills: ['Technical Leadership', 'Cross-team Coordination'], status: 'AI_CAPTURED',
    evidence: [{ quote: 'I will run the integrated alarm test Tuesday. Electrical has the sensor harness, environmental controls will provide the leak profile, and I will own the firmware checklist.', timestamp: '28:32', speaker: 'Maya Chen' }], sharedWithManager: true,
  },
]

export const PREPARED_TRANSCRIPT: SpeakerAwareTranscript = {
  meetingId: SCHEDULED_MEETING.id,
  turns: MEETING_RESULT_CONTRIBUTIONS.map((item, index) => ({
    speakerId: MAYA.id, speakerName: MAYA.name, startMs: [494000, 1007000, 1712000][index],
    endMs: [518000, 1033000, 1749000][index], text: item.evidence[0].quote,
  })),
}

export const INITIAL_WORKSPACE_STATE: WorkspaceState = {
  contributions: [...MEETING_RESULT_CONTRIBUTIONS, ...SEEDED_CONTRIBUTIONS],
}

export const SKILL_NARRATIVES: Record<string, string> = {
  'Embedded C++': 'Applies embedded C++ to safety-focused controllers, connecting firmware decisions to behavior the team can test.',
  'Sensor Integration': 'Connects physical sensors to reliable system decisions and separates real mission risks from harmless signal noise.',
  'Fault Detection': 'Identifies failure patterns early and builds recovery paths that keep critical systems operating safely.',
  'Hardware-in-the-loop Testing': 'Turns hardware behavior into repeatable tests that give the wider team confidence before field trials.',
  'Hardware Testing': 'Reproduces intermittent hardware behavior methodically and confirms fixes across repeated runs.',
  'Power Management': 'Balances energy limits with mission priorities, especially during cold startup and low-solar conditions.',
  Telemetry: 'Makes system behavior visible through useful diagnostic data, shortening the path from a fault to its cause.',
  Debugging: 'Moves from symptoms to reproducible causes, then validates the fix under realistic conditions.',
  'Cross-team Collaboration': 'Translates technical needs into clear handoffs across engineering and mission teams.',
  Collaboration: 'Works alongside teammates to reproduce issues and verify shared outcomes.',
  Mentorship: 'Makes specialized testing knowledge reusable through clear checklists and hands-on guidance.',
  'Technical Leadership': 'Owns coordination around integrated outcomes, not only individual technical tasks.',
  'Cross-team Coordination': 'Brings the right disciplines together around a shared test plan, owner, and next step.',
  'Robotic Manipulation': 'Improves the precision and reliability of physical interactions between robotic hardware and mission materials.',
  'Motion Planning': 'Builds safe, testable movement plans that account for uncertain terrain and hardware limits.',
  'Systems Integration': 'Connects hardware and software interfaces into behavior the full team can validate.',
  'Power Budgeting': 'Turns uncertain generation and load demands into clear operational reserves.',
  'Thermal Systems': 'Connects temperature limits to practical heating and power-control decisions.',
  'Test Planning': 'Structures integrated tests around clear scenarios, owners, evidence, and pass conditions.',
  'Requirements Coordination': 'Makes cross-system responsibilities explicit before they become integration problems.',
}
