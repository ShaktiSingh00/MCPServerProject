const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4001/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const get = (path) => request(path);
export const post = (path, data) => request(path, { method: "POST", body: JSON.stringify(data) });
export const put = (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) });
export const del = (path) => request(path, { method: "DELETE" });
