import { describe, expect, it } from "vitest";

import {
  HOME_IMAGE_SIZE,
  HOME_IMAGE_TYPES,
  homeArticle,
  homeBody,
  homeForm,
  homeImage,
} from "../../src/input/home";

const HEADING = "Discover God’s **Love, Grace & Truth**";

const WORDS = {
  title: "Butte Bible Fellowship",
  heroDescription: "Join us.",
  heroAction: "Learn More",
  heroLink: "/about-us",
};

const HOME = { ...WORDS, heroHeading: HEADING };

const TYPED = HOME;

const ARTICLE = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [{ type: "text", value: "Welcome." }],
    },
  ],
};

const form = (value: unknown) =>
  homeForm
    .safeParse(value)
    .error?.issues.map((issue) => issue.path.join(".")) ?? [];

describe("homeBody", () => {
  it("writes the home page's metadata: its title and the words of its hero, with or without a description", () => {
    expect(homeBody.parse(HOME)).toEqual(HOME);
    const described = { ...HOME, description: "A church in Chico." };
    expect(homeBody.parse(described)).toEqual(described);
  });

  it("needs a title and each line of the hero, each saying something", () => {
    for (const key of Object.keys(HOME)) {
      const { [key]: _, ...rest } = HOME as Record<string, unknown>;
      expect(homeBody.safeParse(rest).success, key).toBe(false);
      expect(homeBody.safeParse({ ...HOME, [key]: "" }).success, key).toBe(
        false,
      );
    }
  });

  it("takes a heading that is a line of text, its highlight marked in it, and no tree", () => {
    expect(
      homeBody.safeParse({
        ...HOME,
        heroHeading: { type: "root", children: [] },
      }).success,
    ).toBe(false);
  });

  it("leads the button to a link", () => {
    expect(homeBody.safeParse({ ...HOME, heroLink: "about-us" }).success).toBe(
      false,
    );
    expect(
      homeBody.parse({ ...HOME, heroLink: "https://example.com/visit" })
        .heroLink,
    ).toBe("https://example.com/visit");
  });

  it("carries neither the picture nor what is written on the page: each is written on its own", () => {
    expect(
      homeBody.parse({ ...HOME, body: ARTICLE, heroImage: "/church.jpg" }),
    ).toEqual(HOME);
  });
});

describe("homeForm", () => {
  it("holds what the body takes, each line trimmed", () => {
    expect(
      homeForm.parse({
        ...TYPED,
        title: "  Butte Bible Fellowship ",
        heroHeading: " Discover God’s **Love, Grace & Truth** ",
        heroAction: " Learn More ",
        heroLink: " /about-us ",
      }),
    ).toEqual(TYPED);
  });

  it("holds the hero's picture: the URL of the one kept, an image picked in its place, or none", () => {
    const picked = new File([new Uint8Array(8)], "picked.png", {
      type: "image/png",
    });
    const url = "https://cdn.example.com/kept.jpg";
    expect(homeForm.parse({ ...TYPED, heroImage: url }).heroImage).toBe(url);
    expect(homeForm.parse({ ...TYPED, heroImage: picked }).heroImage).toBe(
      picked,
    );
    expect(homeForm.parse(TYPED).heroImage).toBeUndefined();
    expect(homeForm.shape.heroImage.safeParse(undefined).success).toBe(true);
  });

  it("refuses a file that cannot be the hero's picture, and says what can", () => {
    const pdf = new File(["x"], "notes.pdf", { type: "application/pdf" });
    const heavy = new File([new Uint8Array(HOME_IMAGE_SIZE + 1)], "heavy.png", {
      type: "image/png",
    });
    for (const file of [pdf, heavy]) {
      const checked = homeForm.shape.heroImage.safeParse(file);
      expect(checked.success).toBe(false);
      expect(checked.error?.issues.map((issue) => issue.message)).toEqual([
        "That file can’t be used. Choose a JPEG, PNG or WebP image of 4 MB or less.",
      ]);
    }
  });

  it("names each field left blank, or holding only spaces", () => {
    expect(form({})).toEqual([
      "title",
      "heroHeading",
      "heroDescription",
      "heroAction",
      "heroLink",
    ]);
    expect(form({ ...TYPED, title: "   ", heroHeading: " " })).toEqual([
      "title",
      "heroHeading",
    ]);
  });

  it("names a link that is neither a path nor an address", () => {
    expect(form({ ...TYPED, heroLink: "about-us" })).toEqual(["heroLink"]);
  });

  it("keeps a description as typed, and takes none", () => {
    expect(homeForm.parse({ ...TYPED, description: " A church. " })).toEqual({
      ...TYPED,
      description: " A church. ",
    });
  });
});

describe("homeArticle", () => {
  it("is what is written on the page, as a tree, or nothing", () => {
    expect(homeArticle.parse({ body: ARTICLE })).toEqual({ body: ARTICLE });
    expect(homeArticle.parse({})).toEqual({});
  });

  it("rejects what is not a tree, and carries no metadata", () => {
    expect(homeArticle.safeParse({ body: "# Welcome" }).success).toBe(false);
    expect(homeArticle.parse({ body: ARTICLE, title: "Home" })).toEqual({
      body: ARTICLE,
    });
  });
});

describe("homeImage", () => {
  const image = (type: string, size = 1024) =>
    new File([new Uint8Array(size)], "church", { type });

  it("takes a JPEG, a PNG or a WebP image", () => {
    expect(HOME_IMAGE_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
    for (const type of HOME_IMAGE_TYPES) {
      expect(homeImage.safeParse(image(type)).success, type).toBe(true);
    }
  });

  it("refuses any other kind of file, and what is no file", () => {
    expect(homeImage.safeParse(image("image/svg+xml")).success).toBe(false);
    expect(homeImage.safeParse(image("")).success).toBe(false);
    expect(homeImage.safeParse("/images/church.jpg").success).toBe(false);
  });

  it("refuses an image over 4 MB", () => {
    expect(HOME_IMAGE_SIZE).toBe(4 * 1024 * 1024);
    expect(
      homeImage.safeParse(image("image/png", HOME_IMAGE_SIZE)).success,
    ).toBe(true);
    expect(
      homeImage.safeParse(image("image/png", HOME_IMAGE_SIZE + 1)).success,
    ).toBe(false);
  });
});
