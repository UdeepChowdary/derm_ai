// Common types used throughout the application

export interface SkinAnalysisResult {
  id: string;
  timestamp: number;
  condition: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
  imageUrl: string;
  additionalInfo?: Record<string, unknown>;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  saveHistory: boolean;
  cameraPreference: 'back' | 'front';
  language: string;
}

export interface AppError {
  id: string;
  timestamp: number;
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export interface CameraState {
  isActive: boolean;
  hasPermission: boolean | null;
  error: string | null;
  stream: MediaStream | null;
}

export type AnalysisStatus = 'idle' | 'processing' | 'completed' | 'error';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

// Form related types
export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  validate: (value: T) => string | undefined;
}

// Add more types as needed for your application
