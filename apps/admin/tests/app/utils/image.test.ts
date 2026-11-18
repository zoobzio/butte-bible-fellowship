import { describe, expect, it } from "vitest";

import { toImageRequest } from "~/utils/image";

const KEPT = "https://cdn.example.com/events/worship.jpg";

const image = () =>
  new File([new Uint8Array(8)], "worship.png", { type: "image/png" });

describe("toImageRequest", () => {
  it("uploads an image picked, as the file of a form, whether or not one is kept", () => {
    const file = image();
    for (const kept of [undefined, KEPT]) {
      const request = toImageRequest(file, kept);
      expect(request).toMatchObject({ method: "PATCH" });
      const body = request !== null && "body" in request ? request.body : null;
      expect(body).toBeInstanceOf(FormData);
      expect(body?.get("file")).toBe(file);
    }
  });

  it("removes the picture kept once the form holds none", () => {
    expect(toImageRequest(undefined, KEPT)).toEqual({ method: "DELETE" });
  });

  it("owes nothing for the picture kept, or for none where there is none", () => {
    expect(toImageRequest(KEPT, KEPT)).toBeNull();
    expect(toImageRequest(undefined, undefined)).toBeNull();
  });
});
