import { z } from "zod";

/**
 * Whether a name stands as one step of a path: it holds something, and
 * none of what an address reads as something else, the slash and the
 * backslash, which part one step from the next, the question mark, which
 * ends the path, the hash, which ends the address, and the percent sign,
 * which encodes the rest and does not survive the server's own decoding
 * of a page's address; and it is neither of the two names an address reads
 * as "here" and "the folder above".
 */
export const isStep = (name: string): boolean =>
  name !== "" && !/[/\\?#%]/.test(name) && name !== "." && name !== "..";

export const contentLocation = z
  .array(z.string().refine(isStep, { error: "one step of a path" }))
  .meta({
    id: "ContentLocation",
    description:
      "Where something is in the content: the names of the folders from the top down, and last, for a document, its slug. Empty, the top.",
    examples: [["Sermon notes", "Romans"]],
  });
