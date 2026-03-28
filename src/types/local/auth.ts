import { ReactNode } from "react";

export type TAuthUser = {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  givenName?: string;
  surname?: string;
  role?: TRole;
};

export type TAuthState = {
  isAuthenticated: boolean;
  user: TAuthUser | null;
  loading: boolean;
  error: string | null;
};

export type TAuthProviderProps = {
  children: ReactNode;
};

export type TProtectedRouteProps = {
  children: ReactNode;
  redirectTo?: string;
};

export type TRole = {
  id: number;
  name: "User" | "Manager" | "Admin";
};

export type TUser = {
  id: string;
  azureId?: string;
  email: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  status: "Active" | "Inactive";
  lastLoginAt?: string;
  createdAt?: string;
  role: TRole;
};

export type TUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  userGroup: "User" | "Manager" | "Admin";
  status: "Active" | "Inactive";
};
