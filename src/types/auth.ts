export interface Company {
  id: string;
  companyName: string;
  licenseNumber: string;
  email: string;
  ownerName: string;
  businessDescription: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface RegisterPayload {
  companyName: string;
  licenseNumber: string;
  email: string;
  ownerName: string;
  businessDescription: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends SessionTokens {
  company: Company;
}

export interface MessageResponse {
  message: string;
}
