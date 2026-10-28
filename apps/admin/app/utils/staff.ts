import type { StaffBody, StaffRecord } from "@bbf/schema/types";

import type { StaffDraft } from "~/types/staff";

import { staffBody } from "@bbf/schema";

const written = (value: string): string | undefined => {
  const text = value.trim();
  return text === "" ? undefined : text;
};

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
