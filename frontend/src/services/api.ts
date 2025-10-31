import axios, { AxiosResponse } from 'axios'
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterVendorResponse,
  User, 
  Document, 
  DocumentUploadResponse,
  TemplateRuleSet,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  AdminStats,
  AdminUser,
  AdminDocument,
  ReportsAnalyticsResponse,
  CreateAdminRequest,
  PagedResult
} from '../types/api'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', credentials).then((res: AxiosResponse<LoginResponse>) => res.data),
  
  registerVendor: (userData: RegisterRequest): Promise<RegisterVendorResponse> =>
    api.post('/auth/register', userData).then((res: AxiosResponse<RegisterVendorResponse>) => res.data),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/auth/me').then((res: AxiosResponse<User>) => res.data),
}

export const documentApi = {
  upload: (file: File, templateId: number): Promise<DocumentUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('templateId', templateId.toString())
    
    // Create a new axios instance without the default Content-Type header
    const uploadApi = axios.create({
      baseURL: 'http://localhost:5000/api',
    })
    
    // Add auth token
    const token = localStorage.getItem('token')
    if (token) {
      uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    return uploadApi.post('/documents/upload', formData).then((res: AxiosResponse<DocumentUploadResponse>) => res.data)
  },
  
  getProcessedDocuments: (): Promise<Document[]> =>
    api.get('/documents/processed').then((res: AxiosResponse<{documents: Document[], totalCount: number}>) => res.data.documents),
  
  download: (documentId: number): Promise<Blob> =>
    api.get(`/documents/processed/${documentId}/file`, {
      responseType: 'blob'
    }).then((res: AxiosResponse<Blob>) => res.data),

  downloadBatch: (documentIds: number[]): Promise<Blob> =>
    api.post('/documents/processed/download-batch', { documentIds }, { responseType: 'blob' })
       .then((res: AxiosResponse<Blob>) => res.data),

  sendByEmail: (documentIds: number[], toEmail?: string): Promise<{ status: string; to: string; subject: string }> =>
    api.post('/documents/processed/send-email', { documentIds, toEmail })
       .then((res: AxiosResponse<{ status: string; to: string; subject: string }>) => res.data),
}

export const templateApi = {
  getAll: (): Promise<TemplateRuleSet[]> =>
    api.get('/templates').then((res: AxiosResponse<TemplateRuleSet[]>) => res.data),
  
  getById: (id: number): Promise<TemplateRuleSet> =>
    api.get(`/templates/${id}`).then((res: AxiosResponse<TemplateRuleSet>) => res.data),
  
  create: (template: CreateTemplateRequest): Promise<TemplateRuleSet> =>
    api.post('/templates', template).then((res: AxiosResponse<TemplateRuleSet>) => res.data),
  
  update: (id: number, template: UpdateTemplateRequest): Promise<TemplateRuleSet> =>
    api.put(`/templates/${id}`, template).then((res: AxiosResponse<TemplateRuleSet>) => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/templates/${id}`).then(() => {}),
}

export const adminApi = {
  getStats: (): Promise<AdminStats> =>
    api.get('/admin/stats').then((res: AxiosResponse<AdminStats>) => res.data),
  
  getUsers: (page = 1, pageSize = 10, search?: string, role?: string, status?: string): Promise<PagedResult<AdminUser>> =>
    api.get('/admin/users', {
      params: { page, pageSize, search, role, status }
    }).then((res: AxiosResponse<PagedResult<AdminUser>>) => res.data),
  
  getDocuments: (page = 1, pageSize = 10, search?: string, status?: string): Promise<PagedResult<AdminDocument>> =>
    api.get('/admin/documents', {
      params: { page, pageSize, search, status }
    }).then((res: AxiosResponse<PagedResult<AdminDocument>>) => res.data),
  
  createAdmin: (request: CreateAdminRequest): Promise<AdminUser> =>
    api.post('/admin/users', request).then((res: AxiosResponse<AdminUser>) => res.data),
  
  deleteUser: (userId: string): Promise<void> =>
    api.delete(`/admin/users/${userId}`).then(() => {}),

  getAnalytics: (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ReportsAnalyticsResponse> =>
    api.get('/admin/analytics', {
      params: { period }
    }).then((res: AxiosResponse<ReportsAnalyticsResponse>) => res.data),
}
