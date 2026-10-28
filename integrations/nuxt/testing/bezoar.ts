import { vi } from "vitest";

export const service = {};

export const useBezoar = vi.fn(() => service);

export const closeBezoar = vi.fn(async () => {});
