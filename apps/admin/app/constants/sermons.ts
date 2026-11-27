import type { SermonRecord, SermonView } from "@bbf/schema/types";
import type { AppProsaryMessage } from "#imports";

import type { RecordLink } from "~/types/listing";
import type { TimelineConfig } from "~/types/timeline";

import { CONTENT_STATUSES, sermonView } from "@bbf/schema";
import { dateValues } from "@zoobzio/query";
import { TIME_ZONE } from "#layers/bbf/shared/constants/time";
import { dated, matching, optional, textual } from "~/constants/listing";

/**
 * The way to a sermon's details: the page its row of the timeline leads
 * to, by the number of the sermon's row.
 */
export const link: RecordLink<Pick<SermonRecord, "id">> = (record) =>
  `/sermons/${record.id}/details`;

/**
 * The sermons as the admin lays them out: a timeline by the day each was
 * preached, the latest first, under the month it falls in, thirty at a
 * time. The day a sermon was preached is a calendar day and no instant, so
 * the timeline reads it in UTC, where it stays the day it is. The free
 * text searches the title, the speaker and the summary; beside it, the
 * title filters on the text it holds, carries, starts or ends with, the
 * speaker and the summary on whether they are filled in too, the status on
 * a value held or not, and the day preached on before, after or on, or on
 * or after or on or before. The days the search offers run back from
 * today, in the church's time zone. Each field's label is a message of the
 * prose, which the layer's factory resolves, as it names the search's text
 * literal.
 */
export const SERMONS_TIMELINE: TimelineConfig<SermonRecord> = {
  key: "id",
  at: "date",
  label: "title",
  group: "month",
  limit: 30,
  timeZone: "UTC",
  fields: {
    title: { label: "admin.sermon.title", icon: "text", ...textual },
    speaker: { label: "admin.sermon.speaker", icon: "user", ...optional },
    status: {
      label: "admin.sermon.status",
      icon: "badge",
      values: [...CONTENT_STATUSES],
      ...matching,
    },
    date: {
      label: "admin.sermon.preached",
      icon: "calendar",
      values: dateValues(TIME_ZONE),
      ...dated,
    },
    summary: { label: "admin.editor.summary", icon: "text", ...optional },
  },
};

/**
 * The views the sermons timeline starts with, before any a user saves: the
 * one, every sermon, the timeline as it is first shown. Its name is a
 * message of the prose, which the tabs resolve.
 */
export const SERMON_VIEWS: {
  id: string;
  name: Extract<AppProsaryMessage, string>;
  payload: SermonView;
}[] = [
  {
    id: "all",
    name: "admin.sermons.allView",
    payload: sermonView.parse({}),
  },
];

/** Where a sermon's recording is watched, by YouTube's id for it. */
export const watch = (video: string): string =>
  `https://www.youtube.com/watch?v=${encodeURIComponent(video)}`;

/**
 * Where a sermon's recording plays within a page, by YouTube's id for it:
 * the player YouTube serves without its cookies, as the site's own does.
 */
export const embed = (video: string): string =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video)}`;

/** What a page lets the player it frames do. */
export const PLAYER_ALLOW =
  "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen";

/**
 * A sermon's picture, as its row of the timeline shows it: its own where
 * it has one, and otherwise the frame YouTube keeps of its recording, at
 * the size that is the recording's own shape. One with neither has none.
 */
export const thumbnail = (
  sermon: Pick<SermonRecord, "image" | "video">,
): string | undefined =>
  sermon.image ??
  (sermon.video === undefined
    ? undefined
    : `https://i.ytimg.com/vi/${encodeURIComponent(sermon.video)}/mqdefault.jpg`);
