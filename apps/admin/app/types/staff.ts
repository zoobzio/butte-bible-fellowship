import type { ContentStatus, Hast, StaffRole } from "@bbf/schema/types";

export interface StaffDraft {
  name: string;
  role: StaffRole | "";
  summary: string;
  bio: Hast | undefined;
  photo: string;
  email: string;
  phone: string;
  status: ContentStatus;
}
