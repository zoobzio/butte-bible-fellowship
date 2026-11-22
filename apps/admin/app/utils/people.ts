/**
 * What stands in for a person's photo: the first letter of their first
 * name and of their last, as the site's card draws them.
 */
export const initials = (first: string, last: string): string =>
  [first, last]
    .flatMap((name) => {
      const letter = name.trim()[0];
      return letter ? [letter.toUpperCase()] : [];
    })
    .join("");
