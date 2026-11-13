import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  requestedDocuments,
  setAppConfig,
  useHead,
  useNuxtApp,
} from "#imports";
import ConnectCard from "~/components/ConnectCard.vue";
import ConnectGrid from "~/components/ConnectGrid.vue";
import MapEmbed from "~/components/MapEmbed.vue";
import PageHeader from "~/components/PageHeader.vue";
import StaffCard from "~/components/StaffCard.vue";
import Page from "~/pages/connect.vue";
import { mountSuspended } from "@bbf/nuxt/testing/mount";

const STAFF = [
  {
    id: 1,
    name: "Jane Doe",
    role: "elder",
    summary: "Has served since 2010.",
  },
  { id: 2, name: "John Roe", role: "elder" },
];

const fetchStaff = vi.fn(async () => STAFF);

beforeEach(() => {
  vi.stubGlobal("$fetch", fetchStaff);
  setAppConfig({
    contact: {
      address: "1 Test Street, Testville",
      phone: "555-010-0100",
      email: "office@test.example",
    },
    connect: {
      address: "1 Test Street, Testville, California 90000",
      fax: "555-010-0199",
      map: "https://maps.example.com/embed",
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchStaff.mockReset();
  fetchStaff.mockImplementation(async () => STAFF);
});

const mountPage = () => mountSuspended(Page);

describe("connect page", () => {
  it("heads the page with its title and description", async () => {
    const { wrapper } = await mountPage();
    const { $t } = useNuxtApp();
    const header = wrapper.findComponent(PageHeader);
    expect(header.element).toBe(
      wrapper.find(".connect > :first-child").element,
    );
    expect(header.props()).toEqual({
      title: $t.connect.title(),
      description: $t.connect.description(),
    });
  });

  it("leads with the staff, a card each, under the header", async () => {
    const { wrapper } = await mountPage();
    expect(fetchStaff).toHaveBeenCalledWith("/api/staff");
    const section = wrapper.find(
      ".connect > .page-header + section.connect-staff",
    );
    expect(section.find("h2").exists()).toBe(false);
    expect(
      section.findAllComponents(StaffCard).map((card) => card.props("member")),
    ).toEqual(STAFF);
  });

  it("says how to reach the church after the staff, in the interface's own words, from no page of content", async () => {
    const { wrapper } = await mountPage();
    const article = wrapper.find(".connect > .connect-staff + article.prose");
    const cards = article
      .findComponent(ConnectGrid)
      .findAllComponents(ConnectCard);
    expect(cards.map((card) => card.find("h2").text())).toEqual([
      "Visit Us",
      "Office Hours",
    ]);
    // Each line is its label, then what it names.
    const lines = cards[0]!.findAll("p");
    expect(lines.map((line) => line.find("strong").text())).toEqual([
      "Address:",
      "Phone:",
      "Fax:",
      "Email:",
    ]);
    expect(
      lines.map((line) =>
        line.text().slice(line.find("strong").text().length).trim(),
      ),
    ).toEqual([
      "1 Test Street, Testville, California 90000",
      "555-010-0100",
      "555-010-0199",
      "office@test.example",
    ]);
    expect(
      cards[0]!.findAll("a").map((link) => link.attributes("href")),
    ).toEqual(["tel:5550100100", "mailto:office@test.example"]);
    expect(cards[1]!.findAll("p").map((line) => line.text())).toEqual([
      "Tuesday–Thursday: 9am–4pm",
      "Friday: 9am–noon",
      "Saturday, Sunday, Monday: closed",
    ]);
    expect(requestedDocuments).toEqual([]);
  });

  it("maps the way to the church under the cards", async () => {
    const { wrapper } = await mountPage();
    const map = wrapper.find(".connect-grid + iframe").element;
    expect(wrapper.findComponent(MapEmbed).element).toBe(map);
    expect(wrapper.findComponent(MapEmbed).props()).toEqual({
      src: "https://maps.example.com/embed",
      title: "Map to 1 Test Street, Testville, California 90000",
    });
  });

  it("puts the article straight under the header when the API lists no one", async () => {
    fetchStaff.mockImplementation(async () => []);
    const { wrapper } = await mountPage();
    expect(wrapper.find(".connect-staff").exists()).toBe(false);
    expect(
      wrapper.find(".connect > .page-header + article.prose").exists(),
    ).toBe(true);
  });

  it("titles the document with the page's own message: it is no content", async () => {
    await mountPage();
    expect(useHead.mock.calls[0]![0]()).toEqual({
      title: "Connect – Butte Bible Fellowship",
    });
  });
});
