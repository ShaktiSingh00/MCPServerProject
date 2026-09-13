# Inventory MCP Project

A small Inventory Management Dashboard built in phases:
React frontend → Node/Express backend + SQLite → MCP server → AI wiring → auth.

## Status

- [x] **Phase 1 — React frontend** (`frontend/`): Dashboard, Products, Suppliers,
      Purchase Orders, Inventory, Reports (placeholder), AI Assistant (UI only),
      Settings.
- [x] **Phase 2 — Node.js/Express backend + SQLite** (`backend/`): full REST API,
      real database, seeded with sample data.
- [x] **Frontend ↔ backend wired up** (`frontend/src/api/`): every page above
      (except AI Assistant, still a placeholder) reads and writes through the
      real REST API — no more mock data in the app. Reports computes total
      inventory value, total purchase value, PO status counts, supplier
      spend, monthly purchase totals and the stock-movement trend, all from
      live data.
- [x] **Phase 3 — MCP server** (`mcp-server/`): 25 tools covering products,
      suppliers, purchase orders and inventory — reads and writes, all
      proxied through the Phase 2 REST API. See below.
- [x] **Phase 4 — Wire the AI Assistant UI to the MCP-backed endpoint** (`backend/routes/aiRoutes.js`,
      `backend/services/{mcpClient,aiChatService}.js`): `POST /api/ai/chat` spawns
      `mcp-server/server.js` over stdio (`@modelcontextprotocol/sdk` `Client` +
      `StdioClientTransport`), lists its 25 tools, and runs a manual Claude
      tool-use loop (`@anthropic-ai/sdk`) against them — the AI Assistant page
      (`frontend/src/pages/AIAssistant.jsx`) now sends real conversations
      through `frontend/src/api/ai.js` instead of canned replies. Requires
      `ANTHROPIC_API_KEY` in `backend/.env` (see `.env.example`); without it
      the endpoint returns a clear error instead of crashing.
- [ ] Phase 5 — Authentication (JWT login, protected routes)

## Structure

```
project2/
├── frontend/         React (Vite) — Phase 1, done, now wired to the API
│   └── src/api/        one file per resource — the only place fetch() lives
├── backend/          Node.js/Express + SQLite — Phase 2, done
│   ├── server.js
│   ├── db/            schema.sql, connection.js, seed.js, inventory.db (generated)
│   ├── routes/         one file per resource
│   ├── controllers/    req/res handling + status codes
│   └── services/       all SQL lives here
├── mcp-server/        MCP server (tools call the backend API) — Phase 3, done
│   ├── server.js         creates the McpServer, registers every tool group
│   ├── services/
│   │   ├── apiClient.js    fetch wrapper — the ONLY thing that talks to the backend
│   │   └── toolResult.js   ok()/fail()/safely() helpers shared by every tool
│   └── tools/              one file per resource, same shape as backend/routes
└── README.md
```

## Run the backend

```bash
cd backend
npm install
npm run dev          # node --watch, restarts on file changes
```

Runs on **http://localhost:4001** (port 4000 was already taken by an unrelated
project on this machine — override with `PORT=xxxx npm run dev` if you like).
On first run it creates `db/inventory.db` (SQLite file, gitignored) and seeds
it with sample suppliers, products, purchase orders and stock movements.

Uses Node's built-in `node:sqlite` module (no native build step). It's
labelled experimental by Node; swap in `better-sqlite3` later if you want a
stable driver — the `db.prepare(...).get()/.all()/.run()` API is the same.

### Data model

- **suppliers** — id, name, email, phone, address, status
- **products** — id, name, part_code, category, price, opening_stock, threshold, supplier_id
- **stock_movements** — every stock in/out event (product_id, type, quantity, note, created_at).
  A product's current stock is *always* `opening_stock + SUM(in) - SUM(out)` computed
  from this table — never stored redundantly.
- **purchase_orders** — po_number, supplier_id, product_id, quantity, price, gst_percent,
  freight, packing, total, status, order_date

### REST API

**Products**
| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | supports `?search=` |
| GET | `/api/products/low-stock` | |
| GET | `/api/products/:id` | |
| POST | `/api/products` | `{ name, partCode, category, price, quantity, threshold, supplier }` |
| PUT | `/api/products/:id` | partial update; editing `quantity` re-derives opening_stock |
| DELETE | `/api/products/:id` | |

