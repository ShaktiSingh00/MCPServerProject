import { z } from "zod";
import { get, post, put, del } from "../services/apiClient.js";
import { ok, safely } from "../services/toolResult.js";

export function registerSupplierTools(server) {
  server.registerTool(
    "get_suppliers",
    {
      title: "Get all suppliers",
      description: "List every supplier with their contact details and status.",
      inputSchema: {},
    },
    safely(async () => ok(await get("/suppliers")))
  );

  server.registerTool(
    "get_supplier",
    {
      title: "Get a supplier by ID",
      description: "Look up a single supplier by its numeric ID.",
      inputSchema: { id: z.number() },
    },
    safely(async ({ id }) => ok(await get(`/suppliers/${id}`)))
  );

  server.registerTool(
    "create_supplier",
    {
      title: "Create a supplier",
      description: "Add a new supplier.",
      inputSchema: {
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(["Active", "Inactive"]).optional(),
      },
    },
    safely(async (data) => ok(await post("/suppliers", data)))
  );

  server.registerTool(
    "update_supplier",
    {
      title: "Update a supplier",
      description: "Update one or more fields on an existing supplier.",
      inputSchema: {
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.enum(["Active", "Inactive"]).optional(),
      },
    },
    safely(async ({ id, ...data }) => ok(await put(`/suppliers/${id}`, data)))
  );

  server.registerTool(
    "delete_supplier",
    {
      title: "Delete a supplier",
      description: "Permanently remove a supplier.",
      inputSchema: { id: z.number() },
    },
    safely(async ({ id }) => {
      await del(`/suppliers/${id}`);
      return ok({ deleted: true, id });
    })
  );
}
