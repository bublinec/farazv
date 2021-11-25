import {
  Box,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage
} from "@chakra-ui/react";
import dot from "dot-object";
import React, { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { InfoNote } from "../InfoNote/InfoNote";

export interface FormControlGroupCheckboxProps {
  children?: ReactNode;
  label?: string;
  info?: string;
  name: string;
  rules?: any;
}

export const FormControlGroupCheckbox = (
  props: FormControlGroupCheckboxProps
) => {
  const { children, label, name, info, rules } = props;
  const {
    control,
    formState: { errors }
  } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={false}
      rules={rules}
      render={({ field: { onChange, value, ref }, formState: { errors } }) => {
        return (
          <FormControl isInvalid={dot.pick(name, errors)} fontSize="sm">
            <Flex
              color="body.500"
              fontWeight={400}
              gridGap={2}
              flexDir={{ base: "column", md: "row" }}
            >
              <Flex gridGap={2}>
                <Checkbox
                  onChange={onChange}
                  ref={ref}
                  isChecked={value}
                  colorScheme="primary"
                  size="lg"
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
      }}
    />
  );
};
