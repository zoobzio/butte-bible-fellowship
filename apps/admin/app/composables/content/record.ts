import { contentRecord } from "@bbf/schema";
import { endpoint } from "~/composables/content/routes";
import { useRecord } from "~/composables/records";

export const useContentRecord = () =>
  useRecord("content", endpoint, contentRecord);
