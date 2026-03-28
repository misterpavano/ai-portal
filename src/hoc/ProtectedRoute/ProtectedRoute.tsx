import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router-dom";
import amplifyConfig from "../../amplifyconfiguration.json";

// Skip auth when Cognito isn't configured (empty config)
const AUTH_CONFIGURED = Object.keys(amplifyConfig).length > 0;

export type ProtectedRouteProps = {
  children: JSX.Element;
};

function ProtectedRoute(props: ProtectedRouteProps): JSX.Element {
  const { children } = props;

  if (!AUTH_CONFIGURED) {
    return children;
  }

  return <AuthGate>{children}</AuthGate>;
}

function AuthGate({ children }: { children: JSX.Element }): JSX.Element {
  const { user } = useAuthenticator((context) => [context.user]);

  if (!user) {
    return <Navigate replace to="/auth/login" />;
  }

  return children;
}

export default ProtectedRoute;
