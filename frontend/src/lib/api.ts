import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api/v1' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export type User = { id: string; email: string; name: string; role: 'hr' | 'employee' };

export type Skill = { id: string; name: string; category: string };
export type ProfileSkill = { id: string; skill: Skill; proficiency: 'novice' | 'intermediate' | 'expert'; yearsExperience: number | null; inferred: boolean };
export type Project = { id: string; title: string; description: string; technologies: string[]; startDate: string | null; endDate: string | null };
export type Profile = {
  id: string; userId: string; status: 'pending' | 'approved' | 'rejected';
  summary: string | null; location: string | null; yearsTotal: number | null;
  fileKey: string | null; user: User;
  profileSkills: ProfileSkill[]; projects: Project[];
};

export type SearchResult = {
  userId: string; profileId: string; matchScore: number; reasoning: string; highlights: string[];
  profile: Profile;
};

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }).then(r => r.data),
  register: (email: string, password: string, name: string, role?: 'hr' | 'employee') =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password, name, role }).then(r => r.data),
  logout: () => api.post('/auth/logout'),
};

// Profiles
export const profilesApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<Profile>('/profiles/upload', form).then(r => r.data);
  },
  getQueue: () => api.get<Profile[]>('/profiles/queue').then(r => r.data),
  getMyProfile: () => api.get<Profile | null>('/profiles/my').then(r => r.data),
  getById: (id: string) => api.get<Profile>(`/profiles/${id}`).then(r => r.data),
  approve: (id: string) => api.patch<Profile>(`/profiles/${id}/approve`).then(r => r.data),
  reject: (id: string) => api.patch<Profile>(`/profiles/${id}/reject`).then(r => r.data),
};

// Employees
export const employeesApi = {
  list: () => api.get<(User & { profile: Profile | null })[]>('/employees').then(r => r.data),
  getById: (id: string) => api.get<User & { profile: Profile }>(`/employees/${id}`).then(r => r.data),
};

// Search
export const searchApi = {
  search: (q: string) => api.get<{ query: string; results: SearchResult[] }>('/search', { params: { q } }).then(r => r.data),
};

export default api;
