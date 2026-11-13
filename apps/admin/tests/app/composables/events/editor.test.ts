import { describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { DINNER, WORSHIP } from "#test/support/records";
import { useEventEditor } from "~/composables/events/editor";

describe("useEventEditor", () => {
  const WEEKLY = {
    slug: "worship-service",
    title: "Worship Service",
    summary: "We gather on Sunday morning.",
    date: "2026-01-04",
    recurring: true,
    weeks: ["1", "3"],
    start: "10:00",
    end: "11:30",
  };

  const ONCE = {
    slug: "harvest-dinner",
    title: "Harvest Dinner",
    date: "2026-10-24",
    recurring: false,
    start: "17:30",
  };

  it("is the event form, held once and otherwise blank for a new event", () => {
    const editor = useEventEditor(null);
    expect(editor.form.id).toBe("event");
    expect(editor.form.config.fields.map((field) => field.key)).toEqual([
      "title",
      "slug",
      "date",
      "start",
      "end",
      "recurring",
      "weeks",
      "summary",
    ]);
    expect(editor.form.config.fields.map((field) => field.type)).toEqual([
      "text",
      "text",
      "date-input",
      "time",
      "time",
      "checkbox",
      "multi-select",
      "textarea",
    ]);
    expect(editor.form.payload).toEqual({ recurring: false });
  });

  it("opens on an event's details, each week as the select writes it", () => {
    expect(useEventEditor(WORSHIP).form.payload).toEqual(WEEKLY);
    expect(useEventEditor(DINNER).form.payload).toEqual(ONCE);
  });

  it("is one column of its details: no field is given a span, and neither the picture nor the body is one", () => {
    const { fields } = useEventEditor({
      ...WORSHIP,
      image: "https://cdn.example.com/events/worship.jpg",
    }).form.config;
    expect(fields.every((field) => field.colspan === undefined)).toBe(true);
    expect(
      fields.filter((field) => field.required).map((field) => field.key),
    ).toEqual(["title", "slug", "date", "start"]);
    const { payload } = useEventEditor(WORSHIP).form;
    for (const key of ["body", "image", "day", "status", "note", "location"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("starts over from the record, whatever the last visit left", () => {
    useEventEditor(WORSHIP).form.set("title", "Something Else");
    expect(useEventEditor(null).form.payload).toEqual({ recurring: false });
    expect(useEventEditor(DINNER).form.payload).toEqual(ONCE);
    expect(useEventEditor(WORSHIP).form.payload.title).toBe("Worship Service");
  });

  it("offers each week of the month by name, and neither a status nor a day", () => {
    const { fields } = useEventEditor(null).form.config;
    const options = (key: string) =>
      fields.flatMap((field) =>
        field.key === key && "options" in field ? field.options : [],
      );
    expect(options("weeks")).toEqual([
      { value: "1", label: "First" },
      { value: "2", label: "Second" },
      { value: "3", label: "Third" },
      { value: "4", label: "Fourth" },
      { value: "5", label: "Fifth" },
    ]);
    expect(fields.some((field) => String(field.key) === "status")).toBe(false);
    expect(fields.some((field) => String(field.key) === "day")).toBe(false);
  });

  it("clears the weeks when an event stops recurring: only a recurring one picks them", () => {
    const { form } = useEventEditor(WORSHIP);
    form.set("recurring", false);
    expect(form.payload.weeks).toBeUndefined();
    expect(form.validate()).toBe(true);
    form.set("recurring", true);
    form.set("weeks", ["2", "4"]);
    form.set("title", "Sunday Worship");
    expect(form.payload).toMatchObject({ recurring: true, weeks: ["2", "4"] });
  });

  it("picks no weeks once the last is unpicked: every week", () => {
    const { form } = useEventEditor(WORSHIP);
    form.set("weeks", []);
    expect(form.payload.weeks).toBeUndefined();
  });

  it("creates an event from what is written, held once, and opens its page, where the picture and the writing wait", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(null);
    editor.form.set("title", " Harvest Dinner ");
    editor.form.set("slug", "harvest-dinner");
    editor.form.set("date", "2026-10-24");
    editor.form.set("start", "17:30");
    editor.form.set("summary", "");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      body: ONCE,
    });
    expect(useRouter().push).toHaveBeenCalledWith("/events/4/details");
    expect(editor.form.submitted).toBe(true);
    expect(editor.error.value).toBeNull();
  });

  it("replaces the event's details when there is a record, the weeks as numbers, stays, and hands the record saved on", async () => {
    const changed = { ...WORSHIP, weeks: [2, 4], title: "Sunday Worship" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useEventEditor(WORSHIP, saved);
    editor.form.set("weeks", ["4", "2"]);
    editor.form.set("title", "Sunday Worship");
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: { ...WEEKLY, weeks: [2, 4], title: "Sunday Worship" },
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.form.submitted).toBe(true);
    expect(editor.form.payload).toMatchObject({
      weeks: ["2", "4"],
      title: "Sunday Worship",
    });
  });

  it("makes a one-off recur by its checkbox alone, on the day of the week of its date", async () => {
    const fetch = vi.fn(async () => ({ ...DINNER, recurring: true }));
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(DINNER);
    editor.form.set("recurring", true);
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events/4", {
      method: "PUT",
      body: { ...ONCE, recurring: true },
    });
  });

  it("writes no summary once the field is cleared", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(WORSHIP);
    editor.form.set("summary", " ");
    expect(editor.form.payload.summary).toBeUndefined();
    await editor.form.submit();
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: { ...WEEKLY, weeks: [1, 3], summary: undefined },
    });
  });

  it("keeps the form open with what is wrong, field by field", async () => {
    const fetch = vi.fn(async () => DINNER);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(null);
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    for (const key of ["title", "slug", "date", "start"] as const) {
      expect(editor.form.field(key).error, key).toBeDefined();
    }
    expect(editor.form.field("end").error).toBeUndefined();
    expect(editor.form.field("recurring").error).toBeUndefined();
    expect(editor.error.value).toBeNull();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("refuses a slug that is not one as the field is left, and an end before the start on a save", async () => {
    const fetch = vi.fn(async () => WORSHIP);
    vi.stubGlobal("$fetch", fetch);
    const editor = useEventEditor(WORSHIP);
    editor.form.set("slug", "Worship Service");
    editor.form.touch("slug");
    expect(editor.form.check("slug")).toBe(false);
    editor.form.set("slug", "worship-service");
    expect(editor.form.check("slug")).toBe(true);
    editor.form.set("end", "09:00");
    await editor.form.submit();
    expect(fetch).not.toHaveBeenCalled();
    expect(editor.form.field("end").error).toBe(
      "an event ends after it starts",
    );
  });

  it("says what went wrong when the save fails, and stays, until the next try", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useEventEditor(WORSHIP);
    await expect(editor.form.submit()).rejects.toThrow("The server is away.");
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.form.submitting).toBe(false);
    expect(editor.form.submitted).toBe(false);
    expect(useRouter().push).not.toHaveBeenCalled();

    editor.form.set("end", "09:00");
    await editor.form.submit();
    expect(editor.error.value).toBeNull();
  });

  it("is clean on the record as it was saved, and dirty from the first change", () => {
    const editor = useEventEditor(WORSHIP);
    expect(editor.dirty.value).toBe(false);
    expect(editor.saving.value).toBe(false);
    editor.form.set("title", "Morning Worship");
    expect(editor.dirty.value).toBe(true);
  });

  it("saves for the page that saves the whole record, and is clean again", async () => {
    const changed = { ...WORSHIP, title: "Morning Worship" };
    const fetch = vi.fn(async () => changed);
    vi.stubGlobal("$fetch", fetch);
    const saved = vi.fn();
    const editor = useEventEditor(WORSHIP, saved);
    editor.form.set("title", "Morning Worship");
    await editor.save();
    expect(fetch).toHaveBeenCalledWith("/api/events/3", {
      method: "PUT",
      body: expect.objectContaining({ title: "Morning Worship" }),
    });
    expect(saved).toHaveBeenCalledWith(changed);
    expect(editor.dirty.value).toBe(false);
    expect(editor.error.value).toBeNull();
  });

  it("puts the fields back as they were last saved on a reset, with what was wrong", async () => {
    const editor = useEventEditor(WORSHIP);
    editor.form.set("slug", "Not A Slug");
    await editor.save();
    expect(editor.form.valid).toBe(false);
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.title).toBe("Worship Service");
    expect(editor.form.errors).toEqual({});
    expect(editor.dirty.value).toBe(false);

    const changed = { ...WORSHIP, title: "Morning Worship" };
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => changed),
    );
    editor.form.set("title", "Morning Worship");
    await editor.save();
    editor.form.set("title", "Another Slip");
    editor.reset();
    expect(editor.form.payload.title).toBe("Morning Worship");
  });

  it("saves without throwing: what fails reports through the error, which a reset clears", async () => {
    vi.stubGlobal(
      "$fetch",
      vi.fn(async () => {
        throw new Error("The server is away.");
      }),
    );
    const editor = useEventEditor(WORSHIP);
    editor.form.set("title", "Morning Worship");
    await editor.save();
    expect(editor.error.value).toBe("The server is away.");
    expect(editor.dirty.value).toBe(true);
    editor.reset();
    expect(editor.error.value).toBeNull();
  });

  it("is not reset under a save", async () => {
    let answer = (_: unknown) => {};
    vi.stubGlobal(
      "$fetch",
      vi.fn(() => new Promise<unknown>((resolve) => (answer = resolve))),
    );
    const editor = useEventEditor(WORSHIP);
    editor.form.set("title", "Morning Worship");
    const saving = editor.save();
    expect(editor.saving.value).toBe(true);
    editor.reset();
    expect(editor.form.payload.title).toBe("Morning Worship");
    answer({ ...WORSHIP, title: "Morning Worship" });
    await saving;
    expect(editor.saving.value).toBe(false);
  });
});
