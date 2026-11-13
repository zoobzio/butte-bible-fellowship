import { useAppConfig } from "#imports";
import { emailHref, phoneHref } from "~/utils/contact";

/**
 * How to find and reach the church, as the connect page says it: where it
 * is, the map of it, its fax number, and its phone number and email, each
 * with the link that calls or writes.
 */
export const useConnect = () => {
  const { contact, connect } = useAppConfig();

  return {
    address: connect.address,
    fax: connect.fax,
    map: connect.map,
    phone: { text: contact.phone, href: phoneHref(contact.phone) },
    email: { text: contact.email, href: emailHref(contact.email) },
  };
};
