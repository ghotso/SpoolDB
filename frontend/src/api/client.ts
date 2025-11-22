import type {
  Material,
  Color,
  Template,
  Filament,
  Spool,
  ConsumptionEntry,
  CreateMaterialInput,
  CreateColorInput,
  CreateTemplateInput,
  CreateFilamentInput,
  CreateSpoolInput,
  CreateConsumptionInput,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Materials
export const materialsApi = {
  list: () => fetchJson<Material[]>('/materials'),
  get: (id: number) => fetchJson<Material>(`/materials/${id}`),
  create: (data: CreateMaterialInput) => fetchJson<Material>('/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: { name: string }) => fetchJson<Material>(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' }).then(r => r.ok),
};

// Colors
export const colorsApi = {
  list: () => fetchJson<Color[]>('/colors'),
  get: (id: number) => fetchJson<Color>(`/colors/${id}`),
  create: (data: CreateColorInput) => fetchJson<Color>('/colors', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: { name: string; hex?: string | null }) => fetchJson<Color>(`/colors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetch(`${API_BASE}/colors/${id}`, { method: 'DELETE' }).then(r => r.ok),
};

// Templates
export const templatesApi = {
  list: () => fetchJson<Template[]>('/templates'),
  get: (id: number) => fetchJson<Template>(`/templates/${id}`),
  create: (data: CreateTemplateInput) => fetchJson<Template>('/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<CreateTemplateInput>) => fetchJson<Template>(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetch(`${API_BASE}/templates/${id}`, { method: 'DELETE' }).then(r => r.ok),
};

// Filaments
export const filamentsApi = {
  list: (includeArchived = false) => fetchJson<Filament[]>(`/filaments?archived=${includeArchived}`),
  get: (id: number) => fetchJson<Filament>(`/filaments/${id}`),
  create: (data: CreateFilamentInput) => fetchJson<Filament>('/filaments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<CreateFilamentInput & { archived?: boolean }>) => 
    fetchJson<Filament>(`/filaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number, force = false) => fetch(`${API_BASE}/filaments/${id}?force=${force}`, { method: 'DELETE' }).then(r => r.ok),
  archive: (id: number, archived: boolean) => fetchJson<Filament>(`/filaments/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ archived }),
  }),
  restock: (id: number, quantity: number, weight_per_spool_g: number, empty_weight_g?: number | null) => fetchJson<Filament>(`/filaments/${id}/restock`, {
    method: 'POST',
    body: JSON.stringify({ quantity, weight_per_spool_g, empty_weight_g }),
  }),
};

// Spools (child of filaments)
export const spoolsApi = {
  list: (filamentId?: number, includeArchived = false) => {
    const params = new URLSearchParams();
    if (filamentId) params.append('filament_id', filamentId.toString());
    if (includeArchived) params.append('archived', 'true');
    const query = params.toString();
    return fetchJson<Spool[]>(`/spools${query ? `?${query}` : ''}`);
  },
  get: (id: number) => fetchJson<Spool>(`/spools/${id}`),
  create: (data: CreateSpoolInput) => fetchJson<Spool>('/spools', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<CreateSpoolInput & { archived?: boolean }>) => 
    fetchJson<Spool>(`/spools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => fetch(`${API_BASE}/spools/${id}`, { method: 'DELETE' }).then(r => r.ok),
  archive: (id: number, archived: boolean) => fetchJson<Spool>(`/spools/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ archived }),
  }),
};

// Consumption
export const consumptionApi = {
  list: (filters?: { filament_id?: number; type?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.filament_id) params.append('filament_id', filters.filament_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const query = params.toString();
    return fetchJson<ConsumptionEntry[]>(`/consumption${query ? `?${query}` : ''}`);
  },
  get: (id: number) => fetchJson<ConsumptionEntry>(`/consumption/${id}`),
  create: (data: CreateConsumptionInput) => fetchJson<ConsumptionEntry>('/consumption', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<CreateConsumptionInput>) => fetchJson<ConsumptionEntry>(`/consumption/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => fetch(`${API_BASE}/consumption/${id}`, { method: 'DELETE' }).then(r => r.ok),
};

// i18n
export const i18nApi = {
  list: () => fetchJson<string[]>('/i18n/list'),
  get: (language: string) => fetchJson<Record<string, any>>(`/i18n/${language}`),
};

// Colors - most used
export const colorsMostUsedApi = {
  list: (limit?: number) => fetchJson<Color[]>(`/colors/most-used${limit ? `?limit=${limit}` : ''}`),
};

// G-code upload
export const gcodeApi = {
  parse: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/gcode/parse`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to parse G-code' }));
      throw new Error(error.error || 'Failed to parse G-code');
    }

    return response.json();
  },
  upload: async (file: File, filamentId: number, type: 'success' | 'failed' | 'test' | 'manual' = 'success') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filament_id', filamentId.toString());
    formData.append('type', type);

    const response = await fetch(`${API_BASE}/gcode/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to upload G-code' }));
      throw new Error(error.error || 'Failed to upload G-code');
    }

    return response.json();
  },
};

// Settings
export const settingsApi = {
  getAll: () => fetchJson<Record<string, string>>('/settings'),
  get: (key: string) => fetchJson<string>(`/settings/${key}`),
  set: (key: string, value: string) => fetchJson<string>(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
};

// Notifications
export const notificationsApi = {
  list: () => fetchJson<Filament[]>('/notifications'),
};


