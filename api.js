/* ROMA WATCH - لایه ارتباط با بک‌اند
   این فایل باید قبل از script.js / cart.js / login.js لود بشه. */
const RomaAPI = (() => {
  // وقتی بک‌اند رو روی سرور واقعی دیپلوی کردی، فقط همین آدرس رو عوض کن
  const BASE_URL = "http://localhost:4000/api";

  const TOKEN_KEY = "roma_token";
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);
  const isLoggedIn = () => !!getToken();

  async function request(path, options = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    let body = null;
    try {
      body = await res.json();
    } catch {
      /* بدنه خالی یا غیر JSON */
    }
    if (!res.ok) {
      throw new Error(body?.error || `خطا در ارتباط با سرور (${res.status})`);
    }
    return body;
  }

  return {
    getToken,
    setToken,
    clearToken,
    isLoggedIn,
    auth: {
      sendOtp: (phone) => request("/auth/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
      verifyOtp: (phone, code) =>
        request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, code }) }),
      me: () => request("/auth/me"),
    },
    products: {
      list: (query = "") => request(`/products${query}`),
      get: (id) => request(`/products/${id}`),
    },
    cart: {
      get: () => request("/cart"),
      add: (productId, qty = 1) =>
        request("/cart", { method: "POST", body: JSON.stringify({ productId, qty }) }),
      update: (productId, qty) =>
        request(`/cart/${productId}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
      remove: (productId) => request(`/cart/${productId}`, { method: "DELETE" }),
      clear: () => request("/cart", { method: "DELETE" }),
    },
    favorites: {
      get: () => request("/favorites"),
      toggle: (productId) => request(`/favorites/${productId}`, { method: "POST" }),
    },
    orders: {
      create: () => request("/orders", { method: "POST" }),
      mine: () => request("/orders"),
      track: (code) => request(`/orders/track/${encodeURIComponent(code)}`),
    },
  };
})();
