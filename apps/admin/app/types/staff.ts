import type { ContentStatus } from "@bbf/schema/types";

export interface StaffDraft {
  slug: string;
  name: string;
  role: string;
  summary: string;
  bio: string;
  photo: string;
  email: string;
  phone: string;
  position: number;
  status: ContentStatus;
}
