import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { HiLocationMarker } from "react-icons/hi";
import { ImMobile, ImPhone } from "react-icons/im";
import { MdMail } from "react-icons/md";
import { routes } from "../../../../lib/routes";
import { Container } from "../../Container/Container";
import { useContact } from "../hooks/useContact";
import { FooterColumn } from "./FooterColumn";

export interface FooterMiddleProps extends BoxProps {}

export const FooterMiddle = (props: FooterMiddleProps) => {
  const { ...restOfProps } = props;

  const contact = useContact();

  const contactItems = [
    {
      label: contact.contactDetails.phone,
      to: `/tel:${contact.contactDetails.phone}`,
      icon: <ImPhone />
    },
    {
      label: contact.contactDetails.mobil,
      to: `/tel:${contact.contactDetails.mobil}`,
      icon: <ImMobile />
    },
    {
      label: contact.contactDetails.email,
      to: `/mailto:${contact.contactDetails.email}`,
      icon: <MdMail />
    },
    {
      label: contact.contactDetails.address,
      to: contact.contactDetails.googleMapLink,
      icon: <HiLocationMarker />
    }
  ];

  return (
    <Box {...restOfProps}>
      <Container>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 5 }}
          rowGap={{ base: 8, lg: 0 }}
          columnGap={{ base: 2 }}
        >
          <FooterColumn
            title={routes.parish.label}
            items={Object.values(routes.parish?.children || [])}
          />
          <FooterColumn
            title={routes.sacraments.label}
            items={Object.values(routes.sacraments?.children || [])}
          />
          <FooterColumn
            title={routes.groups.label}
            items={Object.values(routes.groups?.children || [])}
          />
          <FooterColumn
            title={"Úradné hodiny"}
            items={contact.officeHours.officeDay.map((d) => ({
              label: `${d.day}: ${d.openTime}`
            }))}
          />
          <FooterColumn title={"Kontakt"} items={contactItems} />
        </SimpleGrid>
      </Container>
    </Box>
  );
};
