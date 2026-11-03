import { Box, BoxProps, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { ContactForm } from "./ContactForm";

export interface ContactFormSectionProps extends BoxProps {}

export const ContactFormSection = (props: ContactFormSectionProps) => {
  const { ...restOfProps } = props;
  return (
    <Box {...restOfProps}>
      <Stack spacing={4}>
        <Text fontSize="2xl">{"Napíšte nám"}</Text>
        <ContactForm />
      </Stack>
    </Box>
  );
};
