const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * The constraint of the database a write ran into, if that is what failed
 * it: the driver's error names one, and the database's service carries the
 * driver's error as its own error's cause.
 */
export const constraintOf = (error: unknown): string | undefined => {
  if (!isObject(error)) return undefined;
  if (typeof error.constraint === "string") return error.constraint;
  return constraintOf(error.cause);
};

/**
 * Runs a write, and hands back a refusal in place of its answer when the
 * database refused it over one of the constraints given, each under the
 * word the caller has for it: a name already taken, a folder that is gone.
 * Anything else that fails the write is thrown on.
 */
export const orRefused = async <T, R extends string>(
  refusals: Record<string, R>,
  write: () => Promise<T>,
): Promise<T | R> => {
  try {
    return await write();
  } catch (error) {
    const constraint = constraintOf(error);
    const refusal =
      constraint !== undefined && Object.hasOwn(refusals, constraint)
        ? refusals[constraint]
        : undefined;
    if (refusal === undefined) throw error;
    return refusal;
  }
};
