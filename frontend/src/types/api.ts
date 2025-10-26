export interface User {
  id: number
  email: string
  role: 'Admin' | 'Client'
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  role: string
}

export interface RegisterRequest {
  email: string
  tempPassword: string
  role?: 'Admin' | 'Client'
}

export interface RegisterVendorResponse {
  userId: number
  email: string
  role: string
  createdAt: string
}

export interface Document {
  id: number
  originalFileName: string
  fileSizeBytes: number
  status: 'Uploaded' | 'Processing' | 'ReadyForPreview' | 'Approved' | 'Rejected'
  uploadedAt: string
  finalPdfPath?: string
  extractedData?: Record<string, any>
}

export interface DocumentUploadRequest {
  file: File
  templateRuleSetId?: number
}

export interface DocumentUploadResponse {
  documentId: number
  status: string
  message: string
  sourceDocumentTempId: string
  previewPdfBase64: string
  extractedData: Record<string, any>
}

export interface DocumentConfirmRequest {
  sourceDocumentTempId: string
  templateId: string
  extractedData: Record<string, any>
  finalPdfBase64: string
}

export interface DocumentPreviewResponse {
  documentId: number
  previewPdfPath: string
  extractedData: Record<string, any>
  isReadyForApproval: boolean
}

export interface DocumentApprovalRequest {
  documentId: number
  approved: boolean
  comments?: string
}

export interface TemplateRuleSet {
  id: number
  name: string
  jsonDefinition: string
  createdByUserId: number
  createdAt: string
  isActive: boolean
}

export interface CreateTemplateRequest {
  name: string
  jsonDefinition: string
}

export interface UpdateTemplateRequest {
  name: string
  jsonDefinition: string
  isActive: boolean
}