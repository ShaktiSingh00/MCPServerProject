import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProductTools } from "./tools/productTools.js";
import { registerSupplierTools } from "./tools/supplierTools.js";
import { registerPurchaseOrderTools } from "./tools/purchaseOrderTools.js";
import { registerInventoryTools } from "./tools/inventoryTools.js";

const server = new McpServer({
  name: "inventory-mcp",
  version: "1.0.0",
});

console.error("Starting inventory-mcp server...");

registerProductTools(server);
registerSupplierTools(server);
registerPurchaseOrderTools(server);
registerInventoryTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
