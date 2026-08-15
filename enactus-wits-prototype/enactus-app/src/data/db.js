// ============================================================
//  ENACTUS WITS SUPPORT SYSTEM — MOCK DATABASE SCHEMA
//  AltruTech | Iteration 2 — Elaboration 1
//
//  This file simulates the relational database schema as
//  in-memory JavaScript objects. Structure mirrors the ERD
//  exactly — all 12 core entities are represented with
//  correct attributes, data types, and foreign key references.
// ============================================================

// ────────────────────────────────────────────────────────────
//  TABLE: Role
//  Stores the four system roles. roleId is FK in User.
// ────────────────────────────────────────────────────────────
export const roles = [
  { roleId: 1, roleName: "Member",          permissions: ["view_announcements", "view_events", "register_event", "submit_report", "view_resources", "use_chatbot"] },
  { roleId: 2, roleName: "Admin",            permissions: ["view_announcements", "send_announcements", "manage_events", "review_reports", "manage_resources", "view_members"] },
  { roleId: 3, roleName: "Super Admin",      permissions: ["all"] },
  { roleId: 4, roleName: "Faculty Advisor",  permissions: ["view_reports", "view_progress", "view_members"] },
];

// ────────────────────────────────────────────────────────────
//  TABLE: BusinessStage
//  Categorises each member's business progress.
//  stageId is FK in User, Resource, Announcement (via AudienceMap).
// ────────────────────────────────────────────────────────────
export const businessStages = [
  { stageId: 1, stageName: "Idea Stage",        stageDescription: "Member has a business concept but has not yet started building. Focus areas: validation, research, and market sizing." },
  { stageId: 2, stageName: "Start-Up Stage",    stageDescription: "Member is actively building their business. Focus areas: product development, early customers, and MVP." },
  { stageId: 3, stageName: "Growth Stage",      stageDescription: "Business is operational with early traction. Focus areas: scaling, systems, and revenue growth." },
  { stageId: 4, stageName: "Established Stage", stageDescription: "Business is stable with consistent revenue. Focus areas: expansion, social impact, and nationals showcase." },
];

// ────────────────────────────────────────────────────────────
//  TABLE: User
//  Core user entity. Supports all four roles.
//  FK: roleId → Role, businessStageId → BusinessStage
// ────────────────────────────────────────────────────────────
export const users = [
  {
    userId:          1,
    fullName:        "Lerato Dlamini",
    email:           "lerato@wits.ac.za",
    passwordHash:    "hashed_password123",   // never store plain text in production
    studentNumber:   "2021045123",
    phone:           "071 234 5678",
    bio:             "Building an edtech startup for township schools.",
    businessIdea:    "EduBridge",
    status:          "Active",               // Active | Pending | Inactive
    emailVerified:   true,
    roleId:          1,                      // FK → Role
    businessStageId: 2,                      // FK → BusinessStage
    createdAt:       "2026-03-01T08:00:00Z",
    updatedAt:       "2026-03-15T10:30:00Z",
  },
  {
    userId:          2,
    fullName:        "Admin User",
    email:           "admin@wits.ac.za",
    passwordHash:    "hashed_admin123",
    studentNumber:   "ADMIN001",
    phone:           "011 717 0000",
    bio:             "Enactus Wits Subcommittee Admin",
    businessIdea:    null,
    status:          "Active",
    emailVerified:   true,
    roleId:          2,                      // FK → Role (Admin)
    businessStageId: null,
    createdAt:       "2026-01-01T00:00:00Z",
    updatedAt:       "2026-01-01T00:00:00Z",
  },
  {
    userId:          3,
    fullName:        "Sipho Ndlovu",
    email:           "sipho@wits.ac.za",
    passwordHash:    "hashed_password123",
    studentNumber:   "2020078432",
    phone:           "082 987 6543",
    bio:             "Agri-tech solutions for small-scale farmers.",
    businessIdea:    "FarmLink",
    status:          "Active",
    emailVerified:   true,
    roleId:          1,
    businessStageId: 3,
    createdAt:       "2026-02-14T09:00:00Z",
    updatedAt:       "2026-03-10T14:00:00Z",
  },
  {
    userId:          4,
    fullName:        "Amara Osei",
    email:           "amara@wits.ac.za",
    passwordHash:    "hashed_password123",
    studentNumber:   "2022031987",
    phone:           "063 111 2233",
    bio:             "Fashion-tech platform connecting local designers.",
    businessIdea:    "StyleHub",
    status:          "Active",
    emailVerified:   true,
    roleId:          1,
    businessStageId: 1,
    createdAt:       "2026-03-05T11:00:00Z",
    updatedAt:       "2026-03-05T11:00:00Z",
  },
  {
    userId:          5,
    fullName:        "Nomvula Khumalo",
    email:           "nomvula@wits.ac.za",
    passwordHash:    "hashed_password123",
    studentNumber:   "2019056321",
    phone:           "079 445 8812",
    bio:             "Waste-to-energy startup with pilot running in Soweto.",
    businessIdea:    "GreenCore",
    status:          "Active",
    emailVerified:   true,
    roleId:          1,
    businessStageId: 4,
    createdAt:       "2025-08-10T07:30:00Z",
    updatedAt:       "2026-04-01T09:00:00Z",
  },
  {
    userId:          6,
    fullName:        "Dr. Priya Naidoo",
    email:           "p.naidoo@wits.ac.za",
    passwordHash:    "hashed_advisor123",
    studentNumber:   null,
    phone:           "011 717 1122",
    bio:             "Faculty Advisor — Commerce & Entrepreneurship",
    businessIdea:    null,
    status:          "Active",
    emailVerified:   true,
    roleId:          4,                      // FK → Role (Faculty Advisor)
    businessStageId: null,
    createdAt:       "2026-01-01T00:00:00Z",
    updatedAt:       "2026-01-01T00:00:00Z",
  },
];

