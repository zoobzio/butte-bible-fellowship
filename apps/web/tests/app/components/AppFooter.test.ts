import type { FooterConfig } from "~/types/footer";

import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import { setAppConfig, useNuxtApp } from "#imports";
import AppFooter from "~/components/AppFooter.vue";

// The first column's lines are plain, a message and a literal; the second's
// are links, a literal and a message.
const FOOTER: FooterConfig = {
  columns: [
    {
      title: "site.name",
      lines: [{ label: "site.tagline" }, { text: "Testville" }],
    },
    {
      title: "footer.contact",
      lines: [
        { text: "555-0100", href: "tel:5550100" },
        {
          label: "footer.online",
          href: "https://example.com/video",
          target: "_blank",
        },
      ],
    },
  ],
};

const { $t } = useNuxtApp();

const mountFooter = () =>
  mount(AppFooter, {
    global: {
      stubs: {
        ColorMode: true,
        LanguagePicker: true,
        ThemePicker: true,
        ThemeSettings: true,
      },
    },
  });

beforeEach(() => {
  setAppConfig({ footer: FOOTER });
});

describe("AppFooter", () => {
  it("renders a column per configured column, headed by its title", () => {
    const columns = mountFooter().findAll(".site-footer-col");
    expect(columns.map((column) => column.find("strong").text())).toEqual([
      $t.site.name(),
      $t.footer.contact(),
    ]);
  });

  it("quotes the verse ahead of the columns, with its reference marked up as the prose marks one up", () => {
    const quote = mountFooter().find(
      ".site-footer-grid > blockquote.site-footer-verse:first-child > p",
    );
    expect(quote.text()).toBe(`${$t.footer.verse()} ${$t.footer.reference()}`);
    expect(quote.find("em").text()).toBe($t.footer.reference());
  });

  it("renders lines without an href as plain text, messages resolved", () => {
    const [first] = mountFooter().findAll(".site-footer-col");
    const lines = first!.findAll(".site-footer-col > p");
    expect(lines.map((line) => line.text())).toEqual([
      $t.site.name(),
      $t.site.tagline(),
      "Testville",
    ]);
    expect(first!.find("a").exists()).toBe(false);
  });

  it("renders lines with an href as links, passing the target through", () => {
    const [, second] = mountFooter().findAll(".site-footer-col");
    expect(
      second!.findAll("a").map((link) => ({
        label: link.text(),
        href: link.attributes("href"),
        target: link.attributes("target"),
      })),
    ).toEqual([
      { label: "555-0100", href: "tel:5550100", target: undefined },
      {
        label: $t.footer.online(),
        href: "https://example.com/video",
        target: "_blank",
      },
    ]);
  });

  it("shows the color mode control and this year's copyright line", () => {
    const legal = mountFooter().find(".site-footer-legal");
    expect(legal.findComponent({ name: "ColorMode" }).exists()).toBe(true);
    expect(legal.find("span").text()).toBe(
      $t.footer.copyright({ year: new Date().getFullYear() }),
    );
  });
});
