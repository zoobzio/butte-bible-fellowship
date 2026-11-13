import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";

import type { Draft } from "~/types/editor";

import { useDraft, useDrafts } from "~/composables/drafts";

/** A part of a record, clean and closed until a test says otherwise. */
const part = () => {
  const dirty = ref(false);
  const open = ref(false);
  const saving = ref(false);
  const error = ref<string | null>(null);
  const draft: Draft = {
    dirty,
    open,
    saving,
    error,
    save: vi.fn(async () => {}),
    reset: vi.fn(),
  };
  return { dirty, open, saving, error, draft };
};

/** A page over the parts given, each handed in by a panel of its own. */
const mountPage = (drafts: Draft[], shown = ref(true)) => {
  const held: boolean[] = [];
  const Panel = defineComponent({
    props: { draft: { type: Object, required: true } },
    setup(props) {
      held.push(useDraft(props.draft as Draft));
      return () => h("div");
    },
  });
  let whole!: ReturnType<typeof useDrafts>;
  const wrapper = mount(
    defineComponent({
      setup() {
        whole = useDrafts();
        return () =>
          shown.value ? drafts.map((draft) => h(Panel, { draft })) : [];
      },
    }),
  );
  return { wrapper, whole, held };
};

describe("useDrafts", () => {
  it("is clean, closed and at rest with no part, and with parts that are", () => {
    expect(mountPage([]).whole.dirty.value).toBe(false);
    const { whole, held } = mountPage([part().draft, part().draft]);
    expect(held).toEqual([true, true]);
    expect(whole.dirty.value).toBe(false);
    expect(whole.open.value).toBe(false);
    expect(whole.saving.value).toBe(false);
    expect(whole.errors.value).toEqual([]);
  });

  it("is dirty, open or saving while any part is", () => {
    const [details, body] = [part(), part()];
    const { whole } = mountPage([details.draft, body.draft]);
    body.dirty.value = true;
    expect(whole.dirty.value).toBe(true);
    body.dirty.value = false;
    details.open.value = true;
    expect(whole.dirty.value).toBe(false);
    expect(whole.open.value).toBe(true);
    details.saving.value = true;
    expect(whole.saving.value).toBe(true);
  });

  it("says what went wrong with each part, in the order they were handed in", () => {
    const [details, body] = [part(), part()];
    const { whole } = mountPage([details.draft, body.draft]);
    body.error.value = "The server is away.";
    expect(whole.errors.value).toEqual(["The server is away."]);
    details.error.value = "Slug already taken.";
    expect(whole.errors.value).toEqual([
      "Slug already taken.",
      "The server is away.",
    ]);
  });

  it("saves every part with a change at once, and leaves the rest alone", async () => {
    const [details, body, other] = [part(), part(), part()];
    const { whole } = mountPage([details.draft, body.draft, other.draft]);
    details.dirty.value = true;
    body.dirty.value = true;
    await whole.save();
    expect(details.draft.save).toHaveBeenCalledTimes(1);
    expect(body.draft.save).toHaveBeenCalledTimes(1);
    expect(other.draft.save).not.toHaveBeenCalled();
  });

  it("resets every part, changed or only open", () => {
    const [details, body] = [part(), part()];
    const { whole } = mountPage([details.draft, body.draft]);
    details.dirty.value = true;
    whole.reset();
    expect(details.draft.reset).toHaveBeenCalledTimes(1);
    expect(body.draft.reset).toHaveBeenCalledTimes(1);
  });

  it("neither saves nor resets under a save", async () => {
    const [details, body] = [part(), part()];
    const { whole } = mountPage([details.draft, body.draft]);
    details.dirty.value = true;
    body.saving.value = true;
    await whole.save();
    whole.reset();
    expect(details.draft.save).not.toHaveBeenCalled();
    expect(details.draft.reset).not.toHaveBeenCalled();
    expect(body.draft.reset).not.toHaveBeenCalled();
  });

  it("lets go of a part once its panel is gone", async () => {
    const body = part();
    const shown = ref(true);
    const { wrapper, whole } = mountPage([body.draft], shown);
    body.dirty.value = true;
    expect(whole.dirty.value).toBe(true);
    shown.value = false;
    await wrapper.vm.$nextTick();
    expect(whole.dirty.value).toBe(false);
    whole.reset();
    expect(body.draft.reset).not.toHaveBeenCalled();
  });
});

describe("useDraft", () => {
  it("says there is no page to save it when a panel stands on its own", () => {
    let held: boolean | undefined;
    mount(
      defineComponent({
        setup() {
          held = useDraft(part().draft);
          return () => h("div");
        },
      }),
    );
    expect(held).toBe(false);
  });
});
