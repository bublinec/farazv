import { Flex, SimpleGrid, Stack, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { awakeHerokuBackend } from "../../../lib/api/gqlApi";
import { emailRegex } from "../../../lib/conts/email-regex";
import { submitForm } from "../../../lib/features/contact/api/submitForm";
import { FormSubmissionInput } from "../../../lib/features/contact/model/contact";
import { Button } from "../../Shared/Button/Button";
import { FormControlGroup } from "../../Shared/FormControl/FormControlGroup";
import { FormControlGroupCheckbox } from "../../Shared/FormControl/FormControlGroupCheckbox";
import { FormControlGroupTextarea } from "../../Shared/FormControl/FormControlGroupTextarea";

const DEAFULT_VALIDATION_MESSAGE = "Toto pole je povinné";

export interface ContactFormValues extends FormSubmissionInput {
  agreement: boolean;
}

export interface ContactFormProps {
  namePlaceholder?: string;
  phonePlaceholder?: string;
  emailPlaceholder?: string;
  textaAreaPlaceholder?: string;
  agreementText?: string;
  submitText?: string;
}

export const ContactForm = (props: ContactFormProps) => {
  const {
    namePlaceholder = "Meno a preizvisko",
    phonePlaceholder = "Telefón",
    emailPlaceholder = "Email",
    textaAreaPlaceholder = "Vaša správa...",
    agreementText = "Súhlasím so spracovaním osobných údajov",
    submitText = "Odoslať"
  } = props;

  const methods = useForm<ContactFormValues>({});
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // awake heroku (if index page was not visited)
  useEffect(() => {
    console.log("Awake Heroku Backend");
    try {
      awakeHerokuBackend();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const onSubmit = async (data: ContactFormValues) => {
    const { agreement, ...formSubmissionInput } = data;
    setLoading(true);
    try {
      const formSubmission = await submitForm(formSubmissionInput);
      setLoading(false);
      methods.reset();
      toast({
        position: "top",
        title: "Ďakujeme za Váš email.",
        description: "Budeme Vás kontaktovať čo najskôr.",
        status: "success",
        duration: 5000,
        isClosable: true
      });
    } catch (e) {
      console.log(e);
      toast({
        position: "top",
        title: "Niekde nastala chyba. ",
        description: "Prosím kontaktujte nás telefonicky.",
        status: "error",
        duration: 20000,
        isClosable: true
      });
      setLoading(false);
    }
    // await mutateAsync(emailInput);
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        action=""
        onSubmit={methods.handleSubmit(onSubmit)}
        className="w-full"
      >
        <Stack spacing={{ base: 4, md: 5 }}>
          <SimpleGrid columns={{ md: 3 }} gap={{ base: 4, md: 5 }}>
            <FormControlGroup
              isRequired
              name="fullName"
              placeholder={namePlaceholder || ""}
              validation={{
                required: {
                  value: true,
                  message: DEAFULT_VALIDATION_MESSAGE
                }
              }}
            />
            <FormControlGroup
              name="phone"
              placeholder={phonePlaceholder || ""}
            />
            <FormControlGroup
              isRequired
              name="email"
              placeholder={emailPlaceholder || ""}
              validation={{
                pattern: {
                  value: emailRegex,
                  message: "Zadajte prosím Váš skutočný email!"
                },
                required: {
                  value: true,
                  message: "Zadajte prosím Váš email."
                }
              }}
            />
          </SimpleGrid>
          <FormControlGroupTextarea
            isRequired
            name="body"
            placeholder={textaAreaPlaceholder || ""}
            validation={{
              required: {
                value: true,
                message: DEAFULT_VALIDATION_MESSAGE
              }
            }}
          />
          <Stack spacing={{ base: 4, md: 0 }}>
            <FormControlGroupCheckbox
              label={agreementText}
              name={"agreement"}
              validation={{
                required: {
                  value: true,
                  message: "Musíte súhlasiť s podmienkami"
                }
              }}
            />
            <Flex justifyContent={{ base: "flex-end", md: "flex-end" }}>
              <Button
                type="submit"
                colorScheme={"primary"}
                isLoading={loading}
                loadingText="Odosielam"
              >
                {submitText}
              </Button>
            </Flex>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
