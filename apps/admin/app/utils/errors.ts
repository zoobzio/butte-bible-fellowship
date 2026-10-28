interface Issue {
  path?: (string | number)[];
  message: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const issuesOf = (value: unknown): Issue[] | undefined => {
  if (!isObject(value) || !Array.isArray(value.issues)) return undefined;
  return value.issues.filter(
    (issue): issue is Issue =>
      isObject(issue) && typeof issue.message === "string",
  );
};

const statusOf = (error: unknown): number | undefined => {
  if (!isObject(error)) return undefined;
  const status = error.status ?? error.statusCode;
  return typeof status === "number" ? status : undefined;
};

export const isNotFound = (error: unknown): boolean => statusOf(error) === 404;

export const failure = (error: unknown): string | undefined => {
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
  return undefined;
};
