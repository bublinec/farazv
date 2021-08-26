import { Box } from "@chakra-ui/react";
import React from "react";
import { Container } from "../../Container/Container";

export interface FooterBottomProps {
  className?: string;
}

export const FooterBottom = (props: FooterBottomProps) => {
  const { className = "" } = props;
  const year = new Date().getFullYear();
  return (
    <Box
      bg="trueGray.900"
      className={`${className} py-6 text-white text-sm lg:text-base`}
    >
      <Container className="text-center">
        <span className="opacity-40">Stránka vytvorená spoločnosťou </span>
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-70 hover:opacity-100 transition-all duration-300 ease-in-out"
          href="https://mmntm.digital"
        >
          {" "}
          Momentum Digital
        </a>{" "}
        <span className="opacity-40">© {year}</span>
      </Container>
    </Box>
  );
};
