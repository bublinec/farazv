import { Box, Flex, GridItem, SimpleGrid, Stack } from "@chakra-ui/react";
import { graphql } from "gatsby";
import React from "react";
import { Container } from "../../components/Shared/Container/Container";
import { ContentRenderer } from "../../components/Shared/ContentRenderer/ContentRenderer";
import Layout from "../../components/Shared/Layout/Layout";
import { SectionHeading } from "../../components/Shared/SectionHeading/SectionHeading";
import { Donations } from "../../components/WeeklyAnnouncements/Donations/Donations";
import { MassSchedule } from "../../components/WeeklyAnnouncements/MassSchedule/MassSchedule";
import { useWeeklyAnnouncements } from "../../lib/graphql/hooks/useWeeklyAnnouncements";

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

  const data = useWeeklyAnnouncements();

  return (
    <Layout page={page}>
      <Container maxW={"container.lg"}>
        <Stack spacing={{ base: 8, md: 10 }} py={20}>
          <Stack spacing={4}>
                <Box >
                  <Box>
                    <SimpleGrid columns={12}>
                      <GridItem colSpan={{ base: 12, md: 5 }}>
                        <MassSchedule />
                      </GridItem>

                      <GridItem colSpan={{ base: 12, md: 7 }} mt={{ base: 6, md: 0 }}>
                        <Donations donations={data.donations} />
                      </GridItem>
                    </SimpleGrid>
                  </Box>
                </Box>
          </Stack>
        </Stack>
      </Container>
      <ContentRenderer contentSections={page.contentSections} />
    </Layout>
  );
};

export default WeeklyAnnouncementsPage;
