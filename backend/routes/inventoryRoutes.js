import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";

const router = Router();

router.get("/", inventoryController.listInventory);
router.get("/movements", inventoryController.listStockMovements); // supports ?productId=
router.get("/:productId", inventoryController.getInventoryForProduct);
router.post("/:productId/stock-in", inventoryController.recordStockIn);
router.post("/:productId/stock-out", inventoryController.recordStockOut);

export default router;
