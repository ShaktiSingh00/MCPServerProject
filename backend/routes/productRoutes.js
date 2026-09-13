import { Router } from "express";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/", productController.listProducts); // supports ?search=
router.get("/low-stock", productController.lowStockProducts);
router.get("/:id", productController.getProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

export default router;
