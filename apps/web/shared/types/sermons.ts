/** A sermon on the church's YouTube channel, as its feed lists it. */
export interface Sermon {
  /** YouTube's id for the sermon: what its watch and embed URLs carry. */
  id: string;
  title: string;
  /** When it was published, as an ISO 8601 timestamp. */
  published: string;
  /** The URL of its thumbnail image. */
  thumbnail: string;
}
