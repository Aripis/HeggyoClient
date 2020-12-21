import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import graphQLClient from 'utils/graphqlclient';
import { gql } from 'graphql-request';
import { User } from './interfaces';

interface Auth {
    user: User | null;
    status: string | null;
    logout: () => void;
}

export const useAuth = (): Auth => {
    const router = useRouter();
    const [user, setUser] = useState([null, 'FETCHING']);

    const logout = async () => {
        await graphQLClient.request(gql`
            query {
                logout
            }
        `);
        setUser([null, 'REDIRECT']);
        router.push('/');
    };

    useEffect(() => {
        (async () => {
            const data = await graphQLClient.request(
                gql`
                    query {
                        checkRefreshToken
                    }
                `
            );
            if (data.checkRefreshToken) {
                const query = gql`
                    query {
                        profile {
                            id
                            firstName
                            middleName
                            lastName
                            email
                            userRole
                            status
                            institution {
                                id
                                name
                                email
                                type
                                capacityPerClass
                                educationalStage
                                alias
                            }
                        }
                    }
                `;
                try {
                    const user = await graphQLClient.request(query);
                    setUser([user.profile, 'DONE']);
                } catch {
                    await graphQLClient.request(gql`
                        query {
                            token {
                                accessToken
                            }
                        }
                    `);
                    const user = await graphQLClient.request(query);
                    setUser([user.profile, 'DONE']);
                }
            } else {
                setUser([null, 'REDIRECT']);
            }
        })();
    }, []);

    return { user: user[0] as User, status: user[1], logout };
};