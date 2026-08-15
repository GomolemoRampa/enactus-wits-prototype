import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * ============================================================
 * ENACTUS WITS SUPPORT SYSTEM — UNIFIED API SERVICE
 * Aligned 100% to Supabase Schema (ERD: Group11)
 * ============================================================
 */

// 1. Reference Lookup Constants
export const BUSINESS_STAGES = [
  { business_stage_id: 1, stageId: 1, stage_name: "Idea", stageName: "Idea Stage", stage_description: "Initial concept and ideation phase", stageDescription: "Initial concept and ideation phase" },
  { business_stage_id: 2, stageId: 2, stage_name: "Prototype", stageName: "Prototype Stage", stage_description: "Building and testing the MVP", stageDescription: "Building and testing the MVP" },
  { business_stage_id: 3, stageId: 3, stage_name: "RunningBusiness", stageName: "Running Business Stage", stage_description: "Live business generating revenue or users", stageDescription: "Live business generating revenue or users" },
];

export const ROLES = [
  { role_id: 1, roleId: 1, role_name: "Member", roleName: "Member" },
  { role_id: 2, roleId: 2, role_name: "Admin", roleName: "Admin" },
  { role_id: 3, roleId: 3, role_name: "SuperAdmin", roleName: "Super Admin" },
  { role_id: 4, roleId: 4, role_name: "FacultyAdvisor", roleName: "Faculty Advisor" },
];

export const AUDIENCE_TYPES = [
  { value: "AllMembers", label: "📢 All Members (Broadcast)" },
  { value: "IdeaStage", label: "💡 Idea Stage" },
  { value: "PrototypeStage", label: "🛠️ Prototype Stage" },
  { value: "RunningBusiness", label: "🚀 Running Business" },
  { value: "ExecutivesOnly", label: "👔 Executives Only" },
];

// 2. Local Storage Sync Keys for Offline / Prototype Fallback
const LOCAL_STORAGE_KEYS = {
  APP_USERS: "enactus_app_users",
  ANNOUNCEMENTS: "enactus_announcements",
  AUDIENCE_MAP: "enactus_audience_map",
  EVENTS: "enactus_events",
  EVENT_REGISTRATIONS: "enactus_event_registrations",
  REPORTS: "enactus_reports",
  MILESTONES: "enactus_milestones",
};

const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

