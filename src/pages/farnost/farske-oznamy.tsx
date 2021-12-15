import { Box, Flex, GridItem, SimpleGrid } from "@chakra-ui/react";
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
  const { announcements, donations, ...nextWeekDays } = data[0];
  const days: WeeklyAnnouncements.Day[] = [
    data[1].sunday,
    ...Object.values(nextWeekDays)
  ];

  return (
    <Layout page={page}>
      <Container py={{ base: 14, md: 20 }}>
        <SimpleGrid columns={{ base: 1, md: 12 }} gap={{ base: 6, md: 10 }}>
          <GridItem colSpan={{ md: 5 }}>
            <MassSchedule days={days} />
          </GridItem>
          <GridItem colSpan={{ md: 7 }} mt={{ base: 6, md: 0 }}>
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
      </Container>
      <DynamicZoneRenderer contentSections={page.contentSections} />
    </Layout>
  );
};

export default WeeklyAnnouncementsPage;
