import { useAuthenticator } from "@aws-amplify/ui-react";
import Dashboard from "../../../features/main/dashboard"

const DashboardPage = () => {
    const { user } = useAuthenticator((context) => [context.user]);
    // console.log((user as any).signInUserSession.accessToken.payload["cognito:groups"])
    return <Dashboard />
}

export default DashboardPage