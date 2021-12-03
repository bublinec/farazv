import { Box, Flex, GridItem, SimpleGrid, Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { EventsSection } from "../../components/ContentSections/EventsSection/EventsSection";
import { Container } from "../../components/Shared/Container/Container";
import { DynamicZoneRenderer } from "../../components/Shared/DynamicZoneRenderer/DynamicZoneRenderer";
import Layout from "../../components/Shared/Layout/Layout";
import { Subheading } from "../../components/Shared/Subheading/Subheading";
import { Annoucements } from "../../components/WeeklyAnnouncements/Annoucements/Annoucements";
import { Donations } from "../../components/WeeklyAnnouncements/Donations/Donations";
import { MassSchedule } from "../../components/WeeklyAnnouncements/MassSchedule/MassSchedule";
import { useEvents } from "../../lib/features/events/hooks/useEvents";
import { useWeeklyAnnouncements } from "../../lib/features/weekly-announcements/hooks/useWeeklyAnnouncements";

export const query = graphql`
  query useWeeklyAnnouncementsPage {
    STRAPI {
      adminPages(where: { slug: "farske-oznamy" }) {
        ...STRAPI_AdminPagesFragment
      }
    }
  }
`;

const WeeklyAnnouncementsPage = (props: any) => {
  const page = props.data.STRAPI.adminPages[0];
  const recentEvents = useEvents();
  const data = useWeeklyAnnouncements();
  const { announcements, donations, ...nextWeekDays } = data[1];
  const days = [data[0].sunday, ...Object.values(nextWeekDays)];

  return (
    <Layout page={page}>
      <Container>
        <Stack spacing={{ base: 8, md: 10 }} py={20}>
          <SimpleGrid columns={12} gap={10}>
            <GridItem colSpan={{ base: 12, md: 5 }}>
              <MassSchedule days={days} />
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 7 }} mt={{ base: 6, md: 0 }}>
              <Flex
                flexDir="column"
                // justifyContent={"space-between"}
                gridGap={8}
                minH="full"
              >
                <Annoucements announcments={announcements} />
                <Donations donations={donations} />
                <Box w="full">
                  <Subheading mb={4}>Najbližšie udalosti</Subheading>
                  <EventsSection
                    events={recentEvents}
                    gridGap={6}
                    // heading={{
                    //   title: "Najbližšie udalosti",
                    //   superscript: "Farské oznamy"
                    // }}
                  />
                </Box>
              </Flex>
            </GridItem>
          </SimpleGrid>
        </Stack>
      </Container>
      <DynamicZoneRenderer contentSections={page.contentSections} />
    </Layout>
  );
};

export default WeeklyAnnouncementsPage;
