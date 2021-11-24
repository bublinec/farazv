import { Box, BoxProps, GridItem, SimpleGrid, Stack } from "@chakra-ui/react";
import React from "react";
import { ContactBox } from "../Shared/Contact/ContactBox";
import { useContact } from "../Shared/Footer/hooks/useContact";
import { SectionHeading } from "../Shared/SectionHeading/SectionHeading";

export interface ContactDetailsSectionProps extends BoxProps {}

export const ContactDetailsSection: React.FC = (
  props: ContactDetailsSectionProps
) => {
  const { ...restOfProps } = props;
  const data = useContact();
  const contactData = data.contactDetails;
  const officeHoursData = data.officeHours.officeDay;
  const meetingData = data.SacramentPreparationMettings.meeting;

  return (
    <Box {...restOfProps}>
      <Box>
        <SectionHeading
          heading="Farská kancelária"
          superscript="kontakt"
          mb={{ base: 6, md: 8 }}
        />
        <SimpleGrid columns={12}>
          <GridItem colSpan={{ base: 12, md: 5 }}>
            <Stack spacing={{ base: 6, md: 8 }}>
              <ContactBox
                heading="Kontakt"
                items={[
                  { title: "Telefón", value: contactData.phone },
                  { title: "Mobil", value: contactData.mobil },
                  { title: "Email", value: contactData.email },
                  { title: "IBAN", value: contactData.iban }
                ]}
              />
              <ContactBox
                heading="Úradné hodiny"
                items={officeHoursData.map((item) => ({
                  title: item.day,
                  value: item.openTime
                }))}
              />

              <ContactBox
                heading="Náuky"
                items={meetingData.map((meeting) => ({
                  title: meeting.name,
                  value: meeting.time
                }))}
              />
            </Stack>
          </GridItem>

          <GridItem colSpan={{ base: 12, md: 7 }} mt={{ base: 6, md: 0 }}>
            <ContactBox
              heading="Kde nás najdete?"
              items={[
                {
                  title: "Adresa",
                  value: contactData.address
                },
                {
                  title: "IČO",
                  value: contactData.ico
                }
              ]}
            >
              <Box h={{ base: 80, md: "full" }} pb={2}>
                {/* TODO: REPLACE WITH REACT MAP - (which is nicer) */}
                <iframe
                  src={contactData.googleMapEmbedLink}
                  width="100%"
                  height="100%"
                  loading="lazy"
                />
              </Box>
            </ContactBox>
          </GridItem>
        </SimpleGrid>
      </Box>
    </Box>
  );
};
