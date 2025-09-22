export interface IJwtUser {
  id: string;
  email: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}
