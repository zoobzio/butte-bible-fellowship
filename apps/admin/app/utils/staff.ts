import type { StaffBody, StaffRecord } from "@bbf/schema/types";

import type { StaffDraft } from "~/types/staff";

import { staffBody } from "@bbf/schema";

/** A control's value as the body takes it: trimmed, and left out when empty. */
const written = (value: string): string | undefined => {
  const text = value.trim();
  return text === "" ? undefined : text;
};

/**
 * A member as the editor holds them, from their record, or blank for a new
 * one: a draft, last in the list, with every control empty.
 */
export const toStaffDraft = (record?: StaffRecord): StaffDraft => ({
  slug: record?.slug ?? "",
  name: record?.name ?? "",
  role: record?.role ?? "",
  summary: record?.summary ?? "",
  bio: record?.bio ?? "",
  photo: record?.photo ?? "",
  email: record?.email ?? "",
  phone: record?.phone ?? "",
  position: record?.position ?? 0,
  status: record?.status ?? "draft",
});

/**
 * The body a member is written from, as the schema checks it, from what
 * the editor holds. A control left empty is left out of the body. A draft
 * the schema refuses throws its issues.
 */
export const toStaffBody = (draft: StaffDraft): StaffBody =>
  staffBody.parse({
    slug: draft.slug.trim(),
    name: draft.name.trim(),
    role: draft.role.trim(),
    summary: written(draft.summary),
    bio: written(draft.bio),
    photo: written(draft.photo),
    email: written(draft.email),
    phone: written(draft.phone),
    position: draft.position,
    status: draft.status,
  });
