import { GraphQLClient } from "graphql-request";
import { AWAKE_BACKEND_QUERY } from "./awake-backend-query";

export const STRAPI_URL = "https://farazv.up.railway.app";

export const graphqlEndpoint = `${STRAPI_URL}/graphql`;
export const graphQLClient = new GraphQLClient(graphqlEndpoint);

// STRAPI IS HOSTED ON HEROKU, WHICH GOES TO HIBERNATION STATE AFTER AN HOUR
export const awakeHerokuBackend = async () => {
  await graphQLClient.request(AWAKE_BACKEND_QUERY);
};
