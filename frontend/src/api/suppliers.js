import { get, post, put, del } from "./client";

export const getSuppliers = () => get("/suppliers");
export const getSupplier = (id) => get(`/suppliers/${id}`);
export const createSupplier = (data) => post("/suppliers", data);
export const updateSupplier = (id, data) => put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => del(`/suppliers/${id}`);
