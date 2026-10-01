export type Link = {
  label: string;
  to: string;
};

export const NAVIGATION: Link[] = [
  { label: "Home", to: "/" },
  { label: "You’re Invited", to: "/youre-invited" },
  { label: "About Us", to: "/about-us" },
  { label: "Weekly Events", to: "/calendar" },
  { label: "Contact & Find Us", to: "/connect" },
];
