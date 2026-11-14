/** A line of the connect page that calls or writes: what it says, and its link. */
export interface ContactLink {
  text: string;
  href: string;
}

/**
 * How to find and reach the church, as the connect page draws it from what
 * the admin wrote: its full street address and the map of it, its phone
 * number, fax number and email, each there only when it is written, and
 * the hours its office keeps, a line each.
 */
export interface Connect {
  address: string;
  map: string;
  phone?: ContactLink;
  fax?: string;
  email?: ContactLink;
  hours: string[];
}

/**
 * The picture the hero the home page opens with shows until the admin
 * uploads one of its own: the site's picture of the church.
 */
export interface HeroConfig {
  image: string;
}

export interface ContactConfig {
  address: string;
  phone: string;
  email: string;
}
