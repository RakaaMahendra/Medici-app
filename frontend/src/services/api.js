import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("medici_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("medici_token");
      localStorage.removeItem("medici_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

// Products
export const productAPI = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCOGS: (productId) => api.get(`/products/cogs/${productId}`),
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Suppliers
export const supplierAPI = {
  getAll: () => api.get("/suppliers"),
  getOne: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Materials
export const materialAPI = {
  getAll: () => api.get("/materials"),
  getOne: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post("/materials", data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  addPrice: (data) => api.post("/materials/prices", data),
  updatePrice: (id, data) => api.put(`/materials/prices/${id}`, data),
  deletePrice: (id) => api.delete(`/materials/prices/${id}`),
};

// Recipes
export const recipeAPI = {
  getAll: () => api.get("/recipes"),
  getByProduct: (productId) => api.get(`/recipes/product/${productId}`),
  create: (data) => api.post("/recipes", data),
  update: (id, data) => api.put(`/recipes/${id}`, data),
  delete: (id) => api.delete(`/recipes/${id}`),
};

// Stocks
export const stockAPI = {
  getAll: () => api.get("/stocks"),
  adjust: (data) => api.post("/stocks/adjust", data),
  getLogs: (params) => api.get("/stocks/logs", { params }),
};

// Productions
export const productionAPI = {
  create: (data) => api.post("/productions", data),
  getReport: (params) => api.get("/productions", { params }),
};

// Sales
export const saleAPI = {
  create: (data) => api.post("/sales", data),
  getReport: (params) => api.get("/sales", { params }),
};

// Dashboard
export const dashboardAPI = {
  get: () => api.get("/dashboard"),
};

export default api;
