export interface User {
  UserID: number;
  Username: string;
  Password: string;
  FullName: string;
  Email: string;
  Phone: string;
  Status: boolean;
  RoleID: number;
}

export interface AuthenticatedUserPayload {
  userID?: number;
  username: string;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: boolean;
  roleId: number;
}

export interface LoginServiceResult {
  isError?: boolean;
  payload?: AuthenticatedUserPayload | null;
  errors?: string[];
}
