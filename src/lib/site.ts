/** Prefix for static files in /public when the site is served under a sub-path (GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => `${BASE_PATH}${p}`;

/** Umami analytics (privacy-friendly, no cookies). Leave `umamiWebsiteId` empty to disable. */
export const analytics = {
  umamiSrc: process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js",
  umamiWebsiteId: process.env.NEXT_PUBLIC_UMAMI_ID || "7d45fd9d-eda9-4c7b-b1b2-ef982ba99221",
};

export const site = {
  name: "PGNX Programmes",
  org: "Pak-German Nexus",
  shortOrg: "PGNX",
  tagline: "Every English-taught Bachelor's and Master's programme in Germany, sorted by field, with deadlines and official links.",
  // Primary community link (WhatsApp channel). Can be overridden with NEXT_PUBLIC_COMMUNITY_URL.
  communityUrl: process.env.NEXT_PUBLIC_COMMUNITY_URL || "https://whatsapp.com/channel/0029VbC3aRXBqbr6lg4InC3r",
  social: [
    { name: "WhatsApp channel", url: "https://whatsapp.com/channel/0029VbC3aRXBqbr6lg4InC3r" },
    { name: "Facebook group", url: "https://www.facebook.com/share/g/1ZfriCNBoe/" },
    { name: "YouTube", url: "https://www.youtube.com/@PAKGERMANNEXUS" },
  ],
  // Google Form for "report wrong information" / general feedback. Responses go to the PGNX Google Sheet.
  reportUrl: process.env.NEXT_PUBLIC_REPORT_URL || "https://docs.google.com/forms/d/e/1FAIpQLSep-hVMvtX_sVAovdWw9mKk7YUAiZsAKrW3oBdDd-GyJEs3UQ/viewform",
  // entry id of the form's first question, used to pre-fill the programme name
  reportProgrammeField: "entry.1892240521",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};

/** Report-form link with the programme name pre-filled. */
export function reportLink(programme?: string): string {
  if (!site.reportUrl) return "";
  if (!programme) return site.reportUrl;
  const sep = site.reportUrl.includes("?") ? "&" : "?";
  return `${site.reportUrl}${sep}usp=pp_url&${site.reportProgrammeField}=${encodeURIComponent(programme)}`;
}
