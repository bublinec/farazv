import { SUBMIT_FORM_MUTATION } from "../graphql/submit-form-mutation";
import { FormSubmissionInput } from "../model/contact";
import { graphQLClient } from "./../../../api/gqlApi";

export const submitForm = async (
  input: FormSubmissionInput
): Promise<FormSubmissionInput> => {
  const data = await graphQLClient.request(SUBMIT_FORM_MUTATION, {
    input: input
  });

  return data;
};
