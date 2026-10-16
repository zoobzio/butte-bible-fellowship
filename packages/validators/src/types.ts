import type { z } from "zod";

import type { churchEvent, eventDay } from "./events";
import type { hero, page } from "./pages";
import type { sermon } from "./sermons";
import type { staffMember } from "./staff";

/** A day of the week, as an event names the one it repeats on. */
export type EventDay = z.infer<typeof eventDay>;

/** An event of the church, as the events page's front matter lists it. */
export type ChurchEvent = z.infer<typeof churchEvent>;

/** Someone who serves the church, as the contact page's front matter lists them. */
export type StaffMember = z.infer<typeof staffMember>;

/** The words and picture a page opens with, over its body. */
export type Hero = z.infer<typeof hero>;

/** A page's front matter: its title and description, and what the site's pages add. */
export type Page = z.infer<typeof page>;

/** A sermon on the church's YouTube channel, as its feed lists it. */
export type Sermon = z.infer<typeof sermon>;
