import { z } from "zod";

/** A sermon on the church's YouTube channel, as its feed lists it. */
export const sermon = z.object({
  /** YouTube's id for the sermon: what its watch and embed URLs carry. */
  id: z.string().min(1),
  title: z.string(),
  /** When it was published, as an ISO 8601 timestamp. */
  published: z.iso.datetime({ offset: true }),
  /** The URL of its thumbnail image. */
  thumbnail: z.url(),
});

/** The sermons the site's API lists, newest first. */
export const sermons = z.array(sermon);
