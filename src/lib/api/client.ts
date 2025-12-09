const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async getMe(token: string) {
    return this.request('/auth/me', { token });
  }

  // User endpoints
  async getProfile(token: string) {
    return this.request('/users/me', { token });
  }

  async updateProfile(token: string, data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async getPublicProfile(userId: string) {
    return this.request(`/users/${userId}`);
  }

  // Equipment endpoints
  async getEquipment(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/equipment${query}`);
  }

  async getEquipmentById(id: string) {
    return this.request(`/equipment/${id}`);
  }

  async getFeaturedEquipment(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/equipment/featured${query}`);
  }

  async getMyEquipment(token: string) {
    return this.request('/equipment/my-listings', { token });
  }

  async createEquipment(token: string, data: any) {
    return this.request('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateEquipment(token: string, id: string, data: any) {
    return this.request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteEquipment(token: string, id: string) {
    return this.request(`/equipment/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Land endpoints
  async getLand(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/land${query}`);
  }

  async getLandById(id: string) {
    return this.request(`/land/${id}`);
  }

  async getFeaturedLand(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/land/featured${query}`);
  }

  async getMyLand(token: string) {
    return this.request('/land/my-listings', { token });
  }

  async createLand(token: string, data: any) {
    return this.request('/land', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateLand(token: string, id: string, data: any) {
    return this.request(`/land/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteLand(token: string, id: string) {
    return this.request(`/land/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Animals endpoints
  async getAnimals(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/animals${query}`);
  }

  async getAnimalById(id: string) {
    return this.request(`/animals/${id}`);
  }

  async getFeaturedAnimals(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/animals/featured${query}`);
  }

  async getMyAnimals(token: string) {
    return this.request('/animals/my-listings', { token });
  }

  async createAnimal(token: string, data: any) {
    return this.request('/animals', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateAnimal(token: string, id: string, data: any) {
    return this.request(`/animals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteAnimal(token: string, id: string) {
    return this.request(`/animals/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Vegetables endpoints
  async getVegetables(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/vegetables${query}`);
  }

  async getVegetableById(id: string) {
    return this.request(`/vegetables/${id}`);
  }

  async getFeaturedVegetables(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/vegetables/featured${query}`);
  }

  async getMyVegetables(token: string) {
    return this.request('/vegetables/my-listings', { token });
  }

  async createVegetable(token: string, data: any) {
    return this.request('/vegetables', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateVegetable(token: string, id: string, data: any) {
    return this.request(`/vegetables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteVegetable(token: string, id: string) {
    return this.request(`/vegetables/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Nurseries endpoints
  async getNurseries(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/nurseries${query}`);
  }

  async getNurseryById(id: string) {
    return this.request(`/nurseries/${id}`);
  }

  async getFeaturedNurseries(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/nurseries/featured${query}`);
  }

  async getMyNurseries(token: string) {
    return this.request('/nurseries/my-listings', { token });
  }

  async createNursery(token: string, data: any) {
    return this.request('/nurseries', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    });
  }

  async updateNursery(token: string, id: string, data: any) {
    return this.request(`/nurseries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    });
  }

  async deleteNursery(token: string, id: string) {
    return this.request(`/nurseries/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryById(id: string) {
    return this.request(`/categories/${id}`);
  }

  // Search endpoints
  async search(query: string, params?: Record<string, string>) {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return this.request(`/search?${searchParams.toString()}`);
  }

  async getSuggestions(query: string) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getLocations() {
    return this.request('/search/locations');
  }

  // Upload endpoints
  async uploadFile(token: string, file: File, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);

    const query = folder ? `?folder=${folder}` : '';

    const response = await fetch(`${this.baseUrl}/upload/file${query}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async uploadFiles(token: string, files: File[], folder?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const query = folder ? `?folder=${folder}` : '';

    const response = await fetch(`${this.baseUrl}/upload/files${query}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message);
    }

    return response.json();
  }

  async getPresignedUrl(token: string, fileName: string, contentType: string, folder?: string) {
    return this.request('/upload/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType, folder }),
      token,
    });
  }

  async deleteFile(token: string, key: string) {
    return this.request('/upload/file', {
      method: 'DELETE',
      body: JSON.stringify({ key }),
      token,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