// Seed fallback data matching schema
const INITIAL_APP_USERS = [
  {
    user_id: 1,
    auth_user_id: "mock-auth-1",
    full_name: "Lerato Dlamini",
    wits_email: "lerato@students.wits.ac.za",
    role_id: 1,
    business_stage_id: 2,
    account_status: "Active",
    cell_number: "071 234 5678",
    bio: "Building an edtech startup for township schools.",
    business_idea: "EduBridge",
    join_date: "2026-03-01",
  },
  {
    user_id: 2,
    auth_user_id: "mock-auth-2",
    full_name: "Admin User",
    wits_email: "admin@students.wits.ac.za",
    role_id: 2,
    business_stage_id: null,
    account_status: "Active",
    cell_number: "011 717 0000",
    bio: "Enactus Wits Subcommittee Admin",
    business_idea: null,
    join_date: "2026-01-01",
  },
  {
    user_id: 3,
    auth_user_id: "mock-auth-3",
    full_name: "Sipho Ndlovu",
    wits_email: "sipho@students.wits.ac.za",
    role_id: 1,
    business_stage_id: 3,
    account_status: "Active",
    cell_number: "082 987 6543",
    bio: "Agri-tech solutions for small-scale farmers.",
    business_idea: "FarmLink",
    join_date: "2026-02-14",
  },
  {
    user_id: 4,
    auth_user_id: "mock-auth-4",
    full_name: "Amara Osei",
    wits_email: "amara@students.wits.ac.za",
    role_id: 1,
    business_stage_id: 1,
    account_status: "Active",
    cell_number: "063 111 2233",
    bio: "Fashion-tech platform connecting local designers.",
    business_idea: "StyleHub",
    join_date: "2026-03-05",
  },
  {
    user_id: 5,
    auth_user_id: "mock-auth-5",
    full_name: "Dr. Priya Naidoo",
    wits_email: "p.naidoo@students.wits.ac.za",
    role_id: 4,
    business_stage_id: null,
    account_status: "Active",
    cell_number: "011 717 1122",
    bio: "Faculty Advisor — Commerce & Entrepreneurship",
    business_idea: null,
    join_date: "2026-01-01",
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    announcement_id: 1,
    title: "Nationals Showcase — Submission Deadline Extended",
    body: "The deadline for submitting your nationals showcase report has been extended to 30 May 2026. Please ensure your monthly report is up to date before submitting. Contact your advisor if you need support.",
    created_by_user_id: 2,
    created_at: "2026-04-18T09:00:00Z",
    audience_type: "AllMembers",
    recipient_count: 24,
    pinned: true,
  },
  {
    announcement_id: 2,
    title: "Workshop: Pitching to Investors — Prototype Stage",
    body: "We're hosting a pitching workshop specifically for members with working prototypes. This is a great opportunity to refine your deck before the semester showcase. RSVP by Friday.",
    created_by_user_id: 2,
    created_at: "2026-04-15T14:30:00Z",
    audience_type: "PrototypeStage",
    recipient_count: 8,
    pinned: false,
  },
  {
    announcement_id: 3,
    title: "Monthly Report Reminder — April Submission",
    body: "Your April monthly business report is due by 30 April 2026. Please log in to the portal and submit your report via the Reports section. Members with outstanding reports will be flagged.",
    created_by_user_id: 2,
    created_at: "2026-04-10T08:00:00Z",
    audience_type: "AllMembers",
    recipient_count: 24,
    pinned: false,
  },
  {
    announcement_id: 4,
    title: "Running Business Mentorship Programme — Applications Open",
    body: "Applications for the Running Business Mentorship Programme are now open. If you have an active venture with revenue or users, you can apply for an industry mentor. Applications close 10 May.",
    created_by_user_id: 2,
    created_at: "2026-04-08T11:00:00Z",
    audience_type: "RunningBusiness",
    recipient_count: 6,
    pinned: false,
  },
];

const INITIAL_AUDIENCE_MAP = [
  { audience_map_id: 1, announcement_id: 2, user_id: 1, email_delivered: true },
  { audience_map_id: 2, announcement_id: 4, user_id: 3, email_delivered: true },
];

const INITIAL_EVENTS = [
  {
    event_id: 1,
    title: "Semester Showcase Pitching Masterclass",
    description: "An interactive masterclass to help members prepare high-impact business pitches, financials, and slides for the upcoming semester showcase.",
    event_date: "2026-05-10T10:00:00Z",
    category: "Masterclass",
    visibility: "MembersOnly",
    status: "Upcoming",
    created_by_user_id: 2,
    capacity: 60,
  },
  {
    event_id: 2,
    title: "Enactus Wits General Meeting — April",
    description: "Monthly all-member general meeting. Project updates, subcommittee check-ins, and networking session with past alumni.",
    event_date: "2026-04-25T14:00:00Z",
    category: "General Meeting",
    visibility: "MembersOnly",
    status: "Upcoming",
    created_by_user_id: 2,
    capacity: 100,
  },
];

const INITIAL_EVENT_REGISTRATIONS = [
  { registration_id: 1, event_id: 1, user_id: 1, registered_at: "2026-04-13T10:00:00Z", attended: false },
  { registration_id: 2, event_id: 1, user_id: 3, registered_at: "2026-04-13T11:30:00Z", attended: false },
  { registration_id: 3, event_id: 2, user_id: 1, registered_at: "2026-04-09T09:00:00Z", attended: false },
  { registration_id: 4, event_id: 2, user_id: 4, registered_at: "2026-04-09T10:00:00Z", attended: false },
];

