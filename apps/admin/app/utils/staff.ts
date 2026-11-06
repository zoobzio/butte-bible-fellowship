/**
 * What stands in for a member's photo: the first letter of their first
 * name and of their last, as the site's card draws them.
 */
export const initials = (name: string): string => {
  const names = name.trim().split(/\s+/);
  return [names[0], names.length > 1 ? names[names.length - 1] : undefined]
    .flatMap((part) => (part ? [part[0]!.toUpperCase()] : []))
    .join("");
};
