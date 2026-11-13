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
 * What the hero the home page opens with shows and leads to, which is no
 * one's to translate: the path of its picture, and where its button goes.
 */
export interface HeroConfig {
  image: string;
  to: string;
}

export interface ContactConfig {
  address: string;
  phone: string;
  email: string;
}
