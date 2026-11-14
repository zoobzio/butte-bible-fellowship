/**
 * What the connect page says of finding the church, which is no one's to
 * translate: its full street address, its fax number, and the map of it.
 */
export interface ConnectConfig {
  address: string;
  fax: string;
  map: string;
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
