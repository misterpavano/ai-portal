import { TUser } from "../local/auth";

export type TUpdateUserProfileRequest = Partial<
  Pick<TUser, "givenName" | "surname" | "displayName">
> & { userId: string };

export type TUpdateUserStatusRequest = {
  userId: string;
  status: "Active" | "Inactive";
};

export type TUpdateUserRoleRequest = {
  userId: string;
  roleId: number;
};
