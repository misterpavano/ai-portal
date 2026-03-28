import { TAuthUser, TUser } from "../local/auth";

export type TGetAuthStatusResponse = {
  authenticated: boolean;
};

export type TGetUserProfileResponse = TAuthUser;

export type TLogoutResponse = {
  success: boolean;
  message?: string;
};

export type TErrorDataWithMessage = {
  message: string;
};

export type TGetAllUsersResponse = TUser[];

export type TUpdateUserProfileResponse = {
  message: string;
  user: TUser;
};

export type TUpdateUserStatusResponse = {
  message: string;
  user: TUser;
};

export enum EUserRole {
  User = 1,
  Manager = 2,
  Admin = 3,
}

export type TUpdateUserRoleResponse = {
  message: string;
  user: TUser;
};
