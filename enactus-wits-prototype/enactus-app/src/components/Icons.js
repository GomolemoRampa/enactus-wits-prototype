// Lightweight inline icon set (stroke-based, currentColor) used across the
// dashboard in place of emoji glyphs.
import React from "react";

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconHome = (p) => (
  <svg {...base} {...p}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></svg>
);
export const IconMegaphone = (p) => (
  <svg {...base} {...p}><path d="M3 11v2a2 2 0 0 0 2 2h1l3 5V6l-3 5H5a2 2 0 0 0-2 2Z" /><path d="M13 8a5 5 0 0 1 0 8" /><path d="M17 6a9 9 0 0 1 0 12" /></svg>
);
export const IconCalendar = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>
);
export const IconDocument = (p) => (
  <svg {...base} {...p}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v5h5" /></svg>
);
export const IconRocket = (p) => (
  <svg {...base} {...p}><path d="M12 3c3 1 5 4 5 8 0 3-2 6-5 9-3-3-5-6-5-9 0-4 2-7 5-8Z" /><circle cx="12" cy="10" r="1.6" /><path d="M9 17l-3 3M15 17l3 3" /></svg>
);
export const IconUsers = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17.5" cy="9" r="2.5" /><path d="M15.5 13.2a5.5 5.5 0 0 1 6 6.8h-2.6" /></svg>
);
export const IconUser = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>
);
export const IconMail = (p) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 6.5 8 6 8-6" /></svg>
);
export const IconBell = (p) => (
  <svg {...base} {...p}><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconTrophy = (p) => (
  <svg {...base} {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" /><path d="M12 14v3M9 21h6M9.5 21v-1.5a2.5 2.5 0 0 1 5 0V21" /></svg>
);
export const IconTag = (p) => (
  <svg {...base} {...p}><path d="M3 11.5 11.5 3H19a2 2 0 0 1 2 2v7.5L12.5 21 3 11.5Z" /><circle cx="15" cy="8" r="1.4" /></svg>
);
export const IconClock = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
);
export const IconPin = (p) => (
  <svg {...base} {...p}><path d="M12 21s-6.5-5.6-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.2" /></svg>
);
export const IconTarget = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}><path d="M4 12.5 9.5 18 20 6" /></svg>
);
export const IconWarning = (p) => (
  <svg {...base} {...p}><path d="M12 3 22 20H2Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" /></svg>
);
export const IconInbox = (p) => (
  <svg {...base} {...p}><path d="M3 12h5l1.5 3h5L16 12h5" /><rect x="3" y="12" width="18" height="8" rx="2" /><path d="M6 12 8 4h8l2 8" /></svg>
);
export const IconStar = (p) => (
  <svg {...base} {...p}><path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9l-5.6 3.1 1.4-6.2-4.8-4.3 6.4-.6Z" /></svg>
);
export const IconChart = (p) => (
  <svg {...base} {...p}><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M2 20h20" /></svg>
);
export const IconDownload = (p) => (
  <svg {...base} {...p}><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></svg>
);
export const IconUpload = (p) => (
  <svg {...base} {...p}><path d="M12 20V9" /><path d="m7 13 5-5 5 5" /><path d="M5 20h14" /></svg>
);
export const IconFolder = (p) => (
  <svg {...base} {...p}><path d="M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" /></svg>
);
export const IconChat = (p) => (
  <svg {...base} {...p}><path d="M4 5h16v11H8l-4 4V5Z" /></svg>
);
export const IconLock = (p) => (
  <svg {...base} {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
);
export const IconExternalLink = (p) => (
  <svg {...base} {...p}><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M9 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4" /></svg>
);
export const IconX = (p) => (
  <svg {...base} {...p}><path d="m5 5 14 14M19 5 5 19" /></svg>
);
export const IconUndo = (p) => (
  <svg {...base} {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
);
export const IconEdit = (p) => (
  <svg {...base} {...p}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M13.5 6.5l3 3" /></svg>
);
export const IconArrowLeft = (p) => (
  <svg {...base} {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></svg>
);
export const IconGrid = (p) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" /></svg>
);
export const IconBook = (p) => (
  <svg {...base} {...p}><path d="M4 5.5c2.2-1 5-1.2 8 0v13c-3-1.2-5.8-1-8 0v-13Z" /><path d="M20 5.5c-2.2-1-5-1.2-8 0v13c3-1.2 5.8-1 8 0v-13Z" /></svg>
);
