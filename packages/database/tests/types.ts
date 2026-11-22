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
  Assert<Equal<Row<Contract, "web.events.weekly">["recurring"], boolean>>,
  Assert<Equal<Row<Contract, "web.events.upcoming">["date"], string>>,
  Assert<Equal<Row<Contract, "web.staff.list">["bio"], unknown>>,
  Assert<
    Equal<
      Row<Contract, "web.staff.list">["role"],
      "pastor" | "elder" | "staff" | "member"
    >
  >,
  Assert<
    Equal<
      "status" extends keyof Row<Contract, "admin.people.fetch"> ? true : false,
      false
    >
  >,
  Assert<Equal<Row<Contract, "web.events.weekly">["end_time"], string | null>>,
  Assert<Equal<Row<Contract, "web.events.fetch">["body"], unknown>>,
  Assert<
    Equal<
      "body" extends keyof Row<Contract, "web.events.list"> ? true : false,
      false
    >
  >,
  Assert<
    Equal<Arguments<Contract, "admin.events.create">["recurring"], boolean>
  >,
  Assert<Equal<Arguments<Contract, "admin.events.create">["date"], string>>,
  Assert<Equal<Row<Contract, "admin.events.fetch">["date"], string>>,
  Assert<Equal<Arguments<Contract, "admin.events.body">["body"], unknown>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.image">["image"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      "status" extends keyof Row<Contract, "admin.events.fetch"> ? true : false,
      false
    >
  >,
  Assert<Equal<Row<Contract, "web.home.fetch">["hero_heading"], string>>,
  Assert<Equal<Row<Contract, "web.home.fetch">["hero_image"], string | null>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.home.image">["image"],
      string | null | undefined
    >
  >,
  Assert<Equal<Row<Contract, "web.home.fetch">["body"], unknown>>,
  Assert<Equal<Row<Contract, "web.about.fetch">["description"], string | null>>,
  Assert<
    Equal<
      "id" extends keyof Row<Contract, "admin.home.fetch"> ? true : false,
      false
    >
  >,
  Assert<Equal<Row<Contract, "admin.about.fetch">["updated_at"], Date>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.about.update">["description"],
      string | null | undefined
    >
  >,
  Assert<Equal<Row<Contract, "web.content.fetch">["body"], unknown>>,
  Assert<
    Equal<
      "id" extends keyof Row<Contract, "web.content.fetch"> ? true : false,
      false
    >
  >,
  Assert<Equal<Row<Contract, "admin.content.fetch">["updated_at"], Date>>,
  Assert<Equal<Row<Contract, "admin.content.fetch">["mime"], string>>,
  Assert<Equal<Row<Contract, "admin.content.fetch">["size"], number>>,
  Assert<Equal<Row<Contract, "admin.folders.fetch">["size"], number>>,
  Assert<Equal<Row<Contract, "admin.folders.list">["updated_at"], Date>>,
  Assert<Equal<Arguments<Contract, "admin.content.body">["body"], unknown>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.content.create">["description"],
      string | null | undefined
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
  Assert<Equal<Returns<Contract, "admin.people.delete">, number>>,
  Assert<
    Equal<
      Returns<Contract, "admin.people.create">,
      { id: number; created_at: Date }[]
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.create">["weeks"],
      (number | null)[] | null | undefined
    >
  >,
  Assert<Equal<Arguments<Contract, "admin.people.bio">["bio"], unknown>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.people.photo">["photo"],
      string | null | undefined
    >
  >,
  Assert<Equal<Arguments<Contract, "admin.events.create">["title"], string>>,
  Assert<Equal<Arguments<Contract, "admin.events.update">["id"], number>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.people.list">["sort"],
      string | null | undefined
    >
  >,
  Assert<Equal<Arguments<Contract, "admin.people.list">["direction"], string>>,
  Assert<Equal<Row<Contract, "admin.people.list">["total"], number>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.people.list">["q"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.people.list">["name_contains"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.people.list">["updated_on_or_after"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.list">["sort"],
      string | null | undefined
    >
  >,
  Assert<Equal<Arguments<Contract, "admin.events.list">["direction"], string>>,
  Assert<Equal<Row<Contract, "admin.events.list">["total"], number>>,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.list">["recurring_is"],
      boolean | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.list">["day_not"],
      Day | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.list">["title_not_contains"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      Arguments<Contract, "admin.events.list">["date_on_or_before"],
      string | null | undefined
    >
  >,
  Assert<
    Equal<
      "search" extends keyof Row<Contract, "admin.events.fetch"> ? true : false,
      false
    >
  >,
];

// @ts-expect-error Day must be an enum label.
export const wrongDay: Arguments<Contract, "admin.events.list">["day_is"] =
  "funday";

export const spare: Arguments<Contract, "admin.people.create"> = {
  first_name: "x",
  last_name: "y",
  role: "staff",
};

// @ts-expect-error Role is required.
export const incomplete: Arguments<Contract, "admin.people.create"> = {
  first_name: "x",
  last_name: "y",
};

// @ts-expect-error Role must be an enum label.
export const wrongRole: Arguments<Contract, "admin.people.create">["role"] =
  "deacon";
