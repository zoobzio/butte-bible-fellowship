import { describe, expect, it } from "vitest";

import {
  STAFF_AVATAR_SIZE,
  STAFF_AVATAR_TYPES,
  STAFF_SORT_KEYS,
  staffAvatar,
  staffBio,
  staffBody,
  staffForm,
  staffId,
  staffQuery,
} from "../../src/input/staff";

const MEMBER = { name: "Jane Doe", role: "elder" };

const BIO = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Has served since 2010." }],
    },
  ],
};

describe("staffId", () => {
  it("names a member by their row's number, as the address writes it", () => {
    expect(staffId.parse({ id: "12" })).toEqual({ id: 12 });
    expect(staffId.safeParse({ id: "0" }).success).toBe(false);
    expect(staffId.safeParse({ id: "1.5" }).success).toBe(false);
    expect(staffId.safeParse({ id: "jane-doe" }).success).toBe(false);
  });
});

describe("staffQuery", () => {
  it("is the listing query, with a role and a status held or not to narrow it", () => {
    expect(staffQuery.parse({})).toEqual({ page: 1, size: 25 });
    expect(
      staffQuery.parse({
        page: "2",
        q: "jane",
        roleIs: "elder",
        statusNot: "archived",
      }),
    ).toEqual({
      page: 2,
      size: 25,
      q: "jane",
      roleIs: "elder",
      statusNot: "archived",
    });
    expect(
      staffQuery.parse({ roleNot: "pastor", statusIs: "draft" }),
    ).toMatchObject({ roleNot: "pastor", statusIs: "draft" });
  });

  it("takes only a role and a status the staff are written in", () => {
    expect(staffQuery.safeParse({ roleIs: "deacon" }).success).toBe(false);
    expect(staffQuery.safeParse({ roleNot: "deacon" }).success).toBe(false);
    expect(staffQuery.safeParse({ statusIs: "live" }).success).toBe(false);
    expect(staffQuery.safeParse({ statusNot: "live" }).success).toBe(false);
    expect(staffQuery.safeParse({ role: "elder" }).success).toBe(true);
    expect(staffQuery.parse({ role: "elder" })).toEqual({ page: 1, size: 25 });
  });

  it("takes what each text column is or is not, present or missing among them", () => {
    expect(
      staffQuery.parse({
        nameIs: "Jane Doe",
        emailIs: "present",
        phoneNot: "missing",
        summaryIs: "present",
        photoNot: "https://cdn.example.com/x.jpg",
      }),
    ).toMatchObject({
      nameIs: "Jane Doe",
      emailIs: "present",
      phoneNot: "missing",
      summaryIs: "present",
      photoNot: "https://cdn.example.com/x.jpg",
    });
    expect(staffQuery.safeParse({ emailIs: "" }).success).toBe(false);
    expect(staffQuery.safeParse({ nameNot: "" }).success).toBe(false);
    // The bare presence of before is gone: a column names its operator.
    expect(staffQuery.parse({ photo: "missing" })).toEqual({
      page: 1,
      size: 25,
    });
  });

  it("takes the text each text column carries, does not, starts or ends with", () => {
    expect(
      staffQuery.parse({
        nameContains: "jane",
        emailNotContains: "example.com",
        phoneStartsWith: "530",
        summaryEndsWith: "2010.",
        photoContains: "cdn",
      }),
    ).toMatchObject({
      nameContains: "jane",
      emailNotContains: "example.com",
      phoneStartsWith: "530",
      summaryEndsWith: "2010.",
      photoContains: "cdn",
    });
    expect(staffQuery.safeParse({ nameContains: "" }).success).toBe(false);
    expect(staffQuery.safeParse({ nameStartsWith: "" }).success).toBe(false);
  });

  it("sorts by a column of the record, either way", () => {
    expect(STAFF_SORT_KEYS).toEqual([
      "name",
      "role",
      "status",
      "email",
      "phone",
      "createdAt",
      "updatedAt",
    ]);
    expect(staffQuery.parse({ sort: "email", direction: "desc" })).toEqual({
      page: 1,
      size: 25,
      sort: "email",
      direction: "desc",
    });
    expect(staffQuery.safeParse({ sort: "bio" }).success).toBe(false);
    expect(staffQuery.safeParse({ sort: "id" }).success).toBe(false);
  });

  it("takes a day each member was changed or added before, after, on, on or after or on or before, as YYYY-MM-DD", () => {
    expect(
      staffQuery.parse({
        updatedAtBefore: "2026-10-17",
        updatedAtAfter: "2026-10-01",
        updatedAtOn: "2026-10-10",
        updatedAtOnOrAfter: "2026-10-02",
        updatedAtOnOrBefore: "2026-10-16",
        createdAtBefore: "2026-09-17",
        createdAtAfter: "2026-09-01",
        createdAtOn: "2026-09-10",
        createdAtOnOrAfter: "2026-09-02",
        createdAtOnOrBefore: "2026-09-16",
      }),
    ).toMatchObject({
      updatedAtBefore: "2026-10-17",
      updatedAtOnOrAfter: "2026-10-02",
      createdAtOn: "2026-09-10",
      createdAtOnOrBefore: "2026-09-16",
    });
    expect(
      staffQuery.safeParse({ updatedAtOnOrAfter: "2026-10" }).success,
    ).toBe(false);
    expect(staffQuery.safeParse({ updatedAtOn: "yesterday" }).success).toBe(
      false,
    );
    expect(staffQuery.safeParse({ createdAtAfter: "10/01/2026" }).success).toBe(
      false,
    );
  });
});

