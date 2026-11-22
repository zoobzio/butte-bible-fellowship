import { personRecord } from "@bbf/schema";
import { useRecord } from "~/composables/records";
import { endpoint } from "~/composables/people/routes";

export const usePersonRecord = () =>
  useRecord("people", endpoint, personRecord);
