const API_BASE_URL = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('freshharvest_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const authService = {
  async register({ name, email, password, phone, role }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('freshharvest_token', data.token);
      localStorage.setItem('freshharvest_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login({ email, password }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('freshharvest_token', data.token);
      localStorage.setItem('freshharvest_user', JSON.stringify(data.user));
    }
    return data;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  async resetPassword({ resetToken, newPassword }) {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('freshharvest_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('freshharvest_token');
    localStorage.removeItem('freshharvest_user');
  }
};

export const profileService = {
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateProfile({ name, phone }) {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ name, phone })
    });
    const data = await handleResponse(res);
    if (data.user) {
      localStorage.setItem('freshharvest_user', JSON.stringify(data.user));
    }
    return data;
  },

  async addAddress(address) {
    const res = await fetch(`${API_BASE_URL}/profile/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(address)
    });
    return handleResponse(res);
  },

  async updateAddress(addressId, address) {
    const res = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(address)
    });
    return handleResponse(res);
  },

  async deleteAddress(addressId) {
    const res = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async setDefaultAddress(addressId) {
    const res = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}/default`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};

export const productService = {
  async getProducts({ search = '', category = 'All', page = 1, limit = 6, sortBy = 'newest' } = {}) {
    const params = new URLSearchParams({
      search,
      category,
      page: page.toString(),
      limit: limit.toString(),
      sortBy
    });
    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(res);
  },

  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/products/categories`);
    return handleResponse(res);
  }
};
