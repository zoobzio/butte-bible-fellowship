import type { StaffMember } from "@bbf/schema/types";

import { staffMembers } from "@bbf/schema";

import { useAsyncData } from "#imports";

/**
 * The staff the site lists, in their order, from the site's own
 * `/api/staff`, checked against what a member is. A list that cannot be
 * read, or is not what was asked for, is an empty one: the page still
 * renders, without them.
 */
export const useStaff = () => {
  return useAsyncData("staff", () =>
    $fetch("/api/staff")
      .then((data) => staffMembers.parse(data))
      .catch((): StaffMember[] => []),
  );
};
