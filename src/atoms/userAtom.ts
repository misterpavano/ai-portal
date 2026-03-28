import { atom } from "jotai";
import { TAuthUser } from "../types/local/auth";

export const userAtom = atom<TAuthUser | null>(null);
export const isAuthenticatedAtom = atom<boolean>(false);
export const authLoadingAtom = atom<boolean>(false);
export const authErrorAtom = atom<string | null>(null);
export const authInitializedAtom = atom<boolean>(false);

export const userDisplayNameAtom = atom((get) => {
  const user = get(userAtom);

  if (!user) return "User";

  const givenName = user.givenName?.trim() || "";
  const surname = user.surname?.trim() || "";

  if (givenName || surname) {
    return `${givenName} ${surname}`.trim();
  }

  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }

  return "User";
});
