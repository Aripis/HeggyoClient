import { GraphQLClient } from 'graphql-request';

const graphQLClient = new GraphQLClient(
    `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
    {
        mode: 'cors',
        credentials: 'include',
    }
);

export default graphQLClient;
