import { useAuthenticator } from "@aws-amplify/ui-react";
import amplifyConfig from "../amplifyconfiguration.json";

const AUTH_CONFIGURED = Object.keys(amplifyConfig).length > 0;

/**
 * Safe wrapper around useAuthenticator that returns
 * no-op values when Cognito isn't configured.
 */
export function useOptionalAuth() {
  if (!AUTH_CONFIGURED) {
    return {
      user: null,
      signOut: () => {},
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  return { user, signOut };
}
