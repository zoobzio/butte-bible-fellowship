import type { Arguments, Returns, Row } from "bezoar";

import type { Contract } from "../.output/index.mjs";

/**
 * The types a consumer derives from the build. `pnpm typecheck` proves each
 * one against the declaration `bezoar build` wrote.
 */
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type Day =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export type Checks = [
  // A weekly event on the web always has its day; a one-off has its date.
  Assert<Equal<Row<Contract, "web.events.weekly">["day"], Day>>,
  Assert<Equal<Row<Contract, "web.events.upcoming">["date"], string>>,
  // What a page may leave out comes back as null.
  Assert<Equal<Row<Contract, "web.staff.list">["bio"], string | null>>,
  Assert<Equal<Row<Contract, "web.events.weekly">["end_time"], string | null>>,
  // A timestamp is a Date; a time or a date is a string.
  Assert<Equal<Row<Contract, "web.sermons.latest">["published_at"], Date>>,
  Assert<Equal<Row<Contract, "web.events.weekly">["start_time"], string>>,
  Assert<Equal<Arguments<Contract, "web.sermons.latest">, { limit: number }>>,
  Assert<Equal<Arguments<Contract, "web.events.upcoming">, { from: string }>>,
  // A write without RETURNING answers with the count of rows it changed.
  Assert<Equal<Returns<Contract, "admin.staff.delete">, number>>,
  Assert<
    Equal<
      Returns<Contract, "admin.staff.create">,
      { id: number; slug: string; created_at: Date }[]
    >
  >,
  // A slot written into a column that takes null is optional and takes null,
  // and an enum slot stays the enum.
  Assert<
    Equal<
      Arguments<Contract, "admin.events.create">["day"],
      Day | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.create">["weeks"],
      (number | null)[] | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.staff.create">["bio"],
      string | null | undefined
    >
  >,
  // A slot written into a NOT NULL column, or compared in a WHERE, is required.
  Assert<Equal<Arguments<Contract, "admin.events.create">["title"], string>>,
  Assert<Equal<Arguments<Contract, "admin.events.update">["id"], number>>,
];

// @ts-expect-error The day of an event is one of the enum's labels.
export const wrongDay: Arguments<Contract, "admin.events.create">["day"] =
  "funday";

// What a row may do without may be left out; what it needs may not.
export const spare: Arguments<Contract, "admin.staff.create"> = {
  slug: "x",
  name: "x",
  role: "x",
  position: 0,
};

// @ts-expect-error A member needs a role.
export const incomplete: Arguments<Contract, "admin.staff.create"> = {
  slug: "x",
  name: "x",
  position: 0,
};
