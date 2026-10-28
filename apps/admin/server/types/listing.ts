import type { listing } from "@bbf/schema";
import type { z } from "zod";

export type Listing<T> = z.infer<ReturnType<typeof listing<z.ZodType<T>>>>;
