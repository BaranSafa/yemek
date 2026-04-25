import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // API JSON yerine HTML dönüyorsa (backend kapalı) reject et
    if (typeof res.data === 'string' && res.data.startsWith('<!')) {
      return Promise.reject(new Error('Backend sunucuya ulaşılamıyor'));
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  employeeLogin: (data) => api.post('/auth/employee-login', data),
  register: (data) => api.post('/auth/register', data),
  createEmployee: (data) => api.post('/auth/create-employee', data),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getAllAdmin: () => api.get('/products/admin'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  myOrders: () => api.get('/orders/my'),
  allOrders: (params) => api.get('/orders', { params }),
  deliver: (code) => api.post(`/orders/deliver/${code}`),
  stats: () => api.get('/orders/stats'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;
