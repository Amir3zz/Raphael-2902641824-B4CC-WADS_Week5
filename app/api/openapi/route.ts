import { NextResponse } from "next/server";

const openApiSpec = {
  openapi: "3.0.1",
  info: {
    title: "Assignment Logbook API",
    version: "1.0.0",
    description: "Simple API for managing assignments / todos (dev docs).",
  },
  servers: [
    {
      url: "/", // served relative to current host
      description: "Local server",
    },
  ],
  paths: {
    "/api/todos": {
      get: {
        summary: "List todos",
        description: "Returns a list of todos.",
        responses: {
          "200": {
            description: "Array of todos",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Todo" },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create todo",
        description: "Create a new todo. `dueDate` is optional (ISO 8601).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/NewTodo" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created todo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/todos/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "Todo ID",
        },
      ],
      patch: {
        summary: "Update a todo",
        description:
          "Update fields of a todo. Send only fields you want to change.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTodo" },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated todo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          "400": { description: "Validation error" },
          "404": { description: "Todo not found" },
        },
      },
      delete: {
        summary: "Delete a todo",
        description: "Delete the todo with the given id.",
        responses: {
          "204": { description: "Deleted" },
          "404": { description: "Todo not found" },
        },
      },
    },
  },
  components: {
    schemas: {
      Todo: {
        type: "object",
        properties: {
          id: { type: "string", example: "cl3f2a9f0000abc" },
          title: { type: "string", example: "Finish math assignment" },
          description: {
            type: ["string", "null"],
            example: "Chapter 5 questions",
          },
          completed: { type: "boolean", example: false },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-03-10T12:34:56.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-03-10T12:34:56.000Z",
          },
          dueDate: {
            type: ["string", "null"],
            format: "date-time",
            example: "2026-03-15T23:59:00.000Z",
          },
        },
        required: ["id", "title", "completed", "createdAt", "updatedAt"],
      },
      NewTodo: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: {
            type: "string",
            format: "date-time",
            description: "ISO 8601 string (optional)",
          },
        },
        required: ["title"],
      },
      UpdateTodo: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: ["string", "null"] },
          completed: { type: "boolean" },
          dueDate: {
            type: ["string", "null"],
            format: "date-time",
            description: "send null to clear due date",
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec);
}
