import { CognitoUserAttribute, CognitoUserPool, ISignUpResult } from "amazon-cognito-identity-js";
import { fetchAuthSession } from "@aws-amplify/auth";
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { useCallback } from "react";


AWS.config.region = process.env['REACT_APP_AWS_CPOOL_REGION']; // Region

const userPool = {
    UserPoolId: process.env['REACT_APP_AWS_CPOOL_ID'] ?? '', // Your user pool id here
    ClientId: process.env['REACT_APP_AWS_CPOOL_CLIENT_ID'] ?? '' // Your client id here
}

AWS.config.update({ region: process.env['REACT_APP_AWS_CPOOL_REGION'], 'accessKeyId': process.env['REACT_APP_AWS_ACCESS_KEY'], 'secretAccessKey': process.env['REACT_APP_AWS_SECRET_KEY'] });

const useCognito = () => {

    const createUser = async (email: string) => {
        const userPoolConfigured = new CognitoUserPool(userPool);
        try {
            // Create user attributes
            const attributeList: CognitoUserAttribute[] = [];
            const dataFirstName = {
                Name: 'given_name',
                Value: 'test'
            };
            const dataSurname = {
                Name: 'family_name',
                Value: 'test'
            };

            const attributeName = new CognitoUserAttribute(dataFirstName);
            const attributeSurname = new CognitoUserAttribute(dataSurname);

            attributeList.push(attributeName);
            attributeList.push(attributeSurname);

            // Generate a temporary password
            const password = 'Default1!'

            // Sign up the user
            const result: ISignUpResult = await new Promise((resolve, reject) => {
                userPoolConfigured.signUp(email, password, attributeList, [], (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result) {
                        resolve(result);
                    }
                });
            });

            // If successful, display success message
            console.log('User created:', result);
            return { success: true, data: result };

        } catch (error) {
            // If error, display error message
            console.log('Error creating user:', error);
            return { success: false, error: error };
        }
    }

    const fetchUserSession = async () => {
        try {
            const { tokens } = await fetchAuthSession();

            if (!tokens || !tokens.accessToken || !tokens.accessToken.payload) {
                return false;
            }

            const groups = tokens.accessToken.payload['cognito:groups'];

            if (Array.isArray(groups)) {
                return groups.includes('ADMIN');
            }

            return false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    };

    const getUsers = useCallback(async () => {
        var cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();

        return new Promise((resolve, reject) => {
            cognitoidentityserviceprovider.listUsers({
                UserPoolId: userPool.UserPoolId
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }, [])


    const deleteUser = async (email: string) => {
        var params = {
            UserPoolId: userPool.UserPoolId,
            Username: email
        };

        var cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();

        return new Promise((resolve, reject) => {
            cognitoidentityserviceprovider.adminDeleteUser(params, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    const getIdToken = async () => {
        const { tokens } = await fetchAuthSession();
        return tokens?.idToken?.toString() || null;
      };

    return {
        createUser,
        fetchUserSession,
        getUsers,
        deleteUser,
        getIdToken
    }

}

export default useCognito;