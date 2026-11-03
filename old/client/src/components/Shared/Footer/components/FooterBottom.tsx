import { Box, Stack } from "@chakra-ui/react";
import React from "react";
import { Container } from "../../Container/Container";

("@chakra-ui/react");

export interface FooterBottomProps {
  className?: string;
}

export const FooterBottom = (props: FooterBottomProps) => {
  const { className = "" } = props;
  const year = new Date().getFullYear();
  return (
    <Box
      bg="black"
      className={`${className} py-12 text-white text-sm lg:text-base font-light`}
    >
      <Container className="text-center">
        <Stack>
          <Box>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 text-secondary hover:opacity-100 transition-all duration-300 ease-in-out"
              href="https://gdpr.kbs.sk/"
            >
              Ochrana osobných údajov GDPR
            </a>
          </Box>
          <Box>
            <span className="opacity-100">Stránka vytvorená spoločnosťou </span>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 text-secondary hover:opacity-100 transition-all duration-300 ease-in-out"
              href="https://mmntm.digital"
            >
              {" "}
              <br className="md:hidden" />
              Momentum Digital
            </a>{" "}
            <span className="opacity-100"> © {year}</span>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
