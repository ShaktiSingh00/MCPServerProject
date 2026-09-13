import * as productService from "../services/productService.js";

export function listProducts(req, res) {
  const { search } = req.query;
  const products = search ? productService.searchProducts(search) : productService.getAllProducts();
  res.json(products);
}

export function lowStockProducts(req, res) {
  res.json(productService.getLowStockProducts());
}

export function getProduct(req, res) {
  const product = productService.getProductById(Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}

export function createProduct(req, res) {
  try {
    const product = productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function updateProduct(req, res) {
  try {
    const product = productService.updateProduct(Number(req.params.id), req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function deleteProduct(req, res) {
  const ok = productService.deleteProduct(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "Product not found" });
  res.status(204).end();
}
