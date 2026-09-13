import { z } from "zod";
import { get, post } from "../services/apiClient.js";
import { ok, safely } from "../services/toolResult.js";

export function registerInventoryTools(server) {
  server.registerTool(
    "get_inventory",
    {
      title: "Get inventory",
      description: "List opening stock, stock in, stock out and current stock for every product.",
      inputSchema: {},
    },
    safely(async () => ok(await get("/inventory")))
  );

  server.registerTool(
    "get_product_stock",
    {
      title: "Get stock for one product",
      description: "Opening stock, stock in, stock out and current stock for a single product.",
      inputSchema: { productId: z.number() },
    },
    safely(async ({ productId }) => ok(await get(`/inventory/${productId}`)))
  );

  server.registerTool(
    "get_stock_movements",
    {
      title: "Get stock movements",
      description: "List individual stock in/out events, most recent first. Optionally filter to one product.",
      inputSchema: { productId: z.number().optional() },
    },
    safely(async ({ productId }) =>
      ok(await get(`/inventory/movements${productId ? `?productId=${productId}` : ""}`))
    )
  );

  server.registerTool(
    "record_stock_in",
    {
      title: "Record stock in",
      description: "Log incoming stock for a product (e.g. a delivery arrived) and increase its current stock.",
      inputSchema: {
        productId: z.number(),
        quantity: z.number().describe("Must be positive"),
        note: z.string().optional(),
      },
    },
    safely(async ({ productId, quantity, note }) => ok(await post(`/inventory/${productId}/stock-in`, { quantity, note })))
  );

  server.registerTool(
    "record_stock_out",
    {
      title: "Record stock out",
      description: "Log outgoing stock for a product (e.g. issued to a team) and decrease its current stock.",
      inputSchema: {
        productId: z.number(),
        quantity: z.number().describe("Must be positive"),
        note: z.string().optional(),
      },
    },
    safely(async ({ productId, quantity, note }) => ok(await post(`/inventory/${productId}/stock-out`, { quantity, note })))
  );
}
