import React from "react";
import { Container } from "../../Container/Container";
import { LogoLink } from "../../LogoLink/LogoLink";

export interface FooterTopProps {
  className?: string;
}

export const FooterTop = (props: FooterTopProps) => {
  const { className = "" } = props;
  return (
    <Container py={6}>
      <LogoLink light />
    </Container>
  );
};
