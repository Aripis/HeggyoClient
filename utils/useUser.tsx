import { useState, useEffect } from 'react';
import graphQLClient from 'utils/graphqlclient';
import { gql } from 'graphql-request';

const useUser = () => {
    const [user, setUser] = useState([null, 'FETCHING']);

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

    return { user: user[0], status: user[1] };
};

export default useUser;