// ────────────────────────────────────────────────────────────
//  TABLE: Announcement
//  Stores all announcements sent by Admins.
//  FK: authorId → User
//  Audience is resolved via AudienceMap (for stage-targeted)
//  or audienceType = "all" for broadcast.
// ────────────────────────────────────────────────────────────
export const announcements = [
  {
    announcementId: 1,
    title:          "Nationals Showcase — Submission Deadline Extended",
    body:           "The deadline for submitting your nationals showcase report has been extended to 30 May 2026. Please ensure your monthly report is up to date before submitting. Contact your advisor if you need support.",
    authorId:       2,                       // FK → User (Admin)
    audienceType:   "all",                   // all | stage
    pinned:         true,
    createdAt:      "2026-04-18T09:00:00Z",
    updatedAt:      "2026-04-18T09:00:00Z",
  },
  {
    announcementId: 2,
    title:          "Workshop: Pitching to Investors — Idea & Start-Up Stage",
    body:           "We're hosting a pitching workshop specifically for members in the Idea and Start-Up stages. This is a great opportunity to refine your pitch before the semester showcase. RSVP by Friday.",
    authorId:       2,
    audienceType:   "stage",
    pinned:         false,
    createdAt:      "2026-04-15T14:30:00Z",
    updatedAt:      "2026-04-15T14:30:00Z",
  },
  {
    announcementId: 3,
    title:          "Monthly Report Reminder — April Submission",
    body:           "Your April monthly business report is due by 30 April 2026. Please log in to the portal and submit your report via the Reports section. Members with outstanding reports will be flagged.",
    authorId:       2,
    audienceType:   "all",
    pinned:         false,
    createdAt:      "2026-04-10T08:00:00Z",
    updatedAt:      "2026-04-10T08:00:00Z",
  },
  {
    announcementId: 4,
    title:          "Growth Stage Mentorship Programme — Applications Open",
    body:           "Applications for the Growth Stage Mentorship Programme are now open. If you're in the Growth or Established stage, you can apply for a dedicated industry mentor. Applications close 10 May.",
    authorId:       2,
    audienceType:   "stage",
    pinned:         false,
    createdAt:      "2026-04-08T11:00:00Z",
    updatedAt:      "2026-04-08T11:00:00Z",
  },
];

