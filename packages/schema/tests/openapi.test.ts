import { describe, expect, it } from "vitest";
import { createDocument } from "zod-openapi";

import {
  churchEvent,
  eventBody,
  eventPath,
  eventsQuery,
  page,
  sermon,
  sermonPath,
  sermons,
  sermonsQuery,
  staffBody,
  staffMember,
  staffMembers,
  staffPath,
} from "../src";

/** A response of one shape, for the document's sake. */
const json = (schema: unknown) => ({
  description: "OK",
  content: { "application/json": { schema } },
});

/**
 * The document the server would build from these schemas: every model as a
 * response, every input as the parameters or the body of a request.
 */
const document = createDocument({
  openapi: "3.1.0",
  info: { title: "Butte Bible Fellowship", version: "0.0.0" },
  paths: {
    "/api/events": {
      get: {
        requestParams: { query: eventsQuery },
        responses: { 200: json(churchEvent.array()) },
      },
      post: {
        requestBody: { content: { "application/json": { schema: eventBody } } },
        responses: { 201: json(churchEvent) },
      },
    },
    "/api/events/{slug}": {
      get: {
        requestParams: { path: eventPath },
        responses: { 200: json(churchEvent) },
      },
    },
    "/api/sermons": {
      get: {
        requestParams: { query: sermonsQuery },
        responses: { 200: json(sermons) },
      },
    },
    "/api/sermons/{id}": {
      get: {
        requestParams: { path: sermonPath },
        responses: { 200: json(sermon) },
      },
    },
    "/api/staff": {
      get: { responses: { 200: json(staffMembers) } },
      post: {
        requestBody: { content: { "application/json": { schema: staffBody } } },
        responses: { 201: json(staffMember) },
      },
    },
    "/api/staff/{slug}": {
      get: {
        requestParams: { path: staffPath },
        responses: { 200: json(staffMember) },
      },
    },
    "/api/pages/{slug}": {
      get: { responses: { 200: json(page) } },
    },
  },
});

const schemas = document.components?.schemas ?? {};

/** The parameters of an operation, by name. */
const parameters = (path: string, method: "get" | "post") => {
  const operation = document.paths?.[path]?.[method];
  const list = (operation?.parameters ?? []) as Array<{
    name: string;
    in: string;
    required?: boolean;
    description?: string;
    schema: Record<string, unknown>;
  }>;
  return Object.fromEntries(
    list.map((parameter) => [parameter.name, parameter]),
  );
};

describe("the components", () => {
  it("name every model and every body", () => {
    expect(Object.keys(schemas).sort()).toEqual([
      "ChurchEvent",
      "ContentStatus",
      "EventBody",
      "EventDay",
      "EventTime",
      "Hero",
      "Page",
      "Sermon",
      "StaffBody",
      "StaffMember",
    ]);
  });

  it("render a shared primitive once, the same in a request and a response", () => {
    expect(schemas.EventDay).toMatchObject({
      type: "string",
      enum: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
    });
    expect(schemas.EventTime).toMatchObject({
      type: "string",
      pattern: "^\\d{2}:\\d{2}$",
    });
    expect(Object.keys(schemas).filter((id) => id.endsWith("Output"))).toEqual(
      [],
    );
  });

  it("refer to a primitive from the models and bodies that use it", () => {
    for (const id of ["ChurchEvent", "EventBody"]) {
      const { properties } = schemas[id] as {
        properties: Record<string, unknown>;
      };
      expect(properties.day).toMatchObject({
        $ref: "#/components/schemas/EventDay",
      });
      expect(properties.start).toMatchObject({
        $ref: "#/components/schemas/EventTime",
      });
    }
  });

  it("carry each model's description and the formats of its fields", () => {
    expect(schemas.Sermon).toMatchObject({
      description:
        "A sermon on the church's YouTube channel, as its feed lists it.",
      required: ["id", "title", "published", "thumbnail"],
      properties: {
        published: { format: "date-time" },
        thumbnail: { format: "uri" },
      },
    });
    expect(schemas.ChurchEvent).toMatchObject({
      required: ["title", "start"],
      properties: { date: { format: "date" } },
    });
    expect(schemas.StaffMember).toMatchObject({
      required: ["slug", "name", "role"],
      properties: { email: { format: "email" }, photo: { format: "uri" } },
    });
    expect(schemas.StaffBody).toMatchObject({
      properties: { status: { $ref: "#/components/schemas/ContentStatus" } },
    });
  });

  it("nest a model in the page that lists it", () => {
    expect(schemas.Page).toMatchObject({
      properties: {
        hero: { $ref: "#/components/schemas/Hero" },
        events: { items: { $ref: "#/components/schemas/ChurchEvent" } },
      },
    });
  });
});

describe("the requests", () => {
  it("take a path parameter, required, with what it is", () => {
    const { slug } = parameters("/api/events/{slug}", "get");
    expect(slug).toMatchObject({
      in: "path",
      required: true,
      description: "What the event's own page is called in its address.",
      schema: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    });
  });

  it("take a query parameter, optional, with its default", () => {
    const { limit } = parameters("/api/sermons", "get");
    expect(limit).toMatchObject({
      in: "query",
      schema: { type: "integer", minimum: 1, maximum: 50, default: 15 },
    });
    expect(limit?.required).toBeUndefined();
  });

  it("take a body by its name", () => {
    const post = document.paths?.["/api/events"]?.post;
    expect(post?.requestBody).toMatchObject({
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/EventBody" },
        },
      },
    });
    expect(schemas.EventBody).toMatchObject({
      required: ["slug", "title", "start"],
    });
  });

  it("answer with a model by its name", () => {
    const get = document.paths?.["/api/sermons"]?.get;
    expect(get?.responses?.[200]).toMatchObject({
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { $ref: "#/components/schemas/Sermon" },
          },
        },
      },
    });
  });
});
