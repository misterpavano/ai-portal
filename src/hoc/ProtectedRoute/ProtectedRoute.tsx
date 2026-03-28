import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router-dom";

// Skip auth in local dev when Cognito isn't configured
const DEV_BYPASS_AUTH = !process.env.REACT_APP_COGNITO_USER_POOL_ID && process.env.NODE_ENV === "development";

export type ProtectedRouteProps = {
  children: JSX.Element;
};

function ProtectedRoute(props: ProtectedRouteProps): JSX.Element {
  const { user } = useAuthenticator((context) => [context.user]);
  const { children } = props;

  if (DEV_BYPASS_AUTH) {
    return children;
  }

  if (!user) {
    return <Navigate replace to="/auth/login" />;
  }

  return children;
}

export default ProtectedRoute;
