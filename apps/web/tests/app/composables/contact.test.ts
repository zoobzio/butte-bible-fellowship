import type { ConnectPage } from "@bbf/schema/types";

import { describe, expect, it } from "vitest";
import { ref } from "vue";

import { useConnect } from "~/composables/contact";
import { toConnect } from "~/utils/contact";

const PAGE: ConnectPage = {
  title: "Connect",
  address: "1 Test Street, Testville, California 90000",
  phone: "555-010-0100",
  hours: "Friday: 9am–noon",
};

describe("useConnect", () => {
  it("is how to find and reach the church, from the page's front matter", () => {
    const connect = useConnect(() => PAGE);
    expect(connect.value).toEqual(toConnect(PAGE));
    expect(connect.value?.phone?.href).toBe("tel:5550100100");
  });

  it("is nothing while there is no page, and follows the page once there is", () => {
    const page = ref<ConnectPage | null>(null);
    const connect = useConnect(() => page.value);
    expect(connect.value).toBeUndefined();
    page.value = PAGE;
    expect(connect.value?.hours).toEqual(["Friday: 9am–noon"]);
  });
});
