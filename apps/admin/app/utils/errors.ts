/** An issue as zod reports one: where it is, and what is wrong. */
interface Issue {
  path?: (string | number)[];
  message: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** The issues a value carries, when it is an error of zod's, serialized or not. */
const issuesOf = (value: unknown): Issue[] | undefined => {
  if (!isObject(value) || !Array.isArray(value.issues)) return undefined;
  return value.issues.filter(
    (issue): issue is Issue =>
      isObject(issue) && typeof issue.message === "string",
  );
};

/** The HTTP status an error carries, when a fetch raised it. */
const statusOf = (error: unknown): number | undefined => {
  if (!isObject(error)) return undefined;
  const status = error.status ?? error.statusCode;
  return typeof status === "number" ? status : undefined;
};

/** Whether a fetch failed because there is nothing at the address. */
export const isNotFound = (error: unknown): boolean => statusOf(error) === 404;

/**
 * What went wrong, in a line for the editor to show. A body the schema
 * refused, here or on the server, says each issue with the field it is
 * in: `email: Invalid email address`. Anything else says what it can —
 * the server's message, or the error's own.
 */
export const failure = (error: unknown): string => {
  const payload = isObject(error) ? error.data : undefined;
  const issues =
    issuesOf(error) ?? issuesOf(isObject(payload) ? payload.data : undefined);
  if (issues?.length) {
    return issues
      .map(({ path, message }) =>
        path?.length ? `${path.join(".")}: ${message}` : message,
      )
      .join(". ");
  }
  if (isObject(payload) && typeof payload.message === "string") {
    return payload.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong.";
};
