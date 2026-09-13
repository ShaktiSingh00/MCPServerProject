import { get, post, put, del } from "./client";

export const getProducts = () => get("/products");
export const getLowStockProducts = () => get("/products/low-stock");
export const getProduct = (id) => get(`/products/${id}`);
export const createProduct = (data) => post("/products", data);
export const updateProduct = (id, data) => put(`/products/${id}`, data);
export const deleteProduct = (id) => del(`/products/${id}`);