const INITIAL_REPORTS = [
  {
    report_id: 1,
    user_id: 1,
    report_type: "Overall",
    submission_period: "2026-03",
    content: {
      business_summary: "Completed MVP development for EduBridge. Onboarded 3 pilot schools in Gauteng.",
      revenue_this_month: 0,
      challenges_faced: "Difficulty securing school partnerships without formal accreditation.",
      next_steps_plan: "Apply for Enactus national recognition. Begin teacher training workshops.",
    },
    submitted_at: "2026-03-28T14:00:00Z",
    status: "Reviewed",
    reviewed_by_user_id: 5,
    admin_comments: "Strong progress on the prototype. Recommend applying for funding through Wits Enterprise seed pool.",
    is_late: false,
  },
  {
    report_id: 2,
    user_id: 3,
    report_type: "Overall",
    submission_period: "2026-03",
    content: {
      business_summary: "FarmLink pilot expanded to 12 farmers in Limpopo. Generated early direct sales.",
      revenue_this_month: 4200,
      challenges_faced: "Cellular connectivity deadzones in rural areas affecting app sync.",
      next_steps_plan: "Develop offline-first mode with SMS fallback. Approach telecom for CSR data support.",
    },
    submitted_at: "2026-03-30T09:00:00Z",
    status: "Pending",
    reviewed_by_user_id: null,
    admin_comments: null,
    is_late: false,
  },
];

const INITIAL_MILESTONES = [
  { milestone_id: 1, user_id: 1, title: "MVP Completed", milestone_date: "2026-03-20", source: "MemberLogged", is_flagged_for_showcase: false },
  { milestone_id: 2, user_id: 3, title: "First Revenue (R4,200)", milestone_date: "2026-02-28", source: "MemberLogged", is_flagged_for_showcase: true },
  { milestone_id: 3, user_id: 3, title: "Pilot Expansion (12 Farmers)", milestone_date: "2026-03-15", source: "MemberLogged", is_flagged_for_showcase: true },
];

/**
 * Domain Validation Rule (@students.wits.ac.za)
 */
export function validateEmailDomain(email) {
  if (!email || !email.includes("@")) return { valid: false, error: "Please enter a valid email address." };
  const domain = email.split("@")[1].toLowerCase().trim();
  
  if (domain === "students.wits.ac.za") {
    return { valid: true, domain, roleId: 1 };
  }
  
  return {
    valid: false,
    error: "Access restricted: Only official @students.wits.ac.za accounts are permitted to register.",
  };
}

/**
 * Map stageId to AudienceType Enum
 */
export function stageIdToAudienceType(stageId) {
  switch (Number(stageId)) {
    case 1: return "IdeaStage";
    case 2: return "PrototypeStage";
    case 3: return "RunningBusiness";
    default: return "AllMembers";
  }
}

/**
 * Map AudienceType Enum to stageId
 */
export function audienceTypeToStageId(audienceType) {
  switch (audienceType) {
    case "IdeaStage": return 1;
    case "PrototypeStage": return 2;
    case "RunningBusiness": return 3;
    default: return null;
  }
}

