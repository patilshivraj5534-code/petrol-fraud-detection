
export interface StaffDetails {
  name: string;
  employeeId: string;
  stationName: string;
  managerEmail: string;
  autoNotify: boolean;
}

export interface AnalysisResult {
  paymentAmount: number;
  pumpVolume: number;
  pumpUnitPrice: number;
  pumpTotalAmount: number;
  currency: string;
  isMatch: boolean;
  discrepancy: number;
  confidenceScore: number;
  summary: string;
  warnings: string[];
  timestamp?: number;
}

export interface ScanRecord extends AnalysisResult {
  id: string;
  vehiclePlate: string;
  customerName: string;
  paymentMethod?: string;
  notificationSent?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  operator: string;
}

export interface UploadedImages {
  receipt: string | null;
  pump: string | null;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type AppView = 'dashboard' | 'scan' | 'results' | 'profile' | 'audit' | 'guide';
