import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Input
} from "@chakra-ui/react";
import dot from "dot-object";
import React from "react";
import { useFormContext } from "react-hook-form";

export interface FormControlGroupProps extends FormControlProps {
  className?: string;
  label?: string;
  placeholder: string;
  type?: string;
  validation?: any;
  name: string;
  ffref?: any;
}

export const FormControlGroup = (props: FormControlGroupProps) => {
  const {
    className = "",
    label,
    placeholder,
    validation,
    name,
    type = "text"
  } = props;

  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <FormControl {...props} isInvalid={dot.pick(name, errors)}>
      {label && (
        <FormLabel htmlFor={name} fontWeight="normal">
          {label}
        </FormLabel>
      )}
      <Input
        rounded="none"
        _placeholder={{
          color: "lightGray",
          fontWeight: 400
        }}
        py={6}
        borderColor="lightGray"
        focusBorderColor="darkGray"
        type={type}
        placeholder={`${validation?.required?.value ? "*" : ""}${placeholder}`}
        _hover={{
          borderColor: "darkGray"
        }}
        _focus={{ borderWidth: 1 }}
        errorBorderColor={"red.600"}
        {...register(name, validation || {})}
      />
      <FormErrorMessage color="red.600">
        {dot.pick(name, errors)?.message}
      </FormErrorMessage>
    </FormControl>
  );
};
