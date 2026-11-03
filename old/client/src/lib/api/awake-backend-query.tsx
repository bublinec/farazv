import { gql } from "graphql-request";

export const AWAKE_BACKEND_QUERY = gql`
  query awakeHerokuBackend {
    contact {
      id
    }
  }
`;
