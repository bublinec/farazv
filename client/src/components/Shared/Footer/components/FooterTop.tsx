import React from "react";
import { Container } from "../../Container/Container";
import { FooterCompany } from "./FooterCompany";

export interface FooterTopProps {
  className?: string;
}

export const FooterTop = (props: FooterTopProps) => {
  const { className = "" } = props;
  return (
    <Container
      className={`${className} grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4  text-white py-10`}
    >
      <FooterCompany />
    </Container>
  );
};
