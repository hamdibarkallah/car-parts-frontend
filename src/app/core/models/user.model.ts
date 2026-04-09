export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'ADMIN' | 'SUPPLIER' | 'CLIENT';
}

export interface ClientProfile {
  id: number;
  user: User;
  address?: string;
  governorate?: string;
}

export interface SupplierProfile {
  id: number;
  user: User;
  business_name: string;
  address: string;
  governorate: string;
  postal_code: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'CLIENT' | 'SUPPLIER';
  business_name?: string;
  address?: string;
  governorate?: string;
  postal_code?: string;
}
