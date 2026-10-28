import type { StaffMember } from "@bbf/schema/types";

import { staffMembers } from "@bbf/schema";

import { useAsyncData } from "#imports";

export const useStaff = () => {
  return useAsyncData("staff", () =>
    $fetch("/api/staff")
      .then((data) => staffMembers.parse(data))
      .catch((): StaffMember[] => []),
  );
};
