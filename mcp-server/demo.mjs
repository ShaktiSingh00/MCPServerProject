// A repeatable, scriptable demo that proves the MCP server works — no
// Claude Code restart and no Anthropic API credits required. It connects to
// mcp-server/server.js exactly the way a real MCP client (Claude Code,
// Claude Desktop, your own backend) would: spawn it, list its tools, call
// a few of them, read the results back.
//
// Run with: npm run demo   (needs the backend running on :4001 first)

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function section(title) {
  console.log(`\n\x1b[1m\x1b[36m${title}\x1b[0m`);
  console.log("-".repeat(title.length));
}

function printResult(result) {
  const text = result.content?.[0]?.text ?? "";
  const preview = text.length > 500 ? `${text.slice(0, 500)}...` : text;
  console.log(result.isError ? `\x1b[31m${preview}\x1b[0m` : preview);
}

const client = new Client({ name: "demo-client", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [join(__dirname, "server.js")],
});

console.log("Connecting to inventory-mcp over stdio...");
await client.connect(transport);
console.log("Connected.");

section(`Tool discovery — what can this server do?`);
const { tools } = await client.listTools();
console.log(`Server exposes ${tools.length} tools:\n`);
for (const t of tools) console.log(`  • ${t.name}`);

section("Demo 1 — 'Which products have low stock?'");
console.log("> calling get_low_stock_products()\n");
printResult(await client.callTool({ name: "get_low_stock_products", arguments: {} }));

section("Demo 2 — 'Find anything related to keyboards'");
console.log("> calling search_products({ query: 'keyboard' })\n");
printResult(await client.callTool({ name: "search_products", arguments: { query: "keyboard" } }));

section("Demo 3 — 'What would a PO for 20 keyboards at ₹500 cost, with 18% GST?'");
console.log("> calling calculate_purchase_order_total({ quantity: 20, price: 500, gstPercent: 18 })\n");
printResult(
  await client.callTool({
    name: "calculate_purchase_order_total",
    arguments: { quantity: 20, price: 500, gstPercent: 18 },
  })
);

section("Demo 4 — 'Create that purchase order for real'");
console.log("> calling create_purchase_order({ supplier: 'ABC Supplier', productName: 'Keyboard', quantity: 20, price: 500, gstPercent: 18 })\n");
printResult(
  await client.callTool({
    name: "create_purchase_order",
    arguments: { supplier: "ABC Supplier", productName: "Keyboard", quantity: 20, price: 500, gstPercent: 18 },
  })
);

section("Demo 5 — error handling: asking for a product that doesn't exist");
console.log("> calling get_product({ id: 999999 })\n");
printResult(await client.callTool({ name: "get_product", arguments: { id: 999999 } }));

console.log("\nDone. Every call above went: this script -> MCP server -> Express REST API -> SQLite -> back.");
await client.close();
process.exit(0);
