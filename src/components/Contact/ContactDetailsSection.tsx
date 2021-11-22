import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import { useContact } from "../Shared/Footer/hooks/useContact";

export interface ContactDetailsSectionProps extends BoxProps {}

export const  ContactDetailsSection = (props: ContactDetailsSectionProps) => {
  const { ...restOfProps } = props;
  const data = useContact();

  console.log(data);

  return <Box {...restOfProps}>Contact</Box>;
};
