import type { WithAuthenticatorProps } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ user }: WithAuthenticatorProps) {
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [navigate, user])

    return null
}

export default withAuthenticator(Login, {
    hideSignUp: true,
});