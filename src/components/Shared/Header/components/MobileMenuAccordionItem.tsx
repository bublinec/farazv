import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box
} from "@chakra-ui/react";
import { Link } from "gatsby";
import React from "react";
import { Route } from "../../../../lib/conts/routes";

export interface MobileMenuAccordionItemProps {
  className?: string;
  route: Route;
}

export const MobileMenuAccordionItem = (
  props: MobileMenuAccordionItemProps
) => {
  const { className = "", route } = props;

  return (
    <div className={`${className}`}>
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton
            _expanded={{ bg: "transparent" }}
            _active={{ bg: "transparent" }}
            _focus={{ bg: "transparent" }}
            _closed={{ bg: "transparent" }}
            _hover={{ bg: "transparent" }}
            bg="wite"
            p={0}
            zIndex={50}
            backgroundColor="transparent"
            className="uppercase"
          >
            <div className="flex justify-between text-darkGray text-2xl">
              <Box flex="1" textAlign="left">
                {route.label}
              </Box>
              <AccordionIcon />
            </div>
          </AccordionButton>
          <AccordionPanel pb={1}>
            <div className="flex flex-col items-start ">
              {route?.children?.map((r) => (
                <Link
                  activeClassName="text-secondary"
                  to={`${route.to}${r.to}`}
                  key={r.label}
                >
                  <div className="py-2 pr-6 pl-1 text-xl">{r.label}</div>
                </Link>
              ))}
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
