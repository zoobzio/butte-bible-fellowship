import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

import { STAFF } from "#test/support/records";
import RecordTable from "~/components/RecordTable.vue";

/**
 * A widget as the table's factory yields one, over a stand-in for the design
 * system's table: it renders each row's title cell through the slot the
 * record table fills, or the empty slot when there are no rows.
 */
const widget = (data: (typeof STAFF)[]) => ({
  service: { id: "staff", data },
  component: defineComponent({
    props: { service: { type: Object, required: true }, pt: Object },
    setup(props, { slots }) {
      return () =>
        h("table", { "data-pt": JSON.stringify(props.pt) }, [
          ...props.service.data.map((row: typeof STAFF) =>
            h("tr", [h("td", slots["cell:name"]?.({ row }))]),
          ),
          props.service.data.length ? null : h("tr", [slots.empty?.()]),
        ]);
    },
  }),
  settings: () => ({ scroller: {} }),
});

const mountTable = (data: (typeof STAFF)[]) =>
  mount(RecordTable, {
    props: {
      widget: widget(data) as never,
      link: (record: typeof STAFF) => `/staff/${record.id}`,
      title: "name",
    },
  });

describe("RecordTable", () => {
  it("renders the widget's component over its service and settings", () => {
    const wrapper = mountTable([STAFF]);
    expect(wrapper.find(".record-table table").attributes("data-pt")).toBe(
      JSON.stringify({ scroller: {} }),
    );
  });

  it("makes the title cell of each row the way to the record's editor", () => {
    const wrapper = mountTable([STAFF, { ...STAFF, id: 2, name: "John Roe" }]);
    const links = wrapper.findAll("a.record-table-link");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/staff/1",
      "/staff/2",
    ]);
    expect(links.map((link) => link.text())).toEqual(["Jane Doe", "John Roe"]);
  });

  it("says when there is nothing to list", () => {
    const wrapper = mountTable([]);
    expect(wrapper.find(".record-table-empty").text()).toBe(
      "Nothing here yet.",
    );
    expect(wrapper.find("a").exists()).toBe(false);
  });
});
