import { Box, BoxProps, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { BsArrowRight } from "react-icons/bs";
import { HiLocationMarker } from "react-icons/hi";
import { ImPhone } from "react-icons/im";
import { MdMail } from "react-icons/md";
import { routes } from "../../../../lib/conts/routes";
import { Container } from "../../Container/Container";
import { useContact } from "../hooks/useContact";
import { FooterColumn } from "./FooterColumn";

export interface FooterMiddleProps extends BoxProps {}

export const FooterMiddle = (props: FooterMiddleProps) => {
  const { ...restOfProps } = props;

  const contact = useContact();

  const contactItems = [
    // {
    //   label: contact.contactDetails.phone,
    //   to: `/tel:${contact.contactDetails.phone}`,
    //   icon: <ImPhone />
    // },
    {
      label: contact.contactDetails.mobil,
      to: `tel:${contact.contactDetails.mobil}`,
      icon: <ImPhone />
    },
    {
      label: contact.contactDetails.email,
      to: `mailto:${contact.contactDetails.email}`,
      icon: <MdMail />
    },
    {
      label: contact.contactDetails.address,
      to: contact.contactDetails.googleMapLink,
      icon: <HiLocationMarker />
    },
    {
      label: "Všetky kontakty",
      to: routes.contact.to,
      icon: <BsArrowRight />
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
            items={
              routes.parish?.children?.map((r) => {
                return {
                  label: r.label,
                  to: r.isExternal ? r.to : `${routes.parish.to}${r.to}`
                };
              }) || []
            }
          />
          <FooterColumn
            title={routes.sacraments.label}
            items={
              routes.sacraments?.children?.map((r) => ({
                label: r.label,
                to: `${routes.sacraments.to}${r.to}`
              })) || []
            }
          />
          <FooterColumn
            title={routes.groups.label}
            items={
              routes.groups?.children?.map((r) => ({
                label: r.label,
                to: `${routes.groups.to}${r.to}`
              })) || []
            }
          />
          <FooterColumn
            w={248}
            ml={{ md: -6 }}
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
