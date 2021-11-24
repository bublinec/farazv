import { Flex, SimpleGrid, Stack, useToast } from "@chakra-ui/react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { emailRegex } from "../../../lib/conts/email-regex";
import { Button } from "../../Shared/Button/Button";
import { FormControlGroup } from "../../Shared/FormControl/FormControlGroup";
import { FormControlGroupCheckbox } from "../../Shared/FormControl/FormControlGroupCheckbox";
import { FormControlGroupTextarea } from "../../Shared/FormControl/FormControlGroupTextarea";

const DEAFULT_VALIDATION_MESSAGE = "Toto pole je povinné";

export interface ContactFormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
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
    agreementText = "Súhlasím so spracovaním osobných údajom",
    submitText = "Odoslať"
  } = props;

  const toast = useToast();
  const methods = useForm<ContactFormValues>({});

  const onSubmit = async (data: ContactFormValues) => {
    const emailInput = {
      from: data.email,
      body: data.message,
      subject: `${data.name}, ${data.phone}`
    };
    console.log(emailInput);
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
              name="name"
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
            name="message"
            placeholder={textaAreaPlaceholder || ""}
            validation={{
              required: {
                value: true,
                message: DEAFULT_VALIDATION_MESSAGE
              }
            }}
          />
          <Stack spacing={0}>
            <FormControlGroupCheckbox
              label={agreementText}
              name={"agreement"}
              // validation={{
              //   required: {
              //     value: true,
              //     message: "Musíte súhlasiť s podmienkami"
              //   }
              // }}
            />
            <Flex justifyContent="flex-end">
              <Button type="submit" colorScheme={"primary"}>
                {submitText}
              </Button>
            </Flex>
          </Stack>
        </Stack>
      </form>
    </FormProvider>
  );
};
