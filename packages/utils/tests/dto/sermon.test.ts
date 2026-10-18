import { sermon } from "@bbf/schema";
import { describe, expect, it } from "vitest";

import { toSermon } from "../../src/dto/sermon";

/** A row as `web.sermons.byId` returns it: the timestamp is a Date. */
const ROW = {
  id: "dQw4w9WgXcQ",
  title: "Faith & Works",
  published_at: new Date("2026-10-04T18:16:28+00:00"),
  thumbnail: "https://i4.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
};

describe("toSermon", () => {
  it("writes the moment it was published as an ISO timestamp in UTC", () => {
    expect(toSermon(ROW)).toEqual({
      id: "dQw4w9WgXcQ",
      title: "Faith & Works",
      published: "2026-10-04T18:16:28.000Z",
      thumbnail: "https://i4.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    });
  });

  it("builds what the schema accepts", () => {
    expect(sermon.safeParse(toSermon(ROW)).success).toBe(true);
  });
});
