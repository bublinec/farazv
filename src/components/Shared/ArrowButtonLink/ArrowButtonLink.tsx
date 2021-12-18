import { BoxProps } from "@chakra-ui/react";
import { Link } from "gatsby";
import React from "react";
import { ArrowButton, ArrowButtonProps } from "../ArrowButton/ArrowButton";

export interface ArrowButtonLinkProps  {
  buttonProps: ArrowButtonProps;
  href: string;
}

export const ArrowButtonLink = (props: ArrowButtonLinkProps) => {
  const { buttonProps, href } = props;
  return (
    <Link to={href}>
      <ArrowButton {...buttonProps} />
    </Link>
  );
};