describe("staffBody", () => {
  it("writes a member as a draft when not told otherwise", () => {
    expect(staffBody.parse(MEMBER)).toEqual({ ...MEMBER, status: "draft" });
  });

  it("accepts all a member's details can say", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      email: "jane@example.com",
      phone: "530-555-0100",
      status: "published",
    };
    expect(staffBody.parse(value)).toEqual(value);
  });

  it("needs a name and a role", () => {
    expect(staffBody.safeParse({ role: "elder" }).success).toBe(false);
    expect(staffBody.safeParse({ name: "Jane Doe" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, name: "" }).success).toBe(false);
    expect(staffBody.safeParse({ ...MEMBER, role: "" }).success).toBe(false);
  });

  it("rejects a status or a role that is not one", () => {
    expect(staffBody.safeParse({ ...MEMBER, status: "hidden" }).success).toBe(
      false,
    );
    expect(staffBody.safeParse({ ...MEMBER, role: "Elder" }).success).toBe(
      false,
    );
  });

  it("carries neither a photo nor a bio: each is written on its own", () => {
    expect(
      staffBody.parse({
        ...MEMBER,
        bio: BIO,
        photo: "https://cdn.example.com/staff/jane-doe.jpg",
      }),
    ).toEqual({ ...MEMBER, status: "draft" });
  });
});

describe("staffForm", () => {
  it("is the body as a form holds it", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      email: "jane@example.com",
      status: "published",
    };
    expect(staffForm.parse(value)).toEqual(value);
  });

  it("writes a member as a draft when not told otherwise", () => {
    expect(staffForm.parse(MEMBER)).toEqual({ ...MEMBER, status: "draft" });
  });

  it("trims the name, and needs one left", () => {
    expect(staffForm.parse({ ...MEMBER, name: " Jane Doe " }).name).toBe(
      "Jane Doe",
    );
    expect(staffForm.safeParse({ ...MEMBER, name: "   " }).success).toBe(false);
  });

  it("checks a field on its own, as a form does as it is left", () => {
    expect(staffForm.shape.email.safeParse("jane").success).toBe(false);
    expect(staffForm.shape.email.safeParse(undefined).success).toBe(true);
    expect(staffForm.shape.role.safeParse(undefined).success).toBe(false);
  });
});

describe("staffBio", () => {
  it("takes a bio as a tree, never as a string", () => {
    expect(staffBio.parse({ bio: BIO })).toEqual({ bio: BIO });
    expect(staffBio.safeParse({ bio: "## Jane\n\nHas served." }).success).toBe(
      false,
    );
  });

  it("takes no bio at all, for a member left without one", () => {
    expect(staffBio.parse({})).toEqual({});
  });
});

describe("staffAvatar", () => {
  const image = (type: string, size = 8) =>
    new File([new Uint8Array(size)], "jane", { type });

  it("takes a JPEG, a PNG or a WebP image", () => {
    expect(STAFF_AVATAR_TYPES).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    for (const type of STAFF_AVATAR_TYPES) {
      expect(staffAvatar.safeParse(image(type)).success, type).toBe(true);
    }
  });

  it("refuses another kind of file, and what is not a file", () => {
    expect(staffAvatar.safeParse(image("image/svg+xml")).success).toBe(false);
    expect(staffAvatar.safeParse(image("application/pdf")).success).toBe(false);
    expect(staffAvatar.safeParse(image("")).success).toBe(false);
    expect(staffAvatar.safeParse("jane.jpg").success).toBe(false);
  });

  it("refuses an image past 4 MB", () => {
    expect(STAFF_AVATAR_SIZE).toBe(4_194_304);
    expect(
      staffAvatar.safeParse(image("image/png", STAFF_AVATAR_SIZE)).success,
    ).toBe(true);
    expect(
      staffAvatar.safeParse(image("image/png", STAFF_AVATAR_SIZE + 1)).success,
    ).toBe(false);
  });
});
