import type { FooterConfig } from "~/types/footer";
import type { HeaderConfig } from "~/types/header";
import type { InvitationConfig } from "~/types/invitation";

import { defineAppConfig } from "#imports";

// The site's words live in `@bbf/i18n`: a `label` or `title` here is the
// key of a message there, checked against its contract and resolved with
// `$t(message)` where it is rendered.

const header: HeaderConfig = {
  links: [
    { label: "navigation.about", to: "/about-us" },
    { label: "navigation.events", to: "/events" },
    { label: "navigation.sermons", to: "/sermons" },
    { label: "navigation.connect", to: "/connect" },
  ],
};

const footer: FooterConfig = {
  columns: [
    {
      title: "footer.contact",
      lines: [
        { text: "2255 Pillsbury Road" },
        { text: "Chico, California 95926" },
        { text: "530-892-0521", href: "tel:5308920521" },
        {
          text: "office@bbfchurchchico.org",
          href: "mailto:office@bbfchurchchico.org",
        },
      ],
    },
    {
      title: "footer.online",
      lines: [
        {
          text: "Facebook",
          href: "https://www.facebook.com/buttebiblefellowship/",
          target: "_blank",
        },
        {
          text: "YouTube",
          href: "https://www.youtube.com/@ButteBibleFellowship",
          target: "_blank",
        },
      ],
    },
  ],
};

const invitation: InvitationConfig = {
  address: "2255 Pillsbury Road, Chico",
};

export default defineAppConfig({ header, footer, invitation });
