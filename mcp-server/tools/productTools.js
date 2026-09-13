import { z } from "zod";
import { get, post, put, del } from "../services/apiClient.js";
import { ok, safely } from "../services/toolResult.js";

export function registerProductTools(server) {
  server.registerTool(
    "get_products",
    {
      title: "Get all products",
      description: "List every product in the catalog, including current stock, threshold and status (In Stock / Low Stock).",
      inputSchema: {},
    },
    safely(async () => ok(await get("/products")))
  );

  server.registerTool(
    "get_product",
    {
      title: "Get a product by ID",
      description: "Look up a single product by its numeric ID.",
      inputSchema: { id: z.number().describe("Product ID") },
    },
    safely(async ({ id }) => ok(await get(`/products/${id}`)))
  );

  server.registerTool(
    "search_products",
    {
      title: "Search products",
      description: "Search products by name, part code or category (partial match).",
      inputSchema: { query: z.string().describe("Text to search for") },
    },
    safely(async ({ query }) => ok(await get(`/products?search=${encodeURIComponent(query)}`)))
  );

  server.registerTool(
    "get_low_stock_products",
    {
      title: "Get low stock products",
      description: "List products whose current stock is at or below their low-stock threshold.",
      inputSchema: {},
    },
    safely(async () => ok(await get("/products/low-stock")))
  );

  server.registerTool(
    "create_product",
    {
      title: "Create a product",
      description: "Add a new product to the catalog.",
      inputSchema: {
        name: z.string(),
        partCode: z.string().describe("Unique part/SKU code"),
        category: z.string(),
        price: z.number(),
        quantity: z.number().optional().describe("Initial stock quantity, default 0"),
        threshold: z.number().optional().describe("Low stock threshold, default 0"),
        supplier: z.string().optional().describe("Supplier name, must already exist"),
      },
    },
    safely(async (data) => ok(await post("/products", data)))
  );

  server.registerTool(
    "update_product",
    {
      title: "Update a product",
      description: "Update one or more fields on an existing product. Only send fields that changed.",
      inputSchema: {
        id: z.number(),
        name: z.string().optional(),
        partCode: z.string().optional(),
        category: z.string().optional(),
        price: z.number().optional(),
        quantity: z.number().optional().describe("Overrides current stock directly"),
        threshold: z.number().optional(),
        supplier: z.string().optional(),
      },
    },
    safely(async ({ id, ...data }) => ok(await put(`/products/${id}`, data)))
  );

  server.registerTool(
    "delete_product",
    {
      title: "Delete a product",
      description: "Permanently remove a product from the catalog.",
      inputSchema: { id: z.number() },
    },
    safely(async ({ id }) => {
      await del(`/products/${id}`);
      return ok({ deleted: true, id });
    })
  );
}
