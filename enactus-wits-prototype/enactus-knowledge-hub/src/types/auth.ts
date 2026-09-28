// Authentication and SSO Types for Enactus Wits Knowledge Hub

export type UserRole = 
  | 'Member'
  | 'Administrator' 
  | 'Super Administrator'
  | 'Faculty Advisor';

export type BusinessStageID = 'Idea' | 'Prototype' | 'Running Business';

export interface EnactusUser {
  id: string;
  enactusId: string;
  name: string;
  email: string;
  role: UserRole;
  businessStageId?: BusinessStageID;
  faculty?: string;
  department?: string;
  teamRole?: string;
  isRegisteredOnMainSystem: boolean;
}

export interface AuthSession {
  token: string;
  user: EnactusUser;
  expiresAt: number;
}

export interface SSOAuthAdapterConfig {
  identityProviderUrl: string;
  clientId: string;
  scope: string[];
}
