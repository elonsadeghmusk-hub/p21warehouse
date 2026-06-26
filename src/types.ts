/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

// سیستم دسترسی جامع - هر مجوز یک عملیات مشخص را کنترل می‌کند
export interface UserPermissions {
  // خروج کالا
  canViewExit: boolean;
  canAddExit: boolean;
  canEditExit: boolean;
  canDeleteExit: boolean;

  // ایمنی HSE
  canViewPPE: boolean;
  canAddPPE: boolean;
  canEditPPE: boolean;
  canDeletePPE: boolean;

  // انبار کالا
  canViewWarehouse: boolean;
  canAddProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;

  // پرسنل
  canViewPersonnel: boolean;
  canAddPersonnel: boolean;
  canEditPersonnel: boolean;
  canDeletePersonnel: boolean;

  // بارنامه
  canViewWaybills: boolean;
  canAddWaybill: boolean;
  canEditWaybill: boolean;
  canDeleteWaybill: boolean;

  // امانات
  canViewLoans: boolean;
  canReturnLoan: boolean;

  // خروج ثبت نشده
  canViewUnregistered: boolean;
  canAssignCode: boolean;

  // گزارشات و دفتر کل
  canViewReports: boolean;
  canViewLog: boolean;
  canExportData: boolean;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  canViewExit: true, canAddExit: true, canEditExit: true, canDeleteExit: true,
  canViewPPE: true, canAddPPE: true, canEditPPE: true, canDeletePPE: true,
  canViewWarehouse: true, canAddProduct: true, canEditProduct: true, canDeleteProduct: true,
  canViewPersonnel: true, canAddPersonnel: true, canEditPersonnel: true, canDeletePersonnel: true,
  canViewWaybills: true, canAddWaybill: true, canEditWaybill: true, canDeleteWaybill: true,
  canViewLoans: true, canReturnLoan: true,
  canViewUnregistered: true, canAssignCode: true,
  canViewReports: true, canViewLog: true, canExportData: true,
};

export const DEFAULT_OPERATOR_PERMISSIONS: UserPermissions = {
  canViewExit: true, canAddExit: true, canEditExit: false, canDeleteExit: false,
  canViewPPE: true, canAddPPE: true, canEditPPE: false, canDeletePPE: false,
  canViewWarehouse: true, canAddProduct: false, canEditProduct: false, canDeleteProduct: false,
  canViewPersonnel: true, canAddPersonnel: false, canEditPersonnel: false, canDeletePersonnel: false,
  canViewWaybills: true, canAddWaybill: true, canEditWaybill: false, canDeleteWaybill: false,
  canViewLoans: true, canReturnLoan: true,
  canViewUnregistered: true, canAssignCode: false,
  canViewReports: true, canViewLog: true, canExportData: false,
};

export const EMPTY_PERMISSIONS: UserPermissions = {
  canViewExit: false, canAddExit: false, canEditExit: false, canDeleteExit: false,
  canViewPPE: false, canAddPPE: false, canEditPPE: false, canDeletePPE: false,
  canViewWarehouse: false, canAddProduct: false, canEditProduct: false, canDeleteProduct: false,
  canViewPersonnel: false, canAddPersonnel: false, canEditPersonnel: false, canDeletePersonnel: false,
  canViewWaybills: false, canAddWaybill: false, canEditWaybill: false, canDeleteWaybill: false,
  canViewLoans: false, canReturnLoan: false,
  canViewUnregistered: false, canAssignCode: false,
  canViewReports: false, canViewLog: false, canExportData: false,
};

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  modPassword?: string;
  permissions?: UserPermissions;
}

export interface Product {
  code: string;
  description: string;
  unit: string;
  category?: string;
  technicalSpecs?: string;
  stock?: number;
  minStock?: number;
  shelfLocation?: string;
}

export interface Recipient {
  fullName: string;
  orgUnit: string;
  safetyScore?: number;
  trainingCertificates?: TrainingCertificate[];
}

export interface TrainingCertificate {
  id: string;
  title: string;
  date: string;
  expiryDate: string;
  issuer: string;
}

export interface ExitItem {
  id: number;
  productCode?: string;
  productDescription: string;
  category?: string;
  quantity: number;
  unit: string;
  technicalSpecs?: string;
  isLoan?: boolean;
  isReturned?: boolean;
  conditionOnReturn?: string;
  healthRating?: number;
}

export interface ExitRecord {
  id: string;
  docNumber: string;
  items: ExitItem[];
  recipientName: string;
  orgUnit: string;
  delivererName: string;
  date: string;
  timestamp: number;
  type: 'EXIT' | 'PPE';
  signature?: string;
  photo?: string;
  notes?: string;
  telegramMsgId?: number;
}

export interface WaybillItem {
  description: string;
  quantity: string;
  unit: string;
}

export interface Waybill {
  id: string;
  docNumber: string;
  sender: string;
  receiver: string;
  machineHead?: string;
  seniorInCharge?: string;
  registrar: string;
  items: WaybillItem[];
  date: string;
  timestamp: number;
  image?: string;
  notes?: string;
}