// ────────────────────────────────────────────────────────────
//  TABLE: AudienceMap
//  Junction table — maps stage-targeted announcements
//  to their target BusinessStages.
//  FK: announcementId → Announcement, stageId → BusinessStage
// ────────────────────────────────────────────────────────────
export const audienceMap = [
  { audienceMapId: 1, announcementId: 2, stageId: 1 },  // Workshop → Idea Stage
  { audienceMapId: 2, announcementId: 2, stageId: 2 },  // Workshop → Start-Up Stage
  { audienceMapId: 3, announcementId: 4, stageId: 3 },  // Mentorship → Growth Stage
  { audienceMapId: 4, announcementId: 4, stageId: 4 },  // Mentorship → Established Stage
];

// ────────────────────────────────────────────────────────────
//  TABLE: Event
//  Stores all events created by Admins.
//  FK: createdBy → User
// ────────────────────────────────────────────────────────────
export const events = [
  {
    eventId:     1,
    title:       "Semester Showcase Prep Session",
    description: "An interactive session to help members prepare their business pitches for the upcoming semester showcase.",
    location:    "Great Hall, Wits Main Campus",
    eventDate:   "2026-05-10T10:00:00Z",
    capacity:    100,
    status:      "Open",                     // Open | Closed | Cancelled
    createdBy:   2,                          // FK → User (Admin)
    createdAt:   "2026-04-12T08:00:00Z",
  },
  {
    eventId:     2,
    title:       "Enactus Wits General Meeting — April",
    description: "Monthly all-member meeting. Attendance is mandatory for all registered members.",
    location:    "Wits Business School, Room 2B",
    eventDate:   "2026-04-25T14:00:00Z",
    capacity:    200,
    status:      "Open",
    createdBy:   2,
    createdAt:   "2026-04-08T09:00:00Z",
  },
];

// ────────────────────────────────────────────────────────────
//  TABLE: EventRegistration
//  Junction table — tracks which members registered for events.
//  FK: userId → User, eventId → Event
// ────────────────────────────────────────────────────────────
export const eventRegistrations = [
  { registrationId: 1, userId: 1, eventId: 1, registeredAt: "2026-04-13T10:00:00Z", attended: false },
  { registrationId: 2, userId: 3, eventId: 1, registeredAt: "2026-04-13T11:30:00Z", attended: false },
  { registrationId: 3, userId: 1, eventId: 2, registeredAt: "2026-04-09T09:00:00Z", attended: false },
  { registrationId: 4, userId: 4, eventId: 2, registeredAt: "2026-04-09T10:00:00Z", attended: false },
  { registrationId: 5, userId: 5, eventId: 2, registeredAt: "2026-04-10T08:00:00Z", attended: false },
];

// ────────────────────────────────────────────────────────────
//  TABLE: Report
//  Monthly business reports submitted by members.
//  FK: userId → User, reviewedBy → User (Admin/Advisor)
// ────────────────────────────────────────────────────────────
export const reports = [
  {
    reportId:         1,
    userId:           1,                     // FK → User (Lerato)
    reportMonth:      "2026-03",
    businessSummary:  "Completed MVP development for EduBridge. Onboarded 3 pilot schools.",
    revenueThisMonth: 0,
    challengesFaced:  "Difficulty securing school partnerships without formal accreditation.",
    nextStepsPlan:    "Apply for Enactus national recognition. Begin teacher training workshops.",
    status:           "Reviewed",            // Submitted | Reviewed | Flagged
    submittedAt:      "2026-03-28T14:00:00Z",
    reviewedBy:       6,                     // FK → User (Faculty Advisor)
    reviewedAt:       "2026-04-02T10:00:00Z",
    reviewNotes:      "Strong progress. Recommend applying for funding through Wits Enterprise.",
  },
  {
    reportId:         2,
    userId:           3,
    reportMonth:      "2026-03",
    businessSummary:  "FarmLink pilot expanded to 12 farmers in Limpopo. Revenue R4,200 this month.",
    revenueThisMonth: 4200,
    challengesFaced:  "Connectivity issues in rural areas affecting app usage.",
    nextStepsPlan:    "Develop offline-first mode. Approach MTN for partnership.",
    status:           "Submitted",
    submittedAt:      "2026-03-30T09:00:00Z",
    reviewedBy:       null,
    reviewedAt:       null,
    reviewNotes:      null,
  },
  {
    reportId:         3,
    userId:           5,
    reportMonth:      "2026-03",
    businessSummary:  "GreenCore Soweto pilot produced 1.2 MWh. Signed MOU with City of Johannesburg.",
    revenueThisMonth: 18500,
    challengesFaced:  "Regulatory delays in energy licensing.",
    nextStepsPlan:    "Engage with NERSA for expedited licensing. Scale to second site.",
    status:           "Reviewed",
    submittedAt:      "2026-03-27T16:00:00Z",
    reviewedBy:       6,
    reviewedAt:       "2026-04-01T11:00:00Z",
    reviewNotes:      "Exceptional progress. Flag for Nationals Showcase achievement report.",
  },
];

