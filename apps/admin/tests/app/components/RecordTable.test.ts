import type { StaffRecord } from "@bbf/schema/types";

import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";

import { createTable, useNuxtApp } from "#imports";
import { STAFF } from "#test/support/records";
import { withSetup } from "@bbf/nuxt/testing/mount";
import RecordTable from "~/components/RecordTable.vue";
import { STAFF_TABLE } from "~/constants/staff";
import { toTableDescriptors } from "~/utils/listing";

const service = (data: StaffRecord[]) => {
  const { $t } = useNuxtApp();
  const useTable = createTable<StaffRecord>("record-table", {
    ...toTableDescriptors(STAFF_TABLE, (message) => $t(message)),
    fetch: async () => ({ data, total: data.length, pageCount: 1 }),
  });
  return withSetup(() => useTable()).result;
};

const mountTable = async (data: StaffRecord[]) => {
  const table = service(data);
  await table.fetch();
  const wrapper = mount(RecordTable, {
    props: {
      table,
      link: (record: StaffRecord) => `/staff/${record.id}`,
      title: "name",
    },
  });
  await flushPromises();
  return wrapper;
};

describe("RecordTable", () => {
  it("renders the design system's table over the service", async () => {
    const wrapper = await mountTable([STAFF]);
    expect(wrapper.find(".record-table .f-data-table table").exists()).toBe(
      true,
    );
    expect(wrapper.findAll(".f-th").map((th) => th.text())).toEqual([
      "Name",
      "Role",
      "Status",
      "Email",
      "Phone",
      "Updated",
    ]);
  });

  it("sorts by a heading when it is clicked, and marks the sorted one", async () => {
    const wrapper = await mountTable([STAFF]);
    const heading = wrapper
      .findAll(".f-th")
      .find((th) => th.text() === "Email")!;
    expect(heading.classes()).toContain("f-data-table-sortable");
    expect(heading.classes()).not.toContain("f-data-table-sorted");
    await heading.find("button").trigger("click");
    await flushPromises();
    expect(heading.classes()).toContain("f-data-table-sorted");
  });

  it("offers the search box, worded by the app's prose", async () => {
    const wrapper = await mountTable([STAFF]);
    const input = wrapper.find(".f-data-table-search .f-autocomplete-input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("placeholder")).toBe("Search…");
  });

  it("makes the title cell of each row the way to the record's editor", async () => {
    const wrapper = await mountTable([
      STAFF,
      { ...STAFF, id: 2, name: "John Roe" },
    ]);
    const links = wrapper.findAll("a.record-table-link");
    expect(links.map((link) => link.attributes("href"))).toEqual([
      "/staff/1",
      "/staff/2",
    ]);
    expect(links.map((link) => link.text())).toEqual(["Jane Doe", "John Roe"]);
  });

  it("says when there is nothing to list", async () => {
    const wrapper = await mountTable([]);
    expect(wrapper.find(".record-table-empty").text()).toBe(
      "Nothing here yet.",
    );
    expect(wrapper.find("a.record-table-link").exists()).toBe(false);
  });
});
