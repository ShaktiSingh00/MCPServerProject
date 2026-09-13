import { Router } from "express";
import * as purchaseOrderController from "../controllers/purchaseOrderController.js";

const router = Router();

router.get("/", purchaseOrderController.listPurchaseOrders); // supports ?supplier= or ?status=
router.get("/:id", purchaseOrderController.getPurchaseOrder);
router.post("/", purchaseOrderController.createPurchaseOrder);
router.put("/:id/status", purchaseOrderController.updatePurchaseOrderStatus);
router.delete("/:id", purchaseOrderController.deletePurchaseOrder);

export default router;
