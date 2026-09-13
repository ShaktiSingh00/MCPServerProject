import { Router } from "express";
import * as supplierController from "../controllers/supplierController.js";

const router = Router();

router.get("/", supplierController.listSuppliers);
router.get("/:id", supplierController.getSupplier);
router.post("/", supplierController.createSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

export default router;
