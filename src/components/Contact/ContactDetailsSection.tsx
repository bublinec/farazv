import { Box, BoxProps, Container, Divider, Flex } from "@chakra-ui/react";
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
  return(
      <Container 
      {...restOfProps}
      margin={0}
      padding={0}
      >
        <SectionHeading heading="Farská kancelária" superscript="kontakt" />
        <Flex
        flexDir="row"
        flexWrap="wrap"
        >
          {/* all contact data*/}
          <Box
          flexDir="column"
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
          <Box >
              <ContactBox heading="Kde nás najdete?" >
                <Box padding="15px 0 10px 0"
                w="519px"
                h="337px">
                  <iframe
                    src={contactData.googleMapEmbedLink}
                    width="100%"
                    height="105%" // hide bottom text
                    loading="lazy"
                  ></iframe>
                </Box>
                <ContactElement title="Adresa" value={contactData.address}/>
                <ContactElement title="IČO" value={contactData.ico}/>
              </ContactBox>
            </Box>

          {/* form that hides in mobile */}
          <Box>

          </Box>
        </Flex>
      </Container>
  )
};
