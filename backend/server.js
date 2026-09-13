import express from "express";
import cors from "cors";
import "./db/connection.js"; // opens the DB and applies schema.sql as a side effect
import { seedIfEmpty } from "./db/seed.js";
import productRoutes from "./routes/productRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// 4000 is already used by the unrelated "mcp project" demo server on this
// machine, so this project defaults to 4001. Override with PORT if needed.
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
