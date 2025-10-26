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
  UpdateTemplateRequest
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
