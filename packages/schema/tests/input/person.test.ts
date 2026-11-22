import { describe, expect, it } from "vitest";

import {
  PERSON_AVATAR_SIZE,
  PERSON_AVATAR_TYPES,
  PERSON_SORT_KEYS,
  personAvatar,
  personBio,
  personBody,
  personForm,
  personId,
  personQuery,
} from "../../src/input/person";

const MEMBER = { firstName: "Jane", lastName: "Doe", role: "elder" };

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

describe("personId", () => {
  it("names a person by their row's number, as the address writes it", () => {
    expect(personId.parse({ id: "12" })).toEqual({ id: 12 });
    expect(personId.safeParse({ id: "0" }).success).toBe(false);
    expect(personId.safeParse({ id: "1.5" }).success).toBe(false);
    expect(personId.safeParse({ id: "jane-doe" }).success).toBe(false);
  });
});

describe("personQuery", () => {
  it("is the listing query, with a role held or not to narrow it", () => {
    expect(personQuery.parse({})).toEqual({ page: 1, size: 25 });
    expect(
      personQuery.parse({ page: "2", q: "jane", roleIs: "elder" }),
    ).toEqual({ page: 2, size: 25, q: "jane", roleIs: "elder" });
    expect(personQuery.parse({ roleNot: "pastor" })).toMatchObject({
      roleNot: "pastor",
    });
  });

  it("takes only a role the staff are written in", () => {
    expect(personQuery.safeParse({ roleIs: "deacon" }).success).toBe(false);
    expect(personQuery.safeParse({ roleNot: "deacon" }).success).toBe(false);
    expect(personQuery.safeParse({ role: "elder" }).success).toBe(true);
    expect(personQuery.parse({ role: "elder" })).toEqual({ page: 1, size: 25 });
  });

  it("narrows by no status: the staff carry none", () => {
    expect(
      personQuery.parse({ statusIs: "draft", statusNot: "archived" }),
    ).toEqual({ page: 1, size: 25 });
    expect(personQuery.safeParse({ sort: "status" }).success).toBe(false);
  });

  it("takes what each text column is or is not, present or missing among them", () => {
    expect(
      personQuery.parse({
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
    expect(personQuery.safeParse({ emailIs: "" }).success).toBe(false);
    expect(personQuery.safeParse({ nameNot: "" }).success).toBe(false);
    // The bare presence of before is gone: a column names its operator.
    expect(personQuery.parse({ photo: "missing" })).toEqual({
      page: 1,
      size: 25,
    });
  });

  it("takes the text each text column carries, does not, starts or ends with", () => {
    expect(
      personQuery.parse({
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
    expect(personQuery.safeParse({ nameContains: "" }).success).toBe(false);
    expect(personQuery.safeParse({ nameStartsWith: "" }).success).toBe(false);
  });

  it("sorts by a column of the record, either way", () => {
    expect(PERSON_SORT_KEYS).toEqual([
      "name",
      "role",
      "title",
      "email",
      "phone",
      "birthday",
      "createdAt",
      "updatedAt",
    ]);
    expect(personQuery.parse({ sort: "email", direction: "desc" })).toEqual({
      page: 1,
      size: 25,
      sort: "email",
      direction: "desc",
    });
    expect(personQuery.safeParse({ sort: "bio" }).success).toBe(false);
    expect(personQuery.safeParse({ sort: "id" }).success).toBe(false);
  });

  it("takes a day each member was changed or added before, after, on, on or after or on or before, as YYYY-MM-DD", () => {
    expect(
      personQuery.parse({
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
      personQuery.safeParse({ updatedAtOnOrAfter: "2026-10" }).success,
    ).toBe(false);
    expect(personQuery.safeParse({ updatedAtOn: "yesterday" }).success).toBe(
      false,
    );
    expect(
      personQuery.safeParse({ createdAtAfter: "10/01/2026" }).success,
    ).toBe(false);
  });
});

describe("personBody", () => {
  it("writes a person by their names and role alone", () => {
    expect(personBody.parse(MEMBER)).toEqual(MEMBER);
  });

  it("accepts all a person's details can say", () => {
    const value = {
      ...MEMBER,
      role: "member",
      title: "Greeter",
      summary: "Has served since 2010.",
      email: "jane@example.com",
      phone: "530-555-0100",
      address: "123 Main St\nButte, MT 59701",
      birthday: "1980-04-12",
    };
    expect(personBody.parse(value)).toEqual(value);
    expect(
      personBody.safeParse({ ...MEMBER, birthday: "April 12" }).success,
    ).toBe(false);
  });

  it("needs a first name, a last name and a role", () => {
    expect(personBody.safeParse({ role: "elder" }).success).toBe(false);
    expect(
      personBody.safeParse({ firstName: "Jane", lastName: "Doe" }).success,
    ).toBe(false);
    expect(
      personBody.safeParse({ name: "Jane Doe", role: "elder" }).success,
    ).toBe(false);
    expect(personBody.safeParse({ ...MEMBER, firstName: "" }).success).toBe(
      false,
    );
    expect(personBody.safeParse({ ...MEMBER, lastName: "" }).success).toBe(
      false,
    );
    expect(personBody.safeParse({ ...MEMBER, role: "" }).success).toBe(false);
  });

  it("rejects a role that is not one", () => {
    expect(personBody.safeParse({ ...MEMBER, role: "Elder" }).success).toBe(
      false,
    );
  });

  it("carries no status", () => {
    expect(personBody.parse({ ...MEMBER, status: "published" })).toEqual(
      MEMBER,
    );
  });

  it("keeps a phone number one way, however it is typed", () => {
    for (const typed of [
      "530-555-0100",
      "(530) 555-0100",
      "(530)555-0100",
      "530.555.0100",
      "530 555 0100",
      "5305550100",
      "+1 530 555 0100",
      "1-530-555-0100",
      " 530-555-0100 ",
    ]) {
      expect(personBody.parse({ ...MEMBER, phone: typed }).phone, typed).toBe(
        "530-555-0100",
      );
    }
  });

  it("refuses a phone number that is not ten digits", () => {
    for (const typed of [
      "",
      "asdf",
      "555-0100",
      "530-555-01000",
      "530-555-010",
      "(530 555-0100",
      "530-555-0100 ext 4",
      "call the office",
    ]) {
      expect(
        personBody.safeParse({ ...MEMBER, phone: typed }).success,
        typed,
      ).toBe(false);
    }
  });

  it("says what a phone number is when one is refused", () => {
    const { error } = personBody.safeParse({ ...MEMBER, phone: "asdf" });
    expect(error?.issues).toMatchObject([
      {
        path: ["phone"],
        message: "Invalid phone number: ten digits, like 530-555-0100",
      },
    ]);
  });

  it("carries neither a photo nor a bio: each is written on its own", () => {
    expect(
      personBody.parse({
        ...MEMBER,
        bio: BIO,
        photo: "https://cdn.example.com/staff/jane-doe.jpg",
      }),
    ).toEqual(MEMBER);
  });
});

describe("personForm", () => {
  it("is the body as a form holds it", () => {
    const value = {
      ...MEMBER,
      summary: "Has served since 2010.",
      email: "jane@example.com",
    };
    expect(personForm.parse(value)).toEqual(value);
  });

  it("trims the names, and needs each left", () => {
    expect(
      personForm.parse({ ...MEMBER, firstName: " Jane ", lastName: " Doe " }),
    ).toMatchObject({ firstName: "Jane", lastName: "Doe" });
    expect(personForm.safeParse({ ...MEMBER, firstName: "   " }).success).toBe(
      false,
    );
    expect(personForm.safeParse({ ...MEMBER, lastName: "   " }).success).toBe(
      false,
    );
  });

  it("checks a field on its own, as a form does as it is left", () => {
    expect(personForm.shape.email.safeParse("jane").success).toBe(false);
    expect(personForm.shape.email.safeParse(undefined).success).toBe(true);
    expect(personForm.shape.phone.safeParse("asdf").success).toBe(false);
    expect(personForm.shape.phone.safeParse("(530) 555-0100").success).toBe(
      true,
    );
    expect(personForm.shape.phone.safeParse(undefined).success).toBe(true);
    expect(personForm.shape.role.safeParse(undefined).success).toBe(false);
  });

  it("holds their photo: the URL of the one kept, an image picked in its place, or none", () => {
    const picked = new File([new Uint8Array(8)], "picked.png", {
      type: "image/png",
    });
    const url = "https://cdn.example.com/kept.jpg";
    expect(personForm.parse({ ...MEMBER, photo: url }).photo).toBe(url);
    expect(personForm.parse({ ...MEMBER, photo: picked }).photo).toBe(picked);
    expect(personForm.parse(MEMBER).photo).toBeUndefined();
    expect(personForm.shape.photo.safeParse(undefined).success).toBe(true);
  });

  it("refuses a file that cannot be their photo, and says what can", () => {
    const pdf = new File(["x"], "notes.pdf", { type: "application/pdf" });
    const heavy = new File(
      [new Uint8Array(PERSON_AVATAR_SIZE + 1)],
      "heavy.png",
      {
        type: "image/png",
      },
    );
    for (const file of [pdf, heavy]) {
      const checked = personForm.shape.photo.safeParse(file);
      expect(checked.success).toBe(false);
      expect(checked.error?.issues.map((issue) => issue.message)).toEqual([
        "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.",
      ]);
    }
  });
});

describe("personBio", () => {
  it("takes a bio as a tree, never as a string", () => {
    expect(personBio.parse({ bio: BIO })).toEqual({ bio: BIO });
    expect(personBio.safeParse({ bio: "## Jane\n\nHas served." }).success).toBe(
      false,
    );
  });

  it("takes no bio at all, for a member left without one", () => {
    expect(personBio.parse({})).toEqual({});
  });
});

describe("personAvatar", () => {
  const image = (type: string, size = 8) =>
    new File([new Uint8Array(size)], "jane", { type });

  it("takes a JPEG, a PNG or a WebP image", () => {
    expect(PERSON_AVATAR_TYPES).toEqual([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    for (const type of PERSON_AVATAR_TYPES) {
      expect(personAvatar.safeParse(image(type)).success, type).toBe(true);
    }
  });

  it("refuses another kind of file, and what is not a file", () => {
    expect(personAvatar.safeParse(image("image/svg+xml")).success).toBe(false);
    expect(personAvatar.safeParse(image("application/pdf")).success).toBe(
      false,
    );
    expect(personAvatar.safeParse(image("")).success).toBe(false);
    expect(personAvatar.safeParse("jane.jpg").success).toBe(false);
  });

  it("refuses an image past 4 MB", () => {
    expect(PERSON_AVATAR_SIZE).toBe(4_194_304);
    expect(
      personAvatar.safeParse(image("image/png", PERSON_AVATAR_SIZE)).success,
    ).toBe(true);
    expect(
      personAvatar.safeParse(image("image/png", PERSON_AVATAR_SIZE + 1))
        .success,
    ).toBe(false);
  });
});
