import type { ContentStatus } from "@bbf/schema/types";

/**
 * A staff member as the editor holds them: every field of their body as a
 * control's value, a string where the body may leave one out, so an empty
 * control is an empty string until the body is built.
 */
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
