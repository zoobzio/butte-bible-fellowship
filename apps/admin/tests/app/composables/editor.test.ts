import { afterEach, describe, expect, it, vi } from "vitest";

import { useRouter } from "#imports";
import { useEditor } from "~/composables/editor";

interface Draft {
  name: string;
}

const options = (
  overrides: Partial<
    Parameters<typeof useEditor<Draft, { name: string }>>[0]
  > = {},
) => ({
  draft: { name: "Jane" },
  body: (draft: Draft) => ({ name: draft.name.trim() }),
  save: vi.fn(async () => ({})),
  remove: vi.fn(async () => ({})),
  back: "/staff",
  confirm: "Delete Jane?",
  ...overrides,
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useEditor", () => {
  it("holds the draft for the controls, and says whether there is a record to delete", () => {
    const editor = useEditor(options());
    expect(editor.draft).toEqual({ name: "Jane" });
    expect(editor.removable).toBe(true);
    expect(editor.saving.value).toBe(false);
    expect(editor.removing.value).toBe(false);
    expect(editor.error.value).toBeNull();
    expect(useEditor(options({ remove: undefined })).removable).toBe(false);
  });

  it("saves the body the draft is written as, then leaves for the list", async () => {
    const save = vi.fn(async () => ({}));
    const editor = useEditor(options({ save }));
    editor.draft.name = " Jane Doe ";
    await editor.submit();
    expect(save).toHaveBeenCalledWith({ name: "Jane Doe" });
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
    expect(editor.error.value).toBeNull();
  });

  it("is saving while the save is under way", async () => {
    let busy = false;
    const editor = useEditor(
      options({
        save: vi.fn(async () => {
          busy = editor.saving.value;
        }),
      }),
    );
    await editor.submit();
    expect(busy).toBe(true);
    expect(editor.saving.value).toBe(false);
  });

  it("keeps the editor open with what is wrong with the draft", async () => {
    const save = vi.fn(async () => ({}));
    const editor = useEditor(
      options({
        save,
        body: () => {
          throw new Error("name: too short");
        },
      }),
    );
    await editor.submit();
    expect(save).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
    expect(editor.error.value).toBe("name: too short");
  });

  it("keeps the editor open with what the server refused", async () => {
    const editor = useEditor(
      options({
        save: vi.fn(async () => {
          throw Object.assign(new Error("Request failed"), {
            status: 400,
            data: {
              message: "Validation Error",
              data: { issues: [{ path: ["slug"], message: "a slug" }] },
            },
          });
        }),
      }),
    );
    await editor.submit();
    expect(editor.error.value).toBe("slug: a slug");
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("asks before it deletes, and does nothing when told no", async () => {
    const confirm = vi.fn(() => false);
    vi.stubGlobal("confirm", confirm);
    const remove = vi.fn(async () => ({}));
    const editor = useEditor(options({ remove }));
    await editor.destroy();
    expect(confirm).toHaveBeenCalledWith("Delete Jane?");
    expect(remove).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("deletes when told yes, then leaves for the list", async () => {
    vi.stubGlobal("confirm", () => true);
    const remove = vi.fn(async () => ({}));
    const editor = useEditor(options({ remove }));
    await editor.destroy();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(useRouter().push).toHaveBeenCalledWith("/staff");
    expect(editor.removing.value).toBe(false);
  });

  it("keeps the editor open when the delete fails", async () => {
    vi.stubGlobal("confirm", () => true);
    const editor = useEditor(
      options({
        remove: vi.fn(async () => {
          throw new Error("database unavailable");
        }),
      }),
    );
    await editor.destroy();
    expect(editor.error.value).toBe("database unavailable");
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it("deletes nothing when there is no record", async () => {
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);
    await useEditor(options({ remove: undefined })).destroy();
    expect(confirm).not.toHaveBeenCalled();
  });
});