**Suppliers**
| Method | Path |
|---|---|
| GET | `/api/suppliers` |
| GET | `/api/suppliers/:id` |
| POST | `/api/suppliers` |
| PUT | `/api/suppliers/:id` |
| DELETE | `/api/suppliers/:id` |

**Purchase Orders**
| Method | Path | Notes |
|---|---|---|
| GET | `/api/purchase-orders` | supports `?supplier=` or `?status=` |
| GET | `/api/purchase-orders/:id` | |
| POST | `/api/purchase-orders` | `{ supplier, productName, quantity, price, gstPercent, freight, packing }` — server computes `total` and the next `PO-YYYY-NNNN` number |
| PUT | `/api/purchase-orders/:id/status` | `{ status: "Pending" \| "Approved" \| "Received" }` |
| DELETE | `/api/purchase-orders/:id` | |

**Inventory**
| Method | Path | Notes |
|---|---|---|
| GET | `/api/inventory` | opening/in/out/current stock per product |
| GET | `/api/inventory/movements` | supports `?productId=` |
| GET | `/api/inventory/:productId` | |
| POST | `/api/inventory/:productId/stock-in` | `{ quantity, note? }` |
| POST | `/api/inventory/:productId/stock-out` | `{ quantity, note? }` |

**Dashboard**
| Method | Path | Notes |
|---|---|---|
| GET | `/api/dashboard/summary` | stats, categoryDistribution, stockOverview (monthly), recentPurchaseOrders, lowStockProducts — everything the Dashboard page needs in one call |

All endpoints verified with curl during development (CRUD, search/filter,
validation errors, 404s, aggregations).

## Run the MCP server

```bash
cd mcp-server
npm install
```

It's not something you "run and see" — it's a subprocess an MCP client
(Claude Code, Claude Desktop, etc.) launches over stdio. It needs the backend
running on port 4001 (or set `API_BASE`) since every tool proxies to it.

Registered in this machine's `~/Desktop/React/.mcp.json` as `inventory-mcp`,
alongside the older `mcp-demo` server. **Restart Claude Code (or reload the
window) for a newly-added server to be picked up** — check with `/mcp` once
it restarts.

### Tools (25)

**Products** — `get_products`, `get_product`, `search_products`,
`get_low_stock_products`, `create_product`, `update_product`, `delete_product`

**Suppliers** — `get_suppliers`, `get_supplier`, `create_supplier`,
`update_supplier`, `delete_supplier`

**Purchase Orders** — `get_purchase_orders` (filter by `supplier`/`status`),
`get_purchase_order`, `get_supplier_orders`, `get_pending_purchase_orders`,
`calculate_purchase_order_total` (pure math, no DB write),
`get_monthly_purchase_summary`, `create_purchase_order`,
`update_purchase_order_status`

**Inventory** — `get_inventory`, `get_product_stock`, `get_stock_movements`,
`record_stock_in`, `record_stock_out`

### How it's built

Every tool file follows the same shape:

```js
server.registerTool(
  "get_products",
  { title: "...", description: "...", inputSchema: { /* zod */ } },
  safely(async (args) => ok(await get("/products")))
);
```

- `inputSchema` is Zod — the SDK validates arguments before your handler runs
- `description` is what the AI reads to decide *when* to call this tool, so
  it's written like documentation, not a code comment
- `safely()` / `ok()` / `fail()` (in `services/toolResult.js`) turn a thrown
  `Error` from the API client into a proper MCP error result instead of
  crashing the process
- `services/apiClient.js` is a straight port of `frontend/src/api/client.js`
  to Node's built-in `fetch` — same interface, different environment

Verified with a standalone test script using the SDK's `Client` +
`StdioClientTransport` to spawn the server and call all the key tools against
the live backend — including the spec's own example, `create_purchase_order`
for 20 Keyboards from ABC Supplier, which produced a real PO with the correct
computed total.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Reads its API URL from `VITE_API_BASE` (see `.env.example`), defaulting to
`http://localhost:4001/api` — start the backend first, or the pages will show
an error state with a Retry button. Every page except Reports and AI
Assistant (still placeholders) fetches real data and writes through the API:
Products and Suppliers do full create/edit/delete, Purchase Orders creates
real POs (server computes the total and PO number), and Inventory's stock
in/out buttons hit `/inventory/:id/stock-in` and `/stock-out` and update the
current-stock numbers you see live.
