import type { AppProsaryMessage } from "#imports";

import type { Choice, Option } from "~/types/editor";

/**
 * The choices named for the reader, in the order they are offered.
 */
export const toOptions = <T extends string>(
  choices: Choice<T>[],
  name: (message: AppProsaryMessage) => string,
): Option<T>[] =>
  choices.map(({ value, label }) => ({ value, label: name(label) }));
