import { useAuthenticator } from "@aws-amplify/ui-react";
import { Navigate } from "react-router-dom";

export type ProtectedRouteProps = {
  children: JSX.Element;
};

function ProtectedRoute(props: ProtectedRouteProps): JSX.Element {
  const { user } = useAuthenticator((context) => [context.user]);
  const { children } = props;
  const path = "/auth/login";

  if (!user) {
    return <Navigate replace to={path} />;
  }

  return children;
}

export default ProtectedRoute;
