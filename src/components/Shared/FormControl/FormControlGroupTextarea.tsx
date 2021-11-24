import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Textarea
} from "@chakra-ui/react";
import dot from "dot-object";
import React from "react";
import { useFormContext } from "react-hook-form";

export interface FormControlGroupTextareaProps extends FormControlProps {
  label?: string;
  placeholder: string;
  validation?: any;
  name: string;
  rows?: number;
}

export const FormControlGroupTextarea = (
  props: FormControlGroupTextareaProps
) => {
  const { label, placeholder, validation, name, rows } = props;

  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <FormControl {...props} isInvalid={dot.pick(name, errors)}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Textarea
        rounded="none"
        _placeholder={{
          color: "lightGray",
          fontWeight: 400
        }}
        py={4}
        borderColor="lightGray"
        focusBorderColor="darkGray"
        placeholder={`${validation?.required?.value ? "*" : ""}${placeholder}`}
        rows={5}
        _hover={{
          borderColor: "darkGray"
        }}
        _focus={{ borderWidth: 1 }}
        errorBorderColor={"red.600"}
        {...register(name, validation)}
      />
      <FormErrorMessage color="red.600">
        {dot.pick(name, errors)?.message}
      </FormErrorMessage>
    </FormControl>
  );
};