// ────────────────────────────────────────────────────────────
//  TABLE: Milestone
//  Tracks key achievements per member.
//  FK: userId → User
// ────────────────────────────────────────────────────────────
export const milestones = [
  { milestoneId: 1, userId: 1, title: "MVP Completed",           description: "EduBridge MVP built and deployed.", achievedAt: "2026-03-20T00:00:00Z", flaggedForShowcase: false },
  { milestoneId: 2, userId: 3, title: "First Revenue",           description: "FarmLink generated first R1,000 in revenue.", achievedAt: "2026-02-28T00:00:00Z", flaggedForShowcase: false },
  { milestoneId: 3, userId: 3, title: "Pilot Expansion",         description: "Expanded pilot to 12 farmers across Limpopo.", achievedAt: "2026-03-15T00:00:00Z", flaggedForShowcase: true },
  { milestoneId: 4, userId: 5, title: "MOU Signed",              description: "GreenCore signed MOU with City of Johannesburg.", achievedAt: "2026-03-10T00:00:00Z", flaggedForShowcase: true },
  { milestoneId: 5, userId: 5, title: "1 MWh Energy Produced",   description: "Soweto pilot surpassed 1 MWh production milestone.", achievedAt: "2026-03-25T00:00:00Z", flaggedForShowcase: true },
];

// ────────────────────────────────────────────────────────────
//  TABLE: ResourceCategory
//  Categorises knowledge hub resources.
//  FK: stageId → BusinessStage (optional — null means all stages)
// ────────────────────────────────────────────────────────────
export const resourceCategories = [
  { categoryId: 1, categoryName: "Business Planning",     stageId: null },
  { categoryId: 2, categoryName: "Funding & Investment",  stageId: null },
  { categoryId: 3, categoryName: "Legal & Compliance",    stageId: null },
  { categoryId: 4, categoryName: "Marketing & Growth",    stageId: 3 },
  { categoryId: 5, categoryName: "Getting Started",       stageId: 1 },
];

// ────────────────────────────────────────────────────────────
//  TABLE: Resource
//  Knowledge hub articles, guides, and links.
//  FK: categoryId → ResourceCategory, stageId → BusinessStage,
//      uploadedBy → User (Admin)
// ────────────────────────────────────────────────────────────
export const resources = [
  {
    resourceId:  1,
    title:       "How to Validate Your Business Idea in 7 Days",
    description: "A step-by-step guide to rapid market validation using low-cost research methods.",
    fileType:    "PDF",
    url:         "#",
    categoryId:  5,
    stageId:     1,
    uploadedBy:  2,
    uploadedAt:  "2026-02-01T00:00:00Z",
  },
  {
    resourceId:  2,
    title:       "Enactus Business Plan Template",
    description: "Official Enactus South Africa business plan template for national submissions.",
    fileType:    "DOCX",
    url:         "#",
    categoryId:  1,
    stageId:     null,
    uploadedBy:  2,
    uploadedAt:  "2026-01-15T00:00:00Z",
  },
  {
    resourceId:  3,
    title:       "SEDA Funding Guide for Student Entrepreneurs",
    description: "Overview of SEDA grants and funding options available to student-run businesses.",
    fileType:    "PDF",
    url:         "#",
    categoryId:  2,
    stageId:     2,
    uploadedBy:  2,
    uploadedAt:  "2026-02-20T00:00:00Z",
  },
];

