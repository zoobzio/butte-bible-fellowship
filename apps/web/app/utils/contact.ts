export const phoneHref = (phone: string): string => {
  return `tel:${phone.replace(/\D/g, "")}`;
};

export const emailHref = (email: string): string => `mailto:${email}`;
