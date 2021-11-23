import { Box, BoxProps, Center, Container, Divider, Flex, Spacer, Stack, useMediaQuery } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useContact } from "../Shared/Footer/hooks/useContact";
import { SectionHeading } from "../Shared/SectionHeading/SectionHeading";
import { ContactBox } from "../Shared/Contact/ContactBox";
import { ContactElement } from "../Shared/Contact/ContactElement";
import { Iframe } from "../Shared/Iframe/Iframe";

export interface ContactDetailsSectionProps extends BoxProps {
}

export const ContactDetailsSection:React.FC = (props: ContactDetailsSectionProps) => {
  const { ...restOfProps } = props;
  const data = useContact();
  const contactData=data.contactDetails;
  const officeHoursData=data.officeHours.officeDay;
  const meetingData=data.SacramentPreparationMettings.meeting;

  const[isMobile, setIsmobile]=useMediaQuery([
    "(max-width: 750px)"
  ])
  return(
      <Container 
      {...restOfProps}
      >
        <Box
        >
          <SectionHeading heading="Farská kancelária" superscript="kontakt" />
          {/* all contact data*/}
          <Stack isInline={isMobile?false:true} pt={5}>
            <Box
            >
              {/* remains */}
              <ContactBox heading="Kontakt">
                <ContactElement title="Telefón" value={contactData.phone}/>
                <ContactElement title="Mobil" value={contactData.mobil}/>
                <ContactElement title="Email" value={contactData.email}/>
                <ContactElement title="IBAN" value={contactData.iban}/>
              </ContactBox>

              <ContactBox heading="Úradné hodiny">
                {officeHoursData.map(item=>{
                  return <ContactElement title={item.day} value={item.openTime}/>
                })}
              </ContactBox> 
              <ContactBox heading="Náuka">
                {meetingData.map(item=>{
                  return <ContactElement title={item.name} value={item.time}/>
                })}
              </ContactBox>
            </Box>
            {/* hides */}
            <Box paddingLeft={isMobile?0:6}>
                <ContactBox heading="Kde nás najdete?" >
                  <Box
                  paddingY={3}>
                    <iframe
                      src={contactData.googleMapEmbedLink}
                      max-width="100%"
                      height="300px"
                      loading="lazy"
                    ></iframe>
                  </Box>
                  <ContactElement title="Adresa" value={contactData.address}/>
                  <ContactElement title="IČO" value={contactData.ico}/>
                </ContactBox>
              </Box>
          </Stack>
          {/* form that hides in mobile */}
          <Box>

          </Box>
        </Box>
      </Container>
  )
};
