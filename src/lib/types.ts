// Contact Management Types
export interface Contact {
  id: string;
  email: string;
  name: string;
  company?: string;
  tags: string[];
  type: 'default' | 'cold' | 'hot';
  createdAt: string;
  lastEmailed?: string;
}

// Email Template Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // Extracted template variables
  createdAt: string;
  updatedAt: string;
}

// Sender Profile Types
export interface SenderProfile {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  isDefault: boolean;
  signature?: string;
}

// Sent Email Types
export interface SentEmail {
  id: string;
  contactId: string;
  templateId: string;
  senderProfileId: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced';
  sentAt: string;
  messageId?: string; // AWS SES message ID
  error?: string;
}

// AWS Settings Types
export interface AWSSettings {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string;
  replyToEmail?: string;
}

// Application Settings Types
export interface AppSettings {
  aws: AWSSettings;
  defaultSenderProfileId?: string;
  rateLimitPerSecond: number;
  batchSize: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  senderProfileId: string;
  contactIds: string[];
  status: 'draft' | 'sending' | 'completed' | 'paused' | 'failed';
  createdAt: string;
  scheduledAt?: string;
  sentCount: number;
  totalCount: number;
  errors: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Validation Types
export interface ContactFormData {
  email: string;
  name: string;
  company?: string;
  tags: string[];
  type: 'default' | 'cold' | 'hot';
}

export interface TemplateFormData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface SenderProfileFormData {
  name: string;
  email: string;
  profilePictureUrl?: string;
  signature?: string;
}

// Utility Types
export type ContactType = Contact['type'];
export type EmailStatus = SentEmail['status'];
export type CampaignStatus = Campaign['status']; 