const BASE_URL = "/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // reponse sans corps JSON
  }

  if (!res.ok) {
    const message = data?.error || "Une erreur est survenue.";
    throw new Error(message);
  }

  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: (token) => request("/auth/me", { token }),

  getProducts: () => request("/products"),
  getProduct: (slug) => request(`/products/${slug}`),

  checkout: (items, token) =>
    request("/orders/checkout", { method: "POST", body: { items }, token }),
  getOrders: (token) => request("/orders", { token }),
  getOrderBySession: (sessionId, token) => request(`/orders/session/${sessionId}`, { token }),
};
