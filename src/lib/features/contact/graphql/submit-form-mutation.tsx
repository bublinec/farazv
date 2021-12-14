import { gql } from "graphql-request";

export const SUBMIT_FORM_MUTATION = gql`
  mutation submitContactForm($input: FormSubmissionInput) {
    createFormSubmission(input: { data: $input }) {
      formSubmission {
        fullName
      }
    }
  }
`;
