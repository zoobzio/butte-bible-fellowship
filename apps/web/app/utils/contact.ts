/** The address a phone number is called at: its digits, after `tel:`. */
export const phoneHref = (phone: string): string => {
  return `tel:${phone.replace(/\D/g, "")}`;
};

/** The address an email is written to. */
export const emailHref = (email: string): string => `mailto:${email}`;
