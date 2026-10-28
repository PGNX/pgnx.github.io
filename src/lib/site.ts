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
  reportUrl: process.env.NEXT_PUBLIC_REPORT_URL || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
};
