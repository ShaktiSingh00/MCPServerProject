import { z } from "zod";
import { get, post, put } from "../services/apiClient.js";
import { ok, safely } from "../services/toolResult.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function calculateTotal({ quantity, price, gstPercent = 0, freight = 0, packing = 0 }) {
  const subtotal = quantity * price;
  const gst = subtotal * (gstPercent / 100);
  return { subtotal, gst, freight, packing, total: subtotal + gst + freight + packing };
}

export function registerPurchaseOrderTools(server) {
  server.registerTool(
    "get_purchase_orders",
    {
      title: "Get purchase orders",
      description: "List purchase orders. Optionally filter by supplier name (partial match) or status.",
      inputSchema: {
        supplier: z.string().optional().describe("Filter by supplier name, e.g. 'ABC Supplier'"),
        status: z.enum(["Pending", "Approved", "Received"]).optional(),
      },
    },
    safely(async ({ supplier, status }) => {
      const params = new URLSearchParams();
      if (supplier) params.set("supplier", supplier);
      if (status) params.set("status", status);
      const qs = params.toString();
      return ok(await get(`/purchase-orders${qs ? `?${qs}` : ""}`));
    })
  );

  server.registerTool(
    "get_purchase_order",
    {
      title: "Get a purchase order by ID",
      description: "Look up a single purchase order by its numeric ID.",
      inputSchema: { id: z.number() },
    },
    safely(async ({ id }) => ok(await get(`/purchase-orders/${id}`)))
  );

  server.registerTool(
    "get_supplier_orders",
    {
      title: "Get orders for a supplier",
      description: "List all purchase orders placed with a specific supplier.",
      inputSchema: { supplier: z.string().describe("Supplier name") },
    },
    safely(async ({ supplier }) => ok(await get(`/purchase-orders?supplier=${encodeURIComponent(supplier)}`)))
  );

  server.registerTool(
    "get_pending_purchase_orders",
    {
      title: "Get pending purchase orders",
      description: "List purchase orders that are still awaiting approval or receipt.",
      inputSchema: {},
    },
    safely(async () => ok(await get("/purchase-orders?status=Pending")))
  );

  server.registerTool(
    "calculate_purchase_order_total",
    {
      title: "Calculate a purchase order total",
      description: "Compute subtotal, GST and grand total for a hypothetical purchase order, without creating it. Useful for quoting before committing.",
      inputSchema: {
        quantity: z.number(),
        price: z.number().describe("Price per unit"),
        gstPercent: z.number().optional().describe("GST percentage, default 0"),
        freight: z.number().optional().describe("Freight charges, default 0"),
        packing: z.number().optional().describe("Packing charges, default 0"),
      },
    },
    safely(async (data) => ok(calculateTotal(data)))
  );

  server.registerTool(
    "get_monthly_purchase_summary",
    {
      title: "Get monthly purchase summary",
      description: "Total purchase order value and count, grouped by order month, across all suppliers.",
      inputSchema: {},
    },
    safely(async () => {
      const orders = await get("/purchase-orders");
      const byMonth = new Map();
      for (const po of orders) {
        const [year, month] = po.date.split("-");
        const key = `${year}-${month}`;
        const entry = byMonth.get(key) ?? { month: `${MONTH_NAMES[Number(month) - 1]} ${year}`, total: 0, count: 0 };
        entry.total += po.totalAmount;
        entry.count += 1;
        byMonth.set(key, entry);
      }
      return ok([...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v));
    })
  );

  server.registerTool(
    "create_purchase_order",
    {
      title: "Create a purchase order",
      description: "Create a new purchase order for a supplier and product. The server computes GST, adds freight/packing, and assigns the next PO number. New POs always start as 'Pending'.",
      inputSchema: {
        supplier: z.string().describe("Existing supplier name, e.g. 'ABC Supplier'"),
        productName: z.string().describe("Existing product name, e.g. 'Keyboard'"),
        quantity: z.number(),
        price: z.number().describe("Price per unit"),
        gstPercent: z.number().optional().describe("GST percentage, default 0"),
        freight: z.number().optional().describe("Freight charges, default 0"),
        packing: z.number().optional().describe("Packing charges, default 0"),
      },
    },
    safely(async (data) => ok(await post("/purchase-orders", data)))
  );

  server.registerTool(
    "update_purchase_order_status",
    {
      title: "Update purchase order status",
      description: "Move a purchase order to Pending, Approved or Received.",
      inputSchema: {
        id: z.number(),
        status: z.enum(["Pending", "Approved", "Received"]),
      },
    },
    safely(async ({ id, status }) => ok(await put(`/purchase-orders/${id}/status`, { status })))
  );
}
