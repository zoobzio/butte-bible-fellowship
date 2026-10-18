import type { Contract } from "@bbf/database";
import type { Arguments, Row } from "bezoar";

import type { toEventArguments, toStaffArguments } from "../src/dao";
import { toChurchEvent, toSermon, toStaffMember } from "../src/dto";

/**
 * What the transforms promise at the type level. `pnpm typecheck` proves
 * each against `@bbf/database`'s build and `@bbf/schema`'s types: a column
 * renamed or a field added on either side fails here, before any app.
 */
declare const weekly: Row<Contract, "web.events.weekly">;
declare const upcoming: Row<Contract, "web.events.upcoming">;
declare const bySlug: Row<Contract, "web.events.bySlug">;
declare const adminEvent: Row<Contract, "admin.events.byId">;
declare const webStaff: Row<Contract, "web.staff.list">;
declare const webOne: Row<Contract, "web.staff.fetch">;
declare const adminStaff: Row<Contract, "admin.staff.fetch">;
declare const latest: Row<Contract, "web.sermons.latest">;
declare const adminSermon: Row<Contract, "admin.sermons.byId">;

// Every query of a kind returns a row its transform takes.
export const events = [weekly, upcoming, bySlug, adminEvent].map(toChurchEvent);
export const staff = [webStaff, webOne, adminStaff].map(toStaffMember);
export const sermons = [latest, adminSermon].map(toSermon);

// @ts-expect-error A row without a start is no event.
export const noStart = toChurchEvent({ slug: "x", title: "x" });

// What a create takes, an update takes with the id of the row it replaces.
declare const eventArguments: ReturnType<typeof toEventArguments>;
declare const staffArguments: ReturnType<typeof toStaffArguments>;
export const createEvent: Arguments<Contract, "admin.events.create"> =
  eventArguments;
export const updateEvent: Arguments<Contract, "admin.events.update"> = {
  ...eventArguments,
  id: 1,
};
export const createStaff: Arguments<Contract, "admin.staff.create"> =
  staffArguments;
export const updateStaff: Arguments<Contract, "admin.staff.update"> = {
  ...staffArguments,
  id: 1,
};

// @ts-expect-error An update needs the id of the row it replaces.
export const updateNothing: Arguments<Contract, "admin.events.update"> =
  eventArguments;
