import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Switch
} from "@chakra-ui/react";
import dot from "dot-object";
import React from "react";
import { useFormContext } from "react-hook-form";

export interface FormControlGroupSwitchProps extends FormControlProps {
  className?: string;
  label: string;
  placeholder: string;
  validation?: Object;
  name: string;
}

export const FormControlGroupSwitch = (props: FormControlGroupSwitchProps) => {
  const { className = "", label, placeholder, validation, name } = props;

  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <FormControl {...props} isInvalid={dot.pick(name, errors)}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Switch
        borderRadius="sm"
        placeholder={placeholder}
        {...register(name, validation)}
      />
      <FormErrorMessage>{dot.pick(name, errors)?.message}</FormErrorMessage>
    </FormControl>
  );
};
