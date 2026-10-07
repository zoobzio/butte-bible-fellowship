import type { ContactConfig } from "~/types/contact";
import type { FooterConfig } from "~/types/footer";
import type { HeaderConfig } from "~/types/header";
import type { InvitationConfig } from "~/types/invitation";

import { defineAppConfig } from "#imports";
import { emailHref, phoneHref } from "~/utils/contact";

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

const contact: ContactConfig = {
  address: "2255 Pillsbury Road, Chico",
  phone: "530-892-0521",
  email: "office@bbfchurchchico.org",
};

const footer: FooterConfig = {
  columns: [
    {
      title: "footer.contact",
      lines: [
        { text: "2255 Pillsbury Road" },
        { text: "Chico, California 95926" },
        { text: contact.phone, href: phoneHref(contact.phone) },
        { text: contact.email, href: emailHref(contact.email) },
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
  address: contact.address,
};

export default defineAppConfig({ header, contact, footer, invitation });
