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
import { Route } from "../../../../lib/routes";

export interface MobileMenuAccordionItemProps {
  className?: string;
  route: Route;
}

export const MobileMenuAccordionItem = (
  props: MobileMenuAccordionItemProps
) => {
  const { className = "", route } = props;
  return (
    <div className={`${className} my-3`}>
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton
            _expanded={{ bg: "white" }}
            _active={{ bg: "white" }}
            _focus={{ bg: "white" }}
            _closed={{ bg: "white" }}
            _hover={{ bg: "white" }}
            bg="wite"
            p={0}
            backgroundColor="white"
            className="py-5 px-10 uppercase"
          >
            <div className="flex justify-between text-darkGray text-2xl">
              <Box flex="1" textAlign="left">
                {route.label}
              </Box>
              <AccordionIcon />
            </div>
          </AccordionButton>
          <AccordionPanel pb={4}>
            <div className="flex flex-col items-start ">
              {route?.children?.map((r) => (
                <Link activeClassName="text-secondary" to={r.to} key={r.label}>
                  <div className="py-2 pr-6 pl-12 text-xl">{r.label}</div>
                </Link>
              ))}
            </div>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