// ────────────────────────────────────────────────────────────
// API IMPLEMENTATION
// ────────────────────────────────────────────────────────────
export const api = {
  // ── AUTH & APP_USER (UC1) ──────────────────────────────────
  async signIn(email, password) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);

      // Query app_user row
      const { data: appUser, error: uErr } = await supabase
        .from("app_user")
        .select(`
          user_id, auth_user_id, full_name, wits_email, role_id,
          business_stage_id, account_status, cell_number, join_date
        `)
        .eq("auth_user_id", data.user.id)
        .single();

      if (uErr) throw new Error(uErr.message);

      return {
        userId: appUser.user_id,
        authUserId: appUser.auth_user_id,
        fullName: appUser.full_name,
        email: appUser.wits_email,
        roleId: appUser.role_id,
        businessStageId: appUser.business_stage_id,
        status: appUser.account_status,
        phone: appUser.cell_number,
      };
    }

    // Local fallback
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);
    const user = users.find(
      u => u.wits_email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      throw new Error("Invalid email or password. For demo: lerato@students.wits.ac.za / password123 or admin@students.wits.ac.za / admin123");
    }

    return {
      userId: user.user_id,
      authUserId: user.auth_user_id,
      fullName: user.full_name,
      email: user.wits_email,
      roleId: user.role_id,
      businessStageId: user.business_stage_id,
      status: user.account_status,
      phone: user.cell_number,
      bio: user.bio,
      businessIdea: user.business_idea,
    };
  },

  async signUp(userData) {
    const domainCheck = validateEmailDomain(userData.email);
    if (!domainCheck.valid) {
      throw new Error(domainCheck.error);
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            student_number: userData.studentNumber,
          },
        },
      });
      if (error) throw new Error(error.message);

      // Trigger creates app_user; fetch created app_user row
      const { data: appUser } = await supabase
        .from("app_user")
        .select("*")
        .eq("auth_user_id", data.user.id)
        .single();

      return {
        userId: appUser ? appUser.user_id : data.user.id,
        authUserId: data.user.id,
        fullName: userData.fullName,
        email: userData.email,
        roleId: appUser ? appUser.role_id : 1,
        businessStageId: null,
      };
    }

    // Local fallback
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);
    if (users.some(u => u.wits_email.toLowerCase() === userData.email.toLowerCase().trim())) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser = {
      user_id: users.length + 1,
      auth_user_id: `mock-auth-${Date.now()}`,
      full_name: userData.fullName,
      wits_email: userData.email,
      role_id: 1,
      business_stage_id: null,
      account_status: "Active",
      cell_number: "",
      bio: "",
      business_idea: "",
      join_date: new Date().toISOString().split("T")[0],
    };

    users.push(newUser);
    setStored(LOCAL_STORAGE_KEYS.APP_USERS, users);

    return {
      userId: newUser.user_id,
      authUserId: newUser.auth_user_id,
      fullName: newUser.full_name,
      email: newUser.wits_email,
      roleId: 1,
      businessStageId: null,
    };
  },

  async signInWithAzure() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "email openid profile",
          redirectTo: window.location.origin,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    }
    throw new Error("Microsoft Entra ID SSO is active when deployed with Supabase. Please sign in with credentials in prototype mode.");
  },

  async updateProfile(userId, profileData) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("app_user")
        .update({
          business_stage_id: profileData.businessStageId,
          cell_number: profileData.phone,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    // Local fallback
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);
    const idx = users.findIndex(u => Number(u.user_id) === Number(userId));
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        business_stage_id: profileData.businessStageId,
        cell_number: profileData.phone,
        bio: profileData.bio,
        business_idea: profileData.businessIdea,
      };
      setStored(LOCAL_STORAGE_KEYS.APP_USERS, users);
      return users[idx];
    }
    return null;
  },

  // ── ANNOUNCEMENT (UC2) ────────────────────────────────────
  async getAnnouncementsForUser(userId, userStageId) {
    const stageAudience = stageIdToAudienceType(userStageId);

    if (isSupabaseConfigured() && supabase) {
      // Fetch announcements where audience_type = AllMembers or matching stage, or in audience_map
      const { data, error } = await supabase
        .from("announcement")
        .select(`
          announcement_id, title, body, created_at, audience_type, recipient_count
        `)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).filter(a => {
        if (a.audience_type === "AllMembers") return true;
        if (stageAudience && a.audience_type === stageAudience) return true;
        return false;
      }).map(a => ({
        announcementId: a.announcement_id,
        title: a.title,
        body: a.body,
        createdAt: a.created_at,
        audienceType: a.audience_type,
        pinned: a.audience_type === "AllMembers",
      }));
    }

    // Local fallback
    const announcements = getStored(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const audienceMap = getStored(LOCAL_STORAGE_KEYS.AUDIENCE_MAP, INITIAL_AUDIENCE_MAP);

    return announcements.filter(a => {
      if (a.audience_type === "AllMembers") return true;
      if (stageAudience && a.audience_type === stageAudience) return true;
      return audienceMap.some(am => am.announcement_id === a.announcement_id && Number(am.user_id) === Number(userId));
    }).map(a => ({
      announcementId: a.announcement_id,
      title: a.title,
      body: a.body,
      createdAt: a.created_at,
      audienceType: a.audience_type,
      pinned: a.pinned || false,
    }));
  },

  async getAllAnnouncements() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("announcement")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map(a => ({
        announcementId: a.announcement_id,
        title: a.title,
        body: a.body,
        createdAt: a.created_at,
        audienceType: a.audience_type,
        recipientCount: a.recipient_count,
        pinned: a.audience_type === "AllMembers",
      }));
    }

    const announcements = getStored(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    return announcements.map(a => ({
      announcementId: a.announcement_id,
      title: a.title,
      body: a.body,
      createdAt: a.created_at,
      audienceType: a.audience_type,
      recipientCount: a.recipient_count || 0,
      pinned: a.pinned || false,
    }));
  },

  async createAnnouncement({ title, body, audienceType = "AllMembers" }, createdByUserId) {
    if (isSupabaseConfigured() && supabase) {
      const { data: newAnn, error } = await supabase
        .from("announcement")
        .insert({
          title,
          body,
          created_by_user_id: createdByUserId,
          audience_type: audienceType,
          recipient_count: 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Populate audience_map for stage targeting
      if (audienceType !== "AllMembers") {
        const targetStageId = audienceTypeToStageId(audienceType);
        if (targetStageId) {
          const { data: matchedUsers } = await supabase
            .from("app_user")
            .select("user_id")
            .eq("business_stage_id", targetStageId);

          if (matchedUsers && matchedUsers.length > 0) {
            const mapRows = matchedUsers.map(u => ({
              announcement_id: newAnn.announcement_id,
              user_id: u.user_id,
            }));
            await supabase.from("audience_map").insert(mapRows);
            await supabase
              .from("announcement")
              .update({ recipient_count: matchedUsers.length })
              .eq("announcement_id", newAnn.announcement_id);
          }
        }
      }

      return newAnn;
    }

    // Local fallback
    const announcements = getStored(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const audienceMap = getStored(LOCAL_STORAGE_KEYS.AUDIENCE_MAP, INITIAL_AUDIENCE_MAP);
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);

    const newAnn = {
      announcement_id: announcements.length + 1,
      title,
      body,
      created_by_user_id: createdByUserId,
      created_at: new Date().toISOString(),
      audience_type: audienceType,
      recipient_count: 0,
      pinned: audienceType === "AllMembers",
    };

    if (audienceType !== "AllMembers") {
      const targetStageId = audienceTypeToStageId(audienceType);
      const targetUsers = users.filter(u => u.business_stage_id === targetStageId);
      newAnn.recipient_count = targetUsers.length;
      targetUsers.forEach(u => {
        audienceMap.push({
          audience_map_id: audienceMap.length + 1,
          announcement_id: newAnn.announcement_id,
          user_id: u.user_id,
          email_delivered: false,
        });
      });
      setStored(LOCAL_STORAGE_KEYS.AUDIENCE_MAP, audienceMap);
    }

    announcements.unshift(newAnn);
    setStored(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return newAnn;
  },

  // ── EVENT & EVENT_REGISTRATION (UC3) ──────────────────────
  async getEvents(currentUserId = null) {
    if (isSupabaseConfigured() && supabase) {
      const { data: events, error: evErr } = await supabase
        .from("event")
        .select(`
          event_id, title, event_date, category, visibility,
          status, description, created_by_user_id,
          event_registration ( registration_id, user_id, registered_at )
        `)
        .order("event_date", { ascending: true });

      if (evErr) throw new Error(evErr.message);

      return (events || []).map(ev => {
        const regs = ev.event_registration || [];
        const isRegistered = currentUserId
          ? regs.some(r => Number(r.user_id) === Number(currentUserId))
          : false;

        return {
          eventId: ev.event_id,
          title: ev.title,
          description: ev.description || "",
          location: ev.category ? `Category: ${ev.category}` : "Wits Campus / Online",
          category: ev.category,
          eventDate: ev.event_date,
          visibility: ev.visibility,
          status: ev.status,
          capacity: 100,
          registeredCount: regs.length,
          isRegistered,
          audienceType: ev.visibility === "Public" ? "All" : "MembersOnly",
        };
      });
    }

    // Local fallback
    const events = getStored(LOCAL_STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const registrations = getStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, INITIAL_EVENT_REGISTRATIONS);

    return events.map(ev => {
      const regs = registrations.filter(r => Number(r.event_id) === Number(ev.event_id));
      const isRegistered = currentUserId
        ? regs.some(r => Number(r.user_id) === Number(currentUserId))
        : false;

      return {
        eventId: ev.event_id,
        title: ev.title,
        description: ev.description || "",
        location: ev.category ? `Category: ${ev.category}` : "Wits Campus / Online",
        category: ev.category,
        eventDate: ev.event_date,
        visibility: ev.visibility,
        status: ev.status,
        capacity: ev.capacity || 60,
        registeredCount: regs.length,
        isRegistered,
        audienceType: ev.visibility === "Public" ? "All" : "MembersOnly",
      };
    });
  },

  async createEvent(eventData, createdByUserId) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("event")
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.eventDate,
          category: eventData.category || "Workshop",
          visibility: eventData.visibility || "MembersOnly",
          status: "Upcoming",
          created_by_user_id: createdByUserId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const events = getStored(LOCAL_STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const newEvent = {
      event_id: events.length + 1,
      title: eventData.title,
      description: eventData.description,
      event_date: eventData.eventDate,
      category: eventData.category || "Workshop",
      visibility: eventData.visibility || "MembersOnly",
      status: "Upcoming",
      created_by_user_id: createdByUserId,
      capacity: parseInt(eventData.capacity, 10) || 60,
    };
    events.push(newEvent);
    setStored(LOCAL_STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  async registerForEvent(eventId, userId) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("event_registration")
        .insert({
          event_id: eventId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const registrations = getStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, INITIAL_EVENT_REGISTRATIONS);
    const exists = registrations.find(
      r => Number(r.event_id) === Number(eventId) && Number(r.user_id) === Number(userId)
    );
    if (exists) return exists;

    const newReg = {
      registration_id: registrations.length + 1,
      event_id: eventId,
      user_id: userId,
      registered_at: new Date().toISOString(),
      attended: false,
    };
    registrations.push(newReg);
    setStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, registrations);
    return newReg;
  },

  async cancelEventRegistration(eventId, userId) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from("event_registration")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return true;
    }

    let registrations = getStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, INITIAL_EVENT_REGISTRATIONS);
    registrations = registrations.filter(
      r => !(Number(r.event_id) === Number(eventId) && Number(r.user_id) === Number(userId))
    );
    setStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, registrations);
    return true;
  },

  async getEventAttendees(eventId) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("event_registration")
        .select(`
          registration_id, registered_at, attended,
          app_user ( user_id, full_name, wits_email, cell_number, business_stage_id )
        `)
        .eq("event_id", eventId);

      if (error) throw new Error(error.message);
      return (data || []).map(r => ({
        registrationId: r.registration_id,
        registeredAt: r.registered_at,
        attended: r.attended,
        user: {
          fullName: r.app_user?.full_name,
          email: r.app_user?.wits_email,
          businessStageId: r.app_user?.business_stage_id,
        },
      }));
    }

    const registrations = getStored(LOCAL_STORAGE_KEYS.EVENT_REGISTRATIONS, INITIAL_EVENT_REGISTRATIONS);
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);
    const matched = registrations.filter(r => Number(r.event_id) === Number(eventId));

    return matched.map(r => {
      const user = users.find(u => Number(u.user_id) === Number(r.user_id));
      return {
        registrationId: r.registration_id,
        registeredAt: r.registered_at,
        attended: r.attended,
        user: {
          fullName: user?.full_name || "Student Member",
          email: user?.wits_email || "—",
          businessStageId: user?.business_stage_id,
        },
      };
    });
  },

  // ── REPORT (UC4) ──────────────────────────────────────────
  async getMyReports(userId) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("report")
        .select(`
          report_id, report_type, submission_period, content,
          submitted_at, status, admin_comments, is_late,
          reviewer:app_user!report_reviewed_by_user_id_fkey ( full_name )
        `)
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map(r => ({
        reportId: r.report_id,
        reportMonth: r.submission_period,
        businessSummary: r.content?.business_summary || "",
        revenueThisMonth: Number(r.content?.revenue_this_month || 0),
        challengesFaced: r.content?.challenges_faced || "",
        nextStepsPlan: r.content?.next_steps_plan || "",
        status: r.status === "Pending" ? "Submitted" : r.status,
        submittedAt: r.submitted_at,
        reviewNotes: r.admin_comments,
        reviewerName: r.reviewer?.full_name || null,
      }));
    }

    // Local fallback
    const reports = getStored(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);

    return reports
      .filter(r => Number(r.user_id) === Number(userId))
      .map(r => {
        const reviewer = users.find(u => Number(u.user_id) === Number(r.reviewed_by_user_id));
        return {
          reportId: r.report_id,
          reportMonth: r.submission_period,
          businessSummary: r.content?.business_summary || "",
          revenueThisMonth: Number(r.content?.revenue_this_month || 0),
          challengesFaced: r.content?.challenges_faced || "",
          nextStepsPlan: r.content?.next_steps_plan || "",
          status: r.status === "Pending" ? "Submitted" : r.status,
          submittedAt: r.submitted_at,
          reviewNotes: r.admin_comments,
          reviewerName: reviewer?.full_name || null,
        };
      })
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  async getAllReports() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("report")
        .select(`
          report_id, user_id, report_type, submission_period, content,
          submitted_at, status, admin_comments, is_late,
          app_user!report_user_id_fkey ( user_id, full_name, wits_email, business_stage_id ),
          reviewer:app_user!report_reviewed_by_user_id_fkey ( full_name )
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map(r => ({
        reportId: r.report_id,
        userId: r.app_user?.user_id,
        userName: r.app_user?.full_name,
        userEmail: r.app_user?.wits_email,
        businessStageId: r.app_user?.business_stage_id,
        reportMonth: r.submission_period,
        businessSummary: r.content?.business_summary || "",
        revenueThisMonth: Number(r.content?.revenue_this_month || 0),
        challengesFaced: r.content?.challenges_faced || "",
        nextStepsPlan: r.content?.next_steps_plan || "",
        status: r.status === "Pending" ? "Submitted" : r.status,
        submittedAt: r.submitted_at,
        reviewNotes: r.admin_comments,
        reviewerName: r.reviewer?.full_name || null,
      }));
    }

    // Local fallback
    const reports = getStored(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);

    return reports.map(r => {
      const user = users.find(u => Number(u.user_id) === Number(r.user_id));
      const reviewer = users.find(u => Number(u.user_id) === Number(r.reviewed_by_user_id));
      return {
        reportId: r.report_id,
        userId: r.user_id,
        userName: user?.full_name || "Member",
        userEmail: user?.wits_email || "—",
        businessStageId: user?.business_stage_id,
        reportMonth: r.submission_period,
        businessSummary: r.content?.business_summary || "",
        revenueThisMonth: Number(r.content?.revenue_this_month || 0),
        challengesFaced: r.content?.challenges_faced || "",
        nextStepsPlan: r.content?.next_steps_plan || "",
        status: r.status === "Pending" ? "Submitted" : r.status,
        submittedAt: r.submitted_at,
        reviewNotes: r.admin_comments,
        reviewerName: reviewer?.full_name || null,
      };
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  },

  async submitReport(reportData, userId) {
    const content = {
      business_summary: reportData.businessSummary,
      revenue_this_month: parseFloat(reportData.revenueThisMonth) || 0.0,
      challenges_faced: reportData.challengesFaced,
      next_steps_plan: reportData.nextStepsPlan,
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("report")
        .insert({
          user_id: userId,
          report_type: "Overall",
          submission_period: reportData.reportMonth,
          content,
          status: "Pending",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const reports = getStored(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const newReport = {
      report_id: reports.length + 1,
      user_id: userId,
      report_type: "Overall",
      submission_period: reportData.reportMonth,
      content,
      submitted_at: new Date().toISOString(),
      status: "Pending",
      reviewed_by_user_id: null,
      admin_comments: null,
      is_late: false,
    };
    reports.unshift(newReport);
    setStored(LOCAL_STORAGE_KEYS.REPORTS, reports);
    return newReport;
  },

  async reviewReport(reportId, { reviewNotes, status = "Reviewed" }, reviewerUserId) {
    const dbStatus = status === "Submitted" ? "Pending" : status;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("report")
        .update({
          admin_comments: reviewNotes,
          status: dbStatus,
          reviewed_by_user_id: reviewerUserId,
        })
        .eq("report_id", reportId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const reports = getStored(LOCAL_STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const idx = reports.findIndex(r => Number(r.report_id) === Number(reportId));
    if (idx !== -1) {
      reports[idx] = {
        ...reports[idx],
        admin_comments: reviewNotes,
        status: dbStatus,
        reviewed_by_user_id: reviewerUserId,
      };
      setStored(LOCAL_STORAGE_KEYS.REPORTS, reports);
      return reports[idx];
    }
    return null;
  },

  // ── MEMBERS DIRECTORY & MILESTONES ─────────────────────────
  async getAllMembers() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("app_user")
        .select("*")
        .eq("role_id", 1)
        .order("full_name");

      if (error) throw new Error(error.message);

      return (data || []).map(u => ({
        userId: u.user_id,
        fullName: u.full_name,
        email: u.wits_email,
        phone: u.cell_number,
        status: u.account_status,
        roleId: u.role_id,
        businessStageId: u.business_stage_id,
        joinDate: u.join_date,
      }));
    }

    const users = getStored(LOCAL_STORAGE_KEYS.APP_USERS, INITIAL_APP_USERS);
    return users
      .filter(u => u.role_id === 1)
      .map(u => ({
        userId: u.user_id,
        fullName: u.full_name,
        email: u.wits_email,
        phone: u.cell_number,
        status: u.account_status,
        roleId: u.role_id,
        businessStageId: u.business_stage_id,
        bio: u.bio,
        businessIdea: u.business_idea,
        joinDate: u.join_date,
      }));
  },

  async getMilestonesForUser(userId) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from("milestone")
        .select("*")
        .eq("user_id", userId)
        .order("milestone_date", { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map(m => ({
        milestoneId: m.milestone_id,
        title: m.title,
        achievedAt: m.milestone_date,
        source: m.source,
        flaggedForShowcase: m.is_flagged_for_showcase,
      }));
    }

    const milestones = getStored(LOCAL_STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES);
    return milestones
      .filter(m => Number(m.user_id) === Number(userId))
      .map(m => ({
        milestoneId: m.milestone_id,
        title: m.title,
        achievedAt: m.milestone_date,
        source: m.source,
        flaggedForShowcase: m.is_flagged_for_showcase,
      }));
  },
};

export function getRoleName(roleId) {
  return ROLES.find(r => r.role_id === Number(roleId))?.roleName || "Member";
}

export function getStageName(stageId) {
  return BUSINESS_STAGES.find(s => s.business_stage_id === Number(stageId))?.stageName || "Not assigned";
}
