import type { FooterConfig } from "~/types/footer";
import type { HeaderConfig } from "~/types/header";
import type { SiteConfig } from "~/types/site";

import { defineAppConfig } from "#imports";

const site: SiteConfig = {
  name: "Butte Bible Fellowship",
  tagline: "The Church on Pillsbury Road",
};

const header: HeaderConfig = {
  links: [
    { label: "Home", to: "/" },
    { label: "You’re Invited", to: "/youre-invited" },
    { label: "About Us", to: "/about-us" },
    { label: "Weekly Events", to: "/calendar" },
    { label: "Contact & Find Us", to: "/connect" },
  ],
};

const footer: FooterConfig = {
  columns: [
    {
      title: "Butte Bible Fellowship",
      lines: [
        { label: "The Church on Pillsbury Road" },
        { label: "Sunday worship · 10:00am" },
      ],
    },
    {
      title: "Contact",
      lines: [
        { label: "2255 Pillsbury Road" },
        { label: "Chico, California 95926" },
        { label: "530-892-0521", href: "tel:5308920521" },
        {
          label: "office@bbfchurchchico.org",
          href: "mailto:office@bbfchurchchico.org",
        },
      ],
    },
    {
      title: "Online",
      lines: [
        {
          label: "Facebook",
          href: "https://www.facebook.com/buttebiblefellowship/",
          target: "_blank",
        },
        {
          label: "YouTube",
          href: "https://www.youtube.com/@ButteBibleFellowship",
          target: "_blank",
        },
      ],
    },
  ],
};

export default defineAppConfig({ site, header, footer });
