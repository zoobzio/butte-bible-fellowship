import type { Arguments, Returns, Row } from "bezoar";

import type { Contract } from "../.output/index.mjs";

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
  Assert<Equal<Row<Contract, "web.events.weekly">["day"], Day>>,
  Assert<Equal<Row<Contract, "web.events.upcoming">["date"], string>>,
  Assert<Equal<Row<Contract, "web.staff.list">["bio"], string | null>>,
  Assert<
    Equal<
      Row<Contract, "admin.staff.fetch">["status"],
      "draft" | "published" | "archived"
    >
  >,
  Assert<Equal<Row<Contract, "web.events.weekly">["end_time"], string | null>>,
  Assert<Equal<Row<Contract, "web.events.fetch">["body"], string | null>>,
  Assert<
    Equal<
      "body" extends keyof Row<Contract, "web.events.list"> ? true : false,
      false
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.create">["status"],
      "draft" | "published" | "archived"
    >
  >,
  Assert<Equal<Row<Contract, "admin.sermons.fetch">["created_at"], Date>>,
  Assert<Equal<Row<Contract, "web.sermons.list">["date"], string>>,
  Assert<Equal<Row<Contract, "web.events.weekly">["start_time"], string>>,
  Assert<Equal<Arguments<Contract, "web.sermons.list">, { limit: number }>>,
  Assert<Equal<Row<Contract, "web.sermons.list">["video"], string | null>>,
  Assert<
    Equal<
      "body" extends keyof Row<Contract, "web.sermons.list"> ? true : false,
      false
    >
  >,
  Assert<Equal<Row<Contract, "web.sermons.fetch">["body"], string | null>>,
  Assert<Equal<Arguments<Contract, "web.events.upcoming">, { from: string }>>,
  Assert<Equal<Returns<Contract, "admin.staff.delete">, number>>,
  Assert<
    Equal<
      Returns<Contract, "admin.staff.create">,
      { id: number; slug: string; created_at: Date }[]
    >
  >,
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
  Assert<Equal<Arguments<Contract, "admin.events.create">["title"], string>>,
  Assert<Equal<Arguments<Contract, "admin.events.update">["id"], number>>,
];

// @ts-expect-error Day must be an enum label.
export const wrongDay: Arguments<Contract, "admin.events.create">["day"] =
  "funday";

export const spare: Arguments<Contract, "admin.staff.create"> = {
  slug: "x",
  name: "x",
  role: "x",
  position: 0,
  status: "draft",
};

// @ts-expect-error Role is required.
export const incomplete: Arguments<Contract, "admin.staff.create"> = {
  slug: "x",
  name: "x",
  position: 0,
  status: "draft",
};
