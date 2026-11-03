import {
  Box,
  BoxProps,
  Flex,
  GridItem,
  SimpleGrid,
  Stack
} from "@chakra-ui/react";
import React from "react";
import { ContactBox } from "../../Shared/Contact/ContactBox";
import { useContact } from "../../Shared/Footer/hooks/useContact";
import { InfoNote } from "../../Shared/InfoNote/InfoNote";
import { SectionHeading } from "../../Shared/SectionHeading/SectionHeading";
import { Map } from "./Map";

export interface ContactDetailsSectionProps extends BoxProps {}

export const ContactDetailsSection: React.FC = (
  props: ContactDetailsSectionProps
) => {
  const { ...restOfProps } = props;
  const data = useContact();
  const contactData = data.contactDetails;
  const officeHoursData = data.officeHours;
  const meetingData = data.SacramentPreparationMettings;

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
                  // { title: "Telefón", value: contactData.phone },
                  { title: "Mobil", value: contactData.mobil },
                  { title: "Email", value: contactData.email },
                  { title: "IBAN", value: contactData.iban }
                ]}
              />
              <ContactBox
                heading="Úradné hodiny"
                items={officeHoursData.officeDay.map((item) => ({
                  title: item.day,
                  value: item.openTime
                }))}
              >
                {officeHoursData.infoNote && (
                  <InfoNote text={officeHoursData.infoNote} mt={-2} />
                )}
              </ContactBox>

              <ContactBox
                heading="Náuky"
                info={meetingData.infoNote}
                items={meetingData.meeting.map((meeting) => ({
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
              <Flex h={{ base: 80, md: "full" }} pb={2} flexDir={"column"}>
                <Box flex={1}>
                  <Map
                    coordinates={{
                      lat: 48.5781,
                      lng: 19.1266
                    }}
                    pb={10}
                  />
                </Box>
                {contactData.infoNote && (
                  <InfoNote text={contactData.infoNote} pt={3} />
                )}
              </Flex>
            </ContactBox>
          </GridItem>
        </SimpleGrid>
      </Box>
    </Box>
  );
};
