import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import type { PageItem } from "~/types/page";

import { ContentRenderer } from "#components";
import ConnectCard from "~/components/markdown/ConnectCard.vue";
import ConnectGrid from "~/components/markdown/ConnectGrid.vue";
import InviteCard from "~/components/markdown/InviteCard.vue";
import InviteGrid from "~/components/markdown/InviteGrid.vue";
import MapEmbed from "~/components/markdown/MapEmbed.vue";
import MarkdownAnchor from "~/components/markdown/MarkdownAnchor.vue";
import MarkdownBody from "~/components/MarkdownBody.vue";

const PAGE = {
  path: "/about-us",
  title: "About – Test Church",
  body: { type: "minimark", value: [["p", {}, "Modern wisdom…"]] },
} as unknown as PageItem;

describe("MarkdownBody", () => {
  it("renders the page with the app's markdown components and no prose components", () => {
    const renderer = mount(MarkdownBody, {
      props: { page: PAGE },
    }).findComponent(ContentRenderer);
    expect(renderer.props("value")).toEqual(PAGE);
    expect(renderer.props("prose")).toBe(false);
    expect(renderer.props("components")).toEqual({
      a: MarkdownAnchor,
      "connect-card": ConnectCard,
      "connect-grid": ConnectGrid,
      "invite-card": InviteCard,
      "invite-grid": InviteGrid,
      "map-embed": MapEmbed,
    });
  });
});
