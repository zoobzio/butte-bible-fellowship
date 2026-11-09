import { eventRecord } from "@bbf/schema";
import { endpoint } from "~/composables/events/routes";
import { useRecord } from "~/composables/records";

export const useEventRecord = () => useRecord("event", endpoint, eventRecord);