// ────────────────────────────────────────────────────────────
//  TABLE: ChatLog
//  Stores AI chatbot interactions per member.
//  FK: userId → User
// ────────────────────────────────────────────────────────────
export const chatLogs = [
  {
    chatLogId:   1,
    userId:      1,
    userMessage: "When is the next report due?",
    botResponse: "Your next monthly business report is due on 30 April 2026. You can submit it via the Reports section in your dashboard.",
    createdAt:   "2026-04-10T13:22:00Z",
  },
  {
    chatLogId:   2,
    userId:      1,
    userMessage: "How do I apply for the mentorship programme?",
    botResponse: "The Growth Stage Mentorship Programme is currently open for applications. As a Start-Up Stage member you are not yet eligible, but check back when you progress to Growth Stage. Would you like tips on how to get there?",
    createdAt:   "2026-04-16T09:05:00Z",
  },
];

// ────────────────────────────────────────────────────────────
//  HELPER FUNCTIONS
//  Simulate database query operations used by components.
// ────────────────────────────────────────────────────────────

/** Get a user by email and password (simulates auth query) */
export function getUserByCredentials(email, password) {
  // In production this would compare password hash — here we compare plain for demo
  return users.find(u => u.email === email && u.passwordHash === `hashed_${password}`) || null;
}

/** Get role name for a roleId */
export function getRoleName(roleId) {
  return roles.find(r => r.roleId === roleId)?.roleName || "Unknown";
}

/** Get stage name for a stageId */
export function getStageName(stageId) {
  return businessStages.find(s => s.stageId === stageId)?.stageName || "Not assigned";
}

/** Get announcements visible to a specific user based on their stage */
export function getAnnouncementsForUser(userId) {
  const user = users.find(u => u.userId === userId);
  if (!user) return [];

  return announcements.filter(ann => {
    if (ann.audienceType === "all") return true;
    if (ann.audienceType === "stage") {
      const targetStages = audienceMap
        .filter(a => a.announcementId === ann.announcementId)
        .map(a => a.stageId);
      return targetStages.includes(user.businessStageId);
    }
    return false;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

/** Get all members (for admin view) */
export function getAllMembers() {
  return users.filter(u => u.roleId === 1);
}

/** Get reports for a user */
export function getReportsForUser(userId) {
  return reports.filter(r => r.userId === userId);
}

/** Get milestones for a user */
export function getMilestonesForUser(userId) {
  return milestones.filter(m => m.userId === userId);
}

/** Add a new announcement (mutates in-memory array — simulates INSERT) */
export function insertAnnouncement(data, authorId, selectedStageIds) {
  const newAnn = {
    announcementId: announcements.length + 1,
    title:          data.title,
    body:           data.body,
    authorId,
    audienceType:   selectedStageIds.length === 0 ? "all" : "stage",
    pinned:         false,
    createdAt:      new Date().toISOString(),
    updatedAt:      new Date().toISOString(),
  };
  announcements.push(newAnn);

  if (selectedStageIds.length > 0) {
    selectedStageIds.forEach(stageId => {
      audienceMap.push({
        audienceMapId:  audienceMap.length + 1,
        announcementId: newAnn.announcementId,
        stageId,
      });
    });
  }

  return newAnn;
}

/** Register a new user (simulates INSERT into User table) */
export function insertUser(userData) {
  const newUser = {
    userId:          users.length + 1,
    ...userData,
    passwordHash:    `hashed_${userData.password}`,
    status:          "Active",
    emailVerified:   true,
    createdAt:       new Date().toISOString(),
    updatedAt:       new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
}
