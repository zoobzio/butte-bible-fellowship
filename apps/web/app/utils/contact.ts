import type { ConnectPage } from "@bbf/schema/types";

import type { Connect } from "~/types/contact";

export const phoneHref = (phone: string): string => {
  return `tel:${phone.replace(/\D/g, "")}`;
};

export const emailHref = (email: string): string => `mailto:${email}`;

/** The map of an address, as a frame embeds it: Google's, drawn around it. */
export const mapSrc = (address: string): string =>
  `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=m&z=13&output=embed&iwloc=near`;

/**
 * How to find and reach the church, as the connect page says it, from the
 * page's front matter: where it is, and the map of it; its phone number
 * and email, each with the link that calls or writes; its fax number; and
 * the hours its office keeps, a line of what was written to a line of the
 * page. What the page says nothing of is left out, and its hours are none.
 */
export const toConnect = (page: ConnectPage): Connect => ({
  address: page.address,
  map: mapSrc(page.address),
  phone:
    page.phone === undefined
      ? undefined
      : { text: page.phone, href: phoneHref(page.phone) },
  fax: page.fax,
  email:
    page.email === undefined
      ? undefined
      : { text: page.email, href: emailHref(page.email) },
  hours: (page.hours ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== ""),
});
