import { sermonDetail } from "@bbf/schema";
import { useRecord } from "~/composables/records";
import { endpoint } from "~/composables/sermons/routes";

export const useSermonRecord = () =>
  useRecord("sermon", endpoint, sermonDetail);
