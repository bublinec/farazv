import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage
} from "@chakra-ui/react";
import dot from "dot-object";
import React, { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { InfoNote } from "../InfoNote/InfoNote";

export interface FormControlGroupCheckboxProps {
  children?: ReactNode;
  label?: string;
  info?: string;
  name: string;
  validation?: any;
}

export const FormControlGroupCheckbox = (
  props: FormControlGroupCheckboxProps
) => {
  const { children, label, name, info, validation } = props;
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <FormControl isInvalid={dot.pick(name, errors)} fontSize="sm">
      <Flex
        color="darkGray"
        fontWeight={200}
        gridGap={2}
        flexDir={{ base: "column", md: "row" }}
      >
        <Flex gridGap={2} alignItems={"center"}>
          <Checkbox
            {...register(name, validation)}
            // colorScheme="primary"
            colorScheme={"blackAlpha"}
            size="lg"
            pb={0.5}
          />
          <Box>{children || label}</Box>
        </Flex>
        {info && <InfoNote text={info} />}
      </Flex>
      <FormErrorMessage color="red.600">
        {errors[name]?.message}
      </FormErrorMessage>
    </FormControl>
  );
};
