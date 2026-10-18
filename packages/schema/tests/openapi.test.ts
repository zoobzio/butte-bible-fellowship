import { describe, expect, it } from "vitest";
import { createDocument } from "zod-openapi";

import {
  churchEvent,
  churchEvents,
  eventBody,
  eventPath,
  eventsQuery,
  page,
  sermon,
  sermonBody,
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
        responses: { 200: json(churchEvents) },
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
      post: {
        requestBody: {
          content: { "application/json": { schema: sermonBody } },
        },
        responses: { 201: json(sermon) },
      },
    },
    "/api/sermons/{slug}": {
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
      "Hast",
      "HastElement",
      "HastText",
      "Hero",
      "Page",
      "Sermon",
      "SermonBody",
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
        "A sermon preached at the church: the day it was preached, who preached it, and its recording on the church's YouTube channel.",
      required: ["slug", "title", "date"],
      properties: {
        date: { format: "date" },
        image: { format: "uri" },
        body: { $ref: "#/components/schemas/Hast" },
      },
    });
    expect(schemas.SermonBody).toMatchObject({
      required: ["slug", "title", "date"],
      properties: {
        body: { type: "string" },
        status: { $ref: "#/components/schemas/ContentStatus" },
      },
    });
    expect(schemas.ChurchEvent).toMatchObject({
      required: ["slug", "title", "start"],
      properties: {
        date: { format: "date" },
        image: { format: "uri" },
        body: { $ref: "#/components/schemas/Hast" },
      },
    });
    expect(schemas.EventBody).toMatchObject({
      properties: { status: { $ref: "#/components/schemas/ContentStatus" } },
    });
    expect(schemas.StaffMember).toMatchObject({
      required: ["slug", "name", "role"],
      properties: {
        email: { format: "email" },
        photo: { format: "uri" },
        bio: { $ref: "#/components/schemas/Hast" },
      },
    });
    expect(schemas.StaffBody).toMatchObject({
      properties: { status: { $ref: "#/components/schemas/ContentStatus" } },
    });
  });

  it("render rich text as a tree that refers to itself", () => {
    const items = {
      anyOf: [
        { $ref: "#/components/schemas/HastElement" },
        { $ref: "#/components/schemas/HastText" },
      ],
    };
    expect(schemas.Hast).toMatchObject({
      required: ["type", "children"],
      properties: { children: { type: "array", items } },
    });
    expect(schemas.HastElement).toMatchObject({
      required: ["type", "tagName", "properties", "children"],
      properties: { children: { type: "array", items } },
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
