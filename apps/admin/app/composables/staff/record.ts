import { staffRecord } from "@bbf/schema";
import { useRecord } from "~/composables/records";
import { endpoint } from "~/composables/staff/routes";

export const useStaffRecord = () => useRecord("staff", endpoint, staffRecord);
